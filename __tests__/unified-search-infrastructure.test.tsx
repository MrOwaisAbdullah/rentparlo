import { renderHook, act } from "@testing-library/react";
import { UnifiedSearchProvider } from "@/contexts/unified-search-provider";
import { useUnifiedSearch } from "@/hooks/use-unified-search";
import { URLStateManager } from "@/lib/url-state-manager";
import { SearchState } from "@/types/search";

// Mock window.location for URL tests
const mockLocation = {
  href: "http://localhost:3000/search",
  pathname: "/search",
  search: "",
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock history API
const mockHistory = {
  replaceState: jest.fn(),
  pushState: jest.fn(),
};

Object.defineProperty(window, "history", {
  value: mockHistory,
  writable: true,
});

describe("Unified Search Infrastructure", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = "";
    mockLocation.href = "http://localhost:3000/search";
  });

  describe("URLStateManager", () => {
    let urlManager: URLStateManager;

    beforeEach(() => {
      urlManager = URLStateManager.getInstance();
    });

    it("should sync search state to URL", () => {
      const searchState: SearchState = {
        query: "test query",
        filters: {
          category: "electronics",
          minPrice: 100,
          maxPrice: 500,
        },
        results: [],
        pagination: { page: 2, limit: 20, total: 0, hasMore: false },
        isLoading: false,
        error: null,
        viewMode: "list",
        sortBy: "price-low",
      };

      urlManager.syncToURL(searchState);

      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        { searchState },
        "",
        expect.stringContaining("q=test%20query")
      );
    });

    it("should restore state from URL parameters", () => {
      mockLocation.search =
        "?q=laptop&category=electronics&minPrice=100&page=2&view=list";

      const restoredState = urlManager.restoreFromURL();

      expect(restoredState).toEqual({
        query: "laptop",
        filters: {
          category: "electronics",
          minPrice: 100,
        },
        pagination: {
          page: 2,
          limit: 20,
          total: 0,
          hasMore: false,
        },
        viewMode: "list",
        sortBy: "",
      });
    });

    it("should validate URL parameters correctly", () => {
      const validParams = new URLSearchParams("?q=test&page=1&minPrice=100");
      const invalidParams = new URLSearchParams("?page=invalid&minPrice=abc");

      expect(urlManager.validateURLParams(validParams)).toBe(true);
      expect(urlManager.validateURLParams(invalidParams)).toBe(false);
    });
  });

  describe("UnifiedSearchProvider and Hooks", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UnifiedSearchProvider>{children}</UnifiedSearchProvider>
    );

    it("should provide search and filter functionality", () => {
      const { result } = renderHook(() => useUnifiedSearch(), { wrapper });

      expect(result.current.searchState).toBeDefined();
      expect(result.current.activeFilters).toBeDefined();
      expect(result.current.filterConfig).toBeDefined();
      expect(typeof result.current.updateQuery).toBe("function");
      expect(typeof result.current.setFilter).toBe("function");
      expect(typeof result.current.performSearch).toBe("function");
    });

    it("should update query correctly", () => {
      const { result } = renderHook(() => useUnifiedSearch(), { wrapper });

      act(() => {
        result.current.updateQuery("new search query");
      });

      expect(result.current.searchState.query).toBe("new search query");
    });

    it("should manage filters correctly", () => {
      const { result } = renderHook(() => useUnifiedSearch(), { wrapper });

      act(() => {
        result.current.setFilter("category", "electronics");
        result.current.setFilter("minPrice", 100);
      });

      expect(result.current.activeFilters.category).toBe("electronics");
      expect(result.current.activeFilters.minPrice).toBe(100);
      expect(result.current.getActiveFilterCount()).toBe(2);
    });

    it("should clear filters correctly", () => {
      const { result } = renderHook(() => useUnifiedSearch(), { wrapper });

      act(() => {
        result.current.setFilter("category", "electronics");
        result.current.setFilter("minPrice", 100);
      });

      expect(result.current.getActiveFilterCount()).toBe(2);

      act(() => {
        result.current.clearFilter("category");
      });

      expect(result.current.activeFilters.category).toBeUndefined();
      expect(result.current.getActiveFilterCount()).toBe(1);

      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.getActiveFilterCount()).toBe(0);
    });

    it("should handle view mode changes", () => {
      const { result } = renderHook(() => useUnifiedSearch(), { wrapper });

      act(() => {
        result.current.setViewMode("list");
      });

      expect(result.current.searchState.viewMode).toBe("list");
    });

    it("should handle sort changes", () => {
      const { result } = renderHook(() => useUnifiedSearch(), { wrapper });

      act(() => {
        result.current.setSortBy("price-low");
      });

      expect(result.current.searchState.sortBy).toBe("price-low");
    });

    it("should provide correct utility flags", () => {
      const { result } = renderHook(() => useUnifiedSearch(), { wrapper });

      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
      expect(result.current.hasResults).toBe(false);

      act(() => {
        result.current.setFilter("category", "electronics");
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("Filter Configuration", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UnifiedSearchProvider>{children}</UnifiedSearchProvider>
    );

    it("should provide default filter configuration", () => {
      const { result } = renderHook(() => useUnifiedSearch(), { wrapper });

      expect(result.current.filterConfig.listings).toBeDefined();
      expect(result.current.filterConfig.blog).toBeDefined();

      // Check listing filters
      expect(result.current.filterConfig.listings.category).toBeDefined();
      expect(result.current.filterConfig.listings.location).toBeDefined();
      expect(result.current.filterConfig.listings.price).toBeDefined();
      expect(result.current.filterConfig.listings.condition).toBeDefined();

      // Check blog filters
      expect(result.current.filterConfig.blog.category).toBeDefined();
      expect(result.current.filterConfig.blog.tags).toBeDefined();
      expect(result.current.filterConfig.blog.language).toBeDefined();
    });

    it("should have correct filter types", () => {
      const { result } = renderHook(() => useUnifiedSearch(), { wrapper });

      const { filterConfig } = result.current;

      expect(filterConfig.listings.category.type).toBe("select");
      expect(filterConfig.listings.price.type).toBe("range");
      expect(filterConfig.blog.tags.type).toBe("multiselect");
      expect(filterConfig.blog.featured.type).toBe("checkbox");
    });
  });
});
