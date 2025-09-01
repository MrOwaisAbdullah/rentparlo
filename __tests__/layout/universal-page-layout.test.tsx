import React from "react";
import { render, screen } from "@testing-library/react";
import {
  UniversalPageLayout,
  ResponsiveContainer,
} from "@/components/layout/universal-page-layout";
import { SidebarProvider } from "@/contexts/sidebar-context";

import { describe, it, expect, vi } from "vitest";

// Mock the sidebar context
vi.mock("@/contexts/sidebar-context", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
}));

// Mock the universal sidebar component
vi.mock("@/components/layout/universal-sidebar", () => ({
  UniversalSidebar: ({
    pageType,
    pageContext,
  }: {
    pageType: string;
    pageContext: Record<string, any>;
  }) => (
    <div
      data-testid="universal-sidebar"
      data-page-type={pageType}
      data-page-context={JSON.stringify(pageContext)}
    >
      Sidebar Content
    </div>
  ),
}));

describe("UniversalPageLayout", () => {
  const defaultProps = {
    pageType: "search" as const,
    children: <div data-testid="main-content">Main Content</div>,
  };

  it("renders main content correctly", () => {
    render(<UniversalPageLayout {...defaultProps} />);

    expect(screen.getByTestId("main-content")).toBeInTheDocument();
    expect(screen.getByText("Main Content")).toBeInTheDocument();
  });

  it("renders sidebar when showSidebar is true", () => {
    render(<UniversalPageLayout {...defaultProps} showSidebar={true} />);

    expect(screen.getByTestId("universal-sidebar")).toBeInTheDocument();
    expect(screen.getByText("Sidebar Content")).toBeInTheDocument();
  });

  it("does not render sidebar when showSidebar is false", () => {
    render(<UniversalPageLayout {...defaultProps} showSidebar={false} />);

    expect(screen.queryByTestId("universal-sidebar")).not.toBeInTheDocument();
  });

  it("passes pageType and pageContext to sidebar", () => {
    const pageContext = { categoryId: "electronics", filters: { price: 1000 } };

    render(
      <UniversalPageLayout
        {...defaultProps}
        pageType="category"
        pageContext={pageContext}
        showSidebar={true}
      />
    );

    const sidebar = screen.getByTestId("universal-sidebar");
    expect(sidebar).toHaveAttribute("data-page-type", "category");
    expect(sidebar).toHaveAttribute(
      "data-page-context",
      JSON.stringify(pageContext)
    );
  });

  it("applies custom className", () => {
    const { container } = render(
      <UniversalPageLayout {...defaultProps} className="custom-layout-class" />
    );

    expect(container.firstChild).toHaveClass("custom-layout-class");
  });

  it("applies custom containerClassName", () => {
    render(
      <UniversalPageLayout
        {...defaultProps}
        containerClassName="custom-container-class"
      />
    );

    // Check if the container div has the custom class
    const container = screen
      .getByTestId("main-content")
      .closest(".custom-container-class");
    expect(container).toBeInTheDocument();
  });

  it("applies custom contentClassName", () => {
    render(
      <UniversalPageLayout
        {...defaultProps}
        contentClassName="custom-content-class"
      />
    );

    // Check if the content wrapper has the custom class
    const contentWrapper = screen.getByTestId("main-content").parentElement;
    expect(contentWrapper).toHaveClass("custom-content-class");
  });

  it("positions sidebar on the right by default", () => {
    render(<UniversalPageLayout {...defaultProps} showSidebar={true} />);

    const mainContent = screen.getByTestId("main-content").parentElement;
    const sidebar = screen.getByTestId("universal-sidebar").parentElement;

    // Check that main content comes before sidebar in DOM order (right sidebar)
    expect(mainContent?.compareDocumentPosition(sidebar!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("positions sidebar on the left when sidebarPosition is left", () => {
    render(
      <UniversalPageLayout
        {...defaultProps}
        showSidebar={true}
        sidebarPosition="left"
      />
    );

    const flexContainer =
      screen.getByTestId("main-content").parentElement?.parentElement;
    expect(flexContainer).toHaveClass("flex-row-reverse");
  });

  it("wraps content in SidebarProvider", () => {
    render(<UniversalPageLayout {...defaultProps} />);

    expect(screen.getByTestId("sidebar-provider")).toBeInTheDocument();
  });

  describe("responsive behavior", () => {
    it("applies responsive classes for mobile-first layout", () => {
      render(<UniversalPageLayout {...defaultProps} showSidebar={true} />);

      const flexContainer =
        screen.getByTestId("main-content").parentElement?.parentElement;
      expect(flexContainer).toHaveClass("flex-col", "lg:flex-row");
    });

    it("applies responsive sidebar width classes", () => {
      render(<UniversalPageLayout {...defaultProps} showSidebar={true} />);

      const sidebarContainer =
        screen.getByTestId("universal-sidebar").parentElement;
      expect(sidebarContainer).toHaveClass("w-full", "lg:w-80");
    });
  });
});

describe("ResponsiveContainer", () => {
  const defaultProps = {
    children: <div data-testid="container-content">Container Content</div>,
  };

  it("renders children correctly", () => {
    render(<ResponsiveContainer {...defaultProps} />);

    expect(screen.getByTestId("container-content")).toBeInTheDocument();
    expect(screen.getByText("Container Content")).toBeInTheDocument();
  });

  it("applies default max-width class", () => {
    const { container } = render(<ResponsiveContainer {...defaultProps} />);

    expect(container.firstChild).toHaveClass("max-w-7xl");
  });

  it("applies custom max-width class", () => {
    const { container } = render(
      <ResponsiveContainer {...defaultProps} maxWidth="lg" />
    );

    expect(container.firstChild).toHaveClass("max-w-lg");
  });

  it("applies default padding class", () => {
    const { container } = render(<ResponsiveContainer {...defaultProps} />);

    expect(container.firstChild).toHaveClass("px-4", "sm:px-6", "lg:px-8");
  });

  it("applies custom padding class", () => {
    const { container } = render(
      <ResponsiveContainer {...defaultProps} padding="sm" />
    );

    expect(container.firstChild).toHaveClass("px-2", "sm:px-4");
  });

  it("applies no padding when padding is none", () => {
    const { container } = render(
      <ResponsiveContainer {...defaultProps} padding="none" />
    );

    expect(container.firstChild).not.toHaveClass("px-2", "px-4", "px-6");
  });

  it("applies custom className", () => {
    const { container } = render(
      <ResponsiveContainer
        {...defaultProps}
        className="custom-container-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-container-class");
  });

  it("prevents horizontal overflow", () => {
    const { container } = render(<ResponsiveContainer {...defaultProps} />);

    expect(container.firstChild).toHaveClass("overflow-hidden");
  });

  it("applies full width and centering", () => {
    const { container } = render(<ResponsiveContainer {...defaultProps} />);

    expect(container.firstChild).toHaveClass("w-full", "mx-auto");
  });
});
