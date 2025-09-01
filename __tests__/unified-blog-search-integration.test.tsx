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

// Extended mock data for integration tests
const mockCategories: BlogCategory[] = [
  {
    _id: "1",
    _type: "category",
    title: "Electronics",
    slug: { current: "electronics" },
    postCount: 8,
  },
  {
    _id: "2",
    _type: "category",
    title: "Furniture",
    slug: { current: "furniture" },
    postCount: 5,
  },
  {
    _id: "3",
    _type: "category",
    title: "Vehicles",
    slug: { current: "vehicles" },
    postCount: 3,
  },
];

const mockTags = [
  "rental",
  "tips",
  "electronics",
  "furniture",
  "karachi",
  "lahore",
  "beginner",
  "advanced",
];

const mockPosts: BlogPostSummary[] = [
  {
    _id: "1",
    title: "Complete Guide to Electronics Rental in Karachi",
    titleUrdu: "کراچی میں الیکٹرانکس کرائے کی مکمل گائیڈ",
    slug: { current: "electronics-rental-karachi" },
    excerpt:
      "Everything you need to know about renting electronics in Karachi.",
    excerptUrdu:
      "کراچی میں الیکٹرانکس کرائے پر لینے کے بارے میں جو کچھ آپ کو جاننا ضروری ہے۔",
    mainImage: {
      asset: { url: "/electronics-guide.jpg" },
      alt: "Electronics rental guide",
    },
    categories: [{ _id: "1", title: "Electronics", slug: "electronics" }],
    tags: ["electronics", "rental", "karachi", "tips"],
    author: "Ahmed Ali",
    readingTime: 8,
    publishedAt: "2024-01-15T10:00:00Z",
    featured: true,
    language: "en",
  },
  {
    _id: "2",
    title: "Furniture Rental Tips for Students",
    slug: { current: "furniture-rental-students" },
    excerpt: "Best practices for students looking to rent furniture.",
    mainImage: {
      asset: { url: "/furniture-students.jpg" },
      alt: "Student furniture guide",
    },
    categories: [{ _id: "2", title: "Furniture", slug: "furniture" }],
    tags: ["furniture", "rental", "students", "tips"],
    author: "Sarah Khan",
    readingTime: 5,
    publishedAt: "2024-01-12T14:30:00Z",
    featured: false,
    language: "en",
  },
  {
    _id: "3",
    title: "گاڑی کرائے پر لینے کے فوائد",
    slug: { current: "car-rental-benefits-urdu" },
    excerpt: "Car rental benefits explained in Urdu.",
    excerptUrdu: "گاڑی کرائے پر لینے کے فوائد کی تفصیلی وضاحت۔",
    mainImage: {
      asset: { url: "/car-rental-urdu.jpg" },
      alt: "Car rental benefits",
    },
    categories: [{ _id: "3", title: "Vehicles", slug: "vehicles" }],
    tags: ["vehicles", "rental", "lahore"],
    author: "محمد حسن",
    readingTime: 6,
    publishedAt: "2024-01-10T09:15:00Z",
    featured: true,
    language: "ur",
  },
  {
    _id: "4",
    title: "Advanced Electronics Setup Guide",
    slug: { current: "advanced-electronics-setup" },
    excerpt: "Professional tips for setting up complex electronic equipment.",
    mainImage: {
      asset: { url: "/advanced-electronics.jpg" },
      alt: "Advanced electronics setup",
    },
    categories: [{ _id: "1", title: "Electronics", slug: "electronics" }],
    tags: ["electronics", "advanced", "setup"],
    author: "Tech Expert",
    readingTime: 12,
    publishedAt: "2024-01-08T16:45:00Z",
    featured: false,
    language: "en",
  },
];

