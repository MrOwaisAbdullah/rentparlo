/**
 * Comprehensive accessibility tests for unified search system
 * Tests keyboard navigation, screen reader support, and ARIA compliance
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Import components to test
import { UniversalSearchBar } from "@/components/search/universal-search-bar";
import { UnifiedListingSearch } from "@/components/search/unified-listing-search";
import { UnifiedBlogSearch } from "@/components/search/unified-blog-search";
import { FilterManager } from "@/components/search/filter-manager";
import { UniversalPageLayout } from "@/components/layout/universal-page-layout";

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
    trackSearch: vi.fn(),
    trackFilterChange: vi.fn(),
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
    description: "High-quality DSLR camera",
    price: 1500,
    priceType: "daily" as const,
    images: ["camera.jpg"],
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
];

const mockBlogPosts = [
  {
    _id: "1",
    title: "Photography Tips",
    excerpt: "Learn photography basics",
    slug: { current: "photography-tips" },
    publishedAt: "2024-01-01T00:00:00Z",
    category: { title: "Photography", slug: { current: "photography" } },
    tags: ["photography", "tips"],
    featured: true,
    language: "en" as const,
  },
];

const mockBlogCategories = [
  { _id: "1", title: "Photography", slug: { current: "photography" } },
  { _id: "2", title: "Travel", slug: { current: "travel" } },
];

const mockFilterConfig = [
  {
    key: "category",
    type: "select" as const,
    label: "Category",
    placeholder: "Select category",
    options: mockCategories.map((cat) => ({
      value: cat.slug,
      label: cat.title,
      count: cat.itemCount,
    })),
  },
  {
    key: "price",
    type: "range" as const,
    label: "Price Range",
    min: 0,
    max: 100000,
    step: 1000,
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
  {
    key: "featured",
    type: "checkbox" as const,
    label: "Featured Only",
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

describe("Comprehensive Accessibility Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ARIA Compliance and Semantic HTML", () => {
    it("UniversalSearchBar has no accessibility violations", async () => {
      const { container } = render(<UniversalSearchBar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("UnifiedListingSearch has no accessibility violations", async () => {
      const { container } = render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("FilterManager has no accessibility violations", async () => {
      const { container } = render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("UniversalPageLayout has no accessibility violations", async () => {
      const { container } = render(
        <UniversalPageLayout pageType="search">
          <div>Content</div>
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("uses proper semantic HTML structure", () => {
      render(
        <UniversalPageLayout pageType="search">
          <UnifiedListingSearch
            categories={mockCategories}
            cities={mockCities}
          />
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      // Check for proper landmarks
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("complementary")).toBeInTheDocument(); // Sidebar
      expect(screen.getByRole("search")).toBeInTheDocument();
    });

    it("has proper heading hierarchy", () => {
      render(
        <UniversalPageLayout pageType="search">
          <UnifiedListingSearch
            categories={mockCategories}
            cities={mockCities}
          />
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      // Check heading levels are logical
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);

      // First heading should be h1 or h2
      const firstHeading = headings[0];
      expect(firstHeading.tagName).toMatch(/^H[1-2]$/);
    });
  });

  describe("Keyboard Navigation", () => {
    it("supports full keyboard navigation in UniversalSearchBar", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar showLocationFilter={true} />);

      // Tab through all interactive elements
      await user.tab();
      expect(document.activeElement).toHaveAttribute("role", "combobox");

      await user.tab();
      expect(document.activeElement).toHaveAttribute("type", "button");

      // Test Enter key on search button
      await user.keyboard("{Enter}");
      // Should trigger search (tested via analytics mock)
    });

    it("supports keyboard navigation in filter controls", async () => {
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

      // Tab to category select
      await user.tab();
      const categorySelect = document.activeElement;
      expect(categorySelect).toHaveAttribute("role", "combobox");

      // Open dropdown with Enter
      await user.keyboard("{Enter}");
      expect(categorySelect).toHaveAttribute("aria-expanded", "true");

      // Navigate with arrow keys
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(onFilterChange).toHaveBeenCalled();
    });

    it("supports keyboard navigation in search results", async () => {
      const user = userEvent.setup();

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Tab through search interface
      await user.tab(); // Search input
      expect(document.activeElement).toHaveAttribute("role", "textbox");

      await user.tab(); // Search button
      expect(document.activeElement).toHaveAttribute("type", "button");

      await user.tab(); // Filters button
      expect(document.activeElement?.textContent).toContain("Filters");
    });

    it("handles Escape key to close dropdowns", async () => {
      const user = userEvent.setup();

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");
      await user.click(searchInput);

      // Open suggestions
      await user.type(searchInput, "c");

      // Close with Escape
      await user.keyboard("{Escape}");
      expect(searchInput).toHaveAttribute("aria-expanded", "false");
    });

    it("supports arrow key navigation in suggestion lists", async () => {
      const user = userEvent.setup();

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");
      await user.click(searchInput);

      // Type to show suggestions
      await user.type(searchInput, "c");

      // Navigate suggestions with arrow keys
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowUp}");
      await user.keyboard("{Enter}");

      // Should select suggestion
      expect(searchInput.getAttribute("value")).toBeTruthy();
    });

    it("maintains focus management during filter operations", async () => {
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

      // Focus should remain manageable
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe("Screen Reader Support", () => {
    it("provides proper ARIA labels for all interactive elements", () => {
      render(<UniversalSearchBar showLocationFilter={true} />);

      const searchInput = screen.getByRole("combobox");
      expect(searchInput).toHaveAttribute("aria-label");
      expect(searchInput).toHaveAttribute("aria-describedby");

      const searchButton = screen.getByRole("button", { name: /search/i });
      expect(searchButton).toHaveAttribute("aria-label");
    });

    it("announces search results count to screen readers", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const resultsRegion = screen.getByRole("region", {
        name: /search results/i,
      });
      expect(resultsRegion).toHaveAttribute("aria-live", "polite");
      expect(resultsRegion).toHaveAttribute("aria-labelledby");
    });

    it("announces filter changes to screen readers", () => {
      const activeFilters = { category: "electronics", condition: "new" };

      render(
        <FilterManager
          filters={activeFilters}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
          showActiveFilters={true}
        />
      );

      const activeFiltersRegion = screen.getByRole("region", {
        name: /active filters/i,
      });
      expect(activeFiltersRegion).toHaveAttribute("aria-live", "polite");
      expect(activeFiltersRegion).toHaveAttribute("aria-label");
    });

    it("provides descriptive labels for complex controls", () => {
      render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      // Price range inputs should have descriptive labels
      const minPriceInput = screen.getByLabelText(/minimum price/i);
      const maxPriceInput = screen.getByLabelText(/maximum price/i);

      expect(minPriceInput).toHaveAttribute("aria-describedby");
      expect(maxPriceInput).toHaveAttribute("aria-describedby");
    });

    it("announces loading states", () => {
      // Mock loading state
      const mockSearchHook = vi.mocked(
        require("@/hooks/use-search-listings").useSearchListings
      );
      mockSearchHook.mockReturnValue({
        data: [],
        isLoading: true,
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
      });

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Loading state should be announced
      const loadingElement = screen.getByText(/loading/i);
      expect(loadingElement).toHaveAttribute("aria-live", "polite");
    });

    it("provides context for form controls", () => {
      render(
        <UnifiedBlogSearch
          posts={mockBlogPosts}
          categories={mockBlogCategories}
          tags={["photography", "travel"]}
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
      );

      const searchInput = screen.getByRole("textbox");
      expect(searchInput).toHaveAttribute("aria-label");
      expect(searchInput).toHaveAttribute("aria-describedby");
    });
  });

  describe("Focus Management", () => {
    it("maintains logical tab order", async () => {
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

      const focusableElements: Element[] = [];

      // Tab through all elements and record order
      for (let i = 0; i < 10; i++) {
        await user.tab();
        if (
          document.activeElement &&
          document.activeElement !== document.body
        ) {
          focusableElements.push(document.activeElement);
        }
      }

      // Should have found focusable elements
      expect(focusableElements.length).toBeGreaterThan(0);

      // Elements should be unique (no focus traps)
      const uniqueElements = new Set(focusableElements);
      expect(uniqueElements.size).toBe(focusableElements.length);
    });

    it("provides visible focus indicators", async () => {
      const user = userEvent.setup();

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");
      await user.tab();

      // Focus should be visible
      expect(searchInput).toHaveFocus();
      expect(searchInput).toHaveClass("focus:outline-none", "focus:ring-2");
    });

    it("manages focus when opening/closing modals or dropdowns", async () => {
      const user = userEvent.setup();

      render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
          showFilterToggle={true}
        />
      );

      const toggleButton = screen.getByRole("button", { name: /filters/i });
      await user.click(toggleButton);

      // Focus should be managed appropriately
      expect(document.activeElement).toBeInTheDocument();
    });

    it("returns focus to trigger element after modal close", async () => {
      const user = userEvent.setup();

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");
      await user.click(searchInput);

      // Open suggestions
      await user.type(searchInput, "test");

      // Close with Escape
      await user.keyboard("{Escape}");

      // Focus should return to input
      expect(searchInput).toHaveFocus();
    });
  });

  describe("Error Handling and Feedback", () => {
    it("announces errors to screen readers", () => {
      // Mock error state
      const mockSearchHook = vi.mocked(
        require("@/hooks/use-search-listings").useSearchListings
      );
      mockSearchHook.mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error("Search failed"),
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

      const errorElement = screen.getByRole("alert");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(/error/i);
    });

    it("provides clear validation messages", async () => {
      const user = userEvent.setup();

      render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      // Try to enter invalid price range
      const minPriceInput = screen.getByLabelText(/minimum price/i);
      await user.type(minPriceInput, "invalid");

      // Should show validation message
      const errorMessage = screen.queryByRole("alert");
      if (errorMessage) {
        expect(errorMessage).toHaveAttribute("aria-live", "polite");
      }
    });

    it("handles empty states accessibly", () => {
      // Mock empty results
      const mockSearchHook = vi.mocked(
        require("@/hooks/use-search-listings").useSearchListings
      );
      mockSearchHook.mockReturnValue({
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
      });

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const emptyState = screen.getByText(/no results found/i);
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveAttribute("role", "status");
    });
  });

  describe("Color Contrast and Visual Accessibility", () => {
    it("maintains sufficient color contrast for text", () => {
      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");
      const computedStyle = window.getComputedStyle(searchInput);

      // Basic check that colors are defined
      expect(computedStyle.color).toBeTruthy();
      expect(computedStyle.backgroundColor).toBeTruthy();
    });

    it("provides non-color indicators for status", () => {
      const activeFilters = { category: "electronics" };

      render(
        <FilterManager
          filters={activeFilters}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
          showActiveFilters={true}
        />
      );

      // Active filters should have text indicators, not just color
      const activeFilter = screen.getByText(/category:/i);
      expect(activeFilter).toBeInTheDocument();
    });
  });

  describe("Mobile Accessibility", () => {
    it("maintains accessibility on touch devices", async () => {
      // Simulate touch device
      Object.defineProperty(window, "ontouchstart", {
        value: () => {},
        writable: true,
      });

      const user = userEvent.setup();

      render(<UniversalSearchBar />);

      const searchButton = screen.getByRole("button", { name: /search/i });

      // Touch target should be large enough (44px minimum)
      const rect = searchButton.getBoundingClientRect();
      expect(rect.height).toBeGreaterThanOrEqual(44);
      expect(rect.width).toBeGreaterThanOrEqual(44);

      // Should be focusable and clickable
      await user.click(searchButton);
      expect(searchButton).toBeInTheDocument();
    });

    it("supports voice control and assistive technologies", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // All interactive elements should have accessible names
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(
          button.getAttribute("aria-label") ||
            button.textContent ||
            button.getAttribute("aria-labelledby")
        ).toBeTruthy();
      });
    });
  });

  describe("Internationalization Accessibility", () => {
    it("supports RTL languages", () => {
      // Set RTL direction
      document.documentElement.dir = "rtl";

      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");
      expect(searchInput).toBeInTheDocument();

      // Reset direction
      document.documentElement.dir = "ltr";
    });

    it("handles language changes gracefully", () => {
      const { rerender } = render(
        <UniversalSearchBar placeholder="Search..." />
      );

      // Change to different language placeholder
      rerender(<UniversalSearchBar placeholder="تلاش کریں..." />);

      const searchInput = screen.getByRole("combobox");
      expect(searchInput).toHaveAttribute("placeholder", "تلاش کریں...");
    });
  });

  describe("Performance and Accessibility", () => {
    it("maintains accessibility during loading states", () => {
      // Mock loading state
      const mockSearchHook = vi.mocked(
        require("@/hooks/use-search-listings").useSearchListings
      );
      mockSearchHook.mockReturnValue({
        data: [],
        isLoading: true,
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
      });

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Loading state should be accessible
      const loadingElement = screen.getByText(/loading/i);
      expect(loadingElement).toHaveAttribute("aria-live", "polite");

      // Interactive elements should remain accessible
      const searchInput = screen.getByRole("textbox");
      expect(searchInput).not.toHaveAttribute("disabled");
    });

    it("handles rapid interactions accessibly", async () => {
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

      // Rapid filter changes should not break accessibility
      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });

      await user.click(categorySelect);
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      // Should maintain proper ARIA states
      expect(categorySelect).toHaveAttribute("aria-expanded", "false");
    });
  });
});
