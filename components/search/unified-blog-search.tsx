"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Tag,
  Globe,
  Star,
  X,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "@/components/blog/blog-card";
import { cn } from "@/lib/utils";
import {
  BlogPostSummary,
  BlogCategory,
  BlogFilters,
  BlogPagination,
} from "@/types";
import {
  SearchLoading,
  ErrorState,
  EmptyState,
  InlineLoading,
  LoadMoreButton,
} from "@/components/ui/loading-states";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import {
  ScreenReaderAnnouncer,
  KeyboardNavigation,
  AriaUtils,
} from "@/lib/accessibility-utils";

interface UnifiedBlogSearchProps {
  posts: BlogPostSummary[];
  categories: BlogCategory[];
  tags: string[];
  filters: BlogFilters;
  pagination: BlogPagination;
  loading?: boolean;
  layout?: "sidebar" | "top" | "inline";
  showSidebar?: boolean;
  className?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

type ViewMode = "grid" | "list";

export function UnifiedBlogSearch({
  posts,
  categories,
  tags,
  filters,
  pagination,
  loading = false,
  layout = "top",
  showSidebar = true,
  className,
  hasNextPage,
  isFetchingNextPage = false,
  onLoadMore,
}: UnifiedBlogSearchProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = React.useState(filters.query || "");
  const [showFilters, setShowFilters] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isFilterLoading, setIsFilterLoading] = React.useState(false);

  // Accessibility utilities
  const announcer = ScreenReaderAnnouncer.getInstance();

  // Generate unique IDs for ARIA relationships
  const searchFormId = React.useRef(
    AriaUtils.generateId("blog-search-form")
  ).current;
  const filtersId = React.useRef(AriaUtils.generateId("blog-filters")).current;
  const resultsId = React.useRef(AriaUtils.generateId("blog-results")).current;

  // Router and search params for URL management
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const pathname = usePathname();

  // URL parameter key mapping (ensures consistency with main search bar)
  const paramKeyMap: Record<string, string> = {
    query: "q",
    minPrice: "minprice",
    maxPrice: "maxprice",
    priceType: "pricetype",
    dateFrom: "datefrom",
    dateTo: "dateto",
    featured: "featured",
    category: "category",
    tag: "tag",
    language: "language",
  };

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((query: string) => {
    setIsSearching(false);
    updateSearchParams({ query });
  }, 300);

  // Handle search input with debounce and loading state
  React.useEffect(() => {
    if (searchQuery !== (filters.query || "")) {
      setIsSearching(true);
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, filters.query, debouncedSearch]);

  // Update searchQuery when filters.query changes from outside
  React.useEffect(() => {
    if (searchQuery !== (filters.query || "")) {
      setSearchQuery(filters.query || "");
    }
  }, [filters.query]);

  const handleFilterChange = (
    key: keyof BlogFilters,
    value: string | boolean | undefined
  ) => {
    setIsFilterLoading(true);

    // Announce filter change
    announcer.announceFilterChange(
      key,
      value?.toString() || "cleared",
      pagination.total
    );

    // Update URL parameters
    updateSearchParams({ [key]: value });
    
    // Reset loading state after a short delay
    setTimeout(() => setIsFilterLoading(false), 100);
  };

  // Update URL with new search parameters
  const updateSearchParams = React.useCallback(
    (newParams: Partial<BlogFilters & { page?: string }>) => {
      const params = new URLSearchParams(currentSearchParams.toString());

      // Map internal filter keys to URL parameter names
      Object.entries(newParams).forEach(([key, value]) => {
        // Handle page parameter separately
        if (key === "page") {
          if (value === "1" || value === undefined) {
            params.delete("page");
          } else {
            params.set("page", value.toString());
          }
          return;
        }

        // Map the key to the correct URL parameter name
        const urlParamKey = paramKeyMap[key] || key;
        
        // Ensure value is properly converted to string
        const stringValue = value !== undefined && value !== null ? 
          typeof value === 'string' ? value : value.toString() : '';
        
        if (stringValue === "" || stringValue === "0" || (key === "page" && stringValue === "1")) {
          params.delete(urlParamKey);
        } else {
          params.set(urlParamKey, stringValue);
        }
      });

      // Reset page when filters change (except when explicitly setting page)
      if (!("page" in newParams)) {
        params.delete("page");
      }

      // Construct the full URL with current pathname
      const path = typeof pathname === 'string' && pathname ? pathname : '/blog';
      const searchParamsString = params.toString();
      const newUrl = searchParamsString ? `${path}?${searchParamsString}` : path;
      router.push(newUrl, { scroll: false });
    },
    [router, currentSearchParams, paramKeyMap, pathname]
  );

  const clearFilter = (key: keyof BlogFilters) => {
    // Announce filter clearing
    announcer.announceFilterCleared(key, pagination.total);

    // Update URL to clear this specific filter
    updateSearchParams({ [key]: undefined });
  };

  const clearAllFilters = () => {
    setSearchQuery("");

    // Announce all filters cleared
    announcer.announceAllFiltersCleared(pagination.total);

    // Update URL to clear all parameters
    router.push(pathname);
  };

  const activeFiltersCount = [
    filters.featured,
    filters.query,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className={cn("space-y-8", className)}>
        <BlogSearchSkeleton />
      </div>
    );
  }

