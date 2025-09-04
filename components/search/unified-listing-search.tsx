"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  MapPin,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { SearchSort } from "@/components/search/search-sort";
import { useSearchListings } from "@/hooks/use-search-listings";
import { useDebounce, useDebouncedCallback } from "@/hooks/use-debounce";
import { analytics } from "@/lib/analytics-client";
import { cn } from "@/lib/utils";
import {
  SearchLoading,
  SearchResultsLoading,
  LoadMoreButton,
  ErrorState,
  EmptyState,
  InlineLoading,
} from "@/components/ui/loading-states";
import {
  ScreenReaderAnnouncer,
  KeyboardNavigation,
  AriaUtils,
} from "@/lib/accessibility-utils";

interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  itemCount?: number;
}

interface City {
  id: string;
  name: string;
  province: string;
}

interface ListingFilters {
  query: string;
  category: string;
  city: string;
  area: string;
  condition: string;
  minPrice: number;
  maxPrice: number;
  availability: string;
  sortBy: string;
  priceType: string;
}

interface UnifiedListingSearchProps {
  initialFilters?: Partial<ListingFilters>;
  categories: Category[];
  cities: City[];
  onFiltersChange?: (filters: ListingFilters) => void;
  onSearch?: (query: string) => void;
  showSidebar?: boolean;
  layout?: "full" | "compact" | "minimal";
  className?: string;
  // URL management - if true, component will manage URL state
  manageURL?: boolean;
  // Limit which filters to show (useful for different pages)
  limitedFilters?: string[];
  // Custom search params for cases where URL is managed externally
  searchParams?: {
    q?: string;
    category?: string;
    city?: string;
    area?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
    availability?: string;
    priceType?: string;
  };
  // Initial listings data (for server-side rendered pages)
  initialListings?: any[];
  initialTotalResults?: number;
}

