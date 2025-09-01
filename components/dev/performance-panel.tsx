"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Clock,
  Database,
  TrendingUp,
  RefreshCw,
  Download,
  X,
} from "lucide-react";
import { performance } from "@/lib/performance-monitor";
import { cn } from "@/lib/utils";

interface PerformancePanelProps {
  className?: string;
  onClose?: () => void;
}

export function PerformancePanel({
  className,
  onClose,
}: PerformancePanelProps) {
  const [stats, setStats] = useState(performance.getStats());
  const [isVisible, setIsVisible] = useState(false);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(performance.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Show panel only in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === "development");
  }, []);

  const handleExport = () => {
    const data = performance.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-performance-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    performance.clear();
    setStats(performance.getStats());
  };

  if (!isVisible) return null;

  return (
    <Card
      className={cn("fixed bottom-4 right-4 w-96 z-50 shadow-lg", className)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Search Performance
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-6 w-6 p-0"
            >
              <Download className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Avg Time
                </div>
                <div className="text-sm font-medium">
                  {stats.averageSearchTime.toFixed(0)}ms
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Database className="w-3 h-3" />
                  Cache Hit
                </div>
                <div className="text-sm font-medium">
                  {stats.cacheHitRate.toFixed(1)}%
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  Total Searches
                </div>
                <div className="text-sm font-medium">{stats.totalSearches}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  Slow Searches
                </div>
                <div className="text-sm font-medium">
                  {stats.slowSearches}
                  {stats.slowSearches > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      !
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Performance Status
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant={
                    stats.averageSearchTime < 500 ? "default" : "destructive"
                  }
                  className="text-xs"
                >
                  {stats.averageSearchTime < 500 ? "Fast" : "Slow"} Response
                </Badge>
                <Badge
                  variant={stats.cacheHitRate > 50 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {stats.cacheHitRate > 50 ? "Good" : "Poor"} Caching
                </Badge>
                {stats.slowSearches === 0 && stats.totalSearches > 0 && (
                  <Badge variant="default" className="text-xs">
                    No Slow Searches
                  </Badge>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-3 mt-3">
            <RecentSearches />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function RecentSearches() {
  const [recentMetrics, setRecentMetrics] = useState(
    performance.monitor.getRecentMetrics(5)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRecentMetrics(performance.monitor.getRecentMetrics(5));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (recentMetrics.length === 0) {
    return (
      <div className="text-center py-4 text-xs text-muted-foreground">
        No recent searches
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Recent Searches</div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {recentMetrics.map((metric, index) => (
          <div
            key={`${metric.timestamp}-${index}`}
            className="flex items-center justify-between text-xs p-2 bg-muted rounded"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{metric.searchDuration.toFixed(0)}ms</span>
              </div>
              {metric.cacheHit && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  cached
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground">
              {metric.resultCount} results
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook to toggle performance panel
export function usePerformancePanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle with Ctrl+Shift+P (or Cmd+Shift+P on Mac)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "P"
      ) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    toggle: () => setIsOpen((prev) => !prev),
    close: () => setIsOpen(false),
  };
}
