"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveChartProps } from "@/types/dashboard";

// Note: This is a placeholder implementation. In a real app, you would use a charting library like Chart.js, Recharts, or similar
export function InteractiveChart({
  type,
  data,
  options,
  height = 300,
  responsive = true,
  loading = false,
}: InteractiveChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current || loading || !data.datasets.length) return;

    // This is a placeholder for chart rendering
    // In a real implementation, you would initialize your chart library here
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);

    // Simple placeholder visualization
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, 0, chartRef.current.width, chartRef.current.height);

    ctx.fillStyle = "#374151";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${type.toUpperCase()} Chart Placeholder`,
      chartRef.current.width / 2,
      chartRef.current.height / 2
    );

    ctx.fillStyle = "#6b7280";
    ctx.font = "12px sans-serif";
    ctx.fillText(
      "Chart.js or similar library integration needed",
      chartRef.current.width / 2,
      chartRef.current.height / 2 + 20
    );
  }, [data, type, loading]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className="relative"
          style={{ height: responsive ? "auto" : height }}
        >
          <canvas
            ref={chartRef}
            width={800}
            height={height}
            className="w-full h-full"
            style={{ maxHeight: height }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to create chart data
export function createChartData(
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
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
