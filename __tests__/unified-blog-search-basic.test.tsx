import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UnifiedBlogSearch } from "@/components/search/unified-blog-search";
import {
  BlogPostSummary,
  BlogCategory,
  BlogFilters,
  BlogPagination,
} from "@/types";

// Basic test data
const mockPost: BlogPostSummary = {
  _id: "1",
  title: "Test Blog Post",
  slug: { current: "test-blog-post" },
  excerpt: "This is a test blog post excerpt.",
  mainImage: {
    asset: { url: "/test-image.jpg" },
    alt: "Test image",
  },
  categories: [{ _id: "1", title: "Test Category", slug: "test-category" }],
  tags: ["test", "blog"],
  author: "Test Author",
  readingTime: 5,
  publishedAt: "2024-01-15T10:00:00Z",
  featured: false,
  language: "en",
};

const mockCategory: BlogCategory = {
  _id: "1",
  _type: "category",
  title: "Test Category",
  slug: { current: "test-category" },
  postCount: 1,
};

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
  total: 1,
  totalPages: 1,
  hasMore: false,
};

describe("UnifiedBlogSearch Basic Tests", () => {
  const defaultProps = {
    posts: [mockPost],
    categories: [mockCategory],
    tags: ["test", "blog"],
    filters: mockFilters,
    pagination: mockPagination,
    onFiltersChange: vi.fn(),
    onPageChange: vi.fn(),
    onSearch: vi.fn(),
  };

  it("renders without crashing", () => {
    render(<UnifiedBlogSearch {...defaultProps} />);
    expect(screen.getByText("Blog Posts")).toBeInTheDocument();
  });

  it("displays blog posts", () => {
    render(<UnifiedBlogSearch {...defaultProps} />);
    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test blog post excerpt.")
    ).toBeInTheDocument();
  });

  it("shows correct post count", () => {
    render(<UnifiedBlogSearch {...defaultProps} />);
    expect(screen.getByText("1 post found")).toBeInTheDocument();
  });

  it("displays search input", () => {
    render(<UnifiedBlogSearch {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Search blog posts...")
    ).toBeInTheDocument();
  });

  it("shows filter button", () => {
    render(<UnifiedBlogSearch {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /filters/i })
    ).toBeInTheDocument();
  });

  it("shows view mode toggle buttons", () => {
    render(<UnifiedBlogSearch {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "Grid view" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "List view" })
    ).toBeInTheDocument();
  });

  it("handles empty posts gracefully", () => {
    render(<UnifiedBlogSearch {...defaultProps} posts={[]} />);
    expect(screen.getByText("No posts found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Try adjusting your search criteria or clearing the filters."
      )
    ).toBeInTheDocument();
  });

  it("shows loading skeleton when loading", () => {
    render(<UnifiedBlogSearch {...defaultProps} loading={true} />);
    // When loading, the main content should not be visible
    expect(screen.queryByText("Test Blog Post")).not.toBeInTheDocument();
  });

  it("displays category in title when category filter is active", () => {
    const filtersWithCategory = { ...mockFilters, category: "test-category" };
    render(
      <UnifiedBlogSearch {...defaultProps} filters={filtersWithCategory} />
    );
    expect(screen.getByText("Test Category Posts")).toBeInTheDocument();
  });

  it("renders with different layouts", () => {
    // Test sidebar layout
    const { unmount: unmount1 } = render(
      <UnifiedBlogSearch {...defaultProps} layout="sidebar" />
    );
    expect(screen.getByText("Blog Posts")).toBeInTheDocument();
    unmount1();

    // Test top layout
    const { unmount: unmount2 } = render(
      <UnifiedBlogSearch {...defaultProps} layout="top" />
    );
    expect(screen.getByText("Blog Posts")).toBeInTheDocument();
    unmount2();

    // Test inline layout
    render(<UnifiedBlogSearch {...defaultProps} layout="inline" />);
    expect(screen.getByText("Blog Posts")).toBeInTheDocument();
  });
});
