'use client';

import { useState, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { InteractiveChartProps } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
];

interface ExtendedInteractiveChartProps extends InteractiveChartProps {
  title?: string;
}

export function InteractiveChart({
  type,
  data,
  options,
  height = 300,
  responsive = true,
  loading = false,
  title,
}: ExtendedInteractiveChartProps) {
  const isMobile = useIsMobile();
  const [zoomDomain, setZoomDomain] = useState<{
    left?: number;
    right?: number;
  } | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => transformDataForRecharts(data, type), [data, type]);

  // Mobile-specific height adjustment
  const mobileHeight = isMobile ? Math.min(height, 250) : height;

  const handleZoomIn = useCallback(() => {
    if (!chartData.length) return;
    const dataLength = chartData.length;
    const currentLeft = zoomDomain?.left || 0;
    const currentRight = zoomDomain?.right || dataLength - 1;
    const range = currentRight - currentLeft;
    const newRange = Math.max(Math.floor(range * 0.8), 3);
    const center = (currentLeft + currentRight) / 2;

    setZoomDomain({
      left: Math.max(0, Math.floor(center - newRange / 2)),
      right: Math.min(dataLength - 1, Math.floor(center + newRange / 2)),
    });
  }, [zoomDomain, chartData]);

  const handleZoomOut = useCallback(() => {
    if (!chartData.length) return;
    const dataLength = chartData.length;
    const currentLeft = zoomDomain?.left || 0;
    const currentRight = zoomDomain?.right || dataLength - 1;
    const range = currentRight - currentLeft;
    const newRange = Math.min(Math.floor(range * 1.2), dataLength);
    const center = (currentLeft + currentRight) / 2;

    setZoomDomain({
      left: Math.max(0, Math.floor(center - newRange / 2)),
      right: Math.min(dataLength - 1, Math.floor(center + newRange / 2)),
    });
  }, [zoomDomain, chartData]);

  // Touch gesture handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return;

      if (e.touches.length === 1) {
        setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else if (e.touches.length === 2) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        setTouchDistance(distance);
      }
    },
    [isMobile]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || !touchStart) return;

      if (e.touches.length === 2 && touchDistance) {
        // Pinch zoom gesture
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        const scale = distance / touchDistance;
        if (scale > 1.1) {
          handleZoomIn();
          setTouchDistance(distance);
        } else if (scale < 0.9) {
          handleZoomOut();
          setTouchDistance(distance);
        }
      }
    },
    [isMobile, touchStart, touchDistance, handleZoomIn, handleZoomOut]
  );

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    setTouchDistance(null);
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomDomain(null);
  }, []);

  const handlePanLeft = useCallback(() => {
    if (!zoomDomain || !chartData.length) return;
    const range = zoomDomain.right - zoomDomain.left;
    const step = Math.max(1, Math.floor(range * 0.1));

    setZoomDomain({
      left: Math.max(0, zoomDomain.left - step),
      right: Math.max(range, zoomDomain.right - step),
    });
  }, [zoomDomain, chartData]);

  const handlePanRight = useCallback(() => {
    if (!zoomDomain || !chartData.length) return;
    const dataLength = chartData.length;
    const range = zoomDomain.right - zoomDomain.left;
    const step = Math.max(1, Math.floor(range * 0.1));

    setZoomDomain({
      left: Math.min(dataLength - range - 1, zoomDomain.left + step),
      right: Math.min(dataLength - 1, zoomDomain.right + step),
    });
  }, [zoomDomain, chartData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height: mobileHeight }} />
        </CardContent>
      </Card>
    );
  }

  // Apply zoom domain if set
  const displayData = zoomDomain
    ? chartData.slice(zoomDomain.left, zoomDomain.right + 1)
    : chartData;

  const renderChart = () => {
    const commonProps = {
      data: displayData,
      margin: isMobile
        ? { top: 5, right: 10, left: 10, bottom: 5 }
        : { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? "preserveStartEnd" : 0}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: isMobile ? "12px" : "14px",
              }}
            />
            {options?.plugins?.legend?.display !== false && <Legend />}
            {data.datasets.map((dataset, index) => (
              <Line
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stroke={typeof dataset.borderColor === 'string' ? dataset.borderColor : COLORS[index % COLORS.length]}
                strokeWidth={dataset.borderWidth || (isMobile ? 1.5 : 2)}
                dot={{
                  fill: typeof dataset.borderColor === 'string' ? dataset.borderColor : COLORS[index % COLORS.length],
                  strokeWidth: isMobile ? 1 : 2,
                  r: isMobile ? 3 : 4,
                }}
                activeDot={{ r: isMobile ? 4 : 6 }}
              />
            ))}
            {!isMobile && chartData.length > 10 && (
              <Brush
                dataKey="name"
                height={30}
                stroke="#8884d8"
                startIndex={zoomDomain?.left}
                endIndex={zoomDomain?.right}
              />
            )}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? "preserveStartEnd" : 0}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: isMobile ? "12px" : "14px",
              }}
            />
            {options?.plugins?.legend?.display !== false && <Legend />}
            {data.datasets.map((dataset, index) => (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={typeof dataset.backgroundColor === 'string' ? dataset.backgroundColor : COLORS[index % COLORS.length]}
                radius={isMobile ? [2, 2, 0, 0] : [4, 4, 0, 0]}
              />
            ))}
            {!isMobile && chartData.length > 10 && (
              <Brush
                dataKey="name"
                height={30}
                stroke="#8884d8"
                startIndex={zoomDomain?.left}
                endIndex={zoomDomain?.right}
              />
            )}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? "preserveStartEnd" : 0}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: isMobile ? "12px" : "14px",
              }}
            />
            {options?.plugins?.legend?.display !== false && <Legend />}
            {data.datasets.map((dataset, index) => (
              <Area
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stackId="1"
                stroke={typeof dataset.borderColor === 'string' ? dataset.borderColor : COLORS[index % COLORS.length]}
                fill={typeof dataset.backgroundColor === 'string' ? dataset.backgroundColor : COLORS[index % COLORS.length]}
                fillOpacity={isMobile ? 0.4 : 0.6}
                strokeWidth={isMobile ? 1.5 : 2}
              />
            ))}
            {!isMobile && chartData.length > 10 && (
              <Brush
                dataKey="name"
                height={30}
                stroke="#8884d8"
                startIndex={zoomDomain?.left}
                endIndex={zoomDomain?.right}
              />
            )}
          </AreaChart>
        );

      case "pie":
      case "doughnut":
        const pieData =
          data.datasets[0]?.data.map((value, index) => ({
            name: data.labels[index],
            value,
            fill: Array.isArray(data.datasets[0].backgroundColor)
              ? data.datasets[0].backgroundColor[index]
              : COLORS[index % COLORS.length],
          })) || [];

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={type === "doughnut" ? (isMobile ? 40 : 60) : 0}
              outerRadius={isMobile ? 80 : 120}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: isMobile ? "12px" : "14px",
              }}
            />
            {options?.plugins?.legend?.display !== false && (
              <Legend wrapperStyle={{ fontSize: isMobile ? "12px" : "14px" }} />
            )}
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Unsupported chart type: {type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {title && <CardHeader><CardTitle>{title}</CardTitle></CardHeader>}
      {/* Mobile Controls */}
      {isMobile && (type === "line" || type === "bar" || type === "area") && (
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              disabled={!zoomDomain}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              disabled={chartData.length <= 3}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetZoom}
              disabled={!zoomDomain}
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          {zoomDomain && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePanLeft}
                disabled={zoomDomain.left <= 0}
                aria-label="Pan left"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePanRight}
                disabled={zoomDomain.right >= chartData.length - 1}
                aria-label="Pan right"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Chart Container */}
      <div
        ref={chartRef}
        className="w-full touch-none"
        style={{ height: responsive ? "auto" : mobileHeight }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="img"
        aria-label={`Interactive ${type} chart. ${isMobile ? "Use pinch to zoom, or use the controls above." : ""}`}
        tabIndex={0}
      >
        <ResponsiveContainer width="100%" height={mobileHeight}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Mobile Instructions */}
      {isMobile && (type === "line" || type === "bar" || type === "area") && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Pinch to zoom • Use controls above for precise navigation
        </div>
      )}
    </div>
  );
}

// Transform data from Chart.js format to Recharts format
function transformDataForRecharts(data: any, type: string) {
  if (type === "pie" || type === "doughnut") {
    return (
      data.datasets[0]?.data.map((value: number, index: number) => ({
        name: data.labels[index],
        value,
      })) || []
    );
  }

  // For line, bar, area charts
  return data.labels.map((label: string, index: number) => {
    const point: any = { name: label };
    data.datasets.forEach((dataset: any) => {
      point[dataset.label] = dataset.data[index];
    });
    return point;
  });
}

// Utility function to create chart data
export function createChartData(
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }>
) {
  return {
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || "#3b82f6",
      borderColor: dataset.borderColor || "#2563eb",
      borderWidth: 2,
      fill: false,
    })),
  };
}

// Utility function to create chart options
export function createChartOptions(
  title?: string,
  showLegend = true,
  showTooltips = true
) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: "top" as const,
      },
      tooltip: {
        enabled: showTooltips,
      },
      title: title
        ? {
            display: true,
            text: title,
          }
        : undefined,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false,
          text: "",
        },
      },
      y: {
        display: true,
        title: {
          display: false,
          text: "",
        },
      },
    },
  };
}
