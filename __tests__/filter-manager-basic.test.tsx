import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect } from "vitest";
import { FilterManager } from "@/components/search/filter-manager";
import { FilterConfig } from "@/types/search";

// Mock the debounce hook
vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: any, delay: number) => value,
}));

const basicFilterConfig: FilterConfig[] = [
  {
    key: "category",
    type: "select",
    label: "Category",
    placeholder: "Select category",
    options: [
      { value: "electronics", label: "Electronics" },
      { value: "furniture", label: "Furniture" },
    ],
  },
  {
    key: "featured",
    type: "checkbox",
    label: "Featured Only",
  },
];

const defaultProps = {
  filters: {},
  filterConfig: basicFilterConfig,
  onFilterChange: vi.fn(),
  onClearFilter: vi.fn(),
  onClearAll: vi.fn(),
};

describe("FilterManager Basic Tests", () => {
  it("renders without crashing", () => {
    render(<FilterManager {...defaultProps} />);
    expect(
      screen.getByRole("group", { name: /filter controls/i })
    ).toBeInTheDocument();
  });

  it("shows no filters available message when config is empty", () => {
    render(<FilterManager {...defaultProps} filterConfig={[]} />);
    expect(screen.getByText(/no filters available/i)).toBeInTheDocument();
  });

  it("renders basic filter types", () => {
    render(<FilterManager {...defaultProps} />);

    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/featured only/i)).toBeInTheDocument();
  });
});
