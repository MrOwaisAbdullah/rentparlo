import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UniversalSidebar } from "@/components/layout/universal-sidebar";
import { SidebarProvider, SidebarContent } from "@/contexts/sidebar-context";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the layout components
vi.mock("@/components/layout/ad-banner", () => ({
  AdBanner: ({
    banner,
    onBannerClick,
  }: {
    banner: any;
    onBannerClick: () => void;
  }) => (
    <div data-testid="ad-banner" onClick={onBannerClick}>
      Ad: {banner.title}
    </div>
  ),
}));

vi.mock("@/components/layout/related-content", () => ({
  RelatedContent: ({
    contentType,
    items,
    title,
    onItemClick,
  }: {
    contentType: string;
    items: any[];
    title?: string;
    onItemClick: (id: string) => void;
  }) => (
    <div data-testid="related-content" data-content-type={contentType}>
      <div>{title}</div>
      {items.map((item) => (
        <div key={item.id} onClick={() => onItemClick(item.id)}>
          {item.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock content for testing
const mockSidebarContent: SidebarContent[] = [
  {
    id: "ad-1",
    type: "ad",
    title: "Test Ad",
    data: {
      id: "ad-1",
      title: "Test Advertisement",
      imageUrl: "/test-ad.jpg",
      linkUrl: "/advertise",
      altText: "Test ad",
      priority: 100,
    },
    priority: 100,
    position: "top",
  },
  {
    id: "popular-listings",
    type: "popular-listings",
    title: "Popular Listings",
    data: {
      items: [
        { id: "listing-1", title: "Test Listing 1", linkUrl: "/listing/1" },
        { id: "listing-2", title: "Test Listing 2", linkUrl: "/listing/2" },
      ],
      limit: 5,
    },
    priority: 80,
    position: "middle",
  },
  {
    id: "categories",
    type: "categories",
    title: "Categories",
    data: {
      items: [
        { id: "cat-1", title: "Electronics", linkUrl: "/category/electronics" },
      ],
      limit: 5,
    },
    priority: 60,
    position: "bottom",
  },
];

// Custom provider for testing
function TestSidebarProvider({
  children,
  mockContent = mockSidebarContent,
  isLoading = false,
  error = null,
}: {
  children: React.ReactNode;
  mockContent?: SidebarContent[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const mockContextValue = {
    sidebarState: {
      pageType: "search" as const,
      pageContext: {},
      content: mockContent,
      isLoading,
      error,
      interactions: [],
    },
    loadSidebarContent: jest.fn(),
    trackInteraction: jest.fn(),
    updateContent: jest.fn(),
    addContent: jest.fn(),
    removeContent: jest.fn(),
    clearContent: jest.fn(),
  };

  return (
    <div data-testid="mock-sidebar-provider">
      {React.cloneElement(children as React.ReactElement, {
        mockContext: mockContextValue,
      })}
    </div>
  );
}

// Mock the useSidebar hook
const mockUseSidebar = vi.fn();
vi.mock("@/contexts/sidebar-context", () => ({
  useSidebar: () => mockUseSidebar(),
}));

describe("UniversalSidebar", () => {
  const defaultProps = {
    pageType: "search" as const,
    pageContext: {},
  };

  beforeEach(() => {
    mockUseSidebar.mockReturnValue({
      sidebarState: {
        pageType: "search",
        pageContext: {},
        content: mockSidebarContent,
        isLoading: false,
        error: null,
        interactions: [],
      },
      loadSidebarContent: jest.fn(),
      trackInteraction: jest.fn(),
      updateContent: jest.fn(),
      addContent: jest.fn(),
      removeContent: jest.fn(),
      clearContent: jest.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders sidebar content correctly", () => {
    render(<UniversalSidebar {...defaultProps} />);

    expect(screen.getByTestId("ad-banner")).toBeInTheDocument();
    expect(screen.getByText("Ad: Test Advertisement")).toBeInTheDocument();
    expect(screen.getByTestId("related-content")).toBeInTheDocument();
  });

  it("loads sidebar content on mount", () => {
    const mockLoadSidebarContent = jest.fn();
    mockUseSidebar.mockReturnValue({
      sidebarState: {
        pageType: "search",
        pageContext: {},
        content: [],
        isLoading: false,
        error: null,
        interactions: [],
      },
      loadSidebarContent: mockLoadSidebarContent,
      trackInteraction: jest.fn(),
      updateContent: jest.fn(),
      addContent: jest.fn(),
      removeContent: jest.fn(),
      clearContent: jest.fn(),
    });

    render(<UniversalSidebar {...defaultProps} />);

    expect(mockLoadSidebarContent).toHaveBeenCalledWith("search", {});
  });

  it("reloads content when pageType changes", () => {
    const mockLoadSidebarContent = jest.fn();
    mockUseSidebar.mockReturnValue({
      sidebarState: {
        pageType: "search",
        pageContext: {},
        content: [],
        isLoading: false,
        error: null,
        interactions: [],
      },
      loadSidebarContent: mockLoadSidebarContent,
      trackInteraction: jest.fn(),
      updateContent: jest.fn(),
      addContent: jest.fn(),
      removeContent: jest.fn(),
      clearContent: jest.fn(),
    });

    const { rerender } = render(<UniversalSidebar {...defaultProps} />);

    expect(mockLoadSidebarContent).toHaveBeenCalledWith("search", {});

    rerender(<UniversalSidebar pageType="category" pageContext={{}} />);

    expect(mockLoadSidebarContent).toHaveBeenCalledWith("category", {});
  });

  it("displays loading skeleton when loading", () => {
    mockUseSidebar.mockReturnValue({
      sidebarState: {
        pageType: "search",
        pageContext: {},
        content: [],
        isLoading: true,
        error: null,
        interactions: [],
      },
      loadSidebarContent: jest.fn(),
      trackInteraction: jest.fn(),
      updateContent: jest.fn(),
      addContent: jest.fn(),
      removeContent: jest.fn(),
      clearContent: jest.fn(),
    });

    render(<UniversalSidebar {...defaultProps} />);

    // Should show skeleton loaders
    expect(screen.getAllByTestId("skeleton")).toHaveLength(3);
  });

  it("displays error message when there is an error", () => {
    mockUseSidebar.mockReturnValue({
      sidebarState: {
        pageType: "search",
        pageContext: {},
        content: [],
        isLoading: false,
        error: "Failed to load content",
        interactions: [],
      },
      loadSidebarContent: jest.fn(),
      trackInteraction: jest.fn(),
      updateContent: jest.fn(),
      addContent: jest.fn(),
      removeContent: jest.fn(),
      clearContent: jest.fn(),
    });

    render(<UniversalSidebar {...defaultProps} />);

    expect(
      screen.getByText("Unable to load sidebar content")
    ).toBeInTheDocument();
  });

  it("tracks interactions when content is clicked", async () => {
    const user = userEvent.setup();
    const mockTrackInteraction = jest.fn();

    mockUseSidebar.mockReturnValue({
      sidebarState: {
        pageType: "search",
        pageContext: {},
        content: mockSidebarContent,
        isLoading: false,
        error: null,
        interactions: [],
      },
      loadSidebarContent: jest.fn(),
      trackInteraction: mockTrackInteraction,
      updateContent: jest.fn(),
      addContent: jest.fn(),
      removeContent: jest.fn(),
      clearContent: jest.fn(),
    });

    render(<UniversalSidebar {...defaultProps} />);

    await user.click(screen.getByTestId("ad-banner"));

    expect(mockTrackInteraction).toHaveBeenCalledWith({
      contentId: "ad-1",
      contentType: "ad",
      action: "click",
      timestamp: expect.any(Date),
      metadata: { pageType: "search", pageContext: {} },
    });
  });

  it("calls onContentClick when provided", async () => {
    const user = userEvent.setup();
    const mockOnContentClick = jest.fn();

    render(
      <UniversalSidebar {...defaultProps} onContentClick={mockOnContentClick} />
    );

    await user.click(screen.getByTestId("ad-banner"));

    expect(mockOnContentClick).toHaveBeenCalledWith("ad-1", "ad");
  });

  it("renders content in correct position order", () => {
    render(<UniversalSidebar {...defaultProps} />);

    const sidebarContainer =
      screen.getByTestId("ad-banner").parentElement?.parentElement;
    const contentElements = sidebarContainer?.children;

    // Should render in position order: top, middle, bottom
    expect(contentElements?.[0]).toContain(screen.getByTestId("ad-banner"));
  });

  it("displays fallback message when no content is available", () => {
    mockUseSidebar.mockReturnValue({
      sidebarState: {
        pageType: "search",
        pageContext: {},
        content: [],
        isLoading: false,
        error: null,
        interactions: [],
      },
      loadSidebarContent: jest.fn(),
      trackInteraction: jest.fn(),
      updateContent: jest.fn(),
      addContent: jest.fn(),
      removeContent: jest.fn(),
      clearContent: jest.fn(),
    });

    render(<UniversalSidebar {...defaultProps} />);

    expect(screen.getByText("No content available")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <UniversalSidebar {...defaultProps} className="custom-sidebar-class" />
    );

    expect(container.firstChild).toHaveClass("custom-sidebar-class");
  });

  describe("content type rendering", () => {
    it("renders ad content correctly", () => {
      const adContent: SidebarContent[] = [
        {
          id: "ad-test",
          type: "ad",
          title: "Test Ad",
          data: {
            id: "ad-test",
            title: "Test Advertisement",
            imageUrl: "/test.jpg",
            linkUrl: "/test",
            altText: "Test",
            priority: 100,
          },
          priority: 100,
          position: "top",
        },
      ];

      mockUseSidebar.mockReturnValue({
        sidebarState: {
          pageType: "search",
          pageContext: {},
          content: adContent,
          isLoading: false,
          error: null,
          interactions: [],
        },
        loadSidebarContent: jest.fn(),
        trackInteraction: jest.fn(),
        updateContent: jest.fn(),
        addContent: jest.fn(),
        removeContent: jest.fn(),
        clearContent: jest.fn(),
      });

      render(<UniversalSidebar {...defaultProps} />);

      expect(screen.getByTestId("ad-banner")).toBeInTheDocument();
    });

    it("renders related content correctly", () => {
      const relatedContent: SidebarContent[] = [
        {
          id: "related-test",
          type: "popular-listings",
          title: "Popular Items",
          data: {
            items: [{ id: "item-1", title: "Test Item", linkUrl: "/item/1" }],
            limit: 5,
          },
          priority: 80,
          position: "middle",
        },
      ];

      mockUseSidebar.mockReturnValue({
        sidebarState: {
          pageType: "search",
          pageContext: {},
          content: relatedContent,
          isLoading: false,
          error: null,
          interactions: [],
        },
        loadSidebarContent: jest.fn(),
        trackInteraction: jest.fn(),
        updateContent: jest.fn(),
        addContent: jest.fn(),
        removeContent: jest.fn(),
        clearContent: jest.fn(),
      });

      render(<UniversalSidebar {...defaultProps} />);

      expect(screen.getByTestId("related-content")).toBeInTheDocument();
      expect(screen.getByTestId("related-content")).toHaveAttribute(
        "data-content-type",
        "listings"
      );
    });

    it("handles unknown content types gracefully", () => {
      const unknownContent: SidebarContent[] = [
        {
          id: "unknown-test",
          type: "unknown" as any,
          title: "Unknown Content",
          data: {},
          priority: 50,
          position: "middle",
        },
      ];

      mockUseSidebar.mockReturnValue({
        sidebarState: {
          pageType: "search",
          pageContext: {},
          content: unknownContent,
          isLoading: false,
          error: null,
          interactions: [],
        },
        loadSidebarContent: jest.fn(),
        trackInteraction: jest.fn(),
        updateContent: jest.fn(),
        addContent: jest.fn(),
        removeContent: jest.fn(),
        clearContent: jest.fn(),
      });

      render(<UniversalSidebar {...defaultProps} />);

      expect(
        screen.getByText("Unknown content type: unknown")
      ).toBeInTheDocument();
    });
  });
});
