// Core search and filter types for the unified search system

export interface SearchResult {
  id: string;
  type: "listing" | "blog";
  title: string;
  description: string;
  image?: string;
  url: string;
  category?: string;
  price?: number;
  location?: string;
  createdAt: string;
}

export interface SearchState {
  // Current search query
  query: string;

  // Active filters
  filters: Record<string, any>;

  // Search results
  results: SearchResult[];

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };

  // UI state
  isLoading: boolean;
  error: string | null;

  // View preferences
  viewMode: "grid" | "list" | "horizontal";
  sortBy: string;
}

export interface ListingFilters {
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

export interface BlogFilters {
  query: string;
  category: string;
  tag: string;
  language: "en" | "ur";
  featured: boolean;
  dateRange: DateRange;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface Option {
  value: string;
  label: string;
  count?: number;
}

export interface ValidationRule {
  type: "required" | "min" | "max" | "pattern";
  value?: any;
  message: string;
}

export interface FilterConfig {
  key: string;
  type: "select" | "range" | "checkbox" | "search" | "date" | "multiselect";
  label: string;
  options?: Option[];
  placeholder?: string;
  validation?: ValidationRule[];
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectFilter extends FilterConfig {
  type: "select";
  options: Option[];
}

export interface MultiSelectFilter extends FilterConfig {
  type: "multiselect";
  options: Option[];
}

export interface RangeFilter extends FilterConfig {
  type: "range";
  min: number;
  max: number;
  step?: number;
}

export interface BooleanFilter extends FilterConfig {
  type: "checkbox";
}

export interface DateRangeFilter extends FilterConfig {
  type: "date";
}

export interface LocationFilter extends FilterConfig {
  type: "select";
  options: Option[];
  nested?: boolean; // For city -> area hierarchy
}

export interface FilterConfiguration {
  listings: {
    category: SelectFilter;
    location: LocationFilter;
    price: RangeFilter;
    condition: SelectFilter;
    availability: SelectFilter;
    priceType: SelectFilter;
  };
  blog: {
    category: SelectFilter;
    tags: MultiSelectFilter;
    language: SelectFilter;
    featured: BooleanFilter;
    dateRange: DateRangeFilter;
  };
}

export interface SearchFilters {
  [key: string]: any;
}

// Context interfaces
export interface SearchContextValue {
  searchState: SearchState;
  updateQuery: (query: string) => void;
  updateFilters: (filters: Partial<Record<string, any>>) => void;
  clearFilters: () => void;
  performSearch: () => Promise<void>;
  setViewMode: (mode: "grid" | "list" | "horizontal") => void;
  setSortBy: (sortBy: string) => void;
  loadMore: () => Promise<void>;
}

export interface FilterContextValue {
  activeFilters: Record<string, any>;
  filterConfig: FilterConfiguration;
  setFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  getActiveFilterCount: () => number;
  isFilterActive: (key: string) => boolean;
  getFilterValue: (key: string) => any;
}

// URL State Manager interface
export interface URLStateManager {
  // Sync state to URL
  syncToURL: (state: SearchState) => void;

  // Restore state from URL
  restoreFromURL: () => Partial<SearchState>;

  // Handle browser navigation
  handlePopState: (event: PopStateEvent) => void;

  // Validate URL parameters
  validateURLParams: (params: URLSearchParams) => boolean;

  // Get current URL parameters
  getCurrentParams: () => URLSearchParams;

  // Update specific parameter
  updateParam: (key: string, value: string | null) => void;
}
