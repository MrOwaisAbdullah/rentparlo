"use client";

import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  useBreakpoint,
} from "@/components/layout/responsive-container";
import { cn } from "@/lib/utils";

interface ResponsiveSearchResultsProps {
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRetry?: () => void;
  className?: string;
  viewMode?: "grid" | "list";
  emptyMessage?: string;
  emptyDescription?: string;
}

/**
 * Responsive search results container with loading states, error handling, and pagination
 */
export function ResponsiveSearchResults({
  children,
  isLoading = false,
  error = null,
  totalResults = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onRetry,
  className,
  viewMode = "grid",
  emptyMessage = "No results found",
  emptyDescription = "Try adjusting your search criteria or filters",
}: ResponsiveSearchResultsProps) {
  const breakpoint = useBreakpoint();

  // Loading state
  if (isLoading) {
    return (
      <ResponsiveContainer
        className={cn("w-full", className)}
        preventHorizontalScroll={true}
      >
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading results...</p>
        </div>
      </ResponsiveContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <ResponsiveContainer
        className={cn("w-full", className)}
        preventHorizontalScroll={true}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>{error}</span>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="w-full sm:w-auto"
              >
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </ResponsiveContainer>
    );
  }

  // Empty state
  if (totalResults === 0) {
    return (
      <ResponsiveContainer
        className={cn("w-full", className)}
        preventHorizontalScroll={true}
      >
        <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{emptyMessage}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {emptyDescription}
            </p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  // Results grid configuration based on breakpoint and view mode
  const getGridColumns = () => {
    if (viewMode === "list") {
      return { mobile: 1, tablet: 1, desktop: 1 };
    }

    switch (breakpoint) {
      case "mobile":
        return { mobile: 1, tablet: 2, desktop: 3 };
      case "tablet":
        return { mobile: 1, tablet: 2, desktop: 3 };
      case "desktop":
        return { mobile: 1, tablet: 2, desktop: 3, wide: 4 };
      case "wide":
        return { mobile: 1, tablet: 2, desktop: 3, wide: 4 };
      default:
        return { mobile: 1, tablet: 2, desktop: 3 };
    }
  };

  return (
    <ResponsiveContainer
      className={cn("w-full space-y-6", className)}
      preventHorizontalScroll={true}
    >
      {/* Results count */}
      <ResponsiveFlex
        justify="between"
        align="center"
        className="text-sm text-muted-foreground"
      >
        <span>
          {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}{" "}
          found
        </span>
        {totalPages > 1 && (
          <span className="hidden sm:inline">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </ResponsiveFlex>

      {/* Results grid */}
      <ResponsiveGrid
        columns={getGridColumns()}
        gap="default"
        className="w-full"
        preventOverflow={true}
      >
        {children}
      </ResponsiveGrid>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <ResponsivePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </ResponsiveContainer>
  );
}

/**
 * Responsive pagination component
 */
function ResponsivePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "mobile";

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const maxVisible = isMobile ? 3 : 7;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <ResponsiveContainer
      className={cn("w-full", className)}
      preventHorizontalScroll={true}
    >
      <ResponsiveFlex
        justify="center"
        align="center"
        gap="sm"
        className="overflow-x-auto scrollbar-hide py-2"
      >
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex-shrink-0"
        >
          {isMobile ? "‹" : "Previous"}
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {/* First page if not visible */}
          {visiblePages[0] > 1 && (
            <>
              <Button
                variant={1 === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(1)}
                className="flex-shrink-0 w-8 h-8 p-0"
              >
                1
              </Button>
              {visiblePages[0] > 2 && (
                <span className="text-muted-foreground px-1">...</span>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="flex-shrink-0 w-8 h-8 p-0"
            >
              {page}
            </Button>
          ))}

          {/* Last page if not visible */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="text-muted-foreground px-1">...</span>
              )}
              <Button
                variant={totalPages === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="flex-shrink-0 w-8 h-8 p-0"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex-shrink-0"
        >
          {isMobile ? "›" : "Next"}
        </Button>
      </ResponsiveFlex>

      {/* Mobile page info */}
      {isMobile && (
        <div className="text-center text-xs text-muted-foreground mt-2">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </ResponsiveContainer>
  );
}
