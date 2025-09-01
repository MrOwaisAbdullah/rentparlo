"use client";

import React from "react";
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
  onFiltersChange: (filters: BlogFilters) => void;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  layout?: "sidebar" | "top" | "inline";
  showSidebar?: boolean;
  className?: string;
}

type ViewMode = "grid" | "list";
type SortBy = "newest" | "oldest" | "popular" | "title" | "featured";

export function UnifiedBlogSearch({
  posts,
  categories,
  tags,
  filters,
  pagination,
  loading = false,
  onFiltersChange,
  onPageChange,
  onSearch,
  layout = "top",
  showSidebar = true,
  className,
}: UnifiedBlogSearchProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [sortBy, setSortBy] = React.useState<SortBy>("newest");
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

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((query: string) => {
    setIsSearching(false);
    onSearch(query);
  }, 300);

  // Debounced filter handler
  const debouncedFilterChange = useDebouncedCallback(
    (newFilters: BlogFilters) => {
      setIsFilterLoading(false);
      onFiltersChange(newFilters);
    },
    100
  );

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

    const newFilters = {
      ...filters,
      [key]: value,
    };
    debouncedFilterChange(newFilters);
  };

  const clearFilter = (key: keyof BlogFilters) => {
    // Announce filter clearing
    announcer.announceFilterCleared(key, pagination.total);

    const newFilters = { ...filters };
    delete newFilters[key];
    // Only pass defined values to avoid undefined properties
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, value]) => value !== undefined)
    ) as BlogFilters;
    onFiltersChange(cleanFilters);
  };

  const clearAllFilters = () => {
    setSearchQuery("");

    // Announce all filters cleared
    announcer.announceAllFiltersCleared(pagination.total);

    onFiltersChange({
      query: "",
      category: undefined,
      tag: undefined,
      language: undefined,
      featured: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const activeFiltersCount = [
    filters.category,
    filters.tag,
    filters.language,
    filters.featured,
    filters.dateFrom,
    filters.dateTo,
    filters.query,
  ].filter(Boolean).length;

  const handleSortChange = (newSortBy: SortBy) => {
    setSortBy(newSortBy);

    // Announce sort change
    announcer.announce(`Sort order changed to ${newSortBy}`, "polite");

    // You can implement actual sorting logic here or pass it to parent
  };

  if (loading) {
    return (
      <div className={cn("space-y-8", className)}>
        <BlogSearchSkeleton />
      </div>
    );
  }

  const renderFilters = () => (
    <Card className="p-4 space-y-4 bg-muted/30">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Select
            value={filters.category || "any"}
            onValueChange={(value) =>
              handleFilterChange(
                "category",
                value === "any" ? undefined : value
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category.slug.current}>
                  {category.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tag Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tag</label>
          <Select
            value={filters.tag || "any"}
            onValueChange={(value) =>
              handleFilterChange("tag", value === "any" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Language</label>
          <Select
            value={filters.language || "any"}
            onValueChange={(value) =>
              handleFilterChange(
                "language",
                value === "any" ? undefined : (value as "en" | "ur")
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All languages</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ur">Urdu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-medium mb-2 block">Sort by</label>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="popular">Most popular</SelectItem>
              <SelectItem value="featured">Featured first</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium mb-2 block">From Date</label>
          <Input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) =>
              handleFilterChange("dateFrom", e.target.value || undefined)
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">To Date</label>
          <Input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) =>
              handleFilterChange("dateTo", e.target.value || undefined)
            }
          />
        </div>
      </div>

      {/* Featured Posts Toggle */}
      <div className="flex items-center justify-between pt-2 border-t">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.featured || false}
            onChange={(e) =>
              handleFilterChange("featured", e.target.checked || undefined)
            }
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">Featured posts only</span>
        </label>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all filters
          </Button>
        )}
      </div>
    </Card>
  );

  const renderActiveFilters = () => {
    if (activeFiltersCount === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {filters.category && (
          <Badge variant="secondary" className="gap-1">
            Category:{" "}
            {categories.find((c) => c.slug.current === filters.category)?.title}
            <button
              onClick={() => clearFilter("category")}
              className="ml-1 hover:text-destructive"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  clearFilter("category");
                }
              }}
              aria-label="Clear category filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.tag && (
          <Badge variant="secondary" className="gap-1">
            <Tag className="h-3 w-3" />
            {filters.tag}
            <button
              onClick={() => clearFilter("tag")}
              className="ml-1 hover:text-destructive"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  clearFilter("tag");
                }
              }}
              aria-label="Clear tag filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.language && (
          <Badge variant="secondary" className="gap-1">
            <Globe className="h-3 w-3" />
            {filters.language === "en" ? "English" : "Urdu"}
            <button
              onClick={() => clearFilter("language")}
              className="ml-1 hover:text-destructive"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  clearFilter("language");
                }
              }}
              aria-label="Clear language filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
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
        {(filters.dateFrom || filters.dateTo) && (
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            Date range
            <button
              onClick={() => {
                clearFilter("dateFrom");
                clearFilter("dateTo");
              }}
              className="ml-1 hover:text-destructive"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  clearFilter("dateFrom");
                  clearFilter("dateTo");
                }
              }}
              aria-label="Clear date range filter"
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
          onClick={() => onPageChange(pagination.page - 1)}
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
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
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
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
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
                variant={viewMode === "grid" ? "default" : "ghost"}
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
                variant={viewMode === "list" ? "default" : "ghost"}
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
        <div className="relative max-w-md">
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            aria-label={AriaUtils.createFilterLabel(
              "Search blog posts",
              searchQuery || undefined
            )}
            aria-describedby={`${searchFormId}-description`}
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
            Search blog posts by title, content, or tags
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && renderFilters()}

        {/* Active Filters */}
        {renderActiveFilters()}
      </div>

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
            "grid gap-6",
            viewMode === "grid"
              ? "md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          )}
        >
          {posts.map((post) => (
            <BlogCard
              key={post._id}
              post={post}
              variant={viewMode === "grid" ? "default" : "horizontal"}
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

      {/* Pagination */}
      {renderPagination()}
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
