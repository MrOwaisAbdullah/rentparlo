"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Table,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileResponsiveWrapper } from "./mobile-responsive-wrapper";
import {
  accessibleChartColors,
  generateChartAltText,
  meetsWCAGStandards,
} from "@/lib/color-contrast-utils";
import { ScreenReaderAnnouncer } from "@/lib/accessibility-utils";
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
import { cn } from "@/lib/utils";

interface AccessibleChartProps {
  type: "line" | "bar" | "pie" | "area" | "doughnut";
  data: any;
  title?: string;
  description?: string;
  height?: number;
  loading?: boolean;
  className?: string;
  colorScheme?: "default" | "colorblind" | "highContrast";
  showDataTable?: boolean;
  enableZoom?: boolean;
  enableFullscreen?: boolean;
}

export function AccessibleChart({
  type,
  data,
  title,
  description,
  height = 300,
  loading = false,
  className,
  colorScheme = "default",
  showDataTable = true,
  enableZoom = true,
  enableFullscreen = true,
}: AccessibleChartProps) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [announceText, setAnnounceText] = useState("");
  const [highContrastMode, setHighContrastMode] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const announcer = ScreenReaderAnnouncer.getInstance();

  // Get color palette based on scheme
  const getColorPalette = useCallback(() => {
    if (highContrastMode) {
      return accessibleChartColors.highContrast;
    }

    switch (colorScheme) {
      case "colorblind":
        return accessibleChartColors.colorblindFriendly;
      case "highContrast":
        return accessibleChartColors.highContrast;
      default:
        return accessibleChartColors.primary;
    }
  }, [colorScheme, highContrastMode]);

  // Transform data for Recharts
  const transformedData = useCallback(() => {
    if (type === "pie" || type === "doughnut") {
      return (
        data.datasets?.[0]?.data?.map((value: number, index: number) => ({
          name: data.labels?.[index] || `Item ${index + 1}`,
          value,
          fill: getColorPalette()[index % getColorPalette().length],
        })) || []
      );
    }

    return (
      data.labels?.map((label: string, index: number) => {
        const point: any = { name: label };
        data.datasets?.forEach((dataset: any) => {
          point[dataset.label] = dataset.data[index];
        });
        return point;
      }) || []
    );
  }, [data, type, getColorPalette]);

  // Generate alternative text
  const altText = generateChartAltText(type, transformedData(), title);

  // Announce changes
  const announce = useCallback(
    (text: string) => {
      setAnnounceText(text);
      announcer.announce(text);
      setTimeout(() => setAnnounceText(""), 1000);
    },
    [announcer]
  );

  // Handle view mode change
  const handleViewModeChange = (mode: "chart" | "table") => {
    setViewMode(mode);
    announce(`Switched to ${mode} view`);
  };

  // Handle zoom
  const handleZoom = (direction: "in" | "out" | "reset") => {
    if (direction === "reset") {
      setZoomLevel(1);
      announce("Chart zoom reset to 100%");
    } else if (direction === "in" && zoomLevel < 3) {
      const newLevel = Math.min(3, zoomLevel + 0.25);
      setZoomLevel(newLevel);
      announce(`Zoomed in to ${Math.round(newLevel * 100)}%`);
    } else if (direction === "out" && zoomLevel > 0.5) {
      const newLevel = Math.max(0.5, zoomLevel - 0.25);
      setZoomLevel(newLevel);
      announce(`Zoomed out to ${Math.round(newLevel * 100)}%`);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    announce(isFullscreen ? "Exited fullscreen" : "Entered fullscreen");
  };

  // Handle high contrast toggle
  const toggleHighContrast = () => {
    setHighContrastMode(!highContrastMode);
    announce(
      highContrastMode ? "Disabled high contrast" : "Enabled high contrast"
    );
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "t":
        case "T":
          if (showDataTable) {
            e.preventDefault();
            handleViewModeChange(viewMode === "chart" ? "table" : "chart");
          }
          break;
        case "+":
        case "=":
          if (enableZoom) {
            e.preventDefault();
            handleZoom("in");
          }
          break;
        case "-":
          if (enableZoom) {
            e.preventDefault();
            handleZoom("out");
          }
          break;
        case "0":
          if (enableZoom) {
            e.preventDefault();
            handleZoom("reset");
          }
          break;
        case "f":
        case "F":
          if (enableFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case "h":
        case "H":
          e.preventDefault();
          toggleHighContrast();
          break;
      }
    },
    [viewMode, showDataTable, enableZoom, enableFullscreen]
  );

  // Render chart
  const renderChart = () => {
    const colors = getColorPalette();
    const chartData = transformedData();

    const commonProps = {
      data: chartData,
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
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            {data.datasets?.map((dataset: any, index: number) => (
              <Line
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stroke={colors[index % colors.length]}
                strokeWidth={highContrastMode ? 3 : 2}
                dot={{ r: highContrastMode ? 5 : 4 }}
                activeDot={{ r: highContrastMode ? 7 : 6 }}
              />
            ))}
            {enableZoom && !isMobile && <Brush dataKey="name" height={30} />}
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
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            {data.datasets?.map((dataset: any, index: number) => (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={colors[index % colors.length]}
                stroke={highContrastMode ? "#000000" : "none"}
                strokeWidth={highContrastMode ? 2 : 0}
              />
            ))}
          </BarChart>
        );

      case "pie":
      case "doughnut":
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={type === "doughnut" ? (isMobile ? 40 : 60) : 0}
              outerRadius={isMobile ? 80 : 120}
              paddingAngle={2}
              dataKey="value"
              stroke={highContrastMode ? "#000000" : "none"}
              strokeWidth={highContrastMode ? 2 : 0}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
          </PieChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            {data.datasets?.map((dataset: any, index: number) => (
              <Area
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={highContrastMode ? 0.8 : 0.6}
                strokeWidth={highContrastMode ? 3 : 2}
              />
            ))}
          </AreaChart>
        );

      default:
        return null;
    }
  };

  // Render data table
  const renderDataTable = () => {
    const chartData = transformedData();

    if (type === "pie" || type === "doughnut") {
      return (
        <table
          ref={tableRef}
          className="w-full border-collapse border border-gray-300"
          role="table"
          aria-label={`Data table for ${title || "chart"}`}
        >
          <caption className="text-left font-medium mb-2">
            {title && `${title} - `}Data Table
          </caption>
          <thead>
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left">
                Category
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right">
                Value
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item: any, index: number) => {
              const total = chartData.reduce(
                (sum: number, d: any) => sum + d.value,
                0
              );
              const percentage =
                total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";

              return (
                <tr key={index}>
                  <td className="border border-gray-300 px-3 py-2">
                    {item.name}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {item.value}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {percentage}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    // For line, bar, area charts
    const columns = [
      "Name",
      ...(data.datasets?.map((d: any) => d.label) || []),
    ];

    return (
      <table
        ref={tableRef}
        className="w-full border-collapse border border-gray-300"
        role="table"
        aria-label={`Data table for ${title || "chart"}`}
      >
        <caption className="text-left font-medium mb-2">
          {title && `${title} - `}Data Table
        </caption>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="border border-gray-300 px-3 py-2 text-left"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chartData.map((item: any, index: number) => (
            <tr key={index}>
              <td className="border border-gray-300 px-3 py-2">{item.name}</td>
              {data.datasets?.map((dataset: any, datasetIndex: number) => (
                <td
                  key={datasetIndex}
                  className="border border-gray-300 px-3 py-2 text-right"
                >
                  {item[dataset.label] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          {description && <Skeleton className="h-4 w-64" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <MobileResponsiveWrapper className={className}>
      {/* Screen Reader Announcer */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announceText}
      </div>

      <Card
        className={cn(
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
          isFullscreen && "fixed inset-0 z-50 rounded-none"
        )}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="img"
        aria-label={altText}
        aria-describedby={description ? "chart-description" : undefined}
      >
        <CardHeader>
          <div
            className={`flex ${isMobile ? "flex-col gap-3" : "items-start justify-between"}`}
          >
            <div>
              {title && (
                <CardTitle className={isMobile ? "text-lg" : ""}>
                  {title}
                </CardTitle>
              )}
              {description && (
                <p
                  id="chart-description"
                  className={`text-muted-foreground mt-1 ${isMobile ? "text-sm" : ""}`}
                >
                  {description}
                </p>
              )}
            </div>

            {/* Controls */}
            <div
              className={`flex gap-2 ${isMobile ? "flex-wrap" : "items-center"}`}
            >
              {showDataTable && (
                <Select
                  value={viewMode}
                  onValueChange={(value: "chart" | "table") =>
                    handleViewModeChange(value)
                  }
                >
                  <SelectTrigger className="w-32" aria-label="Choose view mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chart">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="table">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        Table
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={toggleHighContrast}
                aria-label={`${highContrastMode ? "Disable" : "Enable"} high contrast mode`}
              >
                {highContrastMode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>

              {enableZoom && viewMode === "chart" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom("out")}
                    disabled={zoomLevel <= 0.5}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom("in")}
                    disabled={zoomLevel >= 3}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom("reset")}
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}

              {enableFullscreen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  aria-label={
                    isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                  }
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === "chart" ? (
            <div
              ref={chartRef}
              className="w-full"
              style={{
                height: isFullscreen ? "calc(100vh - 200px)" : height,
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="overflow-auto max-h-96">{renderDataTable()}</div>
          )}
        </CardContent>

        {/* Keyboard shortcuts help */}
        <div className="px-6 pb-4 text-xs text-muted-foreground">
          <p>
            Keyboard shortcuts:
            {showDataTable && " T (toggle table/chart)"}
            {enableZoom && " +/- (zoom)"}
            {enableFullscreen && " F (fullscreen)"}
            {" H (high contrast)"}
          </p>
        </div>
      </Card>
    </MobileResponsiveWrapper>
  );
}

export default AccessibleChart;
