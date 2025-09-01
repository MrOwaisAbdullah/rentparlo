"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { SearchState, SearchContextValue, SearchResult } from "@/types/search";
import { URLStateManager } from "@/lib/url-state-manager";
import {
  usePerformanceSearch,
  useLoadingState,
  useRetryLogic,
} from "@/hooks/use-performance-search";
import { performance } from "@/lib/performance-monitor";

// Initial state
const initialSearchState: SearchState = {
  query: "",
  filters: {},
  results: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  isLoading: false,
  error: null,
  viewMode: "grid",
  sortBy: "",
};

// Action types
type SearchAction =
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_FILTERS"; payload: Partial<Record<string, any>> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_RESULTS"; payload: SearchResult[] }
  | { type: "APPEND_RESULTS"; payload: SearchResult[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" | "horizontal" }
  | { type: "SET_SORT_BY"; payload: string }
  | { type: "SET_PAGINATION"; payload: Partial<SearchState["pagination"]> }
  | { type: "RESTORE_STATE"; payload: Partial<SearchState> }
  | { type: "RESET_STATE" };

// Reducer
function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_QUERY":
      return {
        ...state,
        query: action.payload,
        pagination: { ...state.pagination, page: 1 }, // Reset to first page
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }, // Reset to first page
      };

    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: {},
        pagination: { ...state.pagination, page: 1 },
      };

    case "SET_RESULTS":
      return {
        ...state,
        results: action.payload,
        isLoading: false,
        error: null,
      };

    case "APPEND_RESULTS":
      return {
        ...state,
        results: [...state.results, ...action.payload],
        isLoading: false,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error, // Clear error when starting new request
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "SET_VIEW_MODE":
      return {
        ...state,
        viewMode: action.payload,
      };

    case "SET_SORT_BY":
      return {
        ...state,
        sortBy: action.payload,
        pagination: { ...state.pagination, page: 1 }, // Reset to first page
      };

    case "SET_PAGINATION":
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };

    case "RESTORE_STATE":
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
      };

    case "RESET_STATE":
      return {
        ...initialSearchState,
      };

    default:
      return state;
  }
}

// Context
const SearchContext = createContext<SearchContextValue | undefined>(undefined);

// Provider props
interface SearchProviderProps {
  children: React.ReactNode;
  initialState?: Partial<SearchState>;
  searchFunction?: (state: SearchState) => Promise<{
    results: SearchResult[];
    total: number;
    hasMore: boolean;
  }>;
}

