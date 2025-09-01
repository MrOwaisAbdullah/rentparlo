import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the search hook to return test data
vi.mock("@/hooks/use-search-listings", () => ({
  useSearchListings: vi.fn(() => ({
    data: [
      {
        _id: "1",
        title: "Test Camera",
        description: "Professional camera for rent",
        price: 1000,
        priceType: "daily",
        images: ["test-image.jpg"],
        condition: "new",
        availability: "available",
        location: { city: "Karachi", area: "DHA" },
        category: { title: "Electronics", slug: "electronics" },
        seller: {
          id: "1",
          username: "testuser",
          tier: "basic",
          isVerified: true,
        },
        createdAt: "2024-01-01T00:00:00Z",
      },
    ],
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
  })),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock analytics
vi.mock("@/lib/analytics-client", () => ({
  analytics: {
    trackSearch: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock debounce hook
vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: any) => value,
}));

const mockCategories = [
  { _id: "1", title: "Electronics", slug: "electronics", itemCount: 10 },
  { _id: "2", title: "Vehicles", slug: "vehicles", itemCount: 5 },
];

const mockCities = [
  { id: "1", name: "Karachi", province: "Sindh" },
  { id: "2", name: "Lahore", province: "Punjab" },
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

describe("UnifiedListingSearch Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders and handles basic search functionality", async () => {
    const { UnifiedListingSearch } = await import(
      "@/components/search/unified-listing-search"
    );

    render(
      <UnifiedListingSearch categories={mockCategories} cities={mockCities} />,
      { wrapper: createWrapper() }
    );

    // Check if basic elements are rendered
    expect(
      screen.getByPlaceholderText("Search for rental items...")
    ).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("handles search input and form submission", async () => {
    const { UnifiedListingSearch } = await import(
      "@/components/search/unified-listing-search"
    );
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

    // Type in search input
    fireEvent.change(searchInput, { target: { value: "camera" } });
    expect(searchInput).toHaveValue("camera");

    // Submit search
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith("camera");
    });
  });

  it("renders in different layouts", async () => {
    const { UnifiedListingSearch } = await import(
      "@/components/search/unified-listing-search"
    );

    // Test minimal layout
    const { rerender } = render(
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

    // Test compact layout
    rerender(
      <UnifiedListingSearch
        categories={mockCategories}
        cities={mockCities}
        layout="compact"
      />
    );

    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("handles filter state management", async () => {
    const { UnifiedListingSearch } = await import(
      "@/components/search/unified-listing-search"
    );
    const onFiltersChange = vi.fn();

    render(
      <UnifiedListingSearch
        categories={mockCategories}
        cities={mockCities}
        manageURL={false}
        onFiltersChange={onFiltersChange}
        initialFilters={{ category: "electronics" }}
      />,
      { wrapper: createWrapper() }
    );

    // Should show active filter
    expect(screen.getByText("Category: Electronics")).toBeInTheDocument();
  });

  it("toggles view modes", async () => {
    const { UnifiedListingSearch } = await import(
      "@/components/search/unified-listing-search"
    );

    render(
      <UnifiedListingSearch categories={mockCategories} cities={mockCities} />,
      { wrapper: createWrapper() }
    );

    // Find view mode buttons by their icons
    const buttons = screen.getAllByRole("button");
    const gridButton = buttons.find((btn) =>
      btn.querySelector("svg")?.getAttribute("class")?.includes("lucide-grid")
    );
    const listButton = buttons.find((btn) =>
      btn.querySelector("svg")?.getAttribute("class")?.includes("lucide-list")
    );

    expect(gridButton).toBeInTheDocument();
    expect(listButton).toBeInTheDocument();

    // Click list view button
    if (listButton) {
      fireEvent.click(listButton);
      // View mode change is handled internally
    }
  });

  it("handles external search params", async () => {
    const { UnifiedListingSearch } = await import(
      "@/components/search/unified-listing-search"
    );

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
    expect(screen.getByText("Category: Electronics")).toBeInTheDocument();
    expect(screen.getByText("karachi")).toBeInTheDocument();
  });

  it("shows and hides sidebar based on props", async () => {
    const { UnifiedListingSearch } = await import(
      "@/components/search/unified-listing-search"
    );

    const { rerender } = render(
      <UnifiedListingSearch
        categories={mockCategories}
        cities={mockCities}
        showSidebar={true}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Filters")).toBeInTheDocument();

    rerender(
      <UnifiedListingSearch
        categories={mockCategories}
        cities={mockCities}
        showSidebar={false}
      />
    );

    expect(screen.queryByText("Filters")).not.toBeInTheDocument();
  });
});
