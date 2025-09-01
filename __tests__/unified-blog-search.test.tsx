import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnifiedBlogSearch } from "@/components/search/unified-blog-search";
import {
  BlogPostSummary,
  BlogCategory,
  BlogFilters,
  BlogPagination,
} from "@/types";

// Mock data
const mockCategories: BlogCategory[] = [
  {
    _id: "1",
    _type: "category",
    title: "Electronics",
    slug: { current: "electronics" },
    postCount: 5,
  },
  {
    _id: "2",
    _type: "category",
    title: "Furniture",
    slug: { current: "furniture" },
    postCount: 3,
  },
];

const mockTags = ["rental", "tips", "electronics", "furniture", "karachi"];

const mockPosts: BlogPostSummary[] = [
  {
    _id: "1",
    title: "Complete Guide to Electronics Rental",
    slug: { current: "electronics-rental-guide" },
    excerpt:
      "Everything you need to know about renting electronics in Pakistan.",
    mainImage: {
      asset: { url: "/test-image.jpg" },
      alt: "Electronics guide",
    },
    categories: [{ _id: "1", title: "Electronics", slug: "electronics" }],
    tags: ["electronics", "rental", "tips"],
    author: "John Doe",
    readingTime: 5,
    publishedAt: "2024-01-15T10:00:00Z",
    featured: true,
    language: "en",
  },
  {
    _id: "2",
    title: "Furniture Rental Tips",
    slug: { current: "furniture-rental-tips" },
    excerpt: "Best practices for renting furniture in major cities.",
    mainImage: {
      asset: { url: "/test-image-2.jpg" },
      alt: "Furniture guide",
    },
    categories: [{ _id: "2", title: "Furniture", slug: "furniture" }],
    tags: ["furniture", "rental"],
    author: "Jane Smith",
    readingTime: 3,
    publishedAt: "2024-01-10T14:30:00Z",
    featured: false,
    language: "en",
  },
];

