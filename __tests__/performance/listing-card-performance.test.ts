import React from "react";
import { render } from "@testing-library/react";
import { ListingCardHorizontal } from "../../components/cards/listing-card-horizontal";
import { Listing } from "../../types";

// Mock next/image component
jest.mock("next/image", () => {
  return function MockImage({ alt, ...props }: any) {
    return React.createElement("img", { alt, ...props });
  };
});

// Mock next/link component
jest.mock("next/link", () => {
  return function MockLink({ children, ...props }: any) {
    return React.createElement("a", props, children);
  };
});

describe("ListingCardHorizontal Performance", () => {
  const mockListing: Listing = {
    _id: "test-id",
    _type: "listing",
    title: "Test Listing",
    slug: { current: "test-listing" },
    description: "This is a test listing",
    price: 1000,
    priceType: "daily",
    category: {
      _ref: "category-id",
      title: "Test Category",
    },
    images: [
      {
        asset: {
          url: "/test-image.jpg",
          metadata: {},
        },
      },
    ],
    location: {
      city: "Karachi",
      area: "Clifton",
    },
    condition: "like-new",
    availability: {
      isAvailable: true,
    },
    specifications: [],
    rentalRules: [],
    status: "active",
    supabaseId: "user-id",
    isFeatured: false,
    featuredPriority: 0,
    _createdAt: "2023-01-01T00:00:00Z",
    created_at: "2023-01-01T00:00:00Z",
    views: 100,
    contactClicks: 50,
    badges: ["Featured"],
  };

  it("should render quickly", () => {
    const startTime = performance.now();

    render(
      React.createElement(ListingCardHorizontal, { listing: mockListing })
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render in less than 50ms
    expect(renderTime).toBeLessThan(50);
  });

  it("should render multiple cards efficiently", () => {
    const startTime = performance.now();

    // Render 100 cards
    for (let i = 0; i < 100; i++) {
      render(
        React.createElement(ListingCardHorizontal, { listing: mockListing })
      );
    }

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render 100 cards in less than 1000ms
    expect(renderTime).toBeLessThan(1000);
  });
});
