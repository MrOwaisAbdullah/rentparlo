"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FilterConfig } from "@/types/search";
import { SelectFilter } from "./filters/select-filter";
import { RangeFilter } from "./filters/range-filter";
import { CheckboxFilter } from "./filters/checkbox-filter";
import { DateRangeFilter } from "./filters/date-range-filter";
import { MultiSelectFilter } from "./filters/multi-select-filter";
import { SearchFilter } from "./filters/search-filter";

interface FilterPanelProps {
  filterConfig: FilterConfig[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  layout?: "horizontal" | "vertical" | "grid";
  responsive?: boolean;
  className?: string;
}

export function FilterPanel({
  filterConfig,
  activeFilters,
  onFilterChange,
  layout = "horizontal",
  responsive = true,
  className,
}: FilterPanelProps) {
  // Get layout classes based on layout prop and responsive setting
  const getLayoutClasses = () => {
    const baseClasses = "filter-panel-content";

    if (!responsive) {
      return cn(baseClasses, "flex flex-wrap gap-4");
    }

    switch (layout) {
      case "vertical":
        return cn(baseClasses, "flex flex-col gap-4");
      case "grid":
        return cn(
          baseClasses,
          "grid gap-4",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        );
      case "horizontal":
      default:
        return cn(
          baseClasses,
          "flex flex-col sm:flex-row flex-wrap gap-4",
          "items-start"
        );
    }
  };

  // Render individual filter based on type
  const renderFilter = (config: FilterConfig) => {
    const value = activeFilters[config.key];
    const commonProps = {
      config,
      value,
      onChange: (newValue: any) => onFilterChange(config.key, newValue),
      className: cn(
        "filter-item",
        layout === "grid" && "w-full",
        layout === "horizontal" && "flex-shrink-0 min-w-0"
      ),
    };

    switch (config.type) {
      case "select":
        return <SelectFilter key={config.key} {...commonProps} />;
      case "multiselect":
        return <MultiSelectFilter key={config.key} {...commonProps} />;
      case "range":
        return <RangeFilter key={config.key} {...commonProps} />;
      case "checkbox":
        return <CheckboxFilter key={config.key} {...commonProps} />;
      case "date":
        return <DateRangeFilter key={config.key} {...commonProps} />;
      case "search":
        return <SearchFilter key={config.key} {...commonProps} />;
      default:
        console.warn(`Unknown filter type: ${config.type}`);
        return null;
    }
  };

  // Validate filter config
  const validFilters = filterConfig.filter((config) => {
    if (!config.key || !config.type || !config.label) {
      console.warn("Invalid filter config:", config);
      return false;
    }
    return true;
  });

  if (validFilters.length === 0) {
    return (
      <div className={cn("text-muted-foreground text-sm p-4", className)}>
        No filters available
      </div>
    );
  }

  return (
    <div
      className={cn(getLayoutClasses(), className)}
      role="group"
      aria-label="Filter controls"
    >
      {validFilters.map(renderFilter)}
    </div>
  );
}

export default FilterPanel;
