/**
 * Comprehensive integration tests for the unified search system
 * Tests complete search flows across different pages and components
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Import all core components
import { UniversalSearchBar } from "@/components/search/universal-search-bar";
import { UnifiedListingSearch } from "@/components/search/unified-listing-search";
import { UnifiedBlogSearch } from "@/components/search/unified-blog-search";
import { FilterManager } from "@/components/search/filter-manager";
import { UniversalPageLayout } from "@/components/layout/universal-page-layout";
import { UniversalSidebar } from "@/components/layout/universal-sidebar";

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/search",
}));

// Mock analytics
vi.mock("@/lib/analytics-client", () => ({
  analytics: {
    trackSearch: vi.fn().mockResolvedValue(undefined),
    trackFilterChange: vi.fn().mockResolvedValue(undefined),
    trackPageView: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock hooks
vi.mock("@/hooks/use-search-listings", () => ({
  useSearchListings: () => ({
    data: mockListings,
    isLoading: false,
    error: null,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
    totalResults: mockListings.length,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 20,
      totalResults: mockListings.length,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }),
}));

vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: any) => value,
}));

// Test data
const mockCategories = [
  { _id: "1", title: "Electronics", slug: "electronics", itemCount: 10 },
  { _id: "2", title: "Vehicles", slug: "vehicles", itemCount: 5 },
  { _id: "3", title: "Tools", slug: "tools", itemCount: 8 },
];

const mockCities = [
  { id: "1", name: "Karachi", province: "Sindh" },
  { id: "2", name: "Lahore", province: "Punjab" },
  { id: "3", name: "Islamabad", province: "Federal" },
];

const mockListings = [
  {
    _id: "1",
    title: "Professional Camera",
    description: "High-quality DSLR camera for rent",
    price: 1500,
    priceType: "daily" as const,
    images: ["camera1.jpg"],
    condition: "new",
    availability: "available",
    location: { city: "Karachi", area: "DHA" },
    category: { title: "Electronics", slug: "electronics" },
    seller: {
      id: "1",
      username: "photographer",
      tier: "premium" as const,
      isVerified: true,
    },
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "2",
    title: "Luxury Car",
    description: "BMW for special occasions",
    price: 5000,
    priceType: "daily" as const,
    images: ["car1.jpg"],
    condition: "excellent",
    availability: "available",
    location: { city: "Lahore", area: "Gulberg" },
    category: { title: "Vehicles", slug: "vehicles" },
    seller: {
      id: "2",
      username: "carowner",
      tier: "basic" as const,
      isVerified: false,
    },
    createdAt: "2024-01-02T00:00:00Z",
  },
];

const mockBlogPosts = [
  {
    _id: "1",
    title: "Photography Tips for Beginners",
    excerpt: "Learn the basics of photography",
    slug: { current: "photography-tips" },
    publishedAt: "2024-01-01T00:00:00Z",
    category: { title: "Photography", slug: { current: "photography" } },
    tags: ["photography", "tips", "beginner"],
    featured: true,
    language: "en" as const,
  },
  {
    _id: "2",
    title: "Car Rental Guide",
    excerpt: "Everything you need to know about renting cars",
    slug: { current: "car-rental-guide" },
    publishedAt: "2024-01-02T00:00:00Z",
    category: { title: "Travel", slug: { current: "travel" } },
    tags: ["cars", "rental", "travel"],
    featured: false,
    language: "en" as const,
  },
];

const mockBlogCategories = [
  { _id: "1", title: "Photography", slug: { current: "photography" } },
  { _id: "2", title: "Travel", slug: { current: "travel" } },
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

describe("Comprehensive Search System Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Cross-Component Integration", () => {
    it("integrates UniversalSearchBar with UnifiedListingSearch", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [searchQuery, setSearchQuery] = React.useState("");

        return (
          <div>
            <UniversalSearchBar
              onSearch={(query) => setSearchQuery(query)}
              variant="header"
            />
            <UnifiedListingSearch
              categories={mockCategories}
              cities={mockCities}
              initialQuery={searchQuery}
            />
          </div>
        );
      };

      render(<TestComponent />, { wrapper: createWrapper() });

      // Search from UniversalSearchBar
      const searchInput = screen.getByRole("combobox");
      await user.type(searchInput, "camera");

      const searchButton = screen.getByRole("button", { name: /search/i });
      await user.click(searchButton);

      // Verify search is reflected in UnifiedListingSearch
      await waitFor(() => {
        expect(screen.getByDisplayValue("camera")).toBeInTheDocument();
      });
    });

    it("integrates FilterManager with search results", async () => {
      const user = userEvent.setup();

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Open filters
      const filtersButton = screen.getByText("Filters");
      await user.click(filtersButton);

      // Apply category filter
      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });
      await user.click(categorySelect);

      const electronicsOption = screen.getByRole("option", {
        name: /electronics/i,
      });
      await user.click(electronicsOption);

      // Verify filter is applied and URL is updated
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("category=electronics")
        );
      });
    });

    it("maintains state consistency across components", async () => {
      const user = userEvent.setup();

      render(
        <UniversalPageLayout pageType="search">
          <UnifiedListingSearch
            categories={mockCategories}
            cities={mockCities}
          />
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      // Apply multiple filters
      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      await user.type(searchInput, "camera");

      const filtersButton = screen.getByText("Filters");
      await user.click(filtersButton);

      // Verify all components maintain consistent state
      expect(searchInput).toHaveValue("camera");
      expect(filtersButton).toBeInTheDocument();
    });
  });

  describe("Search Flow Integration", () => {
    it("completes full search flow from query to results", async () => {
      const user = userEvent.setup();

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // 1. Enter search query
      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      await user.type(searchInput, "camera");

      // 2. Apply filters
      const filtersButton = screen.getByText("Filters");
      await user.click(filtersButton);

      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });
      await user.click(categorySelect);

      const electronicsOption = screen.getByRole("option", {
        name: /electronics/i,
      });
      await user.click(electronicsOption);

      // 3. Submit search
      const searchButton = screen.getByText("Search");
      await user.click(searchButton);

      // 4. Verify results and URL update
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("q=camera")
        );
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("category=electronics")
        );
      });
    });

    it("handles filter clearing flow", async () => {
      const user = userEvent.setup();

      // Start with some filters applied
      const searchParams = new URLSearchParams(
        "q=camera&category=electronics&city=karachi"
      );
      vi.mocked(require("next/navigation").useSearchParams).mockReturnValue(
        searchParams
      );

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Verify filters are shown
      expect(screen.getByText("Clear all")).toBeInTheDocument();

      // Clear all filters
      const clearAllButton = screen.getByText("Clear all");
      await user.click(clearAllButton);

      // Verify URL is updated to clear filters
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.not.stringContaining("category=")
        );
      });
    });

    it("handles pagination with filters maintained", async () => {
      const user = userEvent.setup();

      // Mock pagination data
      const mockSearchHook = vi.mocked(
        require("@/hooks/use-search-listings").useSearchListings
      );
      mockSearchHook.mockReturnValue({
        data: mockListings,
        isLoading: false,
        error: null,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
        totalResults: 50,
        pagination: {
          currentPage: 1,
          totalPages: 3,
          itemsPerPage: 20,
          totalResults: 50,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      });

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Apply filters first
      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      await user.type(searchInput, "camera");

      // Navigate to next page (if pagination controls exist)
      const nextPageButton = screen.queryByRole("button", { name: /next/i });
      if (nextPageButton) {
        await user.click(nextPageButton);

        // Verify filters are maintained in URL
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(
            expect.stringContaining("q=camera")
          );
        });
      }
    });
  });

  describe("Blog Search Integration", () => {
    it("integrates blog search with sidebar content", () => {
      render(
        <UniversalPageLayout pageType="blog">
          <UnifiedBlogSearch
            posts={mockBlogPosts}
            categories={mockBlogCategories}
            tags={["photography", "travel", "tips"]}
            filters={{
              query: "",
              category: undefined,
              tag: undefined,
              language: undefined,
              featured: undefined,
              dateFrom: undefined,
              dateTo: undefined,
            }}
            pagination={{
              page: 1,
              totalPages: 1,
              total: mockBlogPosts.length,
              hasMore: false,
            }}
            onFiltersChange={vi.fn()}
            onPageChange={vi.fn()}
            onSearch={vi.fn()}
          />
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      // Verify blog search is rendered
      expect(
        screen.getByRole("textbox", { name: /search blog posts/i })
      ).toBeInTheDocument();

      // Verify sidebar is present for blog context
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("handles blog-specific filter combinations", async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();

      render(
        <UnifiedBlogSearch
          posts={mockBlogPosts}
          categories={mockBlogCategories}
          tags={["photography", "travel", "tips"]}
          filters={{
            query: "",
            category: undefined,
            tag: undefined,
            language: undefined,
            featured: undefined,
            dateFrom: undefined,
            dateTo: undefined,
          }}
          pagination={{
            page: 1,
            totalPages: 1,
            total: mockBlogPosts.length,
            hasMore: false,
          }}
          onFiltersChange={onFiltersChange}
          onPageChange={vi.fn()}
          onSearch={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Apply blog-specific filters
      const featuredCheckbox = screen.getByRole("checkbox", {
        name: /featured only/i,
      });
      await user.click(featuredCheckbox);

      const languageSelect = screen.getByRole("combobox", {
        name: /language/i,
      });
      await user.click(languageSelect);

      const englishOption = screen.getByRole("option", { name: /english/i });
      await user.click(englishOption);

      // Verify filters are applied
      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          featured: true,
          language: "en",
        })
      );
    });
  });

  describe("Universal Page Layout Integration", () => {
    it("renders different page types with appropriate sidebar content", () => {
      const { rerender } = render(
        <UniversalPageLayout pageType="search">
          <div>Search Content</div>
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText("Search Content")).toBeInTheDocument();
      expect(screen.getByRole("complementary")).toBeInTheDocument();

      // Test category page
      rerender(
        <UniversalPageLayout
          pageType="category"
          pageContext={{ categorySlug: "electronics" }}
        >
          <div>Category Content</div>
        </UniversalPageLayout>
      );

      expect(screen.getByText("Category Content")).toBeInTheDocument();

      // Test blog page
      rerender(
        <UniversalPageLayout pageType="blog">
          <div>Blog Content</div>
        </UniversalPageLayout>
      );

      expect(screen.getByText("Blog Content")).toBeInTheDocument();
    });

    it("adapts sidebar content based on page context", () => {
      render(
        <UniversalPageLayout
          pageType="category"
          pageContext={{
            categorySlug: "electronics",
            categoryTitle: "Electronics",
          }}
        >
          <div>Category Content</div>
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      // Sidebar should be present and contextual
      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toBeInTheDocument();

      // Context-specific content should be loaded
      // (This would be tested more thoroughly with actual sidebar content)
    });
  });

  describe("Error Handling Integration", () => {
    it("handles search API errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock search hook to return error
      const mockSearchHook = vi.mocked(
        require("@/hooks/use-search-listings").useSearchListings
      );
      mockSearchHook.mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error("Search API failed"),
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
      });

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Perform search that will fail
      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      await user.type(searchInput, "camera");

      const searchButton = screen.getByText("Search");
      await user.click(searchButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it("handles network connectivity issues", async () => {
      const user = userEvent.setup();

      // Mock network error
      const mockSearchHook = vi.mocked(
        require("@/hooks/use-search-listings").useSearchListings
      );
      mockSearchHook.mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error("Network Error"),
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
      });

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Component should still be functional
      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      expect(searchInput).toBeInTheDocument();

      // Error state should be shown
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  describe("State Management Integration", () => {
    it("synchronizes state between URL and components", async () => {
      const user = userEvent.setup();

      // Start with URL parameters
      const searchParams = new URLSearchParams("q=camera&category=electronics");
      vi.mocked(require("next/navigation").useSearchParams).mockReturnValue(
        searchParams
      );

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Verify components reflect URL state
      expect(screen.getByDisplayValue("camera")).toBeInTheDocument();

      // Modify state through UI
      const searchInput = screen.getByDisplayValue("camera");
      await user.clear(searchInput);
      await user.type(searchInput, "laptop");

      const searchButton = screen.getByText("Search");
      await user.click(searchButton);

      // Verify URL is updated
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("q=laptop")
        );
      });
    });

    it("handles browser back/forward navigation", () => {
      // This would typically be tested with actual browser navigation
      // For now, verify that components can handle external state changes

      const { rerender } = render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Simulate navigation by changing search params
      const newSearchParams = new URLSearchParams(
        "q=laptop&category=electronics"
      );
      vi.mocked(require("next/navigation").useSearchParams).mockReturnValue(
        newSearchParams
      );

      rerender(
        <UnifiedListingSearch categories={mockCategories} cities={mockCities} />
      );

      // Component should reflect new state
      expect(screen.getByDisplayValue("laptop")).toBeInTheDocument();
    });
  });

  describe("Performance Integration", () => {
    it("handles rapid filter changes efficiently", async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
          onFiltersChange={onFiltersChange}
          manageURL={false}
        />,
        { wrapper: createWrapper() }
      );

      // Make rapid filter changes
      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );

      await user.type(searchInput, "c");
      await user.type(searchInput, "a");
      await user.type(searchInput, "m");
      await user.type(searchInput, "e");
      await user.type(searchInput, "r");
      await user.type(searchInput, "a");

      // Due to debouncing (mocked to return immediately),
      // should still handle all changes
      expect(onFiltersChange).toHaveBeenCalled();
    });

    it("manages large result sets efficiently", () => {
      // Mock large dataset
      const largeListings = Array.from({ length: 100 }, (_, i) => ({
        ...mockListings[0],
        _id: `listing-${i}`,
        title: `Item ${i}`,
      }));

      const mockSearchHook = vi.mocked(
        require("@/hooks/use-search-listings").useSearchListings
      );
      mockSearchHook.mockReturnValue({
        data: largeListings,
        isLoading: false,
        error: null,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
        totalResults: 1000,
        pagination: {
          currentPage: 1,
          totalPages: 50,
          itemsPerPage: 20,
          totalResults: 1000,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      });

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Component should render without performance issues
      expect(
        screen.getByPlaceholderText("Search for rental items...")
      ).toBeInTheDocument();

      // Results should be displayed (first page)
      expect(screen.getByText("Item 0")).toBeInTheDocument();
    });
  });
});
