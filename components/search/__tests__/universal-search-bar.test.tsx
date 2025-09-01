import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import UniversalSearchBar from "../universal-search-bar";

import { vi } from "vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
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
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("UniversalSearchBar", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
    mockLocalStorage.getItem.mockReturnValue(null);
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<UniversalSearchBar />);

      expect(
        screen.getByRole("combobox", { name: /search input/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /search/i })
      ).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      const customPlaceholder = "Custom search placeholder";
      render(<UniversalSearchBar placeholder={customPlaceholder} />);

      expect(
        screen.getByPlaceholderText(customPlaceholder)
      ).toBeInTheDocument();
    });

    it("renders location filter when enabled", () => {
      render(<UniversalSearchBar showLocationFilter={true} />);

      expect(screen.getByText("Select city...")).toBeInTheDocument();
    });

    it("hides location filter when disabled", () => {
      render(<UniversalSearchBar showLocationFilter={false} />);

      expect(screen.queryByText("Select city...")).not.toBeInTheDocument();
    });

    it("applies correct variant classes", () => {
      const { rerender } = render(<UniversalSearchBar variant="hero" />);
      expect(screen.getByText("Location")).toBeInTheDocument();
      expect(screen.getByText("What are you looking for?")).toBeInTheDocument();

      rerender(<UniversalSearchBar variant="header" />);
      expect(screen.queryByText("Location")).not.toBeInTheDocument();
      expect(
        screen.queryByText("What are you looking for?")
      ).not.toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("handles form submission with query", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      const submitButton = screen.getByRole("button", { name: /search/i });

      await user.type(input, "camera");
      await user.click(submitButton);

      expect(mockPush).toHaveBeenCalledWith("/search?q=camera&city=Karachi");
    });

    it("handles search with custom onSearch callback", async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();

      render(<UniversalSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.type(input, "laptop");

      const form = input.closest("form");
      fireEvent.submit(form!);

      expect(mockOnSearch).toHaveBeenCalledWith("laptop", {
        query: "laptop",
        city: "Karachi",
        area: "",
        category: "",
      });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("clears input when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.type(input, "test query");

      const clearButton = screen.getByRole("button", { name: /clear search/i });
      await user.click(clearButton);

      expect(input).toHaveValue("");
    });
  });

  describe("Suggestions", () => {
    it("shows suggestions when input is focused", async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(["recent search"])
      );

      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.click(input);

      await waitFor(() => {
        expect(
          screen.getByRole("listbox", { name: /search suggestions/i })
        ).toBeInTheDocument();
      });
    });

    it("shows recent searches when no query", async () => {
      const user = userEvent.setup();
      const recentSearches = ["camera", "laptop"];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(recentSearches));

      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText("camera")).toBeInTheDocument();
        expect(screen.getByText("laptop")).toBeInTheDocument();
      });
    });

    it("shows popular searches", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText("Camera")).toBeInTheDocument();
        expect(screen.getByText("Car")).toBeInTheDocument();
      });
    });

    it("filters suggestions based on query", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.type(input, "cam");

      await waitFor(() => {
        expect(screen.getByText("Camera")).toBeInTheDocument();
        expect(screen.queryByText("Car")).not.toBeInTheDocument();
      });
    });

    it("handles suggestion click", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.click(input);

      await waitFor(() => {
        const suggestion = screen.getByText("Camera");
        user.click(suggestion);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/search?q=Camera&city=Karachi");
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("navigates suggestions with arrow keys", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Navigate down
      await user.keyboard("{ArrowDown}");
      const firstOption = screen.getAllByRole("option")[0];
      expect(firstOption).toHaveAttribute("aria-selected", "true");

      // Navigate up
      await user.keyboard("{ArrowUp}");
      const lastOption = screen.getAllByRole("option").slice(-1)[0];
      expect(lastOption).toHaveAttribute("aria-selected", "true");
    });

    it("selects suggestion with Enter key", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(mockPush).toHaveBeenCalled();
    });

    it("closes suggestions with Escape key", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Location Integration", () => {
    it("updates city and area selections", async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();

      render(
        <UniversalSearchBar onSearch={mockOnSearch} showLocationFilter={true} />
      );

      // Click city selector
      const cityButton = screen.getByText("Karachi");
      await user.click(cityButton);

      // Select Lahore
      await waitFor(() => {
        const lahoreOption = screen.getByText("Lahore");
        user.click(lahoreOption);
      });

      // Submit search
      const form = screen
        .getByRole("combobox", { name: /search input/i })
        .closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          "",
          expect.objectContaining({
            city: "Lahore",
          })
        );
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      expect(input).toHaveAttribute("aria-expanded", "false");
      expect(input).toHaveAttribute("aria-haspopup", "listbox");
      expect(input).toHaveAttribute("role", "combobox");
    });

    it("updates ARIA attributes when suggestions are shown", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.click(input);

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("has proper labels for buttons", () => {
      render(<UniversalSearchBar initialQuery="test" />);

      expect(
        screen.getByRole("button", { name: /search/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /clear search/i })
      ).toBeInTheDocument();
    });
  });

  describe("Local Storage", () => {
    it("saves recent searches", async () => {
      const user = userEvent.setup();
      render(<UniversalSearchBar />);

      const input = screen.getByRole("combobox", { name: /search input/i });
      await user.type(input, "test search");

      const form = input.closest("form");
      fireEvent.submit(form!);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "universal_search_recent",
        JSON.stringify(["test search"])
      );
    });

    it("handles localStorage errors gracefully", () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      expect(() => {
        render(<UniversalSearchBar />);
      }).not.toThrow();
    });
  });

  describe("Responsive Behavior", () => {
    it("applies correct size classes", () => {
      const { rerender } = render(<UniversalSearchBar size="sm" />);
      let input = screen.getByRole("combobox", { name: /search input/i });
      expect(input).toHaveClass("h-8");

      rerender(<UniversalSearchBar size="lg" />);
      input = screen.getByRole("combobox", { name: /search input/i });
      expect(input).toHaveClass("h-12");
    });
  });
});
