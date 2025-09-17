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
  condition: string | string[];
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  page: number;
  seller?: string;
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
      condition: filters.condition || undefined,
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 0,
      offset: 0,
      limit: 20,
      sortBy: filters.sortBy || "newest",
      seller: filters.seller || "",
    }),
    [filters]
  );

  console.log('=== USE SEARCH LISTINGS DEBUG ===');
  console.log('useSearchListings - searchParams:', searchParams);
  console.log('Seller filter in useSearchListings:', searchParams.seller);
  console.log('=================================');

  // Create cache key that includes all relevant filters (stable dependencies)
  const queryKey = React.useMemo(
    () => [
      "search-listings",
      searchParams.query || "",
      searchParams.category || "",
      searchParams.city || "",
      searchParams.area || "",
      Array.isArray(searchParams.condition) 
        ? searchParams.condition.join(',') 
        : searchParams.condition || "",
      searchParams.minPrice || 0,
      searchParams.maxPrice || 0,
      searchParams.sortBy || "newest",
      searchParams.seller || "",
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
      searchParams.seller,
    ]
  );

  // Use infinite query for pagination
  const query = useInfiniteQuery<SearchResultsPage>({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      console.log('=== QUERY FUNCTION EXECUTION DEBUG ===');
      console.log('Query function called with pageParam:', pageParam);
      console.log('Search params in query function:', searchParams);
      console.log('=====================================');
      
      const params = {
        ...searchParams,
        offset: pageParam as number,
        limit: 20,
      };

      console.log('Calling searchEnhancedListingsClient with params:', params);
      const result = await searchEnhancedListingsClient(params);
      console.log('searchEnhancedListingsClient returned:', result);

      // Track search query if it's a new search (offset 0) - throttled
      if (pageParam === 0 && searchParams.query && Math.random() < 0.1) {
        // Only track 10% of searches
        try {
          await trackSearchQueryClient(searchParams.query, undefined, params);
        } catch (error) {
          console.error("Failed to track search query:", error);
        }
      }

      const searchResultsPage: SearchResultsPage = {
        results: result.results,
        total: result.total,
        hasMore: result.results.length === params.limit,
        nextOffset: (pageParam as number) + params.limit,
      };
      
      console.log('Returning search results page:', searchResultsPage);
      return searchResultsPage;
    },
    getNextPageParam: (lastPage: SearchResultsPage) => {
      console.log('getNextPageParam called with lastPage:', lastPage);
      const nextParam = lastPage.hasMore ? lastPage.nextOffset : undefined;
      console.log('getNextPageParam returning:', nextParam);
      return nextParam;
    },
    initialPageParam: 0,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (replaces cacheTime)
    refetchOnWindowFocus,
  });

  // Flatten paginated results
  const listings = React.useMemo(() => {
    console.log('=== FLATTEN PAGINATED RESULTS DEBUG ===');
    console.log('Query data pages:', query.data?.pages);
    const flattened = query.data?.pages.flatMap((page) => page.results) || [];
    console.log('Flattened results count:', flattened.length);
    console.log('======================================');
    return flattened;
  }, [query.data]);

  // Get total count from first page
  const totalResults = React.useMemo(() => {
    const total = query.data?.pages[0]?.total || 0;
    console.log('=== TOTAL RESULTS DEBUG ===');
    console.log('Total results:', total);
    console.log('===========================');
    return total;
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
      condition: filters.condition || undefined,
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 0,
      offset: ((filters.page || 1) - 1) * 20,
      limit: 20,
      sortBy: filters.sortBy || "newest",
      seller: filters.seller || "",
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
      Array.isArray(searchParams.condition) 
        ? searchParams.condition.join(',') 
        : searchParams.condition,
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
