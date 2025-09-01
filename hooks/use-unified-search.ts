"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearch } from "@/contexts/search-context";
import { useFilters } from "@/contexts/filter-context";
import { useDebouncedCallback } from "@/hooks/use-debounce";

/**
 * Combined hook that provides unified access to both search and filter functionality
 * This hook automatically syncs filter changes with search state
 */
export function useUnifiedSearch() {
  const search = useSearch();
  const filters = useFilters();

  // Sync filter changes with search state
  useEffect(() => {
    search.updateFilters(filters.activeFilters);
  }, [filters.activeFilters]);

  // Track search operations to prevent duplicate calls
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced search function that includes current filters
  const performSearchWithFilters = useCallback(async () => {
    // Update search state with current filters before performing search
    search.updateFilters(filters.activeFilters);
    await search.performSearch();
  }, [search, filters.activeFilters]);

  // Debounced search for query updates (300ms delay)
  const debouncedQuerySearch = useDebouncedCallback((query: string) => {
    search.updateQuery(query);
    performSearchWithFilters();
  }, 300);

  // Debounced search for filter updates (100ms delay)
  const debouncedFilterSearch = useDebouncedCallback(
    (key: string, value: any) => {
      filters.setFilter(key, value);
      performSearchWithFilters();
    },
    100
  );

  // Enhanced query update that triggers debounced search
  const updateQueryAndSearch = useCallback(
    (query: string) => {
      debouncedQuerySearch(query);
    },
    [debouncedQuerySearch]
  );

  // Enhanced filter update that triggers debounced search
  const updateFilterAndSearch = useCallback(
    (key: string, value: any) => {
      debouncedFilterSearch(key, value);
    },
    [debouncedFilterSearch]
  );

  // Clear all filters and search (immediate)
  const clearAllAndSearch = useCallback(async () => {
    filters.clearAllFilters();
    search.clearFilters();
    await performSearchWithFilters();
  }, [filters, search, performSearchWithFilters]);

  // Clear specific filter and search (immediate)
  const clearFilterAndSearch = useCallback(
    async (key: string) => {
      filters.clearFilter(key);
      await performSearchWithFilters();
    },
    [filters, performSearchWithFilters]
  );

  return {
    // Search state and actions
    searchState: search.searchState,
    updateQuery: search.updateQuery,
    updateQueryAndSearch,
    performSearch: performSearchWithFilters,
    setViewMode: search.setViewMode,
    setSortBy: search.setSortBy,
    loadMore: search.loadMore,

    // Filter state and actions
    activeFilters: filters.activeFilters,
    filterConfig: filters.filterConfig,
    setFilter: filters.setFilter,
    updateFilterAndSearch,
    clearFilter: filters.clearFilter,
    clearFilterAndSearch,
    clearAllFilters: filters.clearAllFilters,
    clearAllAndSearch,
    getActiveFilterCount: filters.getActiveFilterCount,
    isFilterActive: filters.isFilterActive,
    getFilterValue: filters.getFilterValue,

    // Combined utilities
    hasActiveFilters: filters.getActiveFilterCount() > 0,
    isLoading: search.searchState.isLoading,
    isLoadingSearch: search.isLoadingSearch?.() || false,
    isLoadingMore: search.isLoadingMore?.() || false,
    hasError: !!search.searchState.error,
    error: search.searchState.error,
    searchError: search.getSearchError?.() || null,
    loadMoreError: search.getLoadMoreError?.() || null,
    hasResults: search.searchState.results.length > 0,
    resultCount: search.searchState.results.length,
    totalResults: search.searchState.pagination.total,
    canLoadMore: search.searchState.pagination.hasMore,

    // Performance utilities
    clearCache: search.clearCache || (() => {}),
  };
}

/**
 * Hook for components that only need to read search/filter state
 */
export function useUnifiedSearchState() {
  const { searchState } = useSearch();
  const { activeFilters, filterConfig, getActiveFilterCount } = useFilters();

  return {
    query: searchState.query,
    results: searchState.results,
    pagination: searchState.pagination,
    isLoading: searchState.isLoading,
    error: searchState.error,
    viewMode: searchState.viewMode,
    sortBy: searchState.sortBy,
    activeFilters,
    filterConfig,
    hasActiveFilters: getActiveFilterCount() > 0,
    activeFilterCount: getActiveFilterCount(),
  };
}

/**
 * Hook for debounced search functionality (deprecated - use main hook instead)
 * @deprecated Use useUnifiedSearch which now includes debouncing by default
 */
export function useDebouncedSearch(delay: number = 300) {
  const { updateQueryAndSearch, updateFilterAndSearch } = useUnifiedSearch();

  return {
    debouncedUpdateQuery: updateQueryAndSearch,
    debouncedUpdateFilter: updateFilterAndSearch,
  };
}
