"use client";

import React from "react";
import {
  X,
  RotateCcw,
  Search,
  MapPin,
  Tag,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FilterConfig } from "@/types/search";

interface ActiveFiltersProps {
  filters: Record<string, any>;
  filterConfig: FilterConfig[];
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
  clearAllLabel?: string;
  className?: string;
  showClearAll?: boolean;
  maxDisplayed?: number;
}

export function ActiveFilters({
  filters,
  filterConfig,
  onClearFilter,
  onClearAll,
  clearAllLabel = "Clear All",
  className,
  showClearAll = true,
  maxDisplayed = 10,
}: ActiveFiltersProps) {
  // Get filter config by key for display purposes
  const getFilterConfig = (key: string) => {
    return filterConfig.find((config) => config.key === key);
  };

  // Get icon for filter type
  const getFilterIcon = (type: string, key: string) => {
    switch (type) {
      case "search":
        return Search;
      case "select":
        if (
          key.includes("location") ||
          key.includes("city") ||
          key.includes("area")
        ) {
          return MapPin;
        }
        if (key.includes("category") || key.includes("tag")) {
          return Tag;
        }
        return null;
      case "range":
        if (key.includes("price")) {
          return DollarSign;
        }
        return null;
      case "date":
        return Calendar;
      default:
        return null;
    }
  };

  // Format filter value for display
  const formatFilterValue = (
    key: string,
    value: any,
    config?: FilterConfig
  ) => {
    if (value === null || value === undefined) return "";

    // Handle different value types
    if (Array.isArray(value)) {
      if (value.length === 0) return "";
      if (value.length === 1) return value[0];
      return `${value[0]} +${value.length - 1}`;
    }

    if (typeof value === "object") {
      // Handle date ranges
      if (value.start && value.end) {
        const start = new Date(value.start).toLocaleDateString();
        const end = new Date(value.end).toLocaleDateString();
        return `${start} - ${end}`;
      }

      // Handle price ranges
      if (value.min !== undefined && value.max !== undefined) {
        if (value.min === 0 && value.max === 0) return "";
        if (value.min === 0) return `Up to ${value.max.toLocaleString()}`;
        if (value.max === 0) return `From ${value.min.toLocaleString()}`;
        return `${value.min.toLocaleString()} - ${value.max.toLocaleString()}`;
      }

      return JSON.stringify(value);
    }

    // Handle boolean values
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    // Handle numbers
    if (typeof value === "number") {
      if (key.includes("price")) {
        return value.toLocaleString();
      }
      return value.toString();
    }

    // Handle strings - look for option labels in config
    if (config && config.options) {
      const option = config.options.find((opt) => opt.value === value);
      return option ? option.label : value;
    }

    return value.toString();
  };

  // Get active filters with their display information
  const activeFilters = React.useMemo(() => {
    return Object.entries(filters)
      .filter(([key, value]) => {
        // Filter out empty values
        if (value === null || value === undefined || value === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "object" && Object.keys(value).length === 0)
          return false;
        if (typeof value === "object" && value.min === 0 && value.max === 0)
          return false;
        return true;
      })
      .map(([key, value]) => {
        const config = getFilterConfig(key);
        const Icon = config ? getFilterIcon(config.type, key) : null;
        const displayValue = formatFilterValue(key, value, config);
        const label = config ? config.label : key;

        return {
          key,
          value,
          displayValue,
          label,
          config,
          Icon,
        };
      })
      .slice(0, maxDisplayed); // Limit displayed filters
  }, [filters, filterConfig, maxDisplayed]);

  const totalActiveCount = Object.keys(filters).filter((key) => {
    const value = filters[key];
    return (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === "object" && Object.keys(value).length === 0)
    );
  }).length;

  const hasMoreFilters = totalActiveCount > maxDisplayed;

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "active-filters flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg border",
        "transition-all duration-200",
        className
      )}
      role="region"
      aria-label={`Active filters (${totalActiveCount})`}
    >
      {/* Active filter badges */}
      {activeFilters.map(({ key, displayValue, label, Icon }) => (
        <Badge
          key={key}
          variant="secondary"
          className={cn(
            "flex items-center gap-1.5 pr-1 max-w-xs",
            "hover:bg-secondary/80 transition-colors"
          )}
        >
          {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
          <span className="truncate">
            <span className="font-medium">{label}:</span>{" "}
            <span className="font-normal">{displayValue}</span>
          </span>
          <button
            onClick={() => onClearFilter(key)}
            className={cn(
              "ml-1 hover:bg-muted rounded-full p-0.5 transition-colors",
              "focus:outline-none focus:ring-1 focus:ring-ring"
            )}
            aria-label={`Remove ${label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {/* Show more indicator */}
      {hasMoreFilters && (
        <Badge variant="outline" className="text-muted-foreground">
          +{totalActiveCount - maxDisplayed} more
        </Badge>
      )}

      {/* Clear all button */}
      {showClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className={cn(
            "text-muted-foreground hover:text-foreground ml-auto",
            "flex items-center gap-1 px-2 py-1 h-auto"
          )}
          aria-label={`${clearAllLabel} (${totalActiveCount} active)`}
        >
          <RotateCcw className="w-3 h-3" />
          {clearAllLabel}
        </Button>
      )}
    </div>
  );
}

export default ActiveFilters;
