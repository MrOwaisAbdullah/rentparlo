import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricsCard } from "../metrics-card";
import { TrendingUp, TrendingDown, Eye, Users } from "lucide-react";

describe("MetricsCard Component", () => {
  it("should render basic metrics card", () => {
    render(<MetricsCard title="Total Views" value="1,500" icon={Eye} />);

    expect(screen.getByText("Total Views")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should display positive change with green color", () => {
    render(
      <MetricsCard
        title="Total Contacts"
        value="75"
        change={15.5}
        changeType="increase"
        icon={Users}
      />
    );

    expect(screen.getByText("Total Contacts")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("+15.5%")).toBeInTheDocument();

    const changeElement = screen.getByText("+15.5%");
    expect(changeElement).toHaveClass("text-green-600");
  });

  it("should display negative change with red color", () => {
    render(
      <MetricsCard
        title="Conversion Rate"
        value="3.2%"
        change={-2.1}
        changeType="decrease"
        icon={TrendingDown}
      />
    );

    expect(screen.getByText("Conversion Rate")).toBeInTheDocument();
    expect(screen.getByText("3.2%")).toBeInTheDocument();
    expect(screen.getByText("-2.1%")).toBeInTheDocument();

    const changeElement = screen.getByText("-2.1%");
    expect(changeElement).toHaveClass("text-red-600");
  });

  it("should display neutral change with gray color", () => {
    render(
      <MetricsCard
        title="Active Listings"
        value="12"
        change={0}
        changeType="neutral"
        icon={Eye}
      />
    );

    expect(screen.getByText("Active Listings")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();

    const changeElement = screen.getByText("0%");
    expect(changeElement).toHaveClass("text-gray-600");
  });

  it("should render trend sparkline when provided", () => {
    const trendData = [10, 15, 12, 18, 22, 20, 25];

    render(
      <MetricsCard
        title="Views Trend"
        value="1,200"
        trend={trendData}
        icon={TrendingUp}
      />
    );

    expect(screen.getByText("Views Trend")).toBeInTheDocument();
    expect(screen.getByTestId("trend-sparkline")).toBeInTheDocument();
  });

  it("should handle large numbers with proper formatting", () => {
    render(
      <MetricsCard title="Total Impressions" value={1234567} icon={Eye} />
    );

    expect(screen.getByText("Total Impressions")).toBeInTheDocument();
    expect(screen.getByText("1.23M")).toBeInTheDocument();
  });

  it("should handle decimal values correctly", () => {
    render(<MetricsCard title="Average Rating" value={4.7} icon={Users} />);

    expect(screen.getByText("Average Rating")).toBeInTheDocument();
    expect(screen.getByText("4.7")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    render(
      <MetricsCard title="Loading Metric" value="" loading={true} icon={Eye} />
    );

    expect(screen.getByText("Loading Metric")).toBeInTheDocument();
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = vi.fn();

    render(
      <MetricsCard
        title="Clickable Metric"
        value="100"
        icon={Eye}
        onClick={handleClick}
      />
    );

    const card = screen.getByRole("button");
    card.click();

    expect(handleClick).toHaveBeenCalled();
  });

  it("should show tooltip on hover", async () => {
    render(
      <MetricsCard
        title="Metric with Tooltip"
        value="500"
        tooltip="This shows the total number of views for all your listings"
        icon={Eye}
      />
    );

    const card = screen.getByText("Metric with Tooltip").closest("div");
    expect(card).toHaveAttribute(
      "title",
      "This shows the total number of views for all your listings"
    );
  });

  it("should display subtitle when provided", () => {
    render(
      <MetricsCard
        title="Total Revenue"
        subtitle="This month"
        value="₹25,000"
        icon={Users}
      />
    );

    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("This month")).toBeInTheDocument();
    expect(screen.getByText("₹25,000")).toBeInTheDocument();
  });

  it("should handle different card sizes", () => {
    render(<MetricsCard title="Small Card" value="10" size="sm" icon={Eye} />);

    const card = screen.getByText("Small Card").closest("div");
    expect(card).toHaveClass("p-4"); // Smaller padding for small size
  });

  it("should show comparison with previous period", () => {
    render(
      <MetricsCard
        title="Monthly Views"
        value="2,500"
        previousValue="2,000"
        change={25}
        changeType="increase"
        icon={Eye}
      />
    );

    expect(screen.getByText("Monthly Views")).toBeInTheDocument();
    expect(screen.getByText("2,500")).toBeInTheDocument();
    expect(screen.getByText("vs 2,000 last period")).toBeInTheDocument();
    expect(screen.getByText("+25%")).toBeInTheDocument();
  });

  it("should handle error state", () => {
    render(
      <MetricsCard
        title="Error Metric"
        value=""
        error="Failed to load data"
        icon={Eye}
      />
    );

    expect(screen.getByText("Error Metric")).toBeInTheDocument();
    expect(screen.getByText("Failed to load data")).toBeInTheDocument();
    expect(screen.getByTestId("error-icon")).toBeInTheDocument();
  });

  it("should render custom content in footer", () => {
    render(
      <MetricsCard
        title="Custom Footer"
        value="100"
        icon={Eye}
        footer={<button>View Details</button>}
      />
    );

    expect(screen.getByText("Custom Footer")).toBeInTheDocument();
    expect(screen.getByText("View Details")).toBeInTheDocument();
  });
});
