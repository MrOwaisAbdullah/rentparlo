"use client";

import React from "react";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FilterConfig } from "@/types/search";
import { FilterPanel } from "./filter-panel";
import { ActiveFilters } from "./active-filters";

interface FilterManagerProps {
  filters: Record<string, any>;
  filterConfig: FilterConfig[];
  onFilterChange: (key: string, value: any) => void;
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
  showActiveFilters?: boolean;
  layout?: "horizontal" | "vertical" | "grid";
  className?: string;
  showFilterToggle?: boolean;
  filterToggleLabel?: string;
  clearAllLabel?: string;
  responsive?: boolean;
}

export function FilterManager({
  filters,
  filterConfig,
  onFilterChange,
  onClearFilter,
  onClearAll,
  showActiveFilters = true,
  layout = "horizontal",
  className,
  showFilterToggle = false,
  filterToggleLabel = "Filters",
  clearAllLabel = "Clear All",
  responsive = true,
}: FilterManagerProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  // Calculate active filter count
  const getActiveFilterCount = React.useCallback(() => {
    return Object.keys(filters).filter((key) => {
      const value = filters[key];
      return (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0) &&
        !(typeof value === "object" && Object.keys(value).length === 0)
      );
    }).length;
  }, [filters]);

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  // Handle clear all with confirmation for large number of filters
  const handleClearAll = React.useCallback(() => {
    if (activeFilterCount > 5) {
      if (
        window.confirm(
          `Are you sure you want to clear all ${activeFilterCount} filters?`
        )
      ) {
        onClearAll();
      }
    } else {
      onClearAll();
    }
  }, [activeFilterCount, onClearAll]);

  // Responsive layout classes
  const getLayoutClasses = () => {
    const baseClasses = "w-full";

    if (!responsive) return baseClasses;

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
          "flex flex-col lg:flex-row gap-4 lg:items-start"
        );
    }
  };

  return (
    <div className={cn("filter-manager", getLayoutClasses(), className)}>
      {/* Filter Toggle (Mobile/Tablet) */}
      {showFilterToggle && (
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {filterToggleLabel}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`${clearAllLabel} (${activeFilterCount} active)`}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              {clearAllLabel}
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {showActiveFilters && hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          filterConfig={filterConfig}
          onClearFilter={onClearFilter}
          onClearAll={handleClearAll}
          clearAllLabel={clearAllLabel}
          className={cn(
            "transition-all duration-200",
            showFilterToggle && !showFilters && "lg:block hidden"
          )}
        />
      )}

      {/* Filter Panel */}
      <div
        id="filter-panel"
        className={cn(
          "filter-panel transition-all duration-300",
          showFilterToggle && (showFilters ? "block" : "hidden lg:block")
        )}
      >
        <FilterPanel
          filterConfig={filterConfig}
          activeFilters={filters}
          onFilterChange={onFilterChange}
          layout={layout}
          responsive={responsive}
        />
      </div>

      {/* Clear All Button (Desktop) */}
      {hasActiveFilters && !showFilterToggle && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`${clearAllLabel} (${activeFilterCount} active)`}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            {clearAllLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default FilterManager;
