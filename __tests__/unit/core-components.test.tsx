/**
 * Unit tests for core unified search system components
 * Tests individual component functionality in isolation
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Import components to test
import { UniversalSearchBar } from "@/components/search/universal-search-bar";
import { FilterManager } from "@/components/search/filter-manager";
import { UniversalPageLayout } from "@/components/layout/universal-page-layout";
import { UniversalSidebar } from "@/components/layout/universal-sidebar";
import { AdBanner } from "@/components/layout/ad-banner";
import { RelatedContent } from "@/components/layout/related-content";

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
    trackBannerClick: vi.fn(),
    trackContentClick: vi.fn(),
  },
}));

// Mock hooks
vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: any) => value,
}));

// Test data
const mockFilterConfig = [
  {
    key: "category",
    type: "select" as const,
    label: "Category",
    placeholder: "Select category",
    options: [
      { value: "electronics", label: "Electronics", count: 10 },
      { value: "vehicles", label: "Vehicles", count: 5 },
    ],
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
    type: "checkbox" as const,
    label: "New Only",
  },
  {
    key: "search",
    type: "search" as const,
    label: "Search",
    placeholder: "Search items...",
  },
  {
    key: "tags",
    type: "multiselect" as const,
    label: "Tags",
    options: [
      { value: "popular", label: "Popular" },
      { value: "trending", label: "Trending" },
    ],
  },
];

const mockAdBanners = [
  {
    id: "ad1",
    title: "Camera Rental Special",
    imageUrl: "/images/camera-ad.jpg",
    linkUrl: "/category/cameras",
    altText: "Professional camera rental deals",
    priority: 1,
    targetAudience: ["photographers"],
    category: "electronics",
  },
  {
    id: "ad2",
    title: "Car Rental Deals",
    imageUrl: "/images/car-ad.jpg",
    linkUrl: "/category/vehicles",
    altText: "Best car rental prices",
    priority: 2,
    targetAudience: ["travelers"],
    category: "vehicles",
  },
];

const mockRelatedItems = [
  {
    id: "item1",
    title: "Professional DSLR Camera",
    imageUrl: "/images/camera1.jpg",
    linkUrl: "/listing/camera1",
    description: "High-quality camera for rent",
    metadata: { price: 1500, category: "electronics" },
  },
  {
    id: "item2",
    title: "Luxury Wedding Car",
    imageUrl: "/images/car1.jpg",
    linkUrl: "/listing/car1",
    description: "Perfect for special occasions",
    metadata: { price: 5000, category: "vehicles" },
  },
];

const mockSidebarContent = [
  {
    id: "ad1",
    type: "ad" as const,
    title: "Advertisement",
    data: mockAdBanners[0],
    priority: 1,
    position: "top" as const,
  },
  {
    id: "related1",
    type: "related-posts" as const,
    title: "Related Items",
    data: mockRelatedItems,
    priority: 2,
    position: "middle" as const,
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

describe("Core Components Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UniversalSearchBar", () => {
    it("renders with default props", () => {
      render(<UniversalSearchBar />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /search/i })
      ).toBeInTheDocument();
    });

    it("renders different variants correctly", () => {
      const { rerender } = render(<UniversalSearchBar variant="header" />);

      expect(screen.getByRole("combobox")).toHaveClass("h-10");

      rerender(<UniversalSearchBar variant="hero" />);
      expect(screen.getByText("What are you looking for?")).toBeInTheDocument();

      rerender(<UniversalSearchBar variant="inline" />);
      expect(screen.getByRole("combobox")).toHaveClass("h-8");
    });

    it("handles different sizes", () => {
      const { rerender } = render(<UniversalSearchBar size="sm" />);

      expect(screen.getByRole("combobox")).toHaveClass("h-8");

      rerender(<UniversalSearchBar size="lg" />);
      expect(screen.getByRole("combobox")).toHaveClass("h-12");
    });

    it("shows/hides location filter based on prop", () => {
      const { rerender } = render(
        <UniversalSearchBar showLocationFilter={true} />
      );

      expect(screen.getByText("Select city...")).toBeInTheDocument();

      rerender(<UniversalSearchBar showLocationFilter={false} />);
      expect(screen.queryByText("Select city...")).not.toBeInTheDocument();
    });

    it("shows/hides category filter based on prop", () => {
      const { rerender } = render(
        <UniversalSearchBar showCategoryFilter={true} />
      );

      expect(screen.getByText("All Categories")).toBeInTheDocument();

      rerender(<UniversalSearchBar showCategoryFilter={false} />);
      expect(screen.queryByText("All Categories")).not.toBeInTheDocument();
    });

    it("handles initial query prop", () => {
      render(<UniversalSearchBar initialQuery="test query" />);

      expect(screen.getByDisplayValue("test query")).toBeInTheDocument();
    });

    it("calls onSearch callback when form is submitted", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();

      render(<UniversalSearchBar onSearch={onSearch} />);

      const input = screen.getByRole("combobox");
      const button = screen.getByRole("button", { name: /search/i });

      await user.type(input, "camera");
      await user.click(button);

      expect(onSearch).toHaveBeenCalledWith("camera", {});
    });

    it("handles suggestion selection", async () => {
      const user = userEvent.setup();

      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox");
      await user.click(input);

      // Should show suggestions
      expect(input).toHaveAttribute("aria-expanded", "true");

      // Type to filter suggestions
      await user.type(input, "c");

      // Should show filtered suggestions
      const suggestions = screen.queryAllByRole("option");
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("clears input when clear button is clicked", async () => {
      const user = userEvent.setup();

      render(<UniversalSearchBar initialQuery="test" />);

      const input = screen.getByDisplayValue("test");
      const clearButton = screen.getByLabelText(/clear search/i);

      await user.click(clearButton);

      expect(input).toHaveValue("");
    });
  });

  describe("FilterManager", () => {
    it("renders all filter types correctly", () => {
      render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price range/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new only/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    });

    it("displays active filters when provided", () => {
      const activeFilters = {
        category: "electronics",
        price: { min: 1000, max: 5000 },
        condition: true,
      };

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

      expect(
        screen.getByRole("region", { name: /active filters/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/electronics/i)).toBeInTheDocument();
      expect(screen.getByText(/1,000 - 5,000/i)).toBeInTheDocument();
    });

    it("calls onFilterChange when filters are modified", async () => {
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

      // Test select filter
      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });
      await user.click(categorySelect);

      const option = screen.getByRole("option", { name: /electronics/i });
      await user.click(option);

      expect(onFilterChange).toHaveBeenCalledWith("category", "electronics");
    });

    it("calls onClearFilter when individual filter is cleared", async () => {
      const user = userEvent.setup();
      const onClearFilter = vi.fn();

      const activeFilters = { category: "electronics" };

      render(
        <FilterManager
          filters={activeFilters}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={onClearFilter}
          onClearAll={vi.fn()}
          showActiveFilters={true}
        />
      );

      const clearButton = screen.getByLabelText(/remove category filter/i);
      await user.click(clearButton);

      expect(onClearFilter).toHaveBeenCalledWith("category");
    });

    it("calls onClearAll when clear all button is clicked", async () => {
      const user = userEvent.setup();
      const onClearAll = vi.fn();

      const activeFilters = { category: "electronics", condition: true };

      render(
        <FilterManager
          filters={activeFilters}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={onClearAll}
        />
      );

      const clearAllButton = screen.getByRole("button", { name: /clear all/i });
      await user.click(clearAllButton);

      expect(onClearAll).toHaveBeenCalled();
    });

    it("handles different layout options", () => {
      const { rerender } = render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
          layout="horizontal"
        />
      );

      let container = screen.getByRole("group", { name: /filter controls/i });
      expect(container).toHaveClass("lg:flex-row");

      rerender(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
          layout="vertical"
        />
      );

      container = screen.getByRole("group", { name: /filter controls/i });
      expect(container).toHaveClass("flex-col");

      rerender(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
          layout="grid"
        />
      );

      container = screen.getByRole("group", { name: /filter controls/i });
      expect(container).toHaveClass("grid");
    });

    it("shows/hides filter toggle based on prop", () => {
      const { rerender } = render(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
          showFilterToggle={true}
        />
      );

      expect(
        screen.getByRole("button", { name: /filters/i })
      ).toBeInTheDocument();

      rerender(
        <FilterManager
          filters={{}}
          filterConfig={mockFilterConfig}
          onFilterChange={vi.fn()}
          onClearFilter={vi.fn()}
          onClearAll={vi.fn()}
          showFilterToggle={false}
        />
      );

      expect(
        screen.queryByRole("button", { name: /filters/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("UniversalPageLayout", () => {
    it("renders main content and sidebar", () => {
      render(
        <UniversalPageLayout pageType="search">
          <div>Main Content</div>
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("complementary")).toBeInTheDocument();
      expect(screen.getByText("Main Content")).toBeInTheDocument();
    });

    it("adapts layout based on page type", () => {
      const { rerender } = render(
        <UniversalPageLayout pageType="search">
          <div>Search Content</div>
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText("Search Content")).toBeInTheDocument();

      rerender(
        <UniversalPageLayout
          pageType="category"
          pageContext={{ categorySlug: "electronics" }}
        >
          <div>Category Content</div>
        </UniversalPageLayout>
      );

      expect(screen.getByText("Category Content")).toBeInTheDocument();

      rerender(
        <UniversalPageLayout pageType="blog">
          <div>Blog Content</div>
        </UniversalPageLayout>
      );

      expect(screen.getByText("Blog Content")).toBeInTheDocument();
    });

    it("shows/hides sidebar based on prop", () => {
      const { rerender } = render(
        <UniversalPageLayout pageType="search" showSidebar={true}>
          <div>Content</div>
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole("complementary")).toBeInTheDocument();

      rerender(
        <UniversalPageLayout pageType="search" showSidebar={false}>
          <div>Content</div>
        </UniversalPageLayout>
      );

      expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });

    it("positions sidebar based on prop", () => {
      const { rerender } = render(
        <UniversalPageLayout pageType="search" sidebarPosition="right">
          <div>Content</div>
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      const layout = screen.getByRole("main").parentElement;
      expect(layout).toHaveClass("flex-row");

      rerender(
        <UniversalPageLayout pageType="search" sidebarPosition="left">
          <div>Content</div>
        </UniversalPageLayout>
      );

      expect(layout).toHaveClass("flex-row-reverse");
    });
  });

  describe("UniversalSidebar", () => {
    it("renders sidebar content based on type", () => {
      render(
        <UniversalSidebar pageType="search" content={mockSidebarContent} />
      );

      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("handles different page types", () => {
      const { rerender } = render(
        <UniversalSidebar pageType="search" content={mockSidebarContent} />
      );

      expect(screen.getByRole("complementary")).toBeInTheDocument();

      rerender(
        <UniversalSidebar
          pageType="category"
          pageContext={{ categorySlug: "electronics" }}
          content={mockSidebarContent}
        />
      );

      expect(screen.getByRole("complementary")).toBeInTheDocument();

      rerender(
        <UniversalSidebar pageType="blog" content={mockSidebarContent} />
      );

      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("calls onContentClick when content is clicked", async () => {
      const user = userEvent.setup();
      const onContentClick = vi.fn();

      render(
        <UniversalSidebar
          pageType="search"
          content={mockSidebarContent}
          onContentClick={onContentClick}
        />
      );

      // Find clickable content (this would depend on actual implementation)
      const clickableElements = screen.getAllByRole("link");
      if (clickableElements.length > 0) {
        await user.click(clickableElements[0]);
        expect(onContentClick).toHaveBeenCalled();
      }
    });

    it("renders empty state when no content", () => {
      render(<UniversalSidebar pageType="search" content={[]} />);

      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toBeInTheDocument();
      // Should handle empty content gracefully
    });
  });

  describe("AdBanner", () => {
    it("renders banner with all properties", () => {
      render(<AdBanner banner={mockAdBanners[0]} size="medium" />);

      expect(screen.getByRole("link")).toBeInTheDocument();
      expect(screen.getByRole("img")).toBeInTheDocument();
      expect(screen.getByText("Camera Rental Special")).toBeInTheDocument();
    });

    it("handles different sizes", () => {
      const { rerender } = render(
        <AdBanner banner={mockAdBanners[0]} size="small" />
      );

      let banner = screen.getByRole("link");
      expect(banner).toHaveClass("h-20");

      rerender(<AdBanner banner={mockAdBanners[0]} size="large" />);

      banner = screen.getByRole("link");
      expect(banner).toHaveClass("h-40");
    });

    it("calls onBannerClick when clicked", async () => {
      const user = userEvent.setup();
      const onBannerClick = vi.fn();

      render(
        <AdBanner banner={mockAdBanners[0]} onBannerClick={onBannerClick} />
      );

      const banner = screen.getByRole("link");
      await user.click(banner);

      expect(onBannerClick).toHaveBeenCalledWith("ad1");
    });

    it("has proper accessibility attributes", () => {
      render(<AdBanner banner={mockAdBanners[0]} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("alt", "Professional camera rental deals");

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/category/cameras");
    });
  });

  describe("RelatedContent", () => {
    it("renders different content types", () => {
      const { rerender } = render(
        <RelatedContent
          contentType="listings"
          items={mockRelatedItems}
          title="Related Listings"
        />
      );

      expect(screen.getByText("Related Listings")).toBeInTheDocument();
      expect(screen.getByText("Professional DSLR Camera")).toBeInTheDocument();

      rerender(
        <RelatedContent
          contentType="posts"
          items={mockRelatedItems}
          title="Related Posts"
        />
      );

      expect(screen.getByText("Related Posts")).toBeInTheDocument();

      rerender(
        <RelatedContent
          contentType="categories"
          items={mockRelatedItems}
          title="Related Categories"
        />
      );

      expect(screen.getByText("Related Categories")).toBeInTheDocument();
    });

    it("limits items based on maxItems prop", () => {
      render(
        <RelatedContent
          contentType="listings"
          items={mockRelatedItems}
          maxItems={1}
        />
      );

      expect(screen.getByText("Professional DSLR Camera")).toBeInTheDocument();
      expect(screen.queryByText("Luxury Wedding Car")).not.toBeInTheDocument();
    });

    it("calls onItemClick when item is clicked", async () => {
      const user = userEvent.setup();
      const onItemClick = vi.fn();

      render(
        <RelatedContent
          contentType="listings"
          items={mockRelatedItems}
          onItemClick={onItemClick}
        />
      );

      const firstItem = screen.getByText("Professional DSLR Camera");
      await user.click(firstItem);

      expect(onItemClick).toHaveBeenCalledWith("item1");
    });

    it("handles empty items array", () => {
      render(
        <RelatedContent contentType="listings" items={[]} title="No Items" />
      );

      expect(screen.getByText("No Items")).toBeInTheDocument();
      // Should handle empty state gracefully
    });
  });

  describe("Error Handling", () => {
    it("handles invalid filter config gracefully", () => {
      const invalidConfig = [
        { key: "", type: "select", label: "" }, // Invalid
        { key: "valid", type: "select", label: "Valid", options: [] },
      ];

      expect(() => {
        render(
          <FilterManager
            filters={{}}
            filterConfig={invalidConfig}
            onFilterChange={vi.fn()}
            onClearFilter={vi.fn()}
            onClearAll={vi.fn()}
          />
        );
      }).not.toThrow();
    });

    it("handles missing required props gracefully", () => {
      expect(() => {
        render(<UniversalSidebar pageType="search" content={[]} />);
      }).not.toThrow();
    });

    it("handles malformed sidebar content", () => {
      const malformedContent = [
        { id: "", type: "invalid", data: null }, // Invalid content
      ];

      expect(() => {
        render(
          <UniversalSidebar pageType="search" content={malformedContent} />
        );
      }).not.toThrow();
    });
  });

  describe("Component Composition", () => {
    it("composes multiple components together", () => {
      render(
        <UniversalPageLayout pageType="search">
          <UniversalSearchBar />
          <FilterManager
            filters={{}}
            filterConfig={mockFilterConfig}
            onFilterChange={vi.fn()}
            onClearFilter={vi.fn()}
            onClearAll={vi.fn()}
          />
        </UniversalPageLayout>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(
        screen.getByRole("group", { name: /filter controls/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("maintains component isolation", () => {
      const onSearch = vi.fn();
      const onFilterChange = vi.fn();

      render(
        <div>
          <UniversalSearchBar onSearch={onSearch} />
          <FilterManager
            filters={{}}
            filterConfig={mockFilterConfig}
            onFilterChange={onFilterChange}
            onClearFilter={vi.fn()}
            onClearAll={vi.fn()}
          />
        </div>
      );

      // Components should work independently
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(
        screen.getByRole("group", { name: /filter controls/i })
      ).toBeInTheDocument();
    });
  });
});
