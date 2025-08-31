"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import {
  FilterContextValue,
  FilterConfiguration,
  FilterConfig,
} from "@/types/search";

// Default filter configurations
const defaultListingFilters: FilterConfiguration["listings"] = {
  category: {
    key: "category",
    type: "select",
    label: "Category",
    placeholder: "Select category",
    options: [],
  },
  location: {
    key: "location",
    type: "select",
    label: "Location",
    placeholder: "Select location",
    options: [],
    nested: true,
  },
  price: {
    key: "price",
    type: "range",
    label: "Price Range",
    min: 0,
    max: 1000000,
    step: 1000,
  },
  condition: {
    key: "condition",
    type: "select",
    label: "Condition",
    placeholder: "Select condition",
    options: [
      { value: "new", label: "New" },
      { value: "like-new", label: "Like New" },
      { value: "good", label: "Good" },
      { value: "fair", label: "Fair" },
    ],
  },
  availability: {
    key: "availability",
    type: "select",
    label: "Availability",
    placeholder: "Select availability",
    options: [
      { value: "available", label: "Available Now" },
      { value: "upcoming", label: "Available Soon" },
      { value: "booked", label: "Currently Booked" },
    ],
  },
  priceType: {
    key: "priceType",
    type: "select",
    label: "Price Type",
    placeholder: "Select price type",
    options: [
      { value: "hourly", label: "Per Hour" },
      { value: "daily", label: "Per Day" },
      { value: "weekly", label: "Per Week" },
      { value: "monthly", label: "Per Month" },
    ],
  },
};

const defaultBlogFilters: FilterConfiguration["blog"] = {
  category: {
    key: "category",
    type: "select",
    label: "Category",
    placeholder: "Select category",
    options: [],
  },
  tags: {
    key: "tags",
    type: "multiselect",
    label: "Tags",
    placeholder: "Select tags",
    options: [],
  },
  language: {
    key: "language",
    type: "select",
    label: "Language",
    placeholder: "Select language",
    options: [
      { value: "en", label: "English" },
      { value: "ur", label: "Urdu" },
    ],
  },
  featured: {
    key: "featured",
    type: "checkbox",
    label: "Featured Posts Only",
  },
  dateRange: {
    key: "dateRange",
    type: "date",
    label: "Date Range",
  },
};

const defaultFilterConfiguration: FilterConfiguration = {
  listings: defaultListingFilters,
  blog: defaultBlogFilters,
};

// Filter state
interface FilterState {
  activeFilters: Record<string, any>;
  filterConfig: FilterConfiguration;
}

// Initial state
const initialFilterState: FilterState = {
  activeFilters: {},
  filterConfig: defaultFilterConfiguration,
};

// Action types
type FilterAction =
  | { type: "SET_FILTER"; payload: { key: string; value: any } }
  | { type: "CLEAR_FILTER"; payload: string }
  | { type: "CLEAR_ALL_FILTERS" }
  | { type: "SET_FILTER_CONFIG"; payload: Partial<FilterConfiguration> }
  | {
      type: "UPDATE_FILTER_OPTIONS";
      payload: { section: "listings" | "blog"; key: string; options: any[] };
    }
  | { type: "RESTORE_FILTERS"; payload: Record<string, any> };

// Reducer
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_FILTER":
      return {
        ...state,
        activeFilters: {
          ...state.activeFilters,
          [action.payload.key]: action.payload.value,
        },
      };

    case "CLEAR_FILTER":
      const { [action.payload]: removed, ...remainingFilters } =
        state.activeFilters;
      return {
        ...state,
        activeFilters: remainingFilters,
      };

    case "CLEAR_ALL_FILTERS":
      return {
        ...state,
        activeFilters: {},
      };

    case "SET_FILTER_CONFIG":
      return {
        ...state,
        filterConfig: {
          ...state.filterConfig,
          ...action.payload,
        },
      };

    case "UPDATE_FILTER_OPTIONS":
      const { section, key, options } = action.payload;
      return {
        ...state,
        filterConfig: {
          ...state.filterConfig,
          [section]: {
            ...state.filterConfig[section],
            [key]: {
              ...state.filterConfig[section][
                key as keyof (typeof state.filterConfig)[typeof section]
              ],
              options,
            },
          },
        },
      };

    case "RESTORE_FILTERS":
      return {
        ...state,
        activeFilters: action.payload,
      };

    default:
      return state;
  }
}

