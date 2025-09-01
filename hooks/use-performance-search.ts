"use client";

import { useCallback, useRef, useMemo } from "react";
import { useDebouncedCallback } from "./use-debounce";

/**
 * Performance-optimized search hook with debouncing, caching, and request deduplication
 */
export function usePerformanceSearch<T = any>(
  searchFunction: (query: string, filters: Record<string, any>) => Promise<T>,
  options: {
    searchDelay?: number;
    filterDelay?: number;
    cacheTimeout?: number;
    maxCacheSize?: number;
  } = {}
) {
  const {
    searchDelay = 300,
    filterDelay = 100,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    maxCacheSize = 50,
  } = options;

  // Cache for search results
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(
    new Map()
  );

  // Track pending requests to avoid duplicates
  const pendingRequestsRef = useRef<Map<string, Promise<T>>>(new Map());

  // Generate cache key from query and filters
  const generateCacheKey = useCallback(
    (query: string, filters: Record<string, any>) => {
      const normalizedFilters = Object.keys(filters)
        .sort()
        .reduce(
          (acc, key) => {
            if (
              filters[key] !== null &&
              filters[key] !== undefined &&
              filters[key] !== ""
            ) {
              acc[key] = filters[key];
            }
            return acc;
          },
          {} as Record<string, any>
        );

      return JSON.stringify({
        query: query.trim().toLowerCase(),
        filters: normalizedFilters,
      });
    },
    []
  );

  // Clean expired cache entries
  const cleanCache = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;

    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > cacheTimeout) {
        cache.delete(key);
      }
    }

    // Limit cache size
    if (cache.size > maxCacheSize) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      // Remove oldest entries
      const toRemove = entries.slice(0, cache.size - maxCacheSize);
      toRemove.forEach(([key]) => cache.delete(key));
    }
  }, [cacheTimeout, maxCacheSize]);

  // Get cached result if available and not expired
  const getCachedResult = useCallback(
    (cacheKey: string): T | null => {
      const cache = cacheRef.current;
      const entry = cache.get(cacheKey);

      if (entry && Date.now() - entry.timestamp < cacheTimeout) {
        return entry.data;
      }

      if (entry) {
        cache.delete(cacheKey);
      }

      return null;
    },
    [cacheTimeout]
  );

  // Set cache entry
  const setCachedResult = useCallback(
    (cacheKey: string, data: T) => {
      cleanCache();
      cacheRef.current.set(cacheKey, { data, timestamp: Date.now() });
    },
    [cleanCache]
  );

  // Optimized search function with caching and deduplication
  const performSearch = useCallback(
    async (query: string, filters: Record<string, any>): Promise<T> => {
      const cacheKey = generateCacheKey(query, filters);

      // Check cache first
      const cachedResult = getCachedResult(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Check if request is already pending
      const pendingRequests = pendingRequestsRef.current;
      const existingRequest = pendingRequests.get(cacheKey);
      if (existingRequest) {
        return existingRequest;
      }

      // Create new request
      const request = searchFunction(query, filters)
        .then((result) => {
          setCachedResult(cacheKey, result);
          return result;
        })
        .finally(() => {
          pendingRequests.delete(cacheKey);
        });

      pendingRequests.set(cacheKey, request);
      return request;
    },
    [searchFunction, generateCacheKey, getCachedResult, setCachedResult]
  );

  // Debounced search for user input
  const debouncedSearch = useDebouncedCallback(
    (query: string, filters: Record<string, any>) => {
      return performSearch(query, filters);
    },
    searchDelay
  );

  // Debounced filter change for filter updates
  const debouncedFilterChange = useDebouncedCallback(
    (query: string, filters: Record<string, any>) => {
      return performSearch(query, filters);
    },
    filterDelay
  );

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    pendingRequestsRef.current.clear();
  }, []);

  // Get cache stats
  const getCacheStats = useCallback(() => {
    return {
      size: cacheRef.current.size,
      pendingRequests: pendingRequestsRef.current.size,
    };
  }, []);

  return {
    performSearch,
    debouncedSearch,
    debouncedFilterChange,
    clearCache,
    getCacheStats,
  };
}

/**
 * Hook for managing loading states with proper error handling
 */
export function useLoadingState() {
  const loadingStatesRef = useRef<Map<string, boolean>>(new Map());
  const errorStatesRef = useRef<Map<string, string | null>>(new Map());

  const setLoading = useCallback((key: string, loading: boolean) => {
    loadingStatesRef.current.set(key, loading);
    if (loading) {
      errorStatesRef.current.delete(key);
    }
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    errorStatesRef.current.set(key, error);
    loadingStatesRef.current.set(key, false);
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStatesRef.current.get(key) || false;
  }, []);

  const getError = useCallback((key: string) => {
    return errorStatesRef.current.get(key) || null;
  }, []);

  const clearState = useCallback((key: string) => {
    loadingStatesRef.current.delete(key);
    errorStatesRef.current.delete(key);
  }, []);

  const clearAllStates = useCallback(() => {
    loadingStatesRef.current.clear();
    errorStatesRef.current.clear();
  }, []);

  return {
    setLoading,
    setError,
    isLoading,
    getError,
    clearState,
    clearAllStates,
  };
}

/**
 * Hook for retry logic with exponential backoff
 */
export function useRetryLogic(
  maxRetries: number = 3,
  baseDelay: number = 1000
) {
  const retryFunction = useCallback(
    async <T>(fn: () => Promise<T>, retryCount: number = 0): Promise<T> => {
      try {
        return await fn();
      } catch (error) {
        if (retryCount >= maxRetries) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));

        return retryFunction(fn, retryCount + 1);
      }
    },
    [maxRetries, baseDelay]
  );

  return { retryFunction };
}
