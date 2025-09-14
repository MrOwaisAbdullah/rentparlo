"use client";

import React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  ResponsiveFlex,
  useBreakpoint,
} from "@/components/layout/responsive-container";

interface ResponsiveFilterPanelProps {
  children: React.ReactNode;
  activeFilterCount?: number;
  onClearAll?: () => void;
  className?: string;
  triggerClassName?: string;
  title?: string;
}

/**
 * Responsive filter panel that shows filters inline on desktop and in a sheet on mobile
 */
export function ResponsiveFilterPanel({
  children,
  activeFilterCount = 0,
  onClearAll,
  className,
  triggerClassName,
  title = "Filters",
}: ResponsiveFilterPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "mobile";

  // On desktop, show filters inline
  if (!isMobile) {
    return (
      <ResponsiveContainer
        className={cn("w-full", className)}
        preventHorizontalScroll={true}
      >
        {children}
      </ResponsiveContainer>
    );
  }

  // On mobile, show filters in a sheet
  return (
    <div className={cn("w-full", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-between", triggerClassName)}
          >
            <ResponsiveFlex align="center" gap="sm" className="flex-1">
              <Filter className="h-4 w-4" />
              <span>{title}</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {activeFilterCount}
                </Badge>
              )}
            </ResponsiveFlex>
          </Button>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <ResponsiveFlex justify="between" align="center">
              <SheetTitle>{title}</SheetTitle>
              {activeFilterCount > 0 && onClearAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearAll();
                    setIsOpen(false);
                  }}
                  className="text-sm"
                >
                  Clear All
                  <X className="w-4 h-4 ml-1" />
                </Button>
              )}
            </ResponsiveFlex>
          </SheetHeader>

          <div className="overflow-y-auto">{children}</div>

          <div className="pt-4 border-t mt-4">
            <Button onClick={() => setIsOpen(false)} className="w-full">
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/**
 * Active filters display component that shows applied filters with clear options
 */
export function ActiveFiltersDisplay({
  filters,
  onClearFilter,
  onClearAll,
  className,
}: {
  filters: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}) {
  if (filters.length === 0) return null;

  return (
    <ResponsiveContainer
      className={cn("w-full", className)}
      preventHorizontalScroll={true}
    >
      <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
        <ResponsiveFlex justify="between" align="center" className="mb-3">
          <h4 className="text-sm font-medium">Active Filters</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs"
          >
            Clear All
          </Button>
        </ResponsiveFlex>

        <ResponsiveFlex wrap={true} gap="sm" className="w-full">
          {filters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1 max-w-full"
            >
              <span className="truncate max-w-[120px] sm:max-w-[200px]">
                {filter.label}: {filter.value}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                onClick={() => onClearFilter(filter.key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </ResponsiveFlex>
      </div>
    </ResponsiveContainer>
  );
}

/**
 * Responsive sort and view controls
 */
export function ResponsiveSortControls({
  sortOptions,
  currentSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  className,
}: {
  sortOptions: Array<{ value: string; label: string }>;
  currentSort: string;
  onSortChange: (sort: string) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  className?: string;
}) {
  return (
    <ResponsiveContainer
      className={cn("w-full", className)}
      preventHorizontalScroll={true}
    >
      <ResponsiveFlex
        justify="between"
        align="center"
        gap="sm"
        className="bg-background border rounded-lg p-3"
      >
        <div className="flex-1 min-w-0">
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full p-2 border rounded text-sm min-w-0"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {viewMode && onViewModeChange && (
          <div className="flex border rounded overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-none"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-none"
            >
              List
            </Button>
          </div>
        )}
      </ResponsiveFlex>
    </ResponsiveContainer>
  );
}
