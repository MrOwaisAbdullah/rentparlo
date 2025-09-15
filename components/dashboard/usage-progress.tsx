"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsageProgressProps } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function UsageProgress({
  label,
  used,
  limit,
  unit = "",
  warningThreshold = 80,
  showPercentage = true,
}: UsageProgressProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isWarning = percentage >= warningThreshold;
  const isAtLimit = used >= limit;

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const getProgressColor = () => {
    if (isAtLimit) return "bg-red-500";
    if (isWarning) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getBadgeVariant = () => {
    if (isAtLimit) return "destructive";
    if (isWarning) return "secondary";
    return "default";
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">
              {formatValue(used)} / {formatValue(limit)} {unit}
            </p>
          </div>
          {showPercentage && (
            <Badge variant={getBadgeVariant()} className="text-xs">
              {Math.round(percentage)}%
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Progress value={percentage} className="h-2" />

          {isAtLimit && (
            <p className="text-xs text-red-600 font-medium">
              Limit reached - consider upgrading your package
            </p>
          )}

          {isWarning && !isAtLimit && (
            <p className="text-xs text-yellow-600 font-medium">
              Approaching limit - {limit - used} {unit} remaining
            </p>
          )}

          {!isWarning && !isAtLimit && (
            <p className="text-xs text-green-600">
              {limit - used} {unit} remaining
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
