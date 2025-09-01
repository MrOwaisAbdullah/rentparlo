import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  useBreakpoint,
} from "@/components/layout/responsive-container";
import { ResponsiveFilterPanel } from "@/components/search/responsive-filter-panel";
import { ResponsiveSearchResults } from "@/components/search/responsive-search-results";

// Mock window.innerWidth for breakpoint testing
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
};

// Mock component to test useBreakpoint hook
function TestBreakpointComponent() {
  const breakpoint = useBreakpoint();
  return <div data-testid="breakpoint">{breakpoint}</div>;
}

describe("Responsive Design Components", () => {
  beforeEach(() => {
    // Reset to desktop width
    mockInnerWidth(1024);
  });

  describe("useBreakpoint hook", () => {
    it("should return correct breakpoint for mobile", () => {
      mockInnerWidth(320);
      render(<TestBreakpointComponent />);
      expect(screen.getByTestId("breakpoint")).toHaveTextContent("mobile");
    });

    it("should return correct breakpoint for tablet", () => {
      mockInnerWidth(768);
      render(<TestBreakpointComponent />);
      expect(screen.getByTestId("breakpoint")).toHaveTextContent("tablet");
    });

    it("should return correct breakpoint for desktop", () => {
      mockInnerWidth(1024);
      render(<TestBreakpointComponent />);
      expect(screen.getByTestId("breakpoint")).toHaveTextContent("desktop");
    });

    it("should return correct breakpoint for wide", () => {
      mockInnerWidth(1440);
      render(<TestBreakpointComponent />);
      expect(screen.getByTestId("breakpoint")).toHaveTextContent("wide");
    });
  });

  describe("ResponsiveContainer", () => {
    it("should render with overflow hidden by default", () => {
      render(
        <ResponsiveContainer data-testid="container">
          <div>Test content</div>
        </ResponsiveContainer>
      );

      const container = screen.getByTestId("container");
      expect(container).toHaveClass("overflow-hidden");
    });

    it("should apply correct max-width classes", () => {
      render(
        <ResponsiveContainer maxWidth="lg" data-testid="container">
          <div>Test content</div>
        </ResponsiveContainer>
      );

      const container = screen.getByTestId("container");
      expect(container).toHaveClass("max-w-lg");
    });

    it("should apply correct padding classes", () => {
      render(
        <ResponsiveContainer padding="lg" data-testid="container">
          <div>Test content</div>
        </ResponsiveContainer>
      );

      const container = screen.getByTestId("container");
      expect(container).toHaveClass("px-6", "sm:px-8", "lg:px-12");
    });

    it("should prevent horizontal scroll when enabled", () => {
      render(
        <ResponsiveContainer
          preventHorizontalScroll={true}
          data-testid="container"
        >
          <div>Test content</div>
        </ResponsiveContainer>
      );

      const container = screen.getByTestId("container");
      expect(container).toHaveClass("overflow-hidden");
    });
  });

  describe("ResponsiveGrid", () => {
    it("should apply correct grid column classes", () => {
      render(
        <ResponsiveGrid
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          data-testid="grid"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId("grid");
      expect(grid).toHaveClass(
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3"
      );
    });

    it("should apply gap classes correctly", () => {
      render(
        <ResponsiveGrid gap="lg" data-testid="grid">
          <div>Item 1</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId("grid");
      expect(grid).toHaveClass("gap-6", "sm:gap-8");
    });

    it("should prevent overflow when enabled", () => {
      render(
        <ResponsiveGrid preventOverflow={true} data-testid="grid">
          <div>Item 1</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId("grid");
      expect(grid).toHaveClass("overflow-hidden", "min-w-0");
    });
  });

  describe("ResponsiveFlex", () => {
    it("should apply correct flex direction classes", () => {
      render(
        <ResponsiveFlex direction="col" data-testid="flex">
          <div>Item 1</div>
        </ResponsiveFlex>
      );

      const flex = screen.getByTestId("flex");
      expect(flex).toHaveClass("flex-col");
    });

    it("should apply correct alignment classes", () => {
      render(
        <ResponsiveFlex align="center" justify="between" data-testid="flex">
          <div>Item 1</div>
        </ResponsiveFlex>
      );

      const flex = screen.getByTestId("flex");
      expect(flex).toHaveClass("items-center", "justify-between");
    });

    it("should wrap by default", () => {
      render(
        <ResponsiveFlex data-testid="flex">
          <div>Item 1</div>
        </ResponsiveFlex>
      );

      const flex = screen.getByTestId("flex");
      expect(flex).toHaveClass("flex-wrap");
    });

    it("should prevent overflow when enabled", () => {
      render(
        <ResponsiveFlex preventOverflow={true} data-testid="flex">
          <div>Item 1</div>
        </ResponsiveFlex>
      );

      const flex = screen.getByTestId("flex");
      expect(flex).toHaveClass("overflow-hidden", "min-w-0");
    });
  });

  describe("ResponsiveSearchResults", () => {
    it("should show loading state", () => {
      render(
        <ResponsiveSearchResults isLoading={true}>
          <div>Results</div>
        </ResponsiveSearchResults>
      );

      expect(screen.getByText("Loading results...")).toBeInTheDocument();
    });

    it("should show error state with retry button", () => {
      const onRetry = vi.fn();
      render(
        <ResponsiveSearchResults error="Something went wrong" onRetry={onRetry}>
          <div>Results</div>
        </ResponsiveSearchResults>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalled();
    });

    it("should show empty state when no results", () => {
      render(
        <ResponsiveSearchResults totalResults={0} emptyMessage="No items found">
          <div>Results</div>
        </ResponsiveSearchResults>
      );

      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    it("should show results with pagination", () => {
      const onPageChange = vi.fn();
      render(
        <ResponsiveSearchResults
          totalResults={50}
          currentPage={1}
          totalPages={5}
          onPageChange={onPageChange}
        >
          <div>Result 1</div>
          <div>Result 2</div>
        </ResponsiveSearchResults>
      );

      expect(screen.getByText("50 results found")).toBeInTheDocument();
      expect(screen.getByText("Result 1")).toBeInTheDocument();
      expect(screen.getByText("Result 2")).toBeInTheDocument();
    });
  });

  describe("Horizontal Scroll Prevention", () => {
    it("should not cause horizontal overflow with long content", () => {
      const { container } = render(
        <ResponsiveContainer data-testid="container">
          <div style={{ width: "2000px" }}>Very wide content</div>
        </ResponsiveContainer>
      );

      const responsiveContainer = container.firstChild as HTMLElement;
      expect(responsiveContainer).toHaveClass("overflow-hidden");
    });

    it("should handle flex items that want to overflow", () => {
      render(
        <ResponsiveFlex preventOverflow={true} data-testid="flex">
          <div style={{ minWidth: "500px" }}>Wide item 1</div>
          <div style={{ minWidth: "500px" }}>Wide item 2</div>
          <div style={{ minWidth: "500px" }}>Wide item 3</div>
        </ResponsiveFlex>
      );

      const flex = screen.getByTestId("flex");
      expect(flex).toHaveClass("overflow-hidden", "min-w-0");
    });

    it("should handle grid items properly", () => {
      render(
        <ResponsiveGrid
          columns={{ mobile: 4, tablet: 6, desktop: 8 }}
          preventOverflow={true}
          data-testid="grid"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i}>Item {i + 1}</div>
          ))}
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId("grid");
      expect(grid).toHaveClass("overflow-hidden", "min-w-0");
    });
  });

  describe("Mobile Responsiveness", () => {
    beforeEach(() => {
      mockInnerWidth(375); // iPhone width
    });

    it("should stack flex items on mobile", () => {
      render(
        <ResponsiveFlex
          direction="row"
          className="lg:flex-row"
          data-testid="flex"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveFlex>
      );

      const flex = screen.getByTestId("flex");
      expect(flex).toHaveClass("flex-row");
    });

    it("should use single column grid on mobile", () => {
      render(
        <ResponsiveGrid
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          data-testid="grid"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId("grid");
      expect(grid).toHaveClass("grid-cols-1");
    });
  });
});

describe("CSS Utilities", () => {
  it("should apply prevent-horizontal-scroll class correctly", () => {
    render(
      <div className="prevent-horizontal-scroll" data-testid="element">
        Content
      </div>
    );

    const element = screen.getByTestId("element");
    expect(element).toHaveClass("prevent-horizontal-scroll");
  });

  it("should apply responsive-container class correctly", () => {
    render(
      <div className="responsive-container" data-testid="element">
        Content
      </div>
    );

    const element = screen.getByTestId("element");
    expect(element).toHaveClass("responsive-container");
  });

  it("should apply truncate-responsive class correctly", () => {
    render(
      <div className="truncate-responsive" data-testid="element">
        Very long text that should be truncated
      </div>
    );

    const element = screen.getByTestId("element");
    expect(element).toHaveClass("truncate-responsive");
  });
});
