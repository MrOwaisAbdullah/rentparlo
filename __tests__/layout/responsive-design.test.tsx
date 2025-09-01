import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  UniversalPageLayout,
  ResponsiveContainer,
} from "@/components/layout/universal-page-layout";

// Mock the sidebar context
vi.mock("@/contexts/sidebar-context", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
}));

// Mock the universal sidebar component
vi.mock("@/components/layout/universal-sidebar", () => ({
  UniversalSidebar: () => <div data-testid="universal-sidebar">Sidebar</div>,
}));

describe("Responsive Design Tests", () => {
  describe("UniversalPageLayout Responsive Behavior", () => {
    it("applies mobile-first responsive classes", () => {
      const { container } = render(
        <UniversalPageLayout pageType="search" showSidebar={true}>
          <div>Content</div>
        </UniversalPageLayout>
      );

      // Check for mobile-first flex layout
      const flexContainer = container.querySelector(".flex.gap-6");
      expect(flexContainer).toHaveClass("flex-col", "lg:flex-row");
    });

    it("applies correct sidebar width classes", () => {
      const { container } = render(
        <UniversalPageLayout pageType="search" showSidebar={true}>
          <div>Content</div>
        </UniversalPageLayout>
      );

      // Check sidebar container has responsive width classes
      const sidebarContainer = container.querySelector(
        '[data-testid="universal-sidebar"]'
      )?.parentElement;
      expect(sidebarContainer).toHaveClass("w-full", "lg:w-80");
    });

    it("applies correct content flex classes", () => {
      const { container } = render(
        <UniversalPageLayout pageType="search" showSidebar={true}>
          <div data-testid="content">Content</div>
        </UniversalPageLayout>
      );

      // Check main content has flex-1 and min-w-0 to prevent overflow
      const contentContainer = container.querySelector(
        '[data-testid="content"]'
      )?.parentElement;
      expect(contentContainer).toHaveClass("flex-1", "min-w-0");
    });

    it("positions sidebar correctly for left placement", () => {
      const { container } = render(
        <UniversalPageLayout
          pageType="search"
          showSidebar={true}
          sidebarPosition="left"
        >
          <div>Content</div>
        </UniversalPageLayout>
      );

      const flexContainer = container.querySelector(".flex.gap-6");
      expect(flexContainer).toHaveClass("lg:flex-row-reverse");
    });

    it("stacks content vertically on mobile", () => {
      const { container } = render(
        <UniversalPageLayout pageType="search" showSidebar={true}>
          <div>Content</div>
        </UniversalPageLayout>
      );

      const flexContainer = container.querySelector(".flex.gap-6");
      expect(flexContainer).toHaveClass("flex-col");
    });
  });

  describe("ResponsiveContainer", () => {
    it("applies default responsive classes", () => {
      const { container } = render(
        <ResponsiveContainer>
          <div>Content</div>
        </ResponsiveContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveClass(
        "w-full",
        "mx-auto",
        "max-w-7xl",
        "px-4",
        "sm:px-6",
        "lg:px-8",
        "overflow-hidden"
      );
    });

    it("applies custom max-width classes", () => {
      const { container } = render(
        <ResponsiveContainer maxWidth="lg">
          <div>Content</div>
        </ResponsiveContainer>
      );

      expect(container.firstChild).toHaveClass("max-w-lg");
    });

    it("applies custom padding classes", () => {
      const { container } = render(
        <ResponsiveContainer padding="sm">
          <div>Content</div>
        </ResponsiveContainer>
      );

      expect(container.firstChild).toHaveClass("px-2", "sm:px-4");
    });

    it("applies no padding when specified", () => {
      const { container } = render(
        <ResponsiveContainer padding="none">
          <div>Content</div>
        </ResponsiveContainer>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).not.toHaveClass("px-2", "px-4", "px-6", "px-8");
    });

    it("prevents horizontal overflow", () => {
      const { container } = render(
        <ResponsiveContainer>
          <div>Content</div>
        </ResponsiveContainer>
      );

      expect(container.firstChild).toHaveClass("overflow-hidden");
    });

    it("applies custom className while preserving responsive classes", () => {
      const { container } = render(
        <ResponsiveContainer className="custom-class">
          <div>Content</div>
        </ResponsiveContainer>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(
        "custom-class",
        "w-full",
        "mx-auto",
        "overflow-hidden"
      );
    });
  });

  describe("Horizontal Scroll Prevention", () => {
    it("ensures layout components have overflow-hidden", () => {
      const { container } = render(
        <UniversalPageLayout pageType="search" showSidebar={true}>
          <ResponsiveContainer>
            <div style={{ width: "200vw" }}>Very wide content</div>
          </ResponsiveContainer>
        </UniversalPageLayout>
      );

      // Check that ResponsiveContainer has overflow-hidden
      const responsiveContainer = container.querySelector(".overflow-hidden");
      expect(responsiveContainer).toBeInTheDocument();
    });

    it("applies min-w-0 to prevent flex item overflow", () => {
      const { container } = render(
        <UniversalPageLayout pageType="search" showSidebar={true}>
          <div data-testid="content">Content</div>
        </UniversalPageLayout>
      );

      const contentContainer = container.querySelector(
        '[data-testid="content"]'
      )?.parentElement;
      expect(contentContainer).toHaveClass("min-w-0");
    });
  });

  describe("Container Sizing", () => {
    it("applies correct container classes", () => {
      const { container } = render(
        <UniversalPageLayout pageType="search">
          <div>Content</div>
        </UniversalPageLayout>
      );

      const containerElement = container.querySelector(".container");
      expect(containerElement).toHaveClass("mx-auto", "px-4", "py-6");
    });

    it("allows custom container className", () => {
      const { container } = render(
        <UniversalPageLayout
          pageType="search"
          containerClassName="custom-container"
        >
          <div>Content</div>
        </UniversalPageLayout>
      );

      const containerElement = container.querySelector(".custom-container");
      expect(containerElement).toBeInTheDocument();
    });

    it("allows custom content className", () => {
      const { container } = render(
        <UniversalPageLayout
          pageType="search"
          contentClassName="custom-content"
        >
          <div data-testid="content">Content</div>
        </UniversalPageLayout>
      );

      const contentContainer = container.querySelector(
        '[data-testid="content"]'
      )?.parentElement;
      expect(contentContainer).toHaveClass("custom-content");
    });
  });
});