  const renderFilters = () => (
    <Card className="p-4 space-y-4 bg-muted/30">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Search Button */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <Button
            onClick={() => {
              if (searchQuery) {
                updateSearchParams({ query: searchQuery });
              }
            }}
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            Search Posts
          </Button>
        </div>

        {/* Featured Posts Toggle */}
        <div>
          <label className="text-sm font-medium mb-2 block">Filter</label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured-toggle"
              checked={filters.featured || false}
              onChange={(e) =>
                handleFilterChange("featured", e.target.checked || undefined)
              }
              className="rounded border-gray-300"
            />
            <label htmlFor="featured-toggle" className="text-sm font-medium cursor-pointer">
              Featured posts only
            </label>
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Clear all filters
        </Button>
      )}
    </Card>
  );

  const renderActiveFilters = () => {
    if (activeFiltersCount === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {filters.featured && (
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3 w-3" />
            Featured only
            <button
              onClick={() => clearFilter("featured")}
              className="ml-1 hover:text-destructive"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  clearFilter("featured");
                }
              }}
              aria-label="Clear featured filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateSearchParams({ page: (pagination.page - 1).toString() })}
          disabled={pagination.page === 1}
        >
          Previous
        </Button>

        <div className="flex space-x-1">
          {Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === pagination.page;

              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "primary" : "outline"}
                  size="sm"
                  onClick={() => updateSearchParams({ page: pageNum.toString() })}
                >
                  {pageNum}
                </Button>
              );
            }
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => updateSearchParams({ page: (pagination.page + 1).toString() })}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6 px-2", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {filters.category
                ? `${categories.find((c) => c.slug.current === filters.category)?.title || "Category"} Posts`
                : "Blog Posts"}
            </h2>
            <p className="text-muted-foreground">
              {pagination.total} {pagination.total === 1 ? "post" : "posts"}{" "}
              found
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div
              className="flex rounded-lg border"
              role="group"
              aria-label="View mode selection"
            >
              <Button
                variant={viewMode === "grid" ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  setViewMode("grid");
                  announcer.announce("Grid view selected", "polite");
                }}
                className="rounded-r-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <Grid className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  setViewMode("list");
                  announcer.announce("List view selected", "polite");
                }}
                className="rounded-l-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowFilters(!showFilters);
                announcer.announce(
                  showFilters ? "Filters panel closed" : "Filters panel opened",
                  "polite"
                );
              }}
              className="relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-expanded={showFilters}
              aria-controls={filtersId}
              aria-label={`${showFilters ? "Hide" : "Show"} filters panel. ${activeFiltersCount} filters active.`}
            >
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                  aria-label={`${activeFiltersCount} active filters`}
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <label htmlFor={`${searchFormId}-input`} className="sr-only">
              Search blog posts
            </label>
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={`${searchFormId}-input`}
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => {
                const newValue = e.target.value;
                setSearchQuery(newValue);
              }}
              className="pl-10 pr-10"
              aria-label={AriaUtils.createFilterLabel(
                "Search blog posts",
                searchQuery || undefined
              )}
              aria-describedby={`${searchFormId}-description`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Update URL with new search query when Enter is pressed
                  updateSearchParams({ query: searchQuery });
                }
              }}
            />
            {isSearching && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Searching blog posts"
              >
                <InlineLoading size="sm" text="" />
              </div>
            )}
            {/* Hidden description for screen readers */}
            <div id={`${searchFormId}-description`} className="sr-only">
              Search blog posts by title, content, or tags. Press Enter to search.
            </div>
          </div>
          <Button
            onClick={() => {
              updateSearchParams({ query: searchQuery });
            }}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-4 space-y-4 bg-muted/30">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured-toggle"
                checked={filters.featured || false}
                onChange={(e) =>
                  handleFilterChange("featured", e.target.checked || undefined)
                }
                className="rounded border-gray-300"
              />
              <label htmlFor="featured-toggle" className="text-sm font-medium cursor-pointer">
                Show featured posts only
              </label>
            </div>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.featured && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              Featured only
              <button
                onClick={() => clearFilter("featured")}
                className="ml-1 hover:text-destructive"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    clearFilter("featured");
                  }
                }}
                aria-label="Clear featured filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {loading ? (
        <SearchLoading message="Loading blog posts..." />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts found"
          message="Try adjusting your search criteria or clearing the filters."
          action={
            <Button variant="outline" onClick={clearAllFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div
          className={cn(
            "grid gap-4",
            viewMode === "grid"
              ? "md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          )}
        >
          {posts.map((post) => (
            <BlogCard
              key={post._id}
              post={post}
              variant={viewMode === "grid" ? "primary" : "horizontal"}
              showExcerpt={true}
              showDate={true}
              showCategories={true}
              showReadingTime={true}
            />
          ))}
        </div>
      )}

      {/* Filter Loading Indicator */}
      {isFilterLoading && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-background border rounded-lg p-3 shadow-lg">
            <InlineLoading text="Updating filters..." />
          </div>
        </div>
      )}

      {/* Load More Button */}
      {(hasNextPage ?? false) && onLoadMore && (
        <div className="text-center pt-8">
          <Button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load More Posts"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Loading skeleton component
function BlogSearchSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-16" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}