"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableFullscreen?: boolean;
  className?: string;
  disableCardWrapper?: boolean; // New prop to disable card wrapper for specific components
}

export function MobileChartWrapper({
  children,
  title,
  subtitle,
  enableZoom = true,
  enablePan = true,
  enableFullscreen = true,
  className,
  disableCardWrapper = false, // Default to false to maintain existing behavior
}: MobileChartWrapperProps) {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Touch gesture handling
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !enablePan) return;

    if (e.touches.length === 1) {
      // Single touch - pan
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setIsDragging(true);
    } else if (e.touches.length === 2 && enableZoom) {
      // Two touches - zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;

    if (e.touches.length === 1 && touchStart && isDragging && enablePan) {
      // Pan gesture
      const deltaX = e.touches[0].clientX - touchStart.x;
      const deltaY = e.touches[0].clientY - touchStart.y;

      setPanOffset((prev) => ({
        x: prev.x + deltaX * 0.5,
        y: prev.y + deltaY * 0.5,
      }));

      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && touchDistance && enableZoom) {
      // Pinch zoom gesture
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      const scale = distance / touchDistance;
      const newZoom = Math.max(0.5, Math.min(3, zoomLevel * scale));
      setZoomLevel(newZoom);
      setTouchDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setTouchDistance(null);
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(3, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.5, prev - 0.25));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!enablePan) return;

    const step = 20;
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        setPanOffset((prev) => ({ ...prev, x: prev.x + step }));
        break;
      case "ArrowRight":
        e.preventDefault();
        setPanOffset((prev) => ({ ...prev, x: prev.x - step }));
        break;
      case "ArrowUp":
        e.preventDefault();
        setPanOffset((prev) => ({ ...prev, y: prev.y + step }));
        break;
      case "ArrowDown":
        e.preventDefault();
        setPanOffset((prev) => ({ ...prev, y: prev.y - step }));
        break;
      case "+":
      case "=":
        e.preventDefault();
        handleZoomIn();
        break;
      case "-":
        e.preventDefault();
        handleZoomOut();
        break;
      case "0":
        e.preventDefault();
        handleReset();
        break;
    }
  };

  const chartTransform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`;

  // For components that don't need the card wrapper (geographic and device performance)
  if (disableCardWrapper) {
    if (!isMobile) {
      return <div className={className}>{children}</div>;
    }

    return (
      <div
        className={cn(
          className,
          isFullscreen && "fixed inset-0 z-50 rounded-none"
        )}
      >
        {title && (
          <div className="px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-base">{title}</h3>
                {subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {Math.round(zoomLevel * 100)}%
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Controls */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="Chart zoom controls"
          >
            {enableZoom && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  aria-label={`Zoom out, current zoom level ${Math.round(zoomLevel * 100)}%`}
                  aria-describedby="zoom-help"
                >
                  <ZoomOut className="h-3 w-3" aria-hidden="true" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  aria-label={`Zoom in, current zoom level ${Math.round(zoomLevel * 100)}%`}
                  aria-describedby="zoom-help"
                >
                  <ZoomIn className="h-3 w-3" aria-hidden="true" />
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              aria-label="Reset chart view to original position and zoom level"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
          <div id="zoom-help" className="sr-only">
            Use zoom controls to magnify chart details. Current zoom level is{" "}
            {Math.round(zoomLevel * 100)}%
          </div>

          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="Chart navigation controls"
          >
            {enablePan && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPanOffset((prev) => ({ ...prev, x: prev.x + 20 }))
                  }
                  aria-label="Pan chart left"
                  aria-describedby="pan-help"
                >
                  <ChevronLeft className="h-3 w-3" aria-hidden="true" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPanOffset((prev) => ({ ...prev, x: prev.x - 20 }))
                  }
                  aria-label="Pan chart right"
                  aria-describedby="pan-help"
                >
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </Button>
              </>
            )}
            {enableFullscreen && (
              <Button
                size="sm"
                variant="outline"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"
                }
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Maximize2 className="h-3 w-3" aria-hidden="true" />
                )}
              </Button>
            )}
          </div>
          <div id="pan-help" className="sr-only">
            Use pan controls to move the chart view horizontally
          </div>
        </div>

        <div className="p-0 overflow-hidden">
          <div
            ref={containerRef}
            className="relative w-full h-64 touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="img"
            aria-label={`Interactive chart: ${title || "Chart"}. Use arrow keys to pan, +/- to zoom, 0 to reset.`}
          >
            <div
              ref={contentRef}
              className="absolute inset-0 transition-transform duration-200 ease-out origin-center"
              style={{
                transform: chartTransform,
                cursor: isDragging ? "grabbing" : "grab",
              }}
            >
              {children}
            </div>
          </div>
        </div>

        {/* Touch gesture instructions */}
        <div
          className="px-4 py-2 text-xs text-muted-foreground border-t bg-muted/20"
          role="region"
          aria-label="Chart interaction instructions"
        >
          <p>
            {enablePan && "Drag to pan"}
            {enablePan && enableZoom && " • "}
            {enableZoom && "Pinch to zoom"}
            {(enablePan || enableZoom) && " • "}
            Tap controls above for precise adjustments
          </p>
          <p className="mt-1">
            Keyboard: Arrow keys to pan, +/- to zoom, 0 to reset
          </p>
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        className,
        isFullscreen && "fixed inset-0 z-50 rounded-none"
      )}
    >
      {title && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {Math.round(zoomLevel * 100)}%
              </Badge>
            </div>
          </div>
        </CardHeader>
      )}

      {/* Mobile Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Chart zoom controls"
        >
          {enableZoom && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                aria-label={`Zoom out, current zoom level ${Math.round(zoomLevel * 100)}%`}
                aria-describedby="zoom-help"
              >
                <ZoomOut className="h-3 w-3" aria-hidden="true" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                aria-label={`Zoom in, current zoom level ${Math.round(zoomLevel * 100)}%`}
                aria-describedby="zoom-help"
              >
                <ZoomIn className="h-3 w-3" aria-hidden="true" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            aria-label="Reset chart view to original position and zoom level"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
        <div id="zoom-help" className="sr-only">
          Use zoom controls to magnify chart details. Current zoom level is{" "}
          {Math.round(zoomLevel * 100)}%
        </div>

        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Chart navigation controls"
        >
          {enablePan && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setPanOffset((prev) => ({ ...prev, x: prev.x + 20 }))
                }
                aria-label="Pan chart left"
                aria-describedby="pan-help"
              >
                <ChevronLeft className="h-3 w-3" aria-hidden="true" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setPanOffset((prev) => ({ ...prev, x: prev.x - 20 }))
                }
                aria-label="Pan chart right"
                aria-describedby="pan-help"
              >
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Button>
            </>
          )}
          {enableFullscreen && (
            <Button
              size="sm"
              variant="outline"
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"
              }
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Maximize2 className="h-3 w-3" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
        <div id="pan-help" className="sr-only">
          Use pan controls to move the chart view horizontally
        </div>
      </div>

      <CardContent className="p-0 overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-full h-64 touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="img"
          aria-label={`Interactive chart: ${title || "Chart"}. Use arrow keys to pan, +/- to zoom, 0 to reset.`}
        >
          <div
            ref={contentRef}
            className="absolute inset-0 transition-transform duration-200 ease-out origin-center"
            style={{
              transform: chartTransform,
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            {children}
          </div>
        </div>
      </CardContent>

      {/* Touch gesture instructions */}
      <div
        className="px-4 py-2 text-xs text-muted-foreground border-t bg-muted/20"
        role="region"
        aria-label="Chart interaction instructions"
      >
        <p>
          {enablePan && "Drag to pan"}
          {enablePan && enableZoom && " • "}
          {enableZoom && "Pinch to zoom"}
          {(enablePan || enableZoom) && " • "}
          Tap controls above for precise adjustments
        </p>
        <p className="mt-1">
          Keyboard: Arrow keys to pan, +/- to zoom, 0 to reset
        </p>
      </div>
    </Card>
  );
}
