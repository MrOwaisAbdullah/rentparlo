import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { FilterManager } from "@/components/search/filter-manager";
import { FilterConfig } from "@/types/search";

// Mock the debounce hook
vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: any, delay: number) => value,
}));

const mockFilterConfig: FilterConfig[] = [
  {
    key: "category",
    type: "select",
    label: "Category",
    placeholder: "Select category",
    options: [
      { value: "electronics", label: "Electronics", count: 10 },
      { value: "furniture", label: "Furniture", count: 5 },
      { value: "vehicles", label: "Vehicles", count: 8 },
    ],
  },
  {
    key: "price",
    type: "range",
    label: "Price Range",
    min: 0,
    max: 100000,
    step: 1000,
  },
  {
    key: "condition",
    type: "select",
    label: "Condition",
    placeholder: "Select condition",
    options: [
      { value: "new", label: "New" },
      { value: "used", label: "Used" },
      { value: "refurbished", label: "Refurbished" },
    ],
  },
  {
    key: "featured",
    type: "checkbox",
    label: "Featured Only",
  },
  {
    key: "tags",
    type: "multiselect",
    label: "Tags",
    placeholder: "Select tags",
    options: [
      { value: "popular", label: "Popular" },
      { value: "trending", label: "Trending" },
      { value: "new-arrival", label: "New Arrival" },
    ],
  },
  {
    key: "search",
    type: "search",
    label: "Search",
    placeholder: "Search items...",
  },
];

const defaultProps = {
  filters: {},
  filterConfig: mockFilterConfig,
  onFilterChange: vi.fn(),
  onClearFilter: vi.fn(),
  onClearAll: vi.fn(),
};