// Context
const FilterContext = createContext<FilterContextValue | undefined>(undefined);

// Provider props
interface FilterProviderProps {
  children: React.ReactNode;
  initialFilters?: Record<string, any>;
  filterConfig?: Partial<FilterConfiguration>;
}

// Provider component
export function FilterProvider({
  children,
  initialFilters = {},
  filterConfig = {},
}: FilterProviderProps) {
  const [state, dispatch] = useReducer(filterReducer, {
    ...initialFilterState,
    activeFilters: initialFilters,
    filterConfig: { ...defaultFilterConfiguration, ...filterConfig },
  });

  // Actions
  const setFilter = useCallback((key: string, value: any) => {
    // Handle empty values
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      dispatch({ type: "CLEAR_FILTER", payload: key });
    } else {
      dispatch({ type: "SET_FILTER", payload: { key, value } });
    }
  }, []);

  const clearFilter = useCallback((key: string) => {
    dispatch({ type: "CLEAR_FILTER", payload: key });
  }, []);

  const clearAllFilters = useCallback(() => {
    dispatch({ type: "CLEAR_ALL_FILTERS" });
  }, []);

  const getActiveFilterCount = useCallback(() => {
    return Object.keys(state.activeFilters).length;
  }, [state.activeFilters]);

  const isFilterActive = useCallback(
    (key: string) => {
      const value = state.activeFilters[key];
      return (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      );
    },
    [state.activeFilters]
  );

  const getFilterValue = useCallback(
    (key: string) => {
      return state.activeFilters[key];
    },
    [state.activeFilters]
  );

  // Update filter configuration
  const updateFilterConfig = useCallback(
    (config: Partial<FilterConfiguration>) => {
      dispatch({ type: "SET_FILTER_CONFIG", payload: config });
    },
    []
  );

  // Update filter options (useful for dynamic options like categories, locations)
  const updateFilterOptions = useCallback(
    (section: "listings" | "blog", key: string, options: any[]) => {
      dispatch({
        type: "UPDATE_FILTER_OPTIONS",
        payload: { section, key, options },
      });
    },
    []
  );

  // Restore filters from external source (like URL or localStorage)
  const restoreFilters = useCallback((filters: Record<string, any>) => {
    dispatch({ type: "RESTORE_FILTERS", payload: filters });
  }, []);

  const contextValue: FilterContextValue = {
    activeFilters: state.activeFilters,
    filterConfig: state.filterConfig,
    setFilter,
    clearFilter,
    clearAllFilters,
    getActiveFilterCount,
    isFilterActive,
    getFilterValue,
  };

  // Expose additional methods for advanced use cases
  const extendedContextValue = {
    ...contextValue,
    updateFilterConfig,
    updateFilterOptions,
    restoreFilters,
  };

  return (
    <FilterContext.Provider value={extendedContextValue}>
      {children}
    </FilterContext.Provider>
  );
}

// Hook to use filter context
export function useFilters(): FilterContextValue & {
  updateFilterConfig: (config: Partial<FilterConfiguration>) => void;
  updateFilterOptions: (
    section: "listings" | "blog",
    key: string,
    options: any[]
  ) => void;
  restoreFilters: (filters: Record<string, any>) => void;
} {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context as any;
}

// Hook to use active filters only
export function useActiveFilters(): Record<string, any> {
  const { activeFilters } = useFilters();
  return activeFilters;
}

// Hook to use filter configuration only
export function useFilterConfig(): FilterConfiguration {
  const { filterConfig } = useFilters();
  return filterConfig;
}

// Hook to check if any filters are active
export function useHasActiveFilters(): boolean {
  const { getActiveFilterCount } = useFilters();
  return getActiveFilterCount() > 0;
}
