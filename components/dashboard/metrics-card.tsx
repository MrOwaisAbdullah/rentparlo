"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MetricsCardProps } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function MetricsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  trend,
  loading = false,
  description,
  "aria-label": ariaLabel,
  ...props
}: MetricsCardProps & { "aria-label"?: string }) {
  const isMobile = useIsMobile();
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="h-3 w-3" />;
      case "decrease":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-green-600 bg-green-50 border-green-200";
      case "decrease":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        isMobile && "touch-manipulation"
      )}
      role="region"
      aria-label={ariaLabel || `${title} metric card`}
      tabIndex={0}
      {...props}
    >
      <CardHeader
        className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? "pb-1" : "pb-2"}`}
      >
        <CardTitle
          className={`font-medium text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
          id={`metric-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
          title={description}
        >
          {title}
        </CardTitle>
        <Icon
          className={`text-muted-foreground ${isMobile ? "h-3 w-3" : "h-4 w-4"}`}
          aria-hidden="true"
        />
      </CardHeader>
      <CardContent className={isMobile ? "pt-1" : ""}>
        <div
          className={`flex items-center ${isMobile ? "flex-col items-start gap-2" : "justify-between"}`}
        >
          <div className={isMobile ? "w-full" : ""}>
            <div
              className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}
              aria-describedby={`metric-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
            >
              {formatValue(value)}
            </div>
            {change !== undefined && (
              <div
                className={`flex items-center ${isMobile ? "mt-1" : "mt-1"}`}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1",
                    isMobile ? "text-xs px-1.5 py-0.5" : "text-xs",
                    getChangeColor()
                  )}
                  aria-label={`${changeType === "increase" ? "Increased" : changeType === "decrease" ? "Decreased" : "No change"} by ${Math.abs(change)} percent`}
                >
                  {getChangeIcon()}
                  <span aria-hidden="true">{Math.abs(change)}%</span>
                </Badge>
              </div>
            )}
          </div>
          {trend && trend.length > 0 && !isMobile && (
            <div
              className="flex items-end space-x-1 h-8"
              role="img"
              aria-label={`Trend chart showing ${trend.length} data points with values ranging from ${Math.min(...trend)} to ${Math.max(...trend)}`}
            >
              {trend.map((point, index) => (
                <div
                  key={index}
                  className="bg-primary/20 rounded-sm w-1"
                  style={{
                    height: `${Math.max((point / Math.max(...trend)) * 100, 10)}%`,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
          {trend && trend.length > 0 && isMobile && (
            <div
              className="flex items-end space-x-0.5 h-6 w-full mt-2"
              role="img"
              aria-label={`Trend chart showing ${trend.length} data points with values ranging from ${Math.min(...trend)} to ${Math.max(...trend)}`}
            >
              {trend.map((point, index) => (
                <div
                  key={index}
                  className="bg-primary/20 rounded-sm flex-1 min-w-[2px]"
                  style={{
                    height: `${Math.max((point / Math.max(...trend)) * 100, 15)}%`,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
