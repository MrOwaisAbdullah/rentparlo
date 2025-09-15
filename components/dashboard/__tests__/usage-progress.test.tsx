import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UsageProgress } from "../usage-progress";

describe("UsageProgress Component", () => {
  it("should render usage progress with basic props", () => {
    render(
      <UsageProgress
        label="Listings Used"
        used={15}
        limit={25}
        unit="listings"
      />
    );

    expect(screen.getByText("Listings Used")).toBeInTheDocument();
    expect(screen.getByText("15 / 25 listings")).toBeInTheDocument();
  });

  it("should calculate and display percentage correctly", () => {
    render(<UsageProgress label="Storage" used={750} limit={1000} unit="MB" />);

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("750 / 1000 MB")).toBeInTheDocument();
  });

  it("should show warning color when approaching limit", () => {
    render(
      <UsageProgress
        label="Featured Listings"
        used={8}
        limit={10}
        warningThreshold={80}
      />
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("bg-yellow-500");
  });

  it("should show danger color when at or over limit", () => {
    render(
      <UsageProgress
        label="API Calls"
        used={1000}
        limit={1000}
        warningThreshold={80}
      />
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("bg-red-500");
  });

  it("should show success color when usage is normal", () => {
    render(
      <UsageProgress
        label="Bandwidth"
        used={300}
        limit={1000}
        warningThreshold={80}
      />
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("bg-green-500");
  });

  it("should handle zero usage", () => {
    render(<UsageProgress label="New Feature" used={0} limit={100} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("0 / 100")).toBeInTheDocument();
  });

  it("should handle usage over limit", () => {
    render(<UsageProgress label="Overused" used={120} limit={100} />);

    expect(screen.getByText("120%")).toBeInTheDocument();
    expect(screen.getByText("120 / 100")).toBeInTheDocument();

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("bg-red-500");
  });

  it("should render without unit", () => {
    render(<UsageProgress label="Score" used={85} limit={100} />);

    expect(screen.getByText("85 / 100")).toBeInTheDocument();
  });

  it("should use default warning threshold", () => {
    render(<UsageProgress label="Default Warning" used={91} limit={100} />);

    // Default warning threshold is 90%
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("bg-yellow-500");
  });

  it("should show correct progress bar width", () => {
    render(<UsageProgress label="Width Test" used={60} limit={100} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveStyle("width: 60%");
  });

  it("should handle decimal values", () => {
    render(<UsageProgress label="Decimal" used={33.33} limit={100} />);

    expect(screen.getByText("33%")).toBeInTheDocument(); // Should round
    expect(screen.getByText("33.33 / 100")).toBeInTheDocument();
  });

  it("should show tooltip with detailed information", () => {
    render(
      <UsageProgress
        label="Detailed Info"
        used={75}
        limit={100}
        tooltip="This shows your current usage vs your plan limit"
      />
    );

    const container = screen.getByText("Detailed Info").closest("div");
    expect(container).toHaveAttribute(
      "title",
      "This shows your current usage vs your plan limit"
    );
  });

  it("should handle large numbers with formatting", () => {
    render(
      <UsageProgress
        label="Large Numbers"
        used={1500000}
        limit={2000000}
        unit="bytes"
        formatLargeNumbers={true}
      />
    );

    expect(screen.getByText("1.5M / 2.0M bytes")).toBeInTheDocument();
  });

  it("should show remaining amount when specified", () => {
    render(
      <UsageProgress
        label="With Remaining"
        used={30}
        limit={100}
        showRemaining={true}
      />
    );

    expect(screen.getByText("70 remaining")).toBeInTheDocument();
  });

  it("should handle animated progress bar", () => {
    render(
      <UsageProgress label="Animated" used={45} limit={100} animated={true} />
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("animate-pulse");
  });

  it("should show upgrade prompt when at limit", () => {
    render(
      <UsageProgress
        label="At Limit"
        used={100}
        limit={100}
        showUpgradePrompt={true}
      />
    );

    expect(screen.getByText("Upgrade Plan")).toBeInTheDocument();
  });

  it("should handle different sizes", () => {
    render(
      <UsageProgress label="Small Size" used={50} limit={100} size="sm" />
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("h-2");
  });

  it("should show status text", () => {
    render(
      <UsageProgress
        label="With Status"
        used={25}
        limit={100}
        statusText="Good usage level"
      />
    );

    expect(screen.getByText("Good usage level")).toBeInTheDocument();
  });

  it("should handle custom color scheme", () => {
    render(
      <UsageProgress
        label="Custom Colors"
        used={50}
        limit={100}
        colorScheme="blue"
      />
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("bg-blue-500");
  });

  it("should show icon when provided", () => {
    const TestIcon = () => <span data-testid="test-icon">📊</span>;

    render(
      <UsageProgress label="With Icon" used={50} limit={100} icon={TestIcon} />
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("should handle loading state", () => {
    render(
      <UsageProgress label="Loading" used={0} limit={100} loading={true} />
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("animate-pulse");
  });

  it("should show trend indicator", () => {
    render(
      <UsageProgress
        label="With Trend"
        used={60}
        limit={100}
        trend="up"
        trendValue={5}
      />
    );

    expect(screen.getByText("+5%")).toBeInTheDocument();
  });

  it("should handle accessibility attributes", () => {
    render(
      <UsageProgress
        label="Accessible"
        used={75}
        limit={100}
        ariaLabel="Storage usage progress"
      />
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-label", "Storage usage progress");
    expect(progressBar).toHaveAttribute("aria-valuenow", "75");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
  });
});