const createMockProps = (overrides = {}) => ({
  posts: mockPosts,
  categories: mockCategories,
  tags: mockTags,
  filters: {
    query: "",
    category: undefined,
    tag: undefined,
    language: undefined,
    featured: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  } as BlogFilters,
  pagination: {
    page: 1,
    limit: 10,
    total: mockPosts.length,
    totalPages: 1,
    hasMore: false,
  } as BlogPagination,
  onFiltersChange: vi.fn(),
  onPageChange: vi.fn(),
  onSearch: vi.fn(),
  ...overrides,
});

describe("UnifiedBlogSearch Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Filter Combinations", () => {
    it("handles multiple filter combinations correctly", async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<UnifiedBlogSearch {...props} />);

      // Open filters
      await user.click(screen.getByRole("button", { name: /filters/i }));

      // Apply category filter
      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });
      await user.click(categorySelect);
      await user.click(screen.getByText("Electronics"));

      expect(props.onFiltersChange).toHaveBeenCalledWith({
        ...props.filters,
        category: "electronics",
      });

      // Apply tag filter
      const tagSelect = screen.getByRole("combobox", { name: /tag/i });
      await user.click(tagSelect);
      await user.click(screen.getByText("advanced"));

      expect(props.onFiltersChange).toHaveBeenCalledWith({
        ...props.filters,
        tag: "advanced",
      });

      // Apply language filter
      const languageSelect = screen.getByRole("combobox", {
        name: /language/i,
      });
      await user.click(languageSelect);
      await user.click(screen.getByText("English"));

      expect(props.onFiltersChange).toHaveBeenCalledWith({
        ...props.filters,
        language: "en",
      });
    });

    it("shows correct active filter badges for multiple filters", () => {
      const filtersWithMultiple: BlogFilters = {
        query: "electronics",
        category: "electronics",
        tag: "advanced",
        language: "en",
        featured: true,
        dateFrom: "2024-01-01",
        dateTo: "2024-01-31",
      };

      const props = createMockProps({ filters: filtersWithMultiple });
      render(<UnifiedBlogSearch {...props} />);

      // Check all active filter badges are displayed
      expect(screen.getByText("Category: Electronics")).toBeInTheDocument();
      expect(screen.getByText("advanced")).toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("Featured only")).toBeInTheDocument();
      expect(screen.getByText("Date range")).toBeInTheDocument();

      // Check filter count badge shows correct number
      expect(screen.getByText("7")).toBeInTheDocument(); // 7 active filters
    });

    it("clears filters in correct sequence", async () => {
      const user = userEvent.setup();
      const filtersWithMultiple: BlogFilters = {
        query: "",
        category: "electronics",
        tag: "advanced",
        language: "en",
        featured: true,
        dateFrom: undefined,
        dateTo: undefined,
      };

      const props = createMockProps({ filters: filtersWithMultiple });
      render(<UnifiedBlogSearch {...props} />);

      // Clear individual filter (category)
      const categoryBadge = screen
        .getByText("Category: Electronics")
        .closest(".gap-1");
      const clearCategoryButton = categoryBadge?.querySelector("button");

      if (clearCategoryButton) {
        await user.click(clearCategoryButton);
        expect(props.onFiltersChange).toHaveBeenCalledWith({
          tag: "advanced",
          language: "en",
          featured: true,
        });
      }

      // Clear another filter (tag)
      const tagBadge = screen.getByText("advanced").closest(".gap-1");
      const clearTagButton = tagBadge?.querySelector("button");

      if (clearTagButton) {
        await user.click(clearTagButton);
        expect(props.onFiltersChange).toHaveBeenCalledWith({
          language: "en",
          featured: true,
        });
      }
    });
  });

  describe("Search and Filter Integration", () => {
    it("combines search query with filters correctly", async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<UnifiedBlogSearch {...props} />);

      // Enter search query
      const searchInput = screen.getByPlaceholderText("Search blog posts...");
      await user.type(searchInput, "electronics");

      // Wait for debounce
      await waitFor(
        () => {
          expect(props.onSearch).toHaveBeenCalledWith("electronics");
        },
        { timeout: 500 }
      );

      // Apply additional filters
      await user.click(screen.getByRole("button", { name: /filters/i }));

      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });
      await user.click(categorySelect);
      await user.click(screen.getByText("Electronics"));

      expect(props.onFiltersChange).toHaveBeenCalledWith({
        ...props.filters,
        category: "electronics",
      });
    });

    it("maintains search query when applying filters", async () => {
      const user = userEvent.setup();
      const propsWithQuery = createMockProps({
        filters: { ...createMockProps().filters, query: "rental tips" },
      });

      render(<UnifiedBlogSearch {...propsWithQuery} />);

      // Search input should show existing query
      const searchInput = screen.getByPlaceholderText("Search blog posts...");
      expect(searchInput).toHaveValue("rental tips");

      // Apply filter while maintaining search
      await user.click(screen.getByRole("button", { name: /filters/i }));

      const featuredCheckbox = screen.getByRole("checkbox", {
        name: /featured posts only/i,
      });
      await user.click(featuredCheckbox);

      expect(propsWithQuery.onFiltersChange).toHaveBeenCalledWith({
        ...propsWithQuery.filters,
        featured: true,
      });
    });
  });

  describe("Language-specific Functionality", () => {
    it("filters posts by language correctly", () => {
      const englishOnlyFilters: BlogFilters = {
        query: "",
        category: undefined,
        tag: undefined,
        language: "en",
        featured: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      };

      const props = createMockProps({ filters: englishOnlyFilters });
      render(<UnifiedBlogSearch {...props} />);

      // Should show language filter badge
      expect(screen.getByText("English")).toBeInTheDocument();
    });

    it("handles Urdu language filter", async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<UnifiedBlogSearch {...props} />);

      await user.click(screen.getByRole("button", { name: /filters/i }));

      const languageSelect = screen.getByRole("combobox", {
        name: /language/i,
      });
      await user.click(languageSelect);
      await user.click(screen.getByText("Urdu"));

      expect(props.onFiltersChange).toHaveBeenCalledWith({
        ...props.filters,
        language: "ur",
      });
    });
  });

  describe("Date Range Filtering", () => {
    it("handles date range filter combinations", async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<UnifiedBlogSearch {...props} />);

      await user.click(screen.getByRole("button", { name: /filters/i }));

      // Set from date
      const fromDateInput = screen.getByLabelText(/from date/i);
      await user.type(fromDateInput, "2024-01-01");

      expect(props.onFiltersChange).toHaveBeenCalledWith({
        ...props.filters,
        dateFrom: "2024-01-01",
      });

      // Set to date
      const toDateInput = screen.getByLabelText(/to date/i);
      await user.type(toDateInput, "2024-01-15");

      expect(props.onFiltersChange).toHaveBeenCalledWith({
        ...props.filters,
        dateTo: "2024-01-15",
      });
    });

    it("clears date range filters together", async () => {
      const user = userEvent.setup();
      const filtersWithDateRange: BlogFilters = {
        query: "",
        category: undefined,
        tag: undefined,
        language: undefined,
        featured: undefined,
        dateFrom: "2024-01-01",
        dateTo: "2024-01-31",
      };

      const props = createMockProps({ filters: filtersWithDateRange });
      render(<UnifiedBlogSearch {...props} />);

      // Find date range badge and clear it
      const dateRangeBadge = screen.getByText("Date range").closest(".gap-1");
      const clearDateButton = dateRangeBadge?.querySelector("button");

      if (clearDateButton) {
        await user.click(clearDateButton);
        // Should clear both dateFrom and dateTo
        expect(props.onFiltersChange).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe("Featured Posts Filtering", () => {
    it("toggles featured filter correctly", async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<UnifiedBlogSearch {...props} />);

      await user.click(screen.getByRole("button", { name: /filters/i }));

      const featuredCheckbox = screen.getByRole("checkbox", {
        name: /featured posts only/i,
      });

      // Enable featured filter
      await user.click(featuredCheckbox);
      expect(props.onFiltersChange).toHaveBeenCalledWith({
        ...props.filters,
        featured: true,
      });

      // Disable featured filter
      await user.click(featuredCheckbox);
      expect(props.onFiltersChange).toHaveBeenCalledWith({
        ...props.filters,
        featured: undefined,
      });
    });

    it("shows featured posts with correct styling", () => {
      const featuredOnlyFilters: BlogFilters = {
        query: "",
        category: undefined,
        tag: undefined,
        language: undefined,
        featured: true,
        dateFrom: undefined,
        dateTo: undefined,
      };

      const props = createMockProps({ filters: featuredOnlyFilters });
      render(<UnifiedBlogSearch {...props} />);

      expect(screen.getByText("Featured only")).toBeInTheDocument();
    });
  });

  describe("Pagination with Filters", () => {
    it("maintains filters when changing pages", async () => {
      const user = userEvent.setup();
      const filtersWithCategory: BlogFilters = {
        query: "",
        category: "electronics",
        tag: undefined,
        language: undefined,
        featured: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      };

      const paginationProps = {
        page: 1,
        limit: 2,
        total: 10,
        totalPages: 5,
        hasMore: true,
      };

      const props = createMockProps({
        filters: filtersWithCategory,
        pagination: paginationProps,
      });

      render(<UnifiedBlogSearch {...props} />);

      // Should show category filter
      expect(screen.getByText("Category: Electronics")).toBeInTheDocument();

      // Click next page
      await user.click(screen.getByRole("button", { name: /next/i }));
      expect(props.onPageChange).toHaveBeenCalledWith(2);

      // Filters should still be visible
      expect(screen.getByText("Category: Electronics")).toBeInTheDocument();
    });
  });

  describe("View Mode Integration", () => {
    it("maintains filters when switching view modes", async () => {
      const user = userEvent.setup();
      const filtersWithMultiple: BlogFilters = {
        query: "electronics",
        category: "electronics",
        tag: undefined,
        language: undefined,
        featured: true,
        dateFrom: undefined,
        dateTo: undefined,
      };

      const props = createMockProps({ filters: filtersWithMultiple });
      render(<UnifiedBlogSearch {...props} />);

      // Verify filters are shown
      expect(screen.getByText("Category: Electronics")).toBeInTheDocument();
      expect(screen.getByText("Featured only")).toBeInTheDocument();

      // Switch to list view
      const viewModeButtons = screen.getAllByRole("button");
      const listViewButton = viewModeButtons.find(
        (button) => button.querySelector("svg") // Find button with icon
      );

      if (listViewButton) {
        await user.click(listViewButton);
        // Filters should still be visible after view mode change
        expect(screen.getByText("Category: Electronics")).toBeInTheDocument();
        expect(screen.getByText("Featured only")).toBeInTheDocument();
      }
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("handles empty categories gracefully", () => {
      const props = createMockProps({ categories: [] });
      render(<UnifiedBlogSearch {...props} />);

      // Should still render without errors
      expect(screen.getByText("Blog Posts")).toBeInTheDocument();
    });

    it("handles empty tags gracefully", () => {
      const props = createMockProps({ tags: [] });
      render(<UnifiedBlogSearch {...props} />);

      // Should still render without errors
      expect(screen.getByText("Blog Posts")).toBeInTheDocument();
    });

    it("handles posts with missing data gracefully", () => {
      const postsWithMissingData = [
        {
          ...mockPosts[0],
          categories: undefined,
          tags: undefined,
          author: "",
          readingTime: undefined,
        },
      ];

      const props = createMockProps({ posts: postsWithMissingData });
      render(<UnifiedBlogSearch {...props} />);

      // Should still render the post
      expect(
        screen.getByText("Complete Guide to Electronics Rental in Karachi")
      ).toBeInTheDocument();
    });
  });
});