export function UnifiedListingSearch({
  initialFilters = {},
  categories,
  cities,
  onFiltersChange,
  onSearch,
  showSidebar = true,
  layout = "full",
  className,
  manageURL = true,
  limitedFilters,
  searchParams: externalSearchParams,
  initialListings = [],
  initialTotalResults = 0,
}: UnifiedListingSearchProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  // Determine search params source
  const searchParams = externalSearchParams || {
    q: currentSearchParams.get("q") || "",
    category: currentSearchParams.get("category") || "",
    city: currentSearchParams.get("city") || "",
    area: currentSearchParams.get("area") || "",
    condition: currentSearchParams.get("condition") || "",
    minPrice: currentSearchParams.get("minPrice") || "",
    maxPrice: currentSearchParams.get("maxPrice") || "",
    sortBy: currentSearchParams.get("sortBy") || "",
    page: currentSearchParams.get("page") || "",
    availability: currentSearchParams.get("availability") || "",
    priceType: currentSearchParams.get("priceType") || "",
  };

  // Search state
  const [searchQuery, setSearchQuery] = React.useState(
    initialFilters.query || searchParams.q || ""
  );
  const [showFilters, setShowFilters] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isFilterLoading, setIsFilterLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<
    "grid" | "list" | "horizontal"
  >("list");

  // Accessibility utilities
  const announcer = ScreenReaderAnnouncer.getInstance();

  // Generate unique IDs for ARIA relationships
  const searchFormId = React.useRef(
    AriaUtils.generateId("listing-search-form")
  ).current;
  const filtersId = React.useRef(
    AriaUtils.generateId("listing-filters")
  ).current;
  const resultsId = React.useRef(
    AriaUtils.generateId("listing-results")
  ).current;

  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Debounced filter change handler
  const debouncedFilterChange = useDebouncedCallback(
    (filterName: string, value: string | number) => {
      setIsFilterLoading(false);
      updateSearchParams({ [filterName]: value } as Partial<ListingFilters>);
    },
    100
  );

  // Current filters from URL or props (memoized for performance)
  const currentFilters: ListingFilters = React.useMemo(
    () => ({
      query: searchParams.q || initialFilters.query || "",
      category: searchParams.category || initialFilters.category || "",
      city: searchParams.city || initialFilters.city || "",
      area: searchParams.area || initialFilters.area || "",
      condition: searchParams.condition || initialFilters.condition || "",
      minPrice: searchParams.minPrice
        ? parseInt(searchParams.minPrice)
        : initialFilters.minPrice || 0,
      maxPrice: searchParams.maxPrice
        ? parseInt(searchParams.maxPrice)
        : initialFilters.maxPrice || 0,
      availability:
        searchParams.availability || initialFilters.availability || "",
      sortBy: searchParams.sortBy || initialFilters.sortBy || "newest",
      priceType: searchParams.priceType || initialFilters.priceType || "",
    }),
    [searchParams, initialFilters]
  );

  // Use search hook for data fetching
  const searchFilters = {
    ...currentFilters,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  };

  // Debug logging
  React.useEffect(() => {
    console.log("Search filters:", searchFilters);
  }, [searchFilters]);

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    totalResults,
    pagination,
  } = useSearchListings(searchFilters, {
    enabled: true,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  // Use initial data if search results are empty and we have initial data
  const displayData = React.useMemo(() => {
    if (data && data.length > 0) {
      return data;
    }
    if (initialListings && initialListings.length > 0 && !isLoading) {
      return initialListings;
    }
    return data || [];
  }, [data, initialListings, isLoading]);

  const displayTotalResults = React.useMemo(() => {
    if (totalResults > 0) {
      return totalResults;
    }
    if (initialTotalResults > 0 && (!data || data.length === 0)) {
      return initialTotalResults;
    }
    return totalResults || 0;
  }, [totalResults, initialTotalResults, data]);

  // Update URL with new search parameters
  const updateSearchParams = React.useCallback(
    (newParams: Partial<ListingFilters>) => {
      if (!manageURL) {
        // If not managing URL, call external handler
        const updatedFilters = { ...currentFilters, ...newParams };
        onFiltersChange?.(updatedFilters);
        return;
      }

      const params = new URLSearchParams(currentSearchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        // Map 'query' to 'q' for URL
        const urlKey = key === "query" ? "q" : key;

        if (value === "" || value === 0 || (key === "page" && value === 1)) {
          params.delete(urlKey);
        } else {
          params.set(urlKey, value.toString());
        }
      });

      // Reset page when filters change (except when explicitly setting page)
      if (!("page" in newParams)) {
        params.delete("page");
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.push(newUrl, { scroll: false });
    },
    [currentSearchParams, router, manageURL, onFiltersChange, currentFilters]
  );

  // Handle search input with accessibility announcements
  const handleSearchSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setIsSearching(true);

      // Announce search initiation
      if (searchQuery.trim()) {
        announcer.announce(`Searching for ${searchQuery}`, "polite");
      } else {
        announcer.announce("Starting search", "polite");
      }

      updateSearchParams({ query: searchQuery });
      onSearch?.(searchQuery);

      // Track search query
      if (searchQuery) {
        analytics.trackSearch(searchQuery, currentFilters).catch(console.error);
      }

      setTimeout(() => setIsSearching(false), 1000);
    },
    [searchQuery, updateSearchParams, onSearch, currentFilters, announcer]
  );

  // Handle filter changes with loading state and accessibility announcements
  const handleFilterChange = React.useCallback(
    (filterName: string, value: string | number) => {
      setIsFilterLoading(true);

      // Announce filter change
      announcer.announceFilterChange(filterName, value, totalResults);

      debouncedFilterChange(filterName, value);
    },
    [debouncedFilterChange, announcer, totalResults]
  );

  // Handle clear filters with accessibility announcements
  const handleClearFilters = React.useCallback(() => {
    setSearchQuery("");

    // Announce filter clearing
    announcer.announceAllFiltersCleared(totalResults);

    if (manageURL) {
      router.push(window.location.pathname);
    } else {
      const clearedFilters: ListingFilters = {
        query: "",
        category: "",
        city: "",
        area: "",
        condition: "",
        minPrice: 0,
        maxPrice: 0,
        availability: "",
        sortBy: "newest",
        priceType: "",
      };
      onFiltersChange?.(clearedFilters);
    }
  }, [router, manageURL, onFiltersChange, announcer, totalResults]);

  // Auto-search when debounced query changes
  React.useEffect(() => {
    if (debouncedQuery !== currentFilters.query) {
      updateSearchParams({ query: debouncedQuery });
    }
  }, [debouncedQuery, currentFilters.query, updateSearchParams]);

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (currentFilters.category) count++;
    if (currentFilters.city) count++;
    if (currentFilters.area) count++;
    if (currentFilters.condition) count++;
    if (currentFilters.availability) count++;
    if (currentFilters.priceType) count++;
    if (currentFilters.minPrice > 0) count++;
    if (currentFilters.maxPrice > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0 || currentFilters.query;

  // Render active filter badges
  const renderActiveFilters = () => {
    const filters = [];

    if (currentFilters.query) {
      filters.push(
        <Badge
          key="query"
          variant="secondary"
          className="flex items-center gap-1"
        >
          <Search className="w-3 h-3" />"{currentFilters.query}"
          <button
            onClick={() => {
              setSearchQuery("");
              handleFilterChange("query", "");
            }}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      );
    }

    if (currentFilters.category) {
      const categoryTitle =
        categories.find((c) => c.slug === currentFilters.category)?.title ||
        currentFilters.category;
      filters.push(
        <Badge
          key="category"
          variant="secondary"
          className="flex items-center gap-1"
        >
          Category: {categoryTitle}
          <button
            onClick={() => handleFilterChange("category", "")}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      );
    }

    if (currentFilters.city) {
      filters.push(
        <Badge
          key="location"
          variant="secondary"
          className="flex items-center gap-1"
        >
          <MapPin className="w-3 h-3" />
          {currentFilters.city}
          {currentFilters.area && ` - ${currentFilters.area}`}
          <button
            onClick={() => {
              handleFilterChange("city", "");
              handleFilterChange("area", "");
            }}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      );
    }

    if (currentFilters.condition) {
      filters.push(
        <Badge
          key="condition"
          variant="secondary"
          className="flex items-center gap-1"
        >
          Condition: {currentFilters.condition}
          <button
            onClick={() => handleFilterChange("condition", "")}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      );
    }

    if (currentFilters.availability) {
      filters.push(
        <Badge
          key="availability"
          variant="secondary"
          className="flex items-center gap-1"
        >
          Availability: {currentFilters.availability}
          <button
            onClick={() => handleFilterChange("availability", "")}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      );
    }

    if (currentFilters.priceType) {
      filters.push(
        <Badge
          key="priceType"
          variant="secondary"
          className="flex items-center gap-1"
        >
          Price Type: {currentFilters.priceType}
          <button
            onClick={() => handleFilterChange("priceType", "")}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      );
    }

    if (currentFilters.minPrice > 0 || currentFilters.maxPrice > 0) {
      filters.push(
        <Badge
          key="price"
          variant="secondary"
          className="flex items-center gap-1"
        >
          Price: PKR {currentFilters.minPrice.toLocaleString()} -{" "}
          {currentFilters.maxPrice.toLocaleString()}
          <button
            onClick={() => {
              handleFilterChange("minPrice", 0);
              handleFilterChange("maxPrice", 0);
            }}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      );
    }

    return filters;
  };

  if (layout === "minimal") {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Search Bar Only */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for rental items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-base"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isSearching}
            className="px-8"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>

        {/* Results */}
        <SearchResults
          listings={data || []}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          totalResults={totalResults}
          currentPage={pagination?.currentPage || 1}
          totalPages={pagination?.totalPages || 1}
          onPageChange={(page) => handleFilterChange("page", page)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Search Header */}
      {layout !== "compact" && (
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="px-4 py-4">
            {/* Search Bar */}
            <form
              id={searchFormId}
              onSubmit={handleSearchSubmit}
              className="flex gap-3 mb-4"
              role="search"
              aria-label="Search for rental listings"
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5"
                  aria-hidden="true"
                />
                <Input
                  type="text"
                  placeholder="Search for rental items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-12 text-base"
                  aria-label={AriaUtils.createFilterLabel(
                    "Search listings",
                    searchQuery || undefined
                  )}
                  aria-describedby={`${searchFormId}-description`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      announcer.announce("Search query cleared", "polite");
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    aria-label={AriaUtils.createClearFilterLabel(
                      "search query"
                    )}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
                {/* Hidden description for screen readers */}
                <div id={`${searchFormId}-description`} className="sr-only">
                  Search for rental listings by name, description, or category
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSearching}
                className="px-8 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={
                  isSearching ? "Searching in progress" : "Start search"
                }
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </form>

            {/* Filter Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFilters(!showFilters);
                    announcer.announce(
                      showFilters
                        ? "Filters panel closed"
                        : "Filters panel opened",
                      "polite"
                    );
                  }}
                  className="flex items-center gap-2 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-expanded={showFilters}
                  aria-controls={filtersId}
                  aria-label={`${showFilters ? "Hide" : "Show"} filters panel. ${activeFilterCount} filters active.`}
                >
                  <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1"
                      aria-label={`${activeFilterCount} active filters`}
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-muted-foreground hover:text-foreground lg:hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`Clear all ${activeFilterCount} active filters`}
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <SearchSort
                  currentSort={currentFilters.sortBy}
                  onSortChange={(sortBy) =>
                    handleFilterChange("sortBy", sortBy)
                  }
                />

                <div
                  className="flex items-center gap-1 bg-muted p-1 rounded-lg ml-2"
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
                    className="p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                  >
                    <Grid className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setViewMode("list");
                      announcer.announce("List view selected", "polite");
                    }}
                    className="p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                  >
                    <List className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters Display (Mobile) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t lg:hidden">
                {renderActiveFilters()}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showSidebar && (
            <div
              className={cn(
                "w-80 flex-shrink-0",
                showFilters ? "block lg:block" : "hidden lg:block"
              )}
            >
              <Card className="sticky top-24">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg" id={`${filtersId}-title`}>
                      Filters
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowFilters(false);
                        announcer.announce("Filters panel closed", "polite");
                      }}
                      className="lg:hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label="Close filters panel"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    id={filtersId}
                    role="region"
                    aria-labelledby={`${filtersId}-title`}
                    aria-describedby={`${filtersId}-description`}
                  >
                    <SearchFilters
                      categories={categories}
                      cities={cities}
                      currentFilters={currentFilters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                      limitedFilters={limitedFilters}
                    />
                    {/* Hidden description for screen readers */}
                    <div id={`${filtersId}-description`} className="sr-only">
                      Use these filters to narrow down your search results.{" "}
                      {activeFilterCount} filters are currently active.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters Display (Desktop) */}
            {hasActiveFilters && layout !== "compact" && (
              <div className="hidden lg:flex flex-wrap items-center gap-2 mb-6 p-4 bg-muted rounded-lg">
                {renderActiveFilters()}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Compact Layout Search Bar */}
            {layout === "compact" && (
              <div className="mb-6">
                <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search for rental items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 h-10 text-base"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSearching}
                    className="px-8"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </form>

                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {renderActiveFilters()}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Results Content */}
            <div
              id={resultsId}
              role="region"
              aria-labelledby={`${resultsId}-title`}
              aria-describedby={`${resultsId}-description`}
              aria-live="polite"
              aria-atomic="false"
            >
              {/* Hidden title and description for screen readers */}
              <h2 id={`${resultsId}-title`} className="sr-only">
                Search Results
              </h2>
              <div id={`${resultsId}-description`} className="sr-only">
                {AriaUtils.createSearchResultsDescription(
                  displayTotalResults || 0,
                  currentFilters.query
                )}
              </div>

              {/* Debug Information - Only in development */}
              {/* {process.env.NODE_ENV === "development" && (
                <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
                  <strong>Debug Info:</strong>
                  <br />
                  Loading: {isLoading.toString()}
                  <br />
                  Error: {error?.message || "None"}
                  <br />
                  Data length: {data?.length || 0}
                  <br />
                  Display data length: {displayData?.length || 0}
                  <br />
                  Total results: {totalResults || 0}
                  <br />
                  Display total results: {displayTotalResults || 0}
                  <br />
                  Initial listings: {initialListings?.length || 0}
                  <br />
                  Current filters: {JSON.stringify(currentFilters, null, 2)}
                </div>
              )} */}

              {error ? (
                <ErrorState
                  title="Search Error"
                  message={
                    error.message ||
                    "Failed to load search results. Please try again."
                  }
                  onRetry={() => window.location.reload()}
                />
              ) : isLoading && (!displayData || displayData.length === 0) ? (
                <SearchResultsLoading count={6} viewMode={viewMode} />
              ) : displayData && displayData.length === 0 ? (
                <EmptyState
                  title="No listings found"
                  message="Try adjusting your search criteria or clearing some filters."
                  action={
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      aria-label={`Clear all ${activeFilterCount} active filters to see more results`}
                    >
                      Clear all filters
                    </Button>
                  }
                />
              ) : (
                <>
                  <SearchResults
                    listings={displayData || []}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onLoadMore={fetchNextPage}
                    totalResults={displayTotalResults}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedListingSearch;
