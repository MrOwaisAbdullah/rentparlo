"use client";

import React from "react";
import { SearchProvider } from "./search-context";
import { FilterProvider } from "./filter-context";
import { SearchState, FilterConfiguration, SearchResult } from "@/types/search";

interface UnifiedSearchProviderProps {
  children: React.ReactNode;
  initialSearchState?: Partial<SearchState>;
  initialFilters?: Record<string, any>;
  filterConfig?: Partial<FilterConfiguration>;
  searchFunction?: (state: SearchState) => Promise<{
    results: SearchResult[];
    total: number;
    hasMore: boolean;
  }>;
}

/**
 * Combined provider that wraps both SearchProvider and FilterProvider
 * This makes it easier to use both contexts together and ensures proper nesting
 */
export function UnifiedSearchProvider({
  children,
  initialSearchState = {},
  initialFilters = {},
  filterConfig = {},
  searchFunction,
}: UnifiedSearchProviderProps) {
  return (
    <FilterProvider initialFilters={initialFilters} filterConfig={filterConfig}>
      <SearchProvider
        initialState={initialSearchState}
        searchFunction={searchFunction}
      >
        {children}
      </SearchProvider>
    </FilterProvider>
  );
}

// Re-export hooks for convenience
export { useSearch, useSearchState } from "./search-context";
export {
  useFilters,
  useActiveFilters,
  useFilterConfig,
  useHasActiveFilters,
} from "./filter-context";
