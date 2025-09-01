import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdBanner } from "@/components/layout/ad-banner";
import type { AdBanner as AdBannerType } from "@/components/layout/ad-banner";

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, "open", {
  writable: true,
  value: mockWindowOpen,
});

// Mock window.location
const mockLocation = {
  href: "",
};
Object.defineProperty(window, "location", {
  writable: true,
  value: mockLocation,
});

describe("AdBanner", () => {
  const mockBanner: AdBannerType = {
    id: "test-ad-1",
    title: "Test Advertisement",
    imageUrl: "/test-ad.jpg",
    linkUrl: "https://example.com",
    altText: "Test ad banner",
    priority: 100,
    description: "This is a test advertisement",
    ctaText: "Click Here",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders banner with image correctly", () => {
    render(<AdBanner banner={mockBanner} />);

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "/test-ad.jpg");
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Test ad banner");
    expect(screen.getByText("Test Advertisement")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test advertisement")
    ).toBeInTheDocument();
    expect(screen.getByText("Click Here")).toBeInTheDocument();
  });

  it("renders banner without image correctly", () => {
    const bannerWithoutImage = { ...mockBanner, imageUrl: "" };
    render(<AdBanner banner={bannerWithoutImage} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Test Advertisement")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test advertisement")
    ).toBeInTheDocument();
  });

  it("handles image load error by showing placeholder", async () => {
    const user = userEvent.setup();
    render(<AdBanner banner={mockBanner} />);

    const image = screen.getByRole("img");

    // Simulate image load error
    await user.click(image);
    const errorEvent = new Event("error");
    Object.defineProperty(errorEvent, "target", {
      value: { src: "" },
      writable: true,
    });

    image.dispatchEvent(errorEvent);

    expect(image).toHaveAttribute("src", "/placeholder.svg");
  });

  it("calls onBannerClick when banner is clicked", async () => {
    const user = userEvent.setup();
    const mockOnBannerClick = jest.fn();

    render(<AdBanner banner={mockBanner} onBannerClick={mockOnBannerClick} />);

    await user.click(screen.getByRole("button"));

    expect(mockOnBannerClick).toHaveBeenCalledWith("test-ad-1");
  });

  it("opens external link in new tab", async () => {
    const user = userEvent.setup();

    render(<AdBanner banner={mockBanner} />);

    await user.click(screen.getByRole("button"));

    expect(mockWindowOpen).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("navigates to internal link in same tab", async () => {
    const user = userEvent.setup();
    const internalBanner = { ...mockBanner, linkUrl: "/internal-page" };

    render(<AdBanner banner={internalBanner} />);

    await user.click(screen.getByRole("button"));

    expect(mockLocation.href).toBe("/internal-page");
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    const mockOnBannerClick = jest.fn();

    render(<AdBanner banner={mockBanner} onBannerClick={mockOnBannerClick} />);

    const button = screen.getByRole("button");

    // Test Enter key
    await user.type(button, "{Enter}");
    expect(mockOnBannerClick).toHaveBeenCalledWith("test-ad-1");

    // Test Space key
    await user.type(button, " ");
    expect(mockOnBannerClick).toHaveBeenCalledTimes(2);
  });

  it("applies correct size classes", () => {
    const { rerender } = render(<AdBanner banner={mockBanner} size="small" />);

    let imageContainer = screen.getByRole("img").parentElement;
    expect(imageContainer).toHaveClass("h-24");

    rerender(<AdBanner banner={mockBanner} size="medium" />);
    imageContainer = screen.getByRole("img").parentElement;
    expect(imageContainer).toHaveClass("h-32");

    rerender(<AdBanner banner={mockBanner} size="large" />);
    imageContainer = screen.getByRole("img").parentElement;
    expect(imageContainer).toHaveClass("h-48");
  });

  it("applies custom className", () => {
    const { container } = render(
      <AdBanner banner={mockBanner} className="custom-ad-class" />
    );

    expect(container.firstChild).toHaveClass("custom-ad-class");
  });

  it("shows hover effects", () => {
    render(<AdBanner banner={mockBanner} />);

    const card = screen.getByRole("button").closest(".cursor-pointer");
    expect(card).toHaveClass("hover:shadow-md", "transition-shadow");
  });

  it("has proper accessibility attributes", () => {
    render(<AdBanner banner={mockBanner} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "Advertisement: Test Advertisement"
    );
    expect(button).toHaveAttribute("tabIndex", "0");
  });

  describe("banner without additional content", () => {
    it("renders minimal banner correctly", () => {
      const minimalBanner: AdBannerType = {
        id: "minimal-ad",
        title: "Minimal Ad",
        imageUrl: "/minimal.jpg",
        linkUrl: "/minimal",
        altText: "Minimal ad",
        priority: 50,
      };

      render(<AdBanner banner={minimalBanner} />);

      expect(screen.getByRole("img")).toBeInTheDocument();
      expect(screen.queryByText("Minimal Ad")).not.toBeInTheDocument(); // Title only shows in gradient overlay when no image
    });
  });

  describe("banner with gradient background", () => {
    it("shows gradient background when no image URL", () => {
      const gradientBanner = { ...mockBanner, imageUrl: "" };
      render(<AdBanner banner={gradientBanner} />);

      const gradientContainer =
        screen.getByText("Test Advertisement").parentElement;
      expect(gradientContainer).toHaveClass(
        "bg-gradient-to-br",
        "from-blue-500",
        "to-purple-600"
      );
    });
  });

  describe("hover overlay", () => {
    it("shows external link icon on hover", () => {
      render(<AdBanner banner={mockBanner} />);

      const overlay = screen
        .getByRole("button")
        .querySelector(".absolute.inset-0");
      expect(overlay).toHaveClass("opacity-0", "group-hover:opacity-100");
    });
  });
});
