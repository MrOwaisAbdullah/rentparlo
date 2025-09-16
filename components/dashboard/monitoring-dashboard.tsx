"use client";

import React, { useState, useEffect, memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Server,
  Users,
  BarChart3,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useDashboardMonitoring } from "@/lib/dashboard-monitoring";
import { InteractiveChart, createChartOptions } from "./interactive-chart";
import { formatDistanceToNow } from "date-fns";

interface MonitoringStats {
  errors: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    resolved: number;
    resolutionRate: number;
  };
  alerts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    acknowledged: number;
    acknowledgmentRate: number;
  };
  performance: {
    avgLoadTime: number;
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  system: {
    memoryUsage: number;
    activeUsers: number;
    activeSessions: number;
    connectionType: string;
  };
}

interface RecentError {
  id: string;
  errorId: string;
  componentName: string;
  errorMessage: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  createdAt: string;
  url: string;
}

interface RecentAlert {
  id: string;
  metric: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  acknowledged: boolean;
  createdAt: string;
  value?: number;
  threshold?: number;
}

const MonitoringDashboard = memo(function MonitoringDashboard() {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<RecentError[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { metrics, health, monitor } = useDashboardMonitoring();

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      setIsLoading(true);

      const [statsResponse, errorsResponse, alertsResponse] = await Promise.all(
        [
          fetch("/api/monitoring/stats"),
          fetch("/api/errors?limit=10"),
          fetch("/api/monitoring/alerts?limit=10"),
        ]
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (errorsResponse.ok) {
        const errorsData = await errorsResponse.json();
        setRecentErrors(errorsData.errors || []);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setRecentAlerts(alertsData.alerts || []);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    fetchMonitoringData();

    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Memoized chart data
  const performanceChartData = useMemo(() => {
    if (!metrics) return { labels: [], datasets: [] };

    return {
      labels: ["Load Time", "Response Time", "Error Rate", "Memory Usage"],
      datasets: [
        {
          label: "Performance Metrics",
          data: [
            metrics.pageLoadTime,
            metrics.timeToInteractive,
            stats?.performance.errorRate || 0,
            health?.memoryUsage || 0,
          ],
          backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
        },
      ],
    };
  }, [metrics, stats, health]);

  const errorTrendData = useMemo(() => {
    if (!recentErrors.length) return { labels: [], datasets: [] };

    const last24Hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (23 - i));
      return hour.getHours();
    });

    const errorCounts = last24Hours.map((hour) => {
      return recentErrors.filter((error) => {
        const errorHour = new Date(error.createdAt).getHours();
        return errorHour === hour;
      }).length;
    });

    return {
      labels: last24Hours.map((h) => `${h}:00`),
      datasets: [
        {
          label: "Errors per Hour",
          data: errorCounts,
          borderColor: "#EF4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          fill: true,
        },
      ],
    };
  }, [recentErrors]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <AlertCircle className="h-4 w-4" />;
      case "low":
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            System Monitoring
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring and error tracking for the dashboard system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity
              className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-pulse" : ""}`}
            />
            Auto Refresh: {autoRefresh ? "On" : "Off"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMonitoringData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  System Status
                </p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress
                value={stats?.performance.uptime || 99.9}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.performance.uptime || 99.9}% uptime
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Errors
                </p>
                <p className="text-2xl font-bold">
                  {stats?.errors.total - stats?.errors.resolved || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                {stats?.errors.critical || 0} Critical
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats?.errors.resolutionRate || 0}% Resolved
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Performance
                </p>
                <p className="text-2xl font-bold">
                  {stats?.performance.avgLoadTime || 0}ms
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Avg load time • {stats?.performance.errorRate || 0}% error rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Users
                </p>
                <p className="text-2xl font-bold">
                  {stats?.system.activeUsers || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                {stats?.system.activeSessions || 0} active sessions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="errors" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Errors</TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Alerts</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractiveChart
              type="bar"
              data={performanceChartData}
              title="Performance Overview"
              height={300}
              options={createChartOptions("Performance Overview", true, true)}
            />

            <InteractiveChart
              type="line"
              data={errorTrendData}
              title="Error Trend (24h)"
              height={300}
              options={createChartOptions("Error Trend (24h)", true, true)}
            />
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Memory Usage</p>
                  <Progress
                    value={(health?.memoryUsage || 0) / 1024 / 1024}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {((health?.memoryUsage || 0) / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Connection</p>
                  <Badge variant="outline">
                    {health?.connectionType || "Unknown"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {health?.isOnline ? "Online" : "Offline"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Viewport</p>
                  <p className="text-sm">
                    {health?.viewportSize.width}x{health?.viewportSize.height}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    DPR: {health?.devicePixelRatio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {stats?.errors.critical || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {stats?.errors.high || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">High</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats?.errors.medium || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Medium</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.errors.low || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Low</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentErrors.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent errors</p>
                  </div>
                ) : (
                  recentErrors.map((error) => (
                    <div
                      key={error.id}
                      className={`p-4 rounded-lg border ${getSeverityColor(error.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(error.severity)}
                          <div>
                            <p className="font-medium">{error.componentName}</p>
                            <p className="text-sm text-muted-foreground">
                              {error.errorMessage}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(error.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={error.resolved ? "default" : "secondary"}
                          >
                            {error.resolved ? "Resolved" : "Open"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {error.severity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent alerts</p>
                  </div>
                ) : (
                  recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <p className="font-medium">{alert.metric}</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.message}
                            </p>
                            {alert.value && alert.threshold && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Value: {alert.value} | Threshold:{" "}
                                {alert.threshold}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              alert.acknowledged ? "default" : "secondary"
                            }
                          >
                            {alert.acknowledged ? "Acknowledged" : "New"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metrics?.pageLoadTime?.toFixed(0) || 0}ms
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Page Load Time
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metrics?.firstContentfulPaint?.toFixed(0) || 0}ms
                  </p>
                  <p className="text-sm text-muted-foreground">
                    First Contentful Paint
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metrics?.largestContentfulPaint?.toFixed(0) || 0}ms
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Largest Contentful Paint
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metrics?.cumulativeLayoutShift?.toFixed(3) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cumulative Layout Shift
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </div>
      )}
    </div>
  );
});

export default MonitoringDashboard;
