import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { UnifiedListingSearch } from "@/components/search/unified-listing-search";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock analytics
vi.mock("@/lib/analytics-client", () => ({
  analytics: {
    trackSearch: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock search hook
vi.mock("@/hooks/use-search-listings", () => ({
  useSearchListings: vi.fn(),
}));

// Mock debounce hook
vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: vi.fn((value) => value),
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

const mockSearchParams = new URLSearchParams();

const mockCategories = [
  { _id: "1", title: "Electronics", slug: "electronics", itemCount: 10 },
  { _id: "2", title: "Vehicles", slug: "vehicles", itemCount: 5 },
  { _id: "3", title: "Tools", slug: "tools", itemCount: 8 },
];

const mockCities = [
  { id: "1", name: "Karachi", province: "Sindh" },
  { id: "2", name: "Lahore", province: "Punjab" },
  { id: "3", name: "Islamabad", province: "Federal" },
];

const mockListings = [
  {
    _id: "1",
    title: "Test Camera",
    description: "Professional camera for rent",
    price: 1000,
    priceType: "daily" as const,
    images: ["test-image.jpg"],
    condition: "new",
    availability: "available",
    location: { city: "Karachi", area: "DHA" },
    category: { title: "Electronics", slug: "electronics" },
    seller: {
      id: "1",
      username: "testuser",
      tier: "basic" as const,
      isVerified: true,
    },
    createdAt: "2024-01-01T00:00:00Z",
  },
];

const mockSearchHookReturn = {
  data: mockListings,
  isLoading: false,
  error: null,
  hasNextPage: false,
  fetchNextPage: vi.fn(),
  isFetchingNextPage: false,
  totalResults: 1,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20,
    totalResults: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

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

describe("UnifiedListingSearch", () => {
  beforeEach(() => {
    const { useRouter, useSearchParams } = await import("next/navigation");
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);

    const { useSearchListings } = await import("@/hooks/use-search-listings");
    vi.mocked(useSearchListings).mockReturnValue(mockSearchHookReturn);

    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders search bar and filters", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      expect(
        screen.getByPlaceholderText("Search for rental items...")
      ).toBeInTheDocument();
      expect(screen.getByText("Filters")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    it("renders in minimal layout", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
          layout="minimal"
        />,
        { wrapper: createWrapper() }
      );

      expect(
        screen.getByPlaceholderText("Search for rental items...")
      ).toBeInTheDocument();
      expect(screen.queryByText("Filters")).not.toBeInTheDocument();
    });

    it("renders in compact layout", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
          layout="compact"
        />,
        { wrapper: createWrapper() }
      );

      expect(
        screen.getByPlaceholderText("Search for rental items...")
      ).toBeInTheDocument();
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("handles search input changes", async () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      fireEvent.change(searchInput, { target: { value: "camera" } });

      expect(searchInput).toHaveValue("camera");
    });

    it("submits search form", async () => {
      const onSearch = vi.fn();

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
          onSearch={onSearch}
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      const searchButton = screen.getByText("Search");

      fireEvent.change(searchInput, { target: { value: "camera" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith("camera");
      });
    });
  });

  describe("Filter Management", () => {
    it("shows active filter count", () => {
      const searchParams = new URLSearchParams(
        "category=electronics&city=karachi"
      );
      const { useSearchParams } = vi.mocked(await import("next/navigation"));
      useSearchParams.mockReturnValue(searchParams);

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText("2")).toBeInTheDocument(); // Filter count badge
    });

    it("clears all filters", async () => {
      const searchParams = new URLSearchParams(
        "category=electronics&city=karachi"
      );
      const { useSearchParams } = vi.mocked(await import("next/navigation"));
      useSearchParams.mockReturnValue(searchParams);

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const clearAllButton = screen.getByText("Clear all");
      fireEvent.click(clearAllButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalled();
      });
    });
  });

  describe("URL Management", () => {
    it("manages URL state when manageURL is true", async () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
          manageURL={true}
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      fireEvent.change(searchInput, { target: { value: "camera" } });

      const searchButton = screen.getByText("Search");
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalled();
      });
    });

    it("calls external handler when manageURL is false", async () => {
      const onFiltersChange = vi.fn();

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
          manageURL={false}
          onFiltersChange={onFiltersChange}
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText(
        "Search for rental items..."
      );
      fireEvent.change(searchInput, { target: { value: "camera" } });

      const searchButton = screen.getByText("Search");
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });
    });
  });

  describe("View Mode Toggle", () => {
    it("toggles between grid and list view", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const gridButton = screen
        .getAllByRole("button")
        .find((btn) =>
          btn
            .querySelector("svg")
            ?.getAttribute("class")
            ?.includes("lucide-grid")
        );
      const listButton = screen
        .getAllByRole("button")
        .find((btn) =>
          btn
            .querySelector("svg")
            ?.getAttribute("class")
            ?.includes("lucide-list")
        );

      expect(gridButton).toBeInTheDocument();
      expect(listButton).toBeInTheDocument();

      if (listButton) {
        fireEvent.click(listButton);
        // View mode change is handled internally
      }
    });
  });

  describe("Responsive Behavior", () => {
    it("shows mobile filter toggle", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
        />,
        { wrapper: createWrapper() }
      );

      const filterButton = screen.getByText("Filters");
      expect(filterButton).toBeInTheDocument();

      fireEvent.click(filterButton);
      // Filter panel visibility is controlled by CSS classes
    });

    it("hides sidebar when showSidebar is false", () => {
      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
          showSidebar={false}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByText("Filters")).not.toBeInTheDocument();
    });
  });

  describe("External Search Params", () => {
    it("uses external search params when provided", () => {
      const externalParams = {
        q: "camera",
        category: "electronics",
        city: "karachi",
      };

      render(
        <UnifiedListingSearch
          categories={mockCategories}
          cities={mockCities}
          searchParams={externalParams}
          manageURL={false}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByDisplayValue("camera")).toBeInTheDocument();
    });
  });
});