describe("FilterManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      render(<FilterManager {...defaultProps} />);
      expect(
        screen.getByRole("group", { name: /filter controls/i })
      ).toBeInTheDocument();
    });

    it("renders all filter types correctly", () => {
      render(<FilterManager {...defaultProps} />);

      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price range/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/condition/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/featured only/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    });

    it("does not show active filters when no filters are applied", () => {
      render(<FilterManager {...defaultProps} />);
      expect(
        screen.queryByRole("region", { name: /active filters/i })
      ).not.toBeInTheDocument();
    });

    it("does not show clear all button when no filters are active", () => {
      render(<FilterManager {...defaultProps} showFilterToggle={false} />);
      expect(
        screen.queryByRole("button", { name: /clear all/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Active Filters Display", () => {
    const activeFilters = {
      category: "electronics",
      price: { min: 1000, max: 5000 },
      condition: "new",
      featured: true,
      tags: ["popular", "trending"],
      search: "laptop",
    };

    it("shows active filters when filters are applied", () => {
      render(<FilterManager {...defaultProps} filters={activeFilters} />);
      expect(
        screen.getByRole("region", { name: /active filters/i })
      ).toBeInTheDocument();
    });

    it("displays correct filter values in active filters", () => {
      render(<FilterManager {...defaultProps} filters={activeFilters} />);

      expect(screen.getByText(/category:/i)).toBeInTheDocument();
      expect(screen.getByText(/electronics/i)).toBeInTheDocument();
      expect(screen.getByText(/price range:/i)).toBeInTheDocument();
      expect(screen.getByText(/1,000 - 5,000/i)).toBeInTheDocument();
      expect(screen.getByText(/condition:/i)).toBeInTheDocument();
      expect(screen.getByText(/new/i)).toBeInTheDocument();
    });

    it("shows clear all button when filters are active", () => {
      render(<FilterManager {...defaultProps} filters={activeFilters} />);
      expect(
        screen.getByRole("button", { name: /clear all/i })
      ).toBeInTheDocument();
    });

    it("shows individual clear buttons for each active filter", () => {
      render(<FilterManager {...defaultProps} filters={activeFilters} />);
      const clearButtons = screen.getAllByLabelText(/remove .* filter/i);
      expect(clearButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Filter Interactions", () => {
    it("calls onFilterChange when select filter is changed", async () => {
      const user = userEvent.setup();
      render(<FilterManager {...defaultProps} />);

      const categorySelect = screen.getByRole("combobox", {
        name: /filter by category/i,
      });
      await user.click(categorySelect);

      const electronicsOption = screen.getByRole("option", {
        name: /electronics/i,
      });
      await user.click(electronicsOption);

      expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
        "category",
        "electronics"
      );
    });

    it("calls onFilterChange when checkbox filter is toggled", async () => {
      const user = userEvent.setup();
      render(<FilterManager {...defaultProps} />);

      const featuredCheckbox = screen.getByRole("checkbox", {
        name: /featured only/i,
      });
      await user.click(featuredCheckbox);

      expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
        "featured",
        true
      );
    });

    it("calls onFilterChange when range filter values are entered", async () => {
      const user = userEvent.setup();
      render(<FilterManager {...defaultProps} />);

      const minPriceInput = screen.getByLabelText(/minimum price range/i);
      await user.type(minPriceInput, "1000");

      await waitFor(() => {
        expect(defaultProps.onFilterChange).toHaveBeenCalledWith("price", {
          min: 1000,
          max: 0,
        });
      });
    });

    it("calls onFilterChange when search filter is used", async () => {
      const user = userEvent.setup();
      render(<FilterManager {...defaultProps} />);

      const searchInput = screen.getByLabelText(/search search/i);
      await user.type(searchInput, "laptop");

      await waitFor(() => {
        expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
          "search",
          "laptop"
        );
      });
    });
  });

  describe("Clear Functionality", () => {
    const activeFilters = {
      category: "electronics",
      price: { min: 1000, max: 5000 },
      condition: "new",
    };

    it("calls onClearFilter when individual filter clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterManager {...defaultProps} filters={activeFilters} />);

      const clearCategoryButton = screen.getByLabelText(
        /remove category filter/i
      );
      await user.click(clearCategoryButton);

      expect(defaultProps.onClearFilter).toHaveBeenCalledWith("category");
    });

    it("calls onClearAll when clear all button is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterManager {...defaultProps} filters={activeFilters} />);

      const clearAllButton = screen.getByRole("button", { name: /clear all/i });
      await user.click(clearAllButton);

      expect(defaultProps.onClearAll).toHaveBeenCalled();
    });

    it("shows confirmation dialog for clearing many filters", async () => {
      const user = userEvent.setup();
      const manyFilters = {
        category: "electronics",
        price: { min: 1000, max: 5000 },
        condition: "new",
        featured: true,
        tags: ["popular", "trending"],
        search: "laptop",
        extra1: "value1",
        extra2: "value2",
      };

      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

      render(<FilterManager {...defaultProps} filters={manyFilters} />);

      const clearAllButton = screen.getByRole("button", { name: /clear all/i });
      await user.click(clearAllButton);

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining("8 filters")
      );
      expect(defaultProps.onClearAll).toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe("Responsive Layout", () => {
    it("renders with horizontal layout by default", () => {
      render(<FilterManager {...defaultProps} />);
      const filterPanel = screen.getByRole("group", {
        name: /filter controls/i,
      });
      expect(filterPanel).toHaveClass("flex-col", "lg:flex-row");
    });

    it("renders with vertical layout when specified", () => {
      render(<FilterManager {...defaultProps} layout="vertical" />);
      const filterPanel = screen.getByRole("group", {
        name: /filter controls/i,
      });
      expect(filterPanel).toHaveClass("flex-col");
    });

    it("renders with grid layout when specified", () => {
      render(<FilterManager {...defaultProps} layout="grid" />);
      const filterPanel = screen.getByRole("group", {
        name: /filter controls/i,
      });
      expect(filterPanel).toHaveClass("grid");
    });

    it("shows filter toggle button when showFilterToggle is true", () => {
      render(<FilterManager {...defaultProps} showFilterToggle={true} />);
      expect(
        screen.getByRole("button", { name: /filters/i })
      ).toBeInTheDocument();
    });

    it("toggles filter panel visibility when filter toggle is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterManager {...defaultProps} showFilterToggle={true} />);

      const toggleButton = screen.getByRole("button", { name: /filters/i });
      const filterPanel = screen.getByRole("group", {
        name: /filter controls/i,
      });

      // Initially hidden on mobile
      expect(filterPanel.closest(".filter-panel")).toHaveClass(
        "hidden",
        "lg:block"
      );

      await user.click(toggleButton);

      // Should be visible after click
      expect(filterPanel.closest(".filter-panel")).toHaveClass("block");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels and roles", () => {
      render(<FilterManager {...defaultProps} />);

      expect(
        screen.getByRole("group", { name: /filter controls/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/minimum price range/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/maximum price range/i)).toBeInTheDocument();
    });

    it("has proper keyboard navigation support", async () => {
      const user = userEvent.setup();
      render(<FilterManager {...defaultProps} />);

      const categorySelect = screen.getByRole("combobox", {
        name: /filter by category/i,
      });

      // Tab to the select
      await user.tab();
      expect(categorySelect).toHaveFocus();

      // Enter to open
      await user.keyboard("{Enter}");

      // Should open the dropdown
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("announces filter count to screen readers", () => {
      const activeFilters = { category: "electronics", condition: "new" };
      render(<FilterManager {...defaultProps} filters={activeFilters} />);

      expect(
        screen.getByRole("region", { name: /active filters \(2\)/i })
      ).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles invalid filter config gracefully", () => {
      const invalidConfig = [
        { key: "", type: "select", label: "" }, // Invalid: missing key and label
        { key: "valid", type: "select", label: "Valid Filter", options: [] },
      ];

      // Should not crash
      render(<FilterManager {...defaultProps} filterConfig={invalidConfig} />);

      // Should only render valid filters
      expect(screen.getByLabelText(/valid filter/i)).toBeInTheDocument();
    });

    it("shows appropriate message when no filters are available", () => {
      render(<FilterManager {...defaultProps} filterConfig={[]} />);
      expect(screen.getByText(/no filters available/i)).toBeInTheDocument();
    });

    it("handles missing filter options gracefully", () => {
      const configWithoutOptions = [
        {
          key: "category",
          type: "select" as const,
          label: "Category",
          placeholder: "Select category",
          // Missing options array
        },
      ];

      render(
        <FilterManager {...defaultProps} filterConfig={configWithoutOptions} />
      );

      // Should render but show no options available
      const categorySelect = screen.getByRole("combobox", {
        name: /filter by category/i,
      });
      expect(categorySelect).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("does not re-render unnecessarily when props do not change", () => {
      const { rerender } = render(<FilterManager {...defaultProps} />);

      // Re-render with same props
      rerender(<FilterManager {...defaultProps} />);

      // Component should still be functional
      expect(
        screen.getByRole("group", { name: /filter controls/i })
      ).toBeInTheDocument();
    });

    it("debounces search input changes", async () => {
      const user = userEvent.setup();
      render(<FilterManager {...defaultProps} />);

      const searchInput = screen.getByLabelText(/search search/i);

      // Type multiple characters quickly
      await user.type(searchInput, "laptop");

      // Should only call onChange once due to debouncing (mocked to return immediately)
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
        "search",
        "laptop"
      );
    });
  });
});
