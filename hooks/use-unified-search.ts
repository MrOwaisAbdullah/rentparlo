"use client";

import { useCallback, useEffect } from "react";
import { useSearch } from "@/contexts/search-context";
import { useFilters } from "@/contexts/filter-context";

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

  // Enhanced search function that includes current filters
  const performSearchWithFilters = useCallback(async () => {
    // Update search state with current filters before performing search
    search.updateFilters(filters.activeFilters);
    await search.performSearch();
  }, [search, filters.activeFilters]);

  // Enhanced query update that triggers search
  const updateQueryAndSearch = useCallback(
    async (query: string) => {
      search.updateQuery(query);
      // Small delay to allow state to update
      setTimeout(() => {
        performSearchWithFilters();
      }, 0);
    },
    [search, performSearchWithFilters]
  );

  // Enhanced filter update that triggers search
  const updateFilterAndSearch = useCallback(
    async (key: string, value: any) => {
      filters.setFilter(key, value);
      // Small delay to allow state to update
      setTimeout(() => {
        performSearchWithFilters();
      }, 0);
    },
    [filters, performSearchWithFilters]
  );

  // Clear all filters and search
  const clearAllAndSearch = useCallback(async () => {
    filters.clearAllFilters();
    search.clearFilters();
    // Small delay to allow state to update
    setTimeout(() => {
      performSearchWithFilters();
    }, 0);
  }, [filters, search, performSearchWithFilters]);

  // Clear specific filter and search
  const clearFilterAndSearch = useCallback(
    async (key: string) => {
      filters.clearFilter(key);
      // Small delay to allow state to update
      setTimeout(() => {
        performSearchWithFilters();
      }, 0);
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
    hasError: !!search.searchState.error,
    error: search.searchState.error,
    hasResults: search.searchState.results.length > 0,
    resultCount: search.searchState.results.length,
    totalResults: search.searchState.pagination.total,
    canLoadMore: search.searchState.pagination.hasMore,
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
 * Hook for debounced search functionality
 */
export function useDebouncedSearch(delay: number = 300) {
  const { updateQueryAndSearch, updateFilterAndSearch } = useUnifiedSearch();

  const debouncedUpdateQuery = useCallback(
    debounce(updateQueryAndSearch, delay),
    [updateQueryAndSearch, delay]
  );

  const debouncedUpdateFilter = useCallback(
    debounce(updateFilterAndSearch, 100), // Shorter delay for filters
    [updateFilterAndSearch]
  );

  return {
    debouncedUpdateQuery,
    debouncedUpdateFilter,
  };
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
