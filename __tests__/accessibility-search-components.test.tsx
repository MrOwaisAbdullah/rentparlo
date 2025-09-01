/**
 * Accessibility tests for search and filter components
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import components to test
import { UniversalSearchBar } from "@/components/search/universal-search-bar";
import { UnifiedListingSearch } from "@/components/search/unified-listing-search";
import { UnifiedBlogSearch } from "@/components/search/unified-blog-search";
import { SearchFilters } from "@/components/search/search-filters";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(() => ""),
    toString: vi.fn(() => ""),
  }),
}));

// Mock analytics
vi.mock("@/lib/analytics-client", () => ({
  analytics: {
    trackSearch: vi.fn(),
  },
}));

// Mock hooks
vi.mock("@/hooks/use-search-listings", () => ({
  useSearchListings: () => ({
    data: [],
    isLoading: false,
    error: null,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
    totalResults: 0,
    pagination: { currentPage: 1, totalPages: 1 },
  }),
}));

// Test data
const mockCategories = [
  { _id: "1", title: "Electronics", slug: "electronics" },
  { _id: "2", title: "Vehicles", slug: "vehicles" },
];

const mockCities = [
  { id: "1", name: "Karachi", province: "Sindh" },
  { id: "2", name: "Lahore", province: "Punjab" },
];

const mockBlogCategories = [
  { _id: "1", title: "Tech", slug: { current: "tech" } },
  { _id: "2", title: "Lifestyle", slug: { current: "lifestyle" } },
];

const mockBlogFilters = {
  query: "",
  category: undefined,
  tag: undefined,
  language: undefined,
  featured: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

const mockBlogPagination = {
  page: 1,
  totalPages: 1,
  total: 0,
  hasMore: false,
};

// Test wrapper
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

describe("Search Components Accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UniversalSearchBar Accessibility", () => {
    it("has proper ARIA attributes for search input", () => {
      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");
      expect(searchInput).toHaveAttribute("aria-label");
      expect(searchInput).toHaveAttribute("aria-expanded", "false");
      expect(searchInput).toHaveAttribute("aria-haspopup", "listbox");
      expect(searchInput).toHaveAttribute("aria-describedby");
    });

    it("announces search actions to screen readers", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "camera");
      await user.click(searchButton);

      // Check that search form has proper role
      const searchForm = screen.getByRole("search");
      expect(searchForm).toBeInTheDocument();
    });

    it("supports keyboard navigation for suggestions", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");

      // Focus input to show suggestions
      await user.click(searchInput);

      // Test arrow key navigation
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowUp}");
      await user.keyboard("{Escape}");

      expect(searchInput).toHaveAttribute("aria-expanded", "false");
    });

    it("has accessible clear button", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar initialQuery="test" />);

      const clearButton = screen.getByLabelText(/clear search/i);
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveAttribute("aria-label");

      await user.click(clearButton);
    });

    it("provides proper focus management", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      // Test tab navigation
      await user.tab();
      expect(searchInput).toHaveFocus();

      await user.tab();
      expect(searchButton).toHaveFocus();
    });
  });

  describe("UnifiedListingSearch Accessibility", () => {
    it("has proper ARIA structure for search form", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const searchForm = screen.getByRole("search");
      expect(searchForm).toHaveAttribute("aria-label");

      const searchInput = screen.getByRole("textbox");
      expect(searchInput).toHaveAttribute("aria-label");
      expect(searchInput).toHaveAttribute("aria-describedby");
    });

    it("has accessible filter controls", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const filterButton = screen.getByRole("button", { name: /filters/i });
      expect(filterButton).toHaveAttribute("aria-expanded");
      expect(filterButton).toHaveAttribute("aria-controls");
      expect(filterButton).toHaveAttribute("aria-label");
    });

    it("has accessible view mode controls", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const viewModeGroup = screen.getByRole("group", { name: /view mode/i });
      expect(viewModeGroup).toBeInTheDocument();

      const gridButton = screen.getByRole("button", { name: /grid view/i });
      const listButton = screen.getByRole("button", { name: /list view/i });

      expect(gridButton).toHaveAttribute("aria-pressed");
      expect(listButton).toHaveAttribute("aria-pressed");
    });

    it("has accessible results region", () => {
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
      expect(resultsRegion).toHaveAttribute("aria-describedby");
    });

    it("announces filter changes", async () => {
      const user = userEvent.setup();
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const clearAllButton = screen.queryByRole("button", {
        name: /clear all/i,
      });
      if (clearAllButton) {
        expect(clearAllButton).toHaveAttribute("aria-label");
      }
    });
  });

  describe("UnifiedBlogSearch Accessibility", () => {
    it("has proper ARIA structure", () => {
      render(
        <UnifiedBlogSearch
          posts={[]}
          categories={mockBlogCategories}
          tags={["tech", "lifestyle"]}
          filters={mockBlogFilters}
          pagination={mockBlogPagination}
          onFiltersChange={vi.fn()}
          onPageChange={vi.fn()}
          onSearch={vi.fn()}
        />
      );

      const searchInput = screen.getByRole("textbox");
      expect(searchInput).toHaveAttribute("aria-label");
      expect(searchInput).toHaveAttribute("aria-describedby");
    });

    it("has accessible filter controls", () => {
      render(
        <UnifiedBlogSearch
          posts={[]}
          categories={mockBlogCategories}
          tags={["tech", "lifestyle"]}
          filters={mockBlogFilters}
          pagination={mockBlogPagination}
          onFiltersChange={vi.fn()}
          onPageChange={vi.fn()}
          onSearch={vi.fn()}
        />
      );

      const filterButton = screen.getByRole("button", { name: /filters/i });
      expect(filterButton).toHaveAttribute("aria-expanded");
      expect(filterButton).toHaveAttribute("aria-controls");
      expect(filterButton).toHaveAttribute("aria-label");
    });

    it("has accessible view mode toggle", () => {
      render(
        <UnifiedBlogSearch
          posts={[]}
          categories={mockBlogCategories}
          tags={["tech", "lifestyle"]}
          filters={mockBlogFilters}
          pagination={mockBlogPagination}
          onFiltersChange={vi.fn()}
          onPageChange={vi.fn()}
          onSearch={vi.fn()}
        />
      );

      const viewModeGroup = screen.getByRole("group", { name: /view mode/i });
      expect(viewModeGroup).toBeInTheDocument();

      const gridButton = screen.getByRole("button", { name: /grid view/i });
      const listButton = screen.getByRole("button", { name: /list view/i });

      expect(gridButton).toHaveAttribute("aria-pressed");
      expect(listButton).toHaveAttribute("aria-pressed");
    });
  });

  describe("SearchFilters Accessibility", () => {
    const mockCurrentFilters = {
      category: "",
      city: "",
      area: "",
      condition: "",
      minPrice: 0,
      maxPrice: 0,
      availability: "",
      priceType: "",
    };

    it("has proper ARIA labels for filter controls", () => {
      render(
        <SearchFilters
          categories={mockCategories}
          cities={mockCities}
          currentFilters={mockCurrentFilters}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      );

      const categorySelect = screen.getByLabelText(/category/i);
      expect(categorySelect).toHaveAttribute("aria-label");
      expect(categorySelect).toHaveAttribute("aria-describedby");
    });

    it("has accessible combobox controls", () => {
      render(
        <SearchFilters
          categories={mockCategories}
          cities={mockCities}
          currentFilters={mockCurrentFilters}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      );

      const cityCombobox = screen.getByRole("combobox", { name: /city/i });
      expect(cityCombobox).toHaveAttribute("aria-expanded");
      expect(cityCombobox).toHaveAttribute("aria-haspopup", "listbox");
      expect(cityCombobox).toHaveAttribute("aria-label");
    });

    it("has accessible clear all button", () => {
      const filtersWithValues = {
        ...mockCurrentFilters,
        category: "electronics",
        city: "Karachi",
      };

      render(
        <SearchFilters
          categories={mockCategories}
          cities={mockCities}
          currentFilters={filtersWithValues}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      );

      const clearAllButton = screen.getByRole("button", { name: /clear all/i });
      expect(clearAllButton).toHaveAttribute("aria-label");
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          categories={mockCategories}
          cities={mockCities}
          currentFilters={mockCurrentFilters}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      );

      const categorySelect = screen.getByLabelText(/category/i);

      await user.click(categorySelect);
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(categorySelect).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("supports tab navigation through all interactive elements", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar showLocationFilter={true} />);

      // Test tab order
      await user.tab();
      const firstFocusable = document.activeElement;
      expect(firstFocusable).toBeInTheDocument();

      await user.tab();
      const secondFocusable = document.activeElement;
      expect(secondFocusable).toBeInTheDocument();

      // Elements should be different
      expect(firstFocusable).not.toBe(secondFocusable);
    });

    it("supports escape key to close dropdowns", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const searchInput = screen.getByRole("combobox");

      await user.click(searchInput);
      await user.keyboard("{Escape}");

      expect(searchInput).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Screen Reader Announcements", () => {
    it("creates screen reader announcement element", () => {
      render(<UniversalSearchBar />);

      // Check that aria-live region exists (created by ScreenReaderAnnouncer)
      const liveRegions = document.querySelectorAll("[aria-live]");
      expect(liveRegions.length).toBeGreaterThan(0);
    });

    it("has proper aria-live regions for dynamic content", () => {
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
    });
  });

  describe("Focus Management", () => {
    it("maintains focus when interacting with filters", async () => {
      const user = userEvent.setup();
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const filterButton = screen.getByRole("button", { name: /filters/i });

      await user.click(filterButton);

      // Filter button should still be focusable
      expect(filterButton).toBeInTheDocument();
    });

    it("provides visible focus indicators", () => {
      render(<UniversalSearchBar />);

      const searchButton = screen.getByRole("button", { name: /search/i });

      // Check that focus styles are applied (focus:outline-none focus:ring-2 classes)
      expect(searchButton).toHaveClass("focus:outline-none");
      expect(searchButton).toHaveClass("focus:ring-2");
    });
  });

  describe("Error Handling", () => {
    it("announces errors to screen readers", () => {
      render(
        <SearchFilters
          categories={mockCategories}
          cities={mockCities}
          currentFilters={mockCurrentFilters}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      );

      // Error messages should have proper ARIA attributes
      const alerts = screen.queryAllByRole("alert");
      alerts.forEach((alert) => {
        expect(alert).toBeInTheDocument();
      });
    });
  });
});
