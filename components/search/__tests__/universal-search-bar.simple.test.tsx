import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import UniversalSearchBar from "../universal-search-bar";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock debounce hook
vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: string) => value,
}));

// Mock area utils
vi.mock("@/lib/area-utils", () => ({
  CITY_AREAS: {
    Karachi: ["Clifton", "DHA", "Gulshan"],
    Lahore: ["DHA", "Gulberg", "Model Town"],
    Islamabad: ["F-6", "F-7", "G-9"],
  },
}));

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

describe("UniversalSearchBar - Basic Tests", () => {
  it("renders search input", () => {
    render(<UniversalSearchBar />);

    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
  });

  it("renders search button", () => {
    render(<UniversalSearchBar />);

    const button = screen.getByRole("button", { name: /search/i });
    expect(button).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    const placeholder = "Custom placeholder";
    render(<UniversalSearchBar placeholder={placeholder} />);

    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  it("shows location filter when enabled", () => {
    render(<UniversalSearchBar showLocationFilter={true} />);

    expect(screen.getByText("Karachi")).toBeInTheDocument();
  });

  it("hides location filter when disabled", () => {
    render(<UniversalSearchBar showLocationFilter={false} />);

    expect(screen.queryByText("Karachi")).not.toBeInTheDocument();
  });
});
