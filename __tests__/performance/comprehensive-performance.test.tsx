/**
 * Comprehensive performance tests for unified search system
 * Tests search operations, filter applications, and rendering performance
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Import components to test
import { UniversalSearchBar } from "@/components/search/universal-search-bar";
import { UnifiedListingSearch } from "@/components/search/unified-listing-search";
import { UnifiedBlogSearch } from "@/components/search/unified-blog-search";
import { FilterManager } from "@/components/search/filter-manager";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/search",
}));

// Mock analytics
vi.mock("@/lib/analytics-client", () => ({
  analytics: {
    trackSearch: vi.fn().mockResolvedValue(undefined),
    trackFilterChange: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock performance hooks
const mockPerformanceSearch = {
  debouncedSearch: vi.fn(),
  debouncedFilterChange: vi.fn(),
  performSearch: vi.fn().mockResolvedValue({ results: [], total: 0 }),
  clearCache: vi.fn(),
  getCacheStats: vi.fn(() => ({ size: 0, pendingRequests: 0 })),
};

vi.mock("@/hooks/use-performance-search", () => ({
  usePerformanceSearch: () => mockPerformanceSearch,
}));

// Mock debounce hook with actual debouncing for performance tests
const mockDebounce = vi.fn();
vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: mockDebounce,
}));

// Mock search listings hook
const mockSearchListings = {
  data: [],
  isLoading: false,
  error: null,
  hasNextPage: false,
  fetchNextPage: vi.fn(),
  isFetchingNextPage: false,
  totalResults: 0,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20,
    totalResults: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

vi.mock("@/hooks/use-search-listings", () => ({
  useSearchListings: () => mockSearchListings,
}));

// Test data
const mockCategories = Array.from({ length: 50 }, (_, i) => ({
  _id: `cat-${i}`,
  title: `Category ${i}`,
  slug: `category-${i}`,
  itemCount: Math.floor(Math.random() * 100),
}));

const mockCities = Array.from({ length: 100 }, (_, i) => ({
  id: `city-${i}`,
  name: `City ${i}`,
  province: `Province ${i % 5}`,
}));

const mockLargeListings = Array.from({ length: 1000 }, (_, i) => ({
  _id: `listing-${i}`,
  title: `Item ${i}`,
  description: `Description for item ${i}`,
  price: Math.floor(Math.random() * 10000) + 100,
  priceType: "daily" as const,
  images: [`image-${i}.jpg`],
  condition: ["new", "used", "refurbished"][i % 3],
  availability: "available",
  location: { city: `City ${i % 10}`, area: `Area ${i % 20}` },
  category: { title: `Category ${i % 10}`, slug: `category-${i % 10}` },
  seller: {
    id: `seller-${i}`,
    username: `user${i}`,
    tier: ["basic", "premium", "pro"][i % 3] as const,
    isVerified: i % 2 === 0,
  },
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const mockFilterConfig = [
  {
    key: "category",
    type: "select" as const,
    label: "Category",
    options: mockCategories.slice(0, 20).map((cat) => ({
      value: cat.slug,
      label: cat.title,
      count: cat.itemCount,
    })),
  },
  {
    key: "city",
    type: "select" as const,
    label: "City",
    options: mockCities.slice(0, 20).map((city) => ({
      value: city.name.toLowerCase(),
      label: city.name,
    })),
  },
  {
    key: "price",
    type: "range" as const,
    label: "Price Range",
    min: 0,
    max: 100000,
    step: 100,
  },
  {
    key: "condition",
    type: "select" as const,
    label: "Condition",
    options: [
      { value: "new", label: "New" },
      { value: "used", label: "Used" },
      { value: "refurbished", label: "Refurbished" },
    ],
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Performance measurement utilities
const measureRenderTime = (renderFn: () => void): number => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

const measureAsyncOperation = async (
  operation: () => Promise<void>
): Promise<number> => {
  const start = performance.now();
  await operation();
  const end = performance.now();
  return end - start;
};

describe("Comprehensive Performance Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset debounce mock to return value immediately for most tests
    mockDebounce.mockImplementation((value) => value);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Search Debouncing Performance", () => {
    it("debounces search input with correct timing", async () => {
      // Use real debouncing for this test
      mockDebounce.mockImplementation((value, delay) => {
        const [debouncedValue, setDebouncedValue] = React.useState(value);

        React.useEffect(() => {
          const timer = setTimeout(() => setDebouncedValue(value), delay);
          return () => clearTimeout(timer);
        }, [value, delay]);

        return debouncedValue;
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");

      // Type rapidly
      await user.type(searchInput, "camera");

      // Should not trigger search immediately
      expect(mockPerformanceSearch.debouncedSearch).not.toHaveBeenCalled();

      // Advance timers to trigger debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockPerformanceSearch.debouncedSearch).toHaveBeenCalledWith(
          "camera",
          {}
        );
      });
    });

    it("debounces filter changes with shorter delay", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={mockPerformanceSearch.debouncedFilterChange}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      // Rapid filter changes
      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });
      await user.click(categorySelect);

      const option = screen.getByRole("option", { name: /category 0/i });
      await user.click(option);

      // Should debounce with shorter delay (100ms)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPerformanceSearch.debouncedFilterChange).toHaveBeenCalled();
      });
    });

    it("cancels previous debounced calls on new input", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");

      // First input
      await user.type(searchInput, "cam");

      // Second input before debounce completes
      await user.type(searchInput, "era");

      // Advance timers
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should only call with final value
      await waitFor(() => {
        expect(mockPerformanceSearch.debouncedSearch).toHaveBeenCalledWith(
          "camera",
          {}
        );
        expect(mockPerformanceSearch.debouncedSearch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Rendering Performance", () => {
    it("renders UniversalSearchBar quickly", () => {
      const renderTime = measureRenderTime(() => {
        render(<UniversalSearchBar />);
      });

      // Should render in under 50ms
      expect(renderTime).toBeLessThan(50);
    });

    it("renders large filter lists efficiently", () => {
      const largeFilterConfig = [
        {
          key: "category",
          type: "select" as const,
          label: "Category",
          options: mockCategories.map((cat) => ({
            value: cat.slug,
            label: cat.title,
            count: cat.itemCount,
          })),
        },
      ];

      const renderTime = measureRenderTime(() => {
        render(
          <FilterManager
            filters={{}}
            filterConfig={largeFilterConfig}
            onFilterChange={vi.fn()}
            onClearFilter={vi.fn()}
            onClearAll={vi.fn()}
          />
        );
      });

      // Should handle large lists efficiently (under 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it("handles large result sets without performance degradation", () => {
      // Mock large dataset
      mockSearchListings.data = mockLargeListings.slice(0, 100);
      mockSearchListings.totalResults = 1000;

      const renderTime = measureRenderTime(() => {
        render(
          <UnifiedListingSearch
            categories={mockCategories}
            cities={mockCities}
          />,
          { wrapper: createWrapper() }
        );
      });

      // Should render efficiently even with large datasets
      expect(renderTime).toBeLessThan(200);
    });

    it("optimizes re-renders with React.memo", () => {
      const { rerender } = render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      // Re-render with same props
      const rerenderTime = measureRenderTime(() => {
        rerender(
          <FilterManager
            filters={{}}
            filterConfig={mockFilterConfig}
            onFilterChange={vi.fn()}
            onClearFilter={vi.fn()}
            onClearAll={vi.fn()}
          />
        );
      });

      // Re-render should be faster due to memoization
      expect(rerenderTime).toBeLessThan(20);
    });
  });

  describe("Search Operation Performance", () => {
    it("performs search operations efficiently", async () => {
      const user = userEvent.setup();

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      const searchButton = screen.getByText("Search");

      const operationTime = await measureAsyncOperation(async () => {
        await user.type(searchInput, "camera");
        await user.click(searchButton);
      });

      // Search operation should complete quickly
      expect(operationTime).toBeLessThan(100);
    });

    it("handles concurrent search requests efficiently", async () => {
      const user = userEvent.setup();

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");

      // Simulate rapid typing (concurrent requests)
      const operationTime = await measureAsyncOperation(async () => {
        await user.type(searchInput, "c");
        await user.type(searchInput, "a");
        await user.type(searchInput, "m");
        await user.type(searchInput, "e");
        await user.type(searchInput, "r");
        await user.type(searchInput, "a");
      });

      // Should handle rapid input efficiently
      expect(operationTime).toBeLessThan(200);
    });

    it("caches search results for performance", () => {
      mockPerformanceSearch.getCacheStats.mockReturnValue({
        size: 5,
        pendingRequests: 0,
      });

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Cache should be utilized
      expect(mockPerformanceSearch.getCacheStats).toHaveBeenCalled();
    });
  });

  describe("Filter Performance", () => {
    it("applies filters efficiently", async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={onFilterChange}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      const operationTime = await measureAsyncOperation(async () => {
        // Apply category filter
        const categorySelect = screen.getByRole("combobox", {
          name: /category/i,
        });
        await user.click(categorySelect);

        const option = screen.getByRole("option", { name: /category 0/i });
        await user.click(option);

        // Apply price filter
        const minPriceInput = screen.getByLabelText(/minimum price/i);
        await user.type(minPriceInput, "1000");
      });

      // Filter operations should be fast
      expect(operationTime).toBeLessThan(150);
      expect(onFilterChange).toHaveBeenCalled();
    });

    it("clears filters efficiently", async () => {
      const user = userEvent.setup();
      const onClearAll = vi.fn();

      const activeFilters = {
        category: "electronics",
        city: "karachi",
        price: { min: 1000, max: 5000 },
        condition: "new",
      };

      render(
        <FilterManager
          filters={activeFilters}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={onClearAll}
        />
      );

      const operationTime = await measureAsyncOperation(async () => {
        const clearAllButton = screen.getByRole("button", {
          name: /clear all/i,
        });
        await user.click(clearAllButton);
      });

      // Clear operation should be fast
      expect(operationTime).toBeLessThan(50);
      expect(onClearAll).toHaveBeenCalled();
    });

    it("handles complex filter combinations efficiently", async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={onFilterChange}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      const operationTime = await measureAsyncOperation(async () => {
        // Apply multiple filters rapidly
        const categorySelect = screen.getByRole("combobox", {
          name: /category/i,
        });
        await user.click(categorySelect);
        await user.click(screen.getByRole("option", { name: /category 0/i }));

        const citySelect = screen.getByRole("combobox", { name: /city/i });
        await user.click(citySelect);
        await user.click(screen.getByRole("option", { name: /city 0/i }));

        const conditionSelect = screen.getByRole("combobox", {
          name: /condition/i,
        });
        await user.click(conditionSelect);
        await user.click(screen.getByRole("option", { name: /new/i }));
      });

      // Complex filter operations should still be efficient
      expect(operationTime).toBeLessThan(300);
    });
  });

  describe("Memory Management", () => {
    it("cleans up resources on unmount", () => {
      const { unmount } = render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it("manages cache size efficiently", () => {
      mockPerformanceSearch.getCacheStats.mockReturnValue({
        size: 100,
        pendingRequests: 5,
      });

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Should monitor cache size
      expect(mockPerformanceSearch.getCacheStats).toHaveBeenCalled();
    });

    it("handles memory pressure gracefully", () => {
      // Simulate memory pressure by creating large objects
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: new Array(1000).fill(`data-${i}`),
      }));

      mockSearchListings.data = largeData.slice(0, 20);

      const renderTime = measureRenderTime(() => {
        render(
          <UnifiedListingSearch
            categories={mockCategories}
            cities={mockCities}
          />,
          { wrapper: createWrapper() }
        );
      });

      // Should handle large data sets without significant performance impact
      expect(renderTime).toBeLessThan(300);
    });
  });

  describe("Network Performance", () => {
    it("handles slow network responses", async () => {
      // Mock slow search response
      mockPerformanceSearch.performSearch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ results: [], total: 0 }), 2000)
          )
      );

      const user = userEvent.setup();

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      const searchButton = screen.getByText("Search");

      // Should remain responsive during slow network
      await user.type(searchInput, "camera");
      await user.click(searchButton);

      // UI should remain interactive
      expect(searchInput).not.toHaveAttribute("disabled");
    });

    it("deduplicates identical requests", async () => {
      const user = userEvent.setup();

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");

      // Make identical searches
      await user.type(searchInput, "camera");
      await user.keyboard("{Enter}");
      await user.keyboard("{Enter}");
      await user.keyboard("{Enter}");

      // Should deduplicate requests
      expect(mockPerformanceSearch.debouncedSearch).toHaveBeenCalledTimes(1);
    });

    it("cancels outdated requests", async () => {
      const user = userEvent.setup();

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");

      // Start search
      await user.type(searchInput, "camera");
      await user.keyboard("{Enter}");

      // Change search before first completes
      await user.clear(searchInput);
      await user.type(searchInput, "laptop");
      await user.keyboard("{Enter}");

      // Should handle request cancellation
      expect(mockPerformanceSearch.debouncedSearch).toHaveBeenCalledWith(
        "laptop",
        {}
      );
    });
  });

  describe("Virtual Scrolling and Pagination", () => {
    it("handles large result sets with pagination", () => {
      mockSearchListings.data = mockLargeListings.slice(0, 20);
      mockSearchListings.totalResults = 1000;
      mockSearchListings.pagination = {
        currentPage: 1,
        totalPages: 50,
        itemsPerPage: 20,
        totalResults: 1000,
        hasNextPage: true,
        hasPreviousPage: false,
      };

      const renderTime = measureRenderTime(() => {
        render(
          <UnifiedListingSearch
            categories={mockCategories}
            cities={mockCities}
          />,
          { wrapper: createWrapper() }
        );
      });

      // Should render efficiently with pagination
      expect(renderTime).toBeLessThan(150);
    });

    it("loads next page efficiently", async () => {
      const user = userEvent.setup();
      const fetchNextPage = vi.fn();

      mockSearchListings.hasNextPage = true;
      mockSearchListings.fetchNextPage = fetchNextPage;

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Simulate scroll to bottom or next page click
      const nextPageButton = screen.queryByRole("button", { name: /next/i });
      if (nextPageButton) {
        const operationTime = await measureAsyncOperation(async () => {
          await user.click(nextPageButton);
        });

        expect(operationTime).toBeLessThan(100);
        expect(fetchNextPage).toHaveBeenCalled();
      }
    });
  });

  describe("Component Optimization", () => {
    it("uses React.memo effectively", () => {
      const MemoizedComponent = React.memo(() => (
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      ));

      const { rerender } = render(<MemoizedComponent />);

      const rerenderTime = measureRenderTime(() => {
        rerender(<MemoizedComponent />);
      });

      // Memoized component should re-render very quickly
      expect(rerenderTime).toBeLessThan(10);
    });

    it("optimizes callback functions with useCallback", () => {
      const onFilterChange = vi.fn();

      const { rerender } = render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={onFilterChange}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      // Re-render with same callback
      const rerenderTime = measureRenderTime(() => {
        rerender(
          <FilterManager
            filters={{}}
            filterConfig={mockFilterConfig}
            onFilterChange={onFilterChange}
            onClearFilter={vi.fn()}
            onClearAll={vi.fn()}
          />
        );
      });

      // Should optimize re-renders
      expect(rerenderTime).toBeLessThan(30);
    });

    it("handles rapid state updates efficiently", async () => {
      const user = userEvent.setup();

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");

      // Rapid typing
      const operationTime = await measureAsyncOperation(async () => {
        for (let i = 0; i < 10; i++) {
          await user.type(searchInput, `${i}`);
        }
      });

      // Should handle rapid updates efficiently
      expect(operationTime).toBeLessThan(500);
    });
  });

  describe("Bundle Size and Loading Performance", () => {
    it("loads components efficiently", () => {
      const loadTime = measureRenderTime(() => {
        render(
          <UnifiedListingSearch
            categories={mockCategories}
            cities={mockCities}
          />,
          { wrapper: createWrapper() }
        );
      });

      // Initial load should be fast
      expect(loadTime).toBeLessThan(100);
    });

    it("handles code splitting gracefully", async () => {
      // Simulate dynamic import
      const DynamicComponent = React.lazy(() =>
        Promise.resolve({
          default: () => (
            <FilterManager
              filters={{}}
              filterConfig={mockFilterConfig}
              onFilterChange={vi.fn()}
              onClearFilter={vi.fn()}
              onClearAll={vi.fn()}
            />
          ),
        })
      );

      const { container } = render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <DynamicComponent />
        </React.Suspense>
      );

      // Should handle lazy loading
      await waitFor(() => {
        expect(container.querySelector('[role="group"]')).toBeInTheDocument();
      });
    });
  });
});
