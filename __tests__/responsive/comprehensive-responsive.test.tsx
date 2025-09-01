/**
 * Comprehensive responsive design tests for unified search system
 * Verifies no horizontal scrolling and proper layout adaptation
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Import components to test
import { UniversalSearchBar } from "@/components/search/universal-search-bar";
import { UnifiedListingSearch } from "@/components/search/unified-listing-search";
import { UnifiedBlogSearch } from "@/components/search/unified-blog-search";
import { FilterManager } from "@/components/search/filter-manager";
import { UniversalPageLayout } from "@/components/layout/universal-page-layout";
import { UniversalSidebar } from "@/components/layout/universal-sidebar";

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

vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: any) => value,
}));

// Test data
const mockCategories = [
  { _id: "1", title: "Electronics", slug: "electronics" },
  { _id: "2", title: "Vehicles", slug: "vehicles" },
  { _id: "3", title: "Tools & Equipment", slug: "tools-equipment" },
  { _id: "4", title: "Home & Garden", slug: "home-garden" },
  { _id: "5", title: "Sports & Recreation", slug: "sports-recreation" },
];

const mockCities = [
  { id: "1", name: "Karachi", province: "Sindh" },
  { id: "2", name: "Lahore", province: "Punjab" },
  { id: "3", name: "Islamabad", province: "Federal" },
  { id: "4", name: "Rawalpindi", province: "Punjab" },
  { id: "5", name: "Faisalabad", province: "Punjab" },
];

const mockBlogCategories = [
  { _id: "1", title: "Photography", slug: { current: "photography" } },
  { _id: "2", title: "Travel", slug: { current: "travel" } },
  { _id: "3", title: "Technology", slug: { current: "technology" } },
];

const mockFilterConfig = [
  {
    key: "category",
    type: "select" as const,
    label: "Category",
    options: mockCategories.map((cat) => ({
      value: cat.slug,
      label: cat.title,
    })),
  },
  {
    key: "city",
    type: "select" as const,
    label: "City",
    options: mockCities.map((city) => ({
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

// Viewport size configurations
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  wide: { width: 1440, height: 900 },
};

// Helper function to set viewport size
const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event("resize"));
};

// Helper function to check for horizontal overflow
const checkHorizontalOverflow = (element: Element) => {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;

  // Check if element extends beyond viewport
  const hasOverflow = rect.right > viewportWidth || rect.width > viewportWidth;

  // Also check computed styles for overflow
  const computedStyle = window.getComputedStyle(element);
  const hasScrollbar =
    computedStyle.overflowX === "scroll" || computedStyle.overflowX === "auto";

  return { hasOverflow, hasScrollbar, elementWidth: rect.width, viewportWidth };
};

describe("Responsive Design - No Horizontal Scroll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset viewport to default
    setViewport(1024, 768);
  });

  describe("UniversalSearchBar Responsive Behavior", () => {
    it("fits within mobile viewport without horizontal scroll", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      const { container } = render(<UniversalSearchBar variant="header" />);

      const searchBar = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(searchBar);

      expect(overflow.hasOverflow).toBe(false);
      expect(overflow.elementWidth).toBeLessThanOrEqual(viewports.mobile.width);
    });

    it("adapts hero variant for mobile screens", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      const { container } = render(
        <UniversalSearchBar
          variant="hero"
          showLocationFilter={true}
          showCategoryFilter={true}
        />
      );

      const searchBar = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(searchBar);

      expect(overflow.hasOverflow).toBe(false);
    });

    it("handles long placeholder text on small screens", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      const { container } = render(
        <UniversalSearchBar placeholder="Search for rental items, equipment, vehicles, and more..." />
      );

      const searchInput = screen.getByRole("combobox");
      const overflow = checkHorizontalOverflow(searchInput);

      expect(overflow.hasOverflow).toBe(false);
    });

    it("maintains proper spacing on tablet screens", () => {
      setViewport(viewports.tablet.width, viewports.tablet.height);

      const { container } = render(
        <UniversalSearchBar
          variant="hero"
          showLocationFilter={true}
          showCategoryFilter={true}
        />
      );

      const searchBar = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(searchBar);

      expect(overflow.hasOverflow).toBe(false);
      expect(overflow.elementWidth).toBeLessThanOrEqual(viewports.tablet.width);
    });
  });

  describe("UnifiedListingSearch Responsive Layout", () => {
    it("prevents horizontal scroll on mobile with all filters", async () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);
      const user = userEvent.setup();

      const { container } = render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
          layout="full"
        />,
        { wrapper: createWrapper() }
      );

      // Open filters panel
      const filtersButton = screen.getByText("Filters");
      await user.click(filtersButton);

      const mainContainer = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(mainContainer);

      expect(overflow.hasOverflow).toBe(false);
    });

    it("stacks filter controls vertically on mobile", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const filterContainer = screen.getByRole("search");
      const computedStyle = window.getComputedStyle(filterContainer);

      // Should use flex-col on mobile
      expect(filterContainer).toHaveClass("flex-col");
    });

    it("handles long category names without overflow", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      const longCategories = [
        {
          _id: "1",
          title: "Professional Photography Equipment & Accessories",
          slug: "photography-equipment",
        },
        {
          _id: "2",
          title: "Heavy Construction Machinery & Industrial Tools",
          slug: "construction-machinery",
        },
      ];

      const { container } = render(
        <UnifiedListingSearch
          categories={longCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const mainContainer = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(mainContainer);

      expect(overflow.hasOverflow).toBe(false);
    });

    it("adapts view mode controls for small screens", async () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);
      const user = userEvent.setup();

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // View mode controls should be present and not overflow
      const viewModeButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("svg"));

      viewModeButtons.forEach((button) => {
        const overflow = checkHorizontalOverflow(button);
        expect(overflow.hasOverflow).toBe(false);
      });
    });
  });

  describe("FilterManager Responsive Behavior", () => {
    it("prevents filter panel overflow on mobile", async () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);
      const user = userEvent.setup();

      const { container } = render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
          layout="vertical"
          showFilterToggle={true}
        />
      );

      // Open filter panel
      const toggleButton = screen.getByRole("button", { name: /filters/i });
      await user.click(toggleButton);

      const filterPanel = container.querySelector(".filter-panel") as Element;
      if (filterPanel) {
        const overflow = checkHorizontalOverflow(filterPanel);
        expect(overflow.hasOverflow).toBe(false);
      }
    });

    it("wraps filter controls properly on tablet", () => {
      setViewport(viewports.tablet.width, viewports.tablet.height);

      const { container } = render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
          layout="grid"
        />
      );

      const filterGrid = container.querySelector(".grid") as Element;
      if (filterGrid) {
        const overflow = checkHorizontalOverflow(filterGrid);
        expect(overflow.hasOverflow).toBe(false);
      }
    });

    it("handles active filters display without overflow", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      const activeFilters = {
        category: "electronics",
        city: "karachi",
        price: { min: 1000, max: 5000 },
        condition: "new",
      };

      const { container } = render(
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
      const overflow = checkHorizontalOverflow(activeFiltersRegion);

      expect(overflow.hasOverflow).toBe(false);
    });
  });

  describe("UniversalPageLayout Responsive Structure", () => {
    it("stacks sidebar below content on mobile", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      const { container } = render(
        <UniversalPageLayout pageType="search">
          <div>Main Content</div>
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      const layout = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(layout);

      expect(overflow.hasOverflow).toBe(false);

      // Should use flex-col on mobile
      expect(layout).toHaveClass("flex-col");
    });

    it("maintains side-by-side layout on desktop", () => {
      setViewport(viewports.desktop.width, viewports.desktop.height);

      const { container } = render(
        <UniversalPageLayout pageType="search">
          <div>Main Content</div>
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      const layout = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(layout);

      expect(overflow.hasOverflow).toBe(false);

      // Should use responsive classes for desktop
      expect(layout).toHaveClass("lg:flex-row");
    });

    it("handles content overflow gracefully", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      const LongContent = () => (
        <div style={{ width: "2000px" }}>
          Very wide content that would normally cause overflow
        </div>
      );

      const { container } = render(
        <UniversalPageLayout pageType="search">
          <LongContent />
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      const layout = container.firstChild as Element;

      // Layout container itself should not overflow
      const layoutOverflow = checkHorizontalOverflow(layout);
      expect(layoutOverflow.hasOverflow).toBe(false);

      // Content should be constrained
      const computedStyle = window.getComputedStyle(layout);
      expect(computedStyle.overflowX).toBe("hidden");
    });
  });

  describe("UniversalSidebar Responsive Behavior", () => {
    it("collapses appropriately on mobile", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      const mockSidebarContent = [
        {
          id: "ad1",
          type: "ad" as const,
          title: "Advertisement",
          data: { imageUrl: "ad.jpg", linkUrl: "/ad" },
          priority: 1,
        },
      ];

      const { container } = render(
        <UniversalSidebar pageType="search" content={mockSidebarContent} />
      );

      const sidebar = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(sidebar);

      expect(overflow.hasOverflow).toBe(false);
    });

    it("maintains fixed width on desktop", () => {
      setViewport(viewports.desktop.width, viewports.desktop.height);

      const mockSidebarContent = [
        {
          id: "ad1",
          type: "ad" as const,
          title: "Advertisement",
          data: { imageUrl: "ad.jpg", linkUrl: "/ad" },
          priority: 1,
        },
      ];

      const { container } = render(
        <UniversalSidebar pageType="search" content={mockSidebarContent} />
      );

      const sidebar = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(sidebar);

      expect(overflow.hasOverflow).toBe(false);

      // Should have fixed width on desktop
      const computedStyle = window.getComputedStyle(sidebar);
      expect(computedStyle.width).toBeTruthy();
    });
  });

  describe("Cross-Viewport Consistency", () => {
    it("maintains functionality across all viewport sizes", async () => {
      const user = userEvent.setup();

      for (const [name, viewport] of Object.entries(viewports)) {
        setViewport(viewport.width, viewport.height);

        const { container, unmount } = render(
          <UnifiedListingSearch
            categories={mockCategories}
            cities={mockCities}
          />,
          { wrapper: createWrapper() }
        );

        // Test basic functionality
        const searchInput = screen.getByPlaceholderText(
          "Search for rental items..."
        );
        await user.type(searchInput, "test");

        // Check for overflow
        const mainContainer = container.firstChild as Element;
        const overflow = checkHorizontalOverflow(mainContainer);

        expect(overflow.hasOverflow).toBe(false);

        // Clean up for next iteration
        unmount();
      }
    });

    it("handles orientation changes gracefully", () => {
      // Portrait mobile
      setViewport(375, 667);

      const { container, rerender } = render(
        <UniversalSearchBar variant="hero" />,
        { wrapper: createWrapper() }
      );

      let overflow = checkHorizontalOverflow(container.firstChild as Element);
      expect(overflow.hasOverflow).toBe(false);

      // Landscape mobile
      setViewport(667, 375);

      rerender(<UniversalSearchBar variant="hero" />);

      overflow = checkHorizontalOverflow(container.firstChild as Element);
      expect(overflow.hasOverflow).toBe(false);
    });
  });

  describe("Content Wrapping and Truncation", () => {
    it("wraps long text content properly", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      const longText =
        "This is a very long search query that should wrap properly and not cause horizontal overflow in the search input field";

      render(<UniversalSearchBar initialQuery={longText} />);

      const searchInput = screen.getByDisplayValue(longText);
      const overflow = checkHorizontalOverflow(searchInput);

      expect(overflow.hasOverflow).toBe(false);
    });

    it("truncates filter labels when necessary", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      const longFilterConfig = [
        {
          key: "category",
          type: "select" as const,
          label: "Very Long Category Filter Label That Should Be Truncated",
          options: [{ value: "test", label: "Test" }],
        },
      ];

      const { container } = render(
        <FilterManager
          filters={{}}
          filterConfig={longFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      const filterContainer = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(filterContainer);

      expect(overflow.hasOverflow).toBe(false);
    });
  });

  describe("Interactive Elements Sizing", () => {
    it("maintains touch-friendly button sizes on mobile", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      render(<UniversalSearchBar />);

      const searchButton = screen.getByRole("button", { name: /search/i });
      const rect = searchButton.getBoundingClientRect();

      // Minimum touch target size (44px)
      expect(rect.height).toBeGreaterThanOrEqual(44);
      expect(rect.width).toBeGreaterThanOrEqual(44);

      const overflow = checkHorizontalOverflow(searchButton);
      expect(overflow.hasOverflow).toBe(false);
    });

    it("scales input fields appropriately", () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);

      render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      const priceInputs = screen.getAllByRole("spinbutton");

      priceInputs.forEach((input) => {
        const overflow = checkHorizontalOverflow(input);
        expect(overflow.hasOverflow).toBe(false);

        // Should have minimum height for touch
        const rect = input.getBoundingClientRect();
        expect(rect.height).toBeGreaterThanOrEqual(40);
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles very narrow viewports", () => {
      setViewport(320, 568); // iPhone 5 size

      const { container } = render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const mainContainer = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(mainContainer);

      expect(overflow.hasOverflow).toBe(false);
    });

    it("handles very wide viewports", () => {
      setViewport(2560, 1440); // Large desktop

      const { container } = render(
        <UniversalPageLayout pageType="search">
          <UnifiedListingSearch
            categories={mockCategories}
            cities={mockCities}
          />
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      const layout = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(layout);

      expect(overflow.hasOverflow).toBe(false);

      // Content should be centered or constrained
      const computedStyle = window.getComputedStyle(layout);
      expect(computedStyle.maxWidth).toBeTruthy();
    });

    it("handles dynamic content changes", async () => {
      setViewport(viewports.mobile.width, viewports.mobile.height);
      const user = userEvent.setup();

      const { container } = render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      // Add filters dynamically
      const filtersButton = screen.getByText("Filters");
      await user.click(filtersButton);

      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });
      await user.click(categorySelect);

      // Should not overflow even with dropdown open
      const mainContainer = container.firstChild as Element;
      const overflow = checkHorizontalOverflow(mainContainer);

      expect(overflow.hasOverflow).toBe(false);
    });
  });
});
