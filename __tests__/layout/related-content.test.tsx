import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RelatedContent } from "@/components/layout/related-content";
import type { RelatedItem } from "@/components/layout/related-content";

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock window.open and location
const mockWindowOpen = vi.fn();
Object.defineProperty(window, "open", {
  writable: true,
  value: mockWindowOpen,
});

const mockLocation = {
  href: "",
};
Object.defineProperty(window, "location", {
  writable: true,
  value: mockLocation,
});

describe("RelatedContent", () => {
  const mockListingItems: RelatedItem[] = [
    {
      id: "listing-1",
      title: "Professional Camera for Rent",
      imageUrl: "/camera.jpg",
      linkUrl: "/listing/camera",
      description: "High-quality DSLR camera",
      metadata: { price: 5000, location: "Karachi" },
    },
    {
      id: "listing-2",
      title: "Luxury Car Rental",
      imageUrl: "/car.jpg",
      linkUrl: "/listing/car",
      description: "Premium sedan for events",
      metadata: { price: 15000, location: "Lahore" },
    },
  ];

  const mockPostItems: RelatedItem[] = [
    {
      id: "post-1",
      title: "How to Choose Rental Equipment",
      linkUrl: "/blog/choose-equipment",
      description: "A comprehensive guide to selecting rental items",
      metadata: { publishedAt: "2024-01-15", views: 1250 },
    },
    {
      id: "post-2",
      title: "Rental Tips for Beginners",
      linkUrl: "/blog/rental-tips",
      description: "Essential tips for first-time renters",
      metadata: { publishedAt: "2024-01-10", views: 890 },
    },
  ];

  const mockCategoryItems: RelatedItem[] = [
    {
      id: "cat-1",
      title: "Electronics",
      linkUrl: "/category/electronics",
      description: "Cameras, laptops, and more",
      metadata: { itemCount: 150, trending: true },
    },
    {
      id: "cat-2",
      title: "Vehicles",
      linkUrl: "/category/vehicles",
      description: "Cars, bikes, and transport",
      metadata: { itemCount: 89 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders listing content correctly", () => {
    render(
      <RelatedContent
        contentType="listings"
        items={mockListingItems}
        title="Popular Listings"
      />
    );

    expect(screen.getByText("Popular Listings")).toBeInTheDocument();
    expect(
      screen.getByText("Professional Camera for Rent")
    ).toBeInTheDocument();
    expect(screen.getByText("Luxury Car Rental")).toBeInTheDocument();
    expect(screen.getByText("PKR 5,000")).toBeInTheDocument();
    expect(screen.getByText("PKR 15,000")).toBeInTheDocument();
    expect(screen.getByText("Karachi")).toBeInTheDocument();
    expect(screen.getByText("Lahore")).toBeInTheDocument();
  });

  it("renders blog post content correctly", () => {
    render(
      <RelatedContent
        contentType="posts"
        items={mockPostItems}
        title="Related Posts"
      />
    );

    expect(screen.getByText("Related Posts")).toBeInTheDocument();
    expect(
      screen.getByText("How to Choose Rental Equipment")
    ).toBeInTheDocument();
    expect(screen.getByText("Rental Tips for Beginners")).toBeInTheDocument();
    expect(screen.getByText("Jan 15")).toBeInTheDocument();
    expect(screen.getByText("Jan 10")).toBeInTheDocument();
    expect(screen.getByText("1250")).toBeInTheDocument();
    expect(screen.getByText("890")).toBeInTheDocument();
  });

  it("renders category content correctly", () => {
    render(
      <RelatedContent
        contentType="categories"
        items={mockCategoryItems}
        title="Browse Categories"
      />
    );

    expect(screen.getByText("Browse Categories")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Vehicles")).toBeInTheDocument();
    expect(screen.getByText("150 items")).toBeInTheDocument();
    expect(screen.getByText("89 items")).toBeInTheDocument();
    expect(screen.getByText("Trending")).toBeInTheDocument();
  });

  it("uses default title when none provided", () => {
    render(<RelatedContent contentType="listings" items={mockListingItems} />);

    expect(screen.getByText("Popular Listings")).toBeInTheDocument();
  });

  it("limits items based on maxItems prop", () => {
    render(
      <RelatedContent
        contentType="listings"
        items={mockListingItems}
        maxItems={1}
      />
    );

    expect(
      screen.getByText("Professional Camera for Rent")
    ).toBeInTheDocument();
    expect(screen.queryByText("Luxury Car Rental")).not.toBeInTheDocument();
  });

  it("handles empty items array", () => {
    render(<RelatedContent contentType="listings" items={[]} />);

    // Component should not render when no items
    expect(screen.queryByText("Popular Listings")).not.toBeInTheDocument();
  });

  it("calls onItemClick when item is clicked", async () => {
    const user = userEvent.setup();
    const mockOnItemClick = jest.fn();

    render(
      <RelatedContent
        contentType="listings"
        items={mockListingItems}
        onItemClick={mockOnItemClick}
      />
    );

    await user.click(screen.getByText("Professional Camera for Rent"));

    expect(mockOnItemClick).toHaveBeenCalledWith("listing-1");
  });

  it("navigates to external links in new tab", async () => {
    const user = userEvent.setup();
    const externalItems = [
      {
        ...mockListingItems[0],
        linkUrl: "https://external.com/listing",
      },
    ];

    render(<RelatedContent contentType="listings" items={externalItems} />);

    await user.click(screen.getByText("Professional Camera for Rent"));

    expect(mockWindowOpen).toHaveBeenCalledWith(
      "https://external.com/listing",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("navigates to internal links in same tab", async () => {
    const user = userEvent.setup();

    render(<RelatedContent contentType="listings" items={mockListingItems} />);

    await user.click(screen.getByText("Professional Camera for Rent"));

    expect(mockLocation.href).toBe("/listing/camera");
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    const mockOnItemClick = jest.fn();

    render(
      <RelatedContent
        contentType="listings"
        items={mockListingItems}
        onItemClick={mockOnItemClick}
      />
    );

    const firstItem = screen
      .getByText("Professional Camera for Rent")
      .closest('[role="button"]');

    // Test Enter key
    if (firstItem) {
      await user.type(firstItem, "{Enter}");
      expect(mockOnItemClick).toHaveBeenCalledWith("listing-1");
    }
  });

  it("handles image load errors gracefully", async () => {
    render(<RelatedContent contentType="listings" items={mockListingItems} />);

    const images = screen.getAllByRole("img");
    const firstImage = images[0];

    // Simulate image load error
    const errorEvent = new Event("error");
    Object.defineProperty(errorEvent, "target", {
      value: { src: "" },
      writable: true,
    });

    firstImage.dispatchEvent(errorEvent);

    expect(firstImage).toHaveAttribute("src", "/placeholder.svg");
  });

  it("shows placeholder when no image URL provided", () => {
    const itemsWithoutImages = mockListingItems.map((item) => ({
      ...item,
      imageUrl: undefined,
    }));

    render(
      <RelatedContent contentType="listings" items={itemsWithoutImages} />
    );

    // Should show gradient placeholder instead of images
    const placeholders = screen
      .getAllByText("Professional Camera for Rent")[0]
      .closest('[role="button"]')
      ?.querySelector(".bg-gradient-to-br");

    expect(placeholders).toBeInTheDocument();
  });

  it("applies hover effects correctly", () => {
    render(<RelatedContent contentType="listings" items={mockListingItems} />);

    const itemContainer = screen
      .getByText("Professional Camera for Rent")
      .closest(".group");

    expect(itemContainer).toHaveClass(
      "hover:bg-muted/50",
      "cursor-pointer",
      "transition-colors"
    );
  });

  it("truncates long titles and descriptions", () => {
    const longTitleItems = [
      {
        id: "long-1",
        title:
          "This is a very long title that should be truncated when displayed in the related content component",
        linkUrl: "/long-title",
        description:
          "This is a very long description that should also be truncated to prevent layout issues in the sidebar component",
        metadata: { price: 1000 },
      },
    ];

    render(<RelatedContent contentType="listings" items={longTitleItems} />);

    const titleElement = screen.getByText(/This is a very long title/);
    expect(titleElement).toHaveClass("line-clamp-2");
  });

  describe("content type specific metadata", () => {
    it("shows correct metadata for listings", () => {
      render(
        <RelatedContent contentType="listings" items={mockListingItems} />
      );

      // Should show price and location
      expect(screen.getByText("PKR 5,000")).toBeInTheDocument();
      expect(screen.getByText("Karachi")).toBeInTheDocument();
    });

    it("shows correct metadata for posts", () => {
      render(<RelatedContent contentType="posts" items={mockPostItems} />);

      // Should show date and views
      expect(screen.getByText("Jan 15")).toBeInTheDocument();
      expect(screen.getByText("1250")).toBeInTheDocument();
    });

    it("shows correct metadata for categories", () => {
      render(
        <RelatedContent contentType="categories" items={mockCategoryItems} />
      );

      // Should show item count and trending indicator
      expect(screen.getByText("150 items")).toBeInTheDocument();
      expect(screen.getByText("Trending")).toBeInTheDocument();
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <RelatedContent
        contentType="listings"
        items={mockListingItems}
        className="custom-related-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-related-class");
  });
});