// Provider component
export function SearchProvider({
  children,
  initialState = {},
  searchFunction,
}: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, {
    ...initialSearchState,
    ...initialState,
  });

  const urlManager = URLStateManager.getInstance();

  // Restore state from URL on mount
  useEffect(() => {
    const urlState = urlManager.restoreFromURL();
    if (Object.keys(urlState).length > 0) {
      dispatch({ type: "RESTORE_STATE", payload: urlState });
    }
  }, []);

  // Sync state to URL whenever it changes
  useEffect(() => {
    urlManager.syncToURL(state);
  }, [
    state.query,
    state.filters,
    state.pagination.page,
    state.viewMode,
    state.sortBy,
  ]);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const restoredState = urlManager.handlePopState(event);
      if (restoredState) {
        dispatch({ type: "RESTORE_STATE", payload: restoredState });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Default search function (can be overridden by props)
  const defaultSearchFunction = async (searchState: SearchState) => {
    // This would typically make an API call
    // For now, return empty results
    return {
      results: [],
      total: 0,
      hasMore: false,
    };
  };

  const activeSearchFunction = searchFunction || defaultSearchFunction;

  // Performance optimizations
  const { performSearch: optimizedSearch, clearCache } = usePerformanceSearch(
    (query: string, filters: Record<string, any>) => {
      const searchState = { ...state, query, filters };
      return activeSearchFunction(searchState);
    },
    {
      searchDelay: 300,
      filterDelay: 100,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      maxCacheSize: 50,
    }
  );

  const {
    setLoading,
    setError,
    isLoading: isLoadingState,
    getError,
  } = useLoadingState();
  const { retryFunction } = useRetryLogic(3, 1000);

  // Track search requests to prevent duplicate calls
  const searchRequestRef = useRef<AbortController | null>(null);

  // Actions
  const updateQuery = useCallback((query: string) => {
    dispatch({ type: "SET_QUERY", payload: query });
  }, []);

  const updateFilters = useCallback((filters: Partial<Record<string, any>>) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const setViewMode = useCallback((mode: "grid" | "list" | "horizontal") => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    dispatch({ type: "SET_SORT_BY", payload: sortBy });
  }, []);

  const performSearch = useCallback(async () => {
    // Cancel any existing search request
    if (searchRequestRef.current) {
      searchRequestRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    searchRequestRef.current = abortController;

    const searchKey = "main-search";
    setLoading(searchKey, true);
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const searchWithRetry = () => {
        if (abortController.signal.aborted) {
          throw new Error("Search cancelled");
        }
        return optimizedSearch(state.query, state.filters);
      };

      const { results, total, hasMore } = await performance.measureAsync(
        "search-operation",
        () => retryFunction(searchWithRetry),
        {
          query: state.query,
          filterCount: Object.keys(state.filters).length,
          page: state.pagination.page,
        }
      );

      // Check if request was cancelled
      if (abortController.signal.aborted) {
        return;
      }

      dispatch({ type: "SET_RESULTS", payload: results });
      dispatch({
        type: "SET_PAGINATION",
        payload: { total, hasMore },
      });
      setError(searchKey, null);

      // Record search performance metrics
      performance.recordSearch({
        searchDuration: performance.end("search-operation") || 0,
        resultCount: results.length,
        cacheHit: false, // This would be determined by the optimizedSearch function
        filterCount: Object.keys(state.filters).length,
      });
    } catch (error) {
      if (abortController.signal.aborted) {
        return; // Don't show error for cancelled requests
      }

      const errorMessage =
        error instanceof Error ? error.message : "Search failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      setError(searchKey, errorMessage);
    } finally {
      setLoading(searchKey, false);
      if (searchRequestRef.current === abortController) {
        searchRequestRef.current = null;
      }
    }
  }, [state, optimizedSearch, retryFunction, setLoading, setError]);

  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.pagination.hasMore) return;

    const loadMoreKey = "load-more";
    setLoading(loadMoreKey, true);
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const nextPage = state.pagination.page + 1;

      const loadMoreWithRetry = () => {
        return optimizedSearch(state.query, {
          ...state.filters,
          page: nextPage,
        });
      };

      const { results, total, hasMore } =
        await retryFunction(loadMoreWithRetry);

      dispatch({ type: "APPEND_RESULTS", payload: results });
      dispatch({
        type: "SET_PAGINATION",
        payload: { page: nextPage, total, hasMore },
      });
      setError(loadMoreKey, null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load more results";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      setError(loadMoreKey, errorMessage);
    } finally {
      setLoading(loadMoreKey, false);
    }
  }, [state, optimizedSearch, retryFunction, setLoading, setError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchRequestRef.current) {
        searchRequestRef.current.abort();
      }
    };
  }, []);

  const contextValue: SearchContextValue = {
    searchState: state,
    updateQuery,
    updateFilters,
    clearFilters,
    performSearch,
    setViewMode,
    setSortBy,
    loadMore,
    // Performance utilities
    clearCache,
    isLoadingSearch: () => isLoadingState("main-search"),
    isLoadingMore: () => isLoadingState("load-more"),
    getSearchError: () => getError("main-search"),
    getLoadMoreError: () => getError("load-more"),
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

// Hook to use search context
export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

// Hook to use search state only (for components that don't need actions)
export function useSearchState(): SearchState {
  const { searchState } = useSearch();
  return searchState;
}
