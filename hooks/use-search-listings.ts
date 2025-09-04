"use client";

import React from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  searchEnhancedListingsClient,
  trackSearchQueryClient,
} from "@/lib/data-integration-client";
import { ItemCondition, SearchResults } from "@/types";

interface SearchFilters {
  query: string;
  category: string;
  city: string;
  area: string;
  condition: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  page: number;
}

interface UseSearchListingsOptions {
  enabled?: boolean;
  keepPreviousData?: boolean;
  refetchOnWindowFocus?: boolean;
}

interface SearchResultsPage {
  results: any[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
}

export function useSearchListings(
  filters: SearchFilters,
  options: UseSearchListingsOptions = {}
) {
  const {
    enabled = true,
    keepPreviousData = true,
    refetchOnWindowFocus = false,
  } = options;

  // Convert filters to search parameters
  const searchParams = React.useMemo(
    () => ({
      query: filters.query || "",
      category: filters.category || "",
      city: filters.city || "",
      area: filters.area || "",
      condition: (filters.condition as ItemCondition) || undefined,
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 0,
      offset: 0,
      limit: 20,
      sortBy: filters.sortBy || "newest",
    }),
    [filters]
  );

  // Create cache key that includes all relevant filters (stable dependencies)
  const queryKey = React.useMemo(
    () => [
      "search-listings",
      searchParams.query || "",
      searchParams.category || "",
      searchParams.city || "",
      searchParams.area || "",
      searchParams.condition || "",
      searchParams.minPrice || 0,
      searchParams.maxPrice || 0,
      searchParams.sortBy || "newest",
    ],
    [
      searchParams.query,
      searchParams.category,
      searchParams.city,
      searchParams.area,
      searchParams.condition,
      searchParams.minPrice,
      searchParams.maxPrice,
      searchParams.sortBy,
    ]
  );

  // Use infinite query for pagination
  const query = useInfiniteQuery<SearchResultsPage>({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const params = {
        ...searchParams,
        offset: pageParam as number,
        limit: 20,
      };

      const result = await searchEnhancedListingsClient(params);

      // Track search query if it's a new search (offset 0) - throttled
      if (pageParam === 0 && searchParams.query && Math.random() < 0.1) {
        // Only track 10% of searches
        try {
          await trackSearchQueryClient(searchParams.query, undefined, params);
        } catch (error) {
          console.error("Failed to track search query:", error);
        }
      }

      return {
        results: result.results,
        total: result.total,
        hasMore: result.results.length === params.limit,
        nextOffset: (pageParam as number) + params.limit,
      };
    },
    getNextPageParam: (lastPage: SearchResultsPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined;
    },
    initialPageParam: 0,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (replaces cacheTime)
    refetchOnWindowFocus,
  });

  // Flatten paginated results
  const listings = React.useMemo(() => {
    return query.data?.pages.flatMap((page) => page.results) || [];
  }, [query.data]);

  // Get total count from first page
  const totalResults = React.useMemo(() => {
    return query.data?.pages[0]?.total || 0;
  }, [query.data?.pages?.[0]?.total]);

  // Calculate pagination info
  const pagination = React.useMemo(() => {
    const currentPage = filters.page || 1;
    const itemsPerPage = 20;
    const total = query.data?.pages[0]?.total || 0;
    const totalPages = Math.ceil(total / itemsPerPage);

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      totalResults: total,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }, [query.data?.pages?.[0]?.total, filters.page]);

  return {
    // Data
    data: listings,
    totalResults,
    pagination,

    // Status
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,

    // Infinite scroll
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,

    // Cache management
    refetch: query.refetch,
  };
}

// Hook for simple search without infinite scroll
export function useSimpleSearch(
  filters: SearchFilters,
  options: UseSearchListingsOptions = {}
) {
  const {
    enabled = true,
    keepPreviousData = true,
    refetchOnWindowFocus = false,
  } = options;

  const searchParams = React.useMemo(
    () => ({
      query: filters.query || "",
      category: filters.category || "",
      city: filters.city || "",
      area: filters.area || "",
      condition: (filters.condition as ItemCondition) || undefined,
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 0,
      offset: ((filters.page || 1) - 1) * 20,
      limit: 20,
      sortBy: filters.sortBy || "newest",
    }),
    [filters]
  );

  const queryKey = React.useMemo(
    () => [
      "simple-search-listings",
      searchParams.query,
      searchParams.category,
      searchParams.city,
      searchParams.area,
      searchParams.condition,
      searchParams.minPrice,
      searchParams.maxPrice,
      searchParams.sortBy,
      searchParams.offset,
    ],
    [searchParams]
  );

  const query = useQuery<SearchResults>({
    queryKey,
    queryFn: async () => {
      const result = await searchEnhancedListingsClient(searchParams);

      // Track search query
      if (searchParams.offset === 0 && searchParams.query) {
        try {
          await trackSearchQueryClient(
            searchParams.query,
            undefined,
            searchParams
          );
        } catch (error) {
          console.error("Failed to track search query:", error);
        }
      }

      return result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000, // Replaces cacheTime
    refetchOnWindowFocus,
  });

  const pagination = React.useMemo(() => {
    const currentPage = filters.page || 1;
    const itemsPerPage = 20;
    const totalPages = Math.ceil((query.data?.total || 0) / itemsPerPage);

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      totalResults: query.data?.total || 0,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }, [query.data, filters.page]);

  return {
    // Data
    data: query.data?.results || [],
    totalResults: query.data?.total || 0,
    pagination,

    // Status
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,

    // Cache management
    refetch: query.refetch,
  };
}