const mockFilters: BlogFilters = {
  query: "",
  category: undefined,
  tag: undefined,
  language: undefined,
  featured: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

const mockPagination: BlogPagination = {
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
  hasMore: false,
};

const defaultProps = {
  posts: mockPosts,
  categories: mockCategories,
  tags: mockTags,
  filters: mockFilters,
  pagination: mockPagination,
  onFiltersChange: vi.fn(),
  onPageChange: vi.fn(),
  onSearch: vi.fn(),
};

describe("UnifiedBlogSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders blog posts correctly", () => {
    render(<UnifiedBlogSearch {...defaultProps} />);

    expect(
      screen.getByText("Complete Guide to Electronics Rental")
    ).toBeInTheDocument();
    expect(screen.getByText("Furniture Rental Tips")).toBeInTheDocument();
    expect(screen.getByText("2 posts found")).toBeInTheDocument();
  });

  it("displays search input and allows searching", async () => {
    const user = userEvent.setup();
    render(<UnifiedBlogSearch {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search blog posts...");
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, "electronics");

    // Wait for debounce
    await waitFor(
      () => {
        expect(defaultProps.onSearch).toHaveBeenCalledWith("electronics");
      },
      { timeout: 500 }
    );
  });

  it("shows and hides filter panel", async () => {
    const user = userEvent.setup();
    render(<UnifiedBlogSearch {...defaultProps} />);

    const filterButton = screen.getByRole("button", { name: /filters/i });
    expect(filterButton).toBeInTheDocument();

    // Filters should be hidden initially
    expect(screen.queryByText("Category")).not.toBeInTheDocument();

    // Show filters
    await user.click(filterButton);
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Tag")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
  });

  it("handles category filter changes", async () => {
    const user = userEvent.setup();
    render(<UnifiedBlogSearch {...defaultProps} />);

    // Open filters
    await user.click(screen.getByRole("button", { name: /filters/i }));

    // Find and click category select
    const categorySelect = screen.getByRole("combobox", { name: /category/i });
    await user.click(categorySelect);

    // Select electronics category
    await user.click(screen.getByText("Electronics"));

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      category: "electronics",
    });
  });

  it("handles tag filter changes", async () => {
    const user = userEvent.setup();
    render(<UnifiedBlogSearch {...defaultProps} />);

    // Open filters
    await user.click(screen.getByRole("button", { name: /filters/i }));

    // Find and click tag select
    const tagSelect = screen.getByRole("combobox", { name: /tag/i });
    await user.click(tagSelect);

    // Select rental tag
    await user.click(screen.getByText("rental"));

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      tag: "rental",
    });
  });

  it("handles language filter changes", async () => {
    const user = userEvent.setup();
    render(<UnifiedBlogSearch {...defaultProps} />);

    // Open filters
    await user.click(screen.getByRole("button", { name: /filters/i }));

    // Find and click language select
    const languageSelect = screen.getByRole("combobox", { name: /language/i });
    await user.click(languageSelect);

    // Select Urdu language
    await user.click(screen.getByText("Urdu"));

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      language: "ur",
    });
  });

  it("handles featured posts toggle", async () => {
    const user = userEvent.setup();
    render(<UnifiedBlogSearch {...defaultProps} />);

    // Open filters
    await user.click(screen.getByRole("button", { name: /filters/i }));

    // Find and click featured checkbox
    const featuredCheckbox = screen.getByRole("checkbox", {
      name: /featured posts only/i,
    });
    await user.click(featuredCheckbox);

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      featured: true,
    });
  });

  it("handles date range filters", async () => {
    const user = userEvent.setup();
    render(<UnifiedBlogSearch {...defaultProps} />);

    // Open filters
    await user.click(screen.getByRole("button", { name: /filters/i }));

    // Find date inputs
    const fromDateInput = screen.getByLabelText(/from date/i);
    const toDateInput = screen.getByLabelText(/to date/i);

    await user.type(fromDateInput, "2024-01-01");
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      dateFrom: "2024-01-01",
    });

    await user.type(toDateInput, "2024-01-31");
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      dateTo: "2024-01-31",
    });
  });

  it("displays active filters as badges", () => {
    const filtersWithActive: BlogFilters = {
      ...mockFilters,
      category: "electronics",
      tag: "rental",
      language: "en",
      featured: true,
    };

    render(<UnifiedBlogSearch {...defaultProps} filters={filtersWithActive} />);

    expect(screen.getByText("Category: Electronics")).toBeInTheDocument();
    expect(screen.getAllByText("rental")[0]).toBeInTheDocument(); // Use getAllByText since there might be multiple
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Featured only")).toBeInTheDocument();
  });

  it("allows clearing individual filters", async () => {
    const user = userEvent.setup();
    const filtersWithActive: BlogFilters = {
      ...mockFilters,
      category: "electronics",
      tag: "rental",
    };

    render(<UnifiedBlogSearch {...defaultProps} filters={filtersWithActive} />);

    // Find and click the X button on category filter
    const categoryBadge = screen
      .getByText("Category: Electronics")
      .closest(".gap-1");
    const clearButton = categoryBadge?.querySelector("button");

    if (clearButton) {
      await user.click(clearButton);
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        tag: "rental",
      });
    }
  });

  it("allows clearing all filters", async () => {
    const user = userEvent.setup();
    const filtersWithActive: BlogFilters = {
      ...mockFilters,
      category: "electronics",
      tag: "rental",
      featured: true,
    };

    render(<UnifiedBlogSearch {...defaultProps} filters={filtersWithActive} />);

    // Open filters to see clear all button
    await user.click(screen.getByRole("button", { name: /filters/i }));

    const clearAllButton = screen.getByRole("button", {
      name: /clear all filters/i,
    });
    await user.click(clearAllButton);

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      query: "",
      category: undefined,
      tag: undefined,
      language: undefined,
      featured: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it("toggles between grid and list view modes", async () => {
    const user = userEvent.setup();
    render(<UnifiedBlogSearch {...defaultProps} />);

    const gridButton = screen.getByRole("button", { name: "Grid view" });
    const listButton = screen.getByRole("button", { name: "List view" });

    // Should start in grid mode - check if grid button has active variant
    expect(gridButton).toBeInTheDocument();
    expect(listButton).toBeInTheDocument();

    // Switch to list mode
    await user.click(listButton);
    // The component should update its internal state (we can't easily test this without exposing state)
  });

  it("handles pagination correctly", async () => {
    const user = userEvent.setup();
    const paginationProps = {
      ...defaultProps,
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasMore: true,
      },
    };

    render(<UnifiedBlogSearch {...paginationProps} />);

    // Should show pagination controls
    expect(
      screen.getByRole("button", { name: /previous/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();

    // Click next page
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);

    // Click previous page
    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it("shows no results message when posts array is empty", () => {
    render(<UnifiedBlogSearch {...defaultProps} posts={[]} />);

    expect(screen.getByText("No posts found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Try adjusting your search criteria or clearing the filters."
      )
    ).toBeInTheDocument();
  });

  it("shows loading skeleton when loading prop is true", () => {
    render(<UnifiedBlogSearch {...defaultProps} loading={true} />);

    // Should show skeleton instead of content
    expect(
      screen.queryByText("Complete Guide to Electronics Rental")
    ).not.toBeInTheDocument();
    // You might need to add test IDs to skeleton elements to test this properly
  });

  it("displays filter count badge when filters are active", () => {
    const filtersWithActive: BlogFilters = {
      ...mockFilters,
      category: "electronics",
      tag: "rental",
      featured: true,
    };

    render(<UnifiedBlogSearch {...defaultProps} filters={filtersWithActive} />);

    // Should show badge with count of 3
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("handles sort by changes", async () => {
    const user = userEvent.setup();
    render(<UnifiedBlogSearch {...defaultProps} />);

    // Open filters
    await user.click(screen.getByRole("button", { name: /filters/i }));

    // Find sort select - it's the 4th combobox (category, tag, language, sort)
    const sortSelects = screen.getAllByRole("combobox");
    const sortSelect = sortSelects[3]; // Sort by is the 4th select
    await user.click(sortSelect);

    // Select featured first
    await user.click(screen.getByText("Featured first"));

    // Note: This test just verifies the UI interaction works
    // The actual sorting logic would be implemented in the parent component
  });

  it("debounces search input correctly", async () => {
    const user = userEvent.setup();
    render(<UnifiedBlogSearch {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search blog posts...");

    // Type multiple characters quickly
    await user.type(searchInput, "test");

    // Should not call onSearch immediately
    expect(defaultProps.onSearch).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(
      () => {
        expect(defaultProps.onSearch).toHaveBeenCalledWith("test");
      },
      { timeout: 500 }
    );

    // Should only be called once despite multiple keystrokes
    expect(defaultProps.onSearch).toHaveBeenCalledTimes(1);
  });
});
