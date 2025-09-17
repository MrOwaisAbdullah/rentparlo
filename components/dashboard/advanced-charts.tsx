"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ZoomIn,
  Download,
} from "lucide-react";

interface TrendChartProps {
  data: Array<{
    date: string;
    views: number;
    contacts: number;
    conversions: number;
  }>;
  height?: number;
  showBrush?: boolean;
  showZoom?: boolean;
}

export function TrendChart({
  data,
  height = 400,
  showBrush = true,
  showZoom = false,
}: TrendChartProps) {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<
    "all" | "views" | "contacts" | "conversions"
  >("all");

  const handleZoomReset = () => {
    setZoomDomain(null);
  };

  const filteredData = data.map((item) => {
    const result: any = { date: item.date };
    if (selectedMetric === "all" || selectedMetric === "views")
      result.Views = item.views;
    if (selectedMetric === "all" || selectedMetric === "contacts")
      result.Contacts = item.contacts;
    if (selectedMetric === "all" || selectedMetric === "conversions")
      result.Conversions = item.conversions;
    return result;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={selectedMetric}
              onValueChange={(value: any) => setSelectedMetric(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="views">Views Only</SelectItem>
                <SelectItem value="contacts">Contacts Only</SelectItem>
                <SelectItem value="conversions">Conversions Only</SelectItem>
              </SelectContent>
            </Select>
            {showZoom && zoomDomain && (
              <Button variant="outline" size="sm" onClick={handleZoomReset}>
                Reset Zoom
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              domain={zoomDomain || ["dataMin", "dataMax"]}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              labelFormatter={(value) => `Date: ${value}`}
            />
            <Legend />

            {(selectedMetric === "all" || selectedMetric === "views") && (
              <Line
                type="monotone"
                dataKey="Views"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            )}

            {(selectedMetric === "all" || selectedMetric === "contacts") && (
              <Bar
                dataKey="Contacts"
                fill="#10b981"
                fillOpacity={0.6}
                radius={[2, 2, 0, 0]}
              />
            )}

            {(selectedMetric === "all" || selectedMetric === "conversions") && (
              <Line
                type="monotone"
                dataKey="Conversions"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
              />
            )}

            {showBrush && (
              <Brush
                dataKey="date"
                height={30}
                stroke="#8884d8"
                onChange={(brushData: any) => {
                  if (
                    brushData?.startIndex !== undefined &&
                    brushData?.endIndex !== undefined
                  ) {
                    setZoomDomain([brushData.startIndex, brushData.endIndex]);
                  }
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ConversionFunnelProps {
  data: {
    views: number;
    contacts: number;
    conversions: number;
  };
  height?: number;
}

export function ConversionFunnel({
  data,
  height = 300,
}: ConversionFunnelProps) {
  const funnelData = [
    { name: "Views", value: data.views, percentage: 100, color: "#3b82f6" },
    {
      name: "Contacts",
      value: data.contacts,
      percentage: (data.contacts / data.views) * 100,
      color: "#10b981",
    },
    {
      name: "Conversions",
      value: data.conversions,
      percentage: (data.conversions / data.views) * 100,
      color: "#f59e0b",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Conversion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((stage, index) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {stage.value.toLocaleString()}
                  </span>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: stage.color + "20",
                      color: stage.color,
                    }}
                  >
                    {stage.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stage.percentage}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
              {index < funnelData.length - 1 && (
                <div className="flex items-center justify-center py-1">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface PerformanceComparisonProps {
  data: Array<{
    name: string;
    current: number;
    previous: number;
    target?: number;
  }>;
  height?: number;
}

export function PerformanceComparison({
  data,
  height = 300,
}: PerformanceComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Bar
              dataKey="previous"
              fill="#94a3b8"
              name="Previous Period"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="current"
              fill="#3b82f6"
              name="Current Period"
              radius={[4, 4, 0, 0]}
            />
            {data.some((d) => d.target) && (
              <ReferenceLine
                y={data[0]?.target}
                stroke="#ef4444"
                strokeDasharray="5 5"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface DeviceBreakdownProps {
  data: Array<{
    device: string;
    views: number;
    contacts: number;
    percentage: number;
  }>;
  height?: number;
}

export function DeviceBreakdown({ data, height = 300 }: DeviceBreakdownProps) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"pie" | "bar">("pie");

  const pieData = data.map((item, index) => ({
    ...item,
    fill: ["#3b82f6", "#10b981", "#f59e0b"][index] || "#6b7280",
    conversionRate: item.views > 0 ? (item.contacts / item.views) * 100 : 0,
  }));

  // Calculate device insights
  const totalViews = data.reduce((sum, device) => sum + device.views, 0);
  const totalContacts = data.reduce((sum, device) => sum + device.contacts, 0);
  const bestPerformingDevice = data.reduce((prev, current) =>
    (current.views > 0 ? current.contacts / current.views : 0) >
    (prev.views > 0 ? prev.contacts / prev.views : 0)
      ? current
      : prev
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Device Performance</CardTitle>
            <Select
              value={viewMode}
              onValueChange={(value: any) => setViewMode(value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={height}>
              {viewMode === "pie" ? (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 60}
                    outerRadius={isMobile ? 80 : 120}
                    paddingAngle={2}
                    dataKey="views"
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
                    }}
                  />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart
                  data={pieData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="device"
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="views"
                    fill="#3b82f6"
                    name="Views"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="contacts"
                    fill="#10b981"
                    name="Contacts"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>

            <div className="space-y-4">
              {data.map((device, index) => {
                const conversionRate =
                  device.views > 0 ? (device.contacts / device.views) * 100 : 0;
                const isTopPerformer =
                  device.device === bestPerformingDevice.device;

                return (
                  <div
                    key={device.device}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isTopPerformer ? "border-green-200 bg-green-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: pieData[index].fill }}
                      />
                      <div>
                        <div className="font-medium capitalize flex items-center gap-2">
                          {device.device}
                          {isTopPerformer && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Best
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {conversionRate.toFixed(1)}% contact rate
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {device.views.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {device.contacts} contacts (
                        {device.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Most Popular Device
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {
                data.reduce((prev, current) =>
                  prev.views > current.views ? prev : current
                ).device
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {data
                .reduce((prev, current) =>
                  prev.views > current.views ? prev : current
                )
                .percentage.toFixed(1)}
              % of total views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Best Converting Device
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {bestPerformingDevice.device}
            </div>
            <p className="text-xs text-muted-foreground">
              {bestPerformingDevice.views > 0
                ? (
                    (bestPerformingDevice.contacts /
                      bestPerformingDevice.views) *
                    100
                  ).toFixed(1)
                : 0}
              % contact rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Mobile Dominance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.find((d) => d.device === "mobile")?.percentage.toFixed(0) ||
                0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Mobile traffic share
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
