import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UniversalPageLayout } from "@/components/layout/universal-page-layout";
import { AdBanner } from "@/components/layout/ad-banner";
import { RelatedContent } from "@/components/layout/related-content";

// Mock the sidebar context
vi.mock("@/contexts/sidebar-context", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  useSidebar: () => ({
    sidebarState: {
      pageType: "search",
      pageContext: {},
      content: [],
      isLoading: false,
      error: null,
      interactions: [],
    },
    loadSidebarContent: vi.fn(),
    trackInteraction: vi.fn(),
    updateContent: vi.fn(),
    addContent: vi.fn(),
    removeContent: vi.fn(),
    clearContent: vi.fn(),
  }),
}));

// Mock the universal sidebar component
vi.mock("@/components/layout/universal-sidebar", () => ({
  UniversalSidebar: ({ pageType }: { pageType: string }) => (
    <div data-testid="universal-sidebar" data-page-type={pageType}>
      Sidebar Content
    </div>
  ),
}));

describe("Layout Components Integration", () => {
  describe("UniversalPageLayout", () => {
    it("renders main content correctly", () => {
      render(
        <UniversalPageLayout pageType="search">
          <div data-testid="main-content">Main Content</div>
        </UniversalPageLayout>
      );

      expect(screen.getByTestId("main-content")).toBeInTheDocument();
      expect(screen.getByText("Main Content")).toBeInTheDocument();
    });

    it("renders sidebar when showSidebar is true", () => {
      render(
        <UniversalPageLayout pageType="search" showSidebar={true}>
          <div>Content</div>
        </UniversalPageLayout>
      );

      expect(screen.getByTestId("universal-sidebar")).toBeInTheDocument();
    });

    it("hides sidebar when showSidebar is false", () => {
      render(
        <UniversalPageLayout pageType="search" showSidebar={false}>
          <div>Content</div>
        </UniversalPageLayout>
      );

      expect(screen.queryByTestId("universal-sidebar")).not.toBeInTheDocument();
    });

    it("applies responsive classes correctly", () => {
      const { container } = render(
        <UniversalPageLayout pageType="search" showSidebar={true}>
          <div>Content</div>
        </UniversalPageLayout>
      );

      const flexContainer = container.querySelector(".flex.gap-6");
      expect(flexContainer).toHaveClass("flex-col", "lg:flex-row");
    });
  });

  describe("AdBanner", () => {
    const mockBanner = {
      id: "test-banner",
      title: "Test Ad",
      imageUrl: "/test.jpg",
      linkUrl: "https://example.com",
      altText: "Test alt text",
      priority: 100,
    };

    it("renders banner with image correctly", () => {
      render(<AdBanner banner={mockBanner} />);

      expect(screen.getByRole("img")).toBeInTheDocument();
      expect(screen.getByRole("img")).toHaveAttribute("src", "/test.jpg");
      expect(screen.getByRole("img")).toHaveAttribute("alt", "Test alt text");
    });

    it("renders banner without image correctly", () => {
      const bannerWithoutImage = { ...mockBanner, imageUrl: "" };
      render(<AdBanner banner={bannerWithoutImage} />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.getByText("Test Ad")).toBeInTheDocument();
    });

    it("has proper accessibility attributes", () => {
      render(<AdBanner banner={mockBanner} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Advertisement: Test Ad");
      expect(button).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("RelatedContent", () => {
    const mockItems = [
      {
        id: "1",
        title: "First Item",
        linkUrl: "/item/1",
        description: "First description",
        metadata: { price: 1000, location: "Karachi" },
      },
      {
        id: "2",
        title: "Second Item",
        linkUrl: "/item/2",
        description: "Second description",
        metadata: { price: 2000, location: "Lahore" },
      },
    ];

    it("renders related content with correct title", () => {
      render(
        <RelatedContent
          contentType="listings"
          items={mockItems}
          title="Custom Title"
        />
      );

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("uses default title when none provided", () => {
      render(<RelatedContent contentType="listings" items={mockItems} />);

      expect(screen.getByText("Popular Listings")).toBeInTheDocument();
    });

    it("renders all items", () => {
      render(<RelatedContent contentType="listings" items={mockItems} />);

      expect(screen.getByText("First Item")).toBeInTheDocument();
      expect(screen.getByText("Second Item")).toBeInTheDocument();
    });

    it("limits items based on maxItems prop", () => {
      render(
        <RelatedContent contentType="listings" items={mockItems} maxItems={1} />
      );

      expect(screen.getByText("First Item")).toBeInTheDocument();
      expect(screen.queryByText("Second Item")).not.toBeInTheDocument();
    });

    it("returns null when no items provided", () => {
      const { container } = render(
        <RelatedContent contentType="listings" items={[]} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("displays listing metadata correctly", () => {
      render(<RelatedContent contentType="listings" items={mockItems} />);

      expect(screen.getByText("PKR 1,000")).toBeInTheDocument();
      expect(screen.getByText("PKR 2,000")).toBeInTheDocument();
      expect(screen.getByText("Karachi")).toBeInTheDocument();
      expect(screen.getByText("Lahore")).toBeInTheDocument();
    });
  });
});
