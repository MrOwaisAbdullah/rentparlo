import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AnalyticsDashboard } from "../analytics-dashboard";
import { mockAnalyticsData } from "../../../tests/setup";

// Mock child components
vi.mock("../interactive-chart", () => ({
  InteractiveChart: ({ type, data, title }: any) => (
    <div data-testid={`chart-${type}`}>
      <h3>{title}</h3>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

vi.mock("../data-table", () => ({
  DataTable: ({ data, columns, title }: any) => (
    <div data-testid="data-table">
      <h3>{title}</h3>
      <div data-testid="table-rows">{data.length} rows</div>
    </div>
  ),
}));

vi.mock("../export-button", () => ({
  ExportButton: ({ data, filename, format }: any) => (
    <button data-testid="export-button">
      Export {format.toUpperCase()} ({data.length} items)
    </button>
  ),
}));

const mockTimeRange = {
  start: "2024-01-01",
  end: "2024-01-31",
  preset: "month" as const,
};

describe("AnalyticsDashboard Component", () => {
  const defaultProps = {
    timeRange: mockTimeRange,
    onTimeRangeChange: vi.fn(),
    data: mockAnalyticsData,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render analytics dashboard with all sections", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Trends")).toBeInTheDocument();
    expect(screen.getByText("Geographic Performance")).toBeInTheDocument();
    expect(screen.getByText("Device Analytics")).toBeInTheDocument();
  });

  it("should display time range selector", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    expect(screen.getByText("Time Range")).toBeInTheDocument();
    expect(screen.getByDisplayValue("This Month")).toBeInTheDocument();
  });

  it("should handle time range changes", () => {
    const onTimeRangeChange = vi.fn();
    render(
      <AnalyticsDashboard
        {...defaultProps}
        onTimeRangeChange={onTimeRangeChange}
      />
    );

    const timeRangeSelect = screen.getByDisplayValue("This Month");
    fireEvent.change(timeRangeSelect, { target: { value: "week" } });

    expect(onTimeRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({ preset: "week" })
    );
  });

  it("should display overview metrics", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    expect(screen.getByText("1,500")).toBeInTheDocument(); // Total Views
    expect(screen.getByText("75")).toBeInTheDocument(); // Total Contacts
    expect(screen.getByText("5.0%")).toBeInTheDocument(); // Conversion Rate
    expect(screen.getByText("1,200")).toBeInTheDocument(); // Unique Visitors
  });

  it("should render trend charts", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    expect(screen.getByTestId("chart-line")).toBeInTheDocument();
    expect(screen.getByText("Views & Contacts Trend")).toBeInTheDocument();
  });

  it("should display geographic performance chart", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    expect(screen.getByTestId("chart-bar")).toBeInTheDocument();
    expect(screen.getByText("Performance by City")).toBeInTheDocument();
  });

  it("should show device analytics pie chart", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    expect(screen.getByTestId("chart-pie")).toBeInTheDocument();
    expect(screen.getByText("Traffic by Device")).toBeInTheDocument();
  });

  it("should display listing performance table", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Listing Performance")).toBeInTheDocument();
    expect(screen.getByText("1 rows")).toBeInTheDocument();
  });

  it("should show export functionality", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    const exportButtons = screen.getAllByTestId("export-button");
    expect(exportButtons.length).toBeGreaterThan(0);
    expect(screen.getByText(/Export CSV/)).toBeInTheDocument();
  });

  it("should handle loading state", () => {
    render(<AnalyticsDashboard {...defaultProps} loading={true} />);

    expect(screen.getByText("Loading analytics...")).toBeInTheDocument();
    expect(screen.getAllByTestId("loading-skeleton")).toHaveLength(4);
  });

  it("should handle empty data state", () => {
    const emptyData = {
      ...mockAnalyticsData,
      overview: {
        ...mockAnalyticsData.overview,
        totalViews: 0,
        totalContacts: 0,
      },
      trends: [],
      listings: [],
    };

    render(<AnalyticsDashboard {...defaultProps} data={emptyData} />);

    expect(screen.getByText("No analytics data available")).toBeInTheDocument();
    expect(
      screen.getByText("Start creating listings to see analytics")
    ).toBeInTheDocument();
  });

  it("should filter data by time range", () => {
    const customTimeRange = {
      start: "2024-01-15",
      end: "2024-01-31",
      preset: "custom" as const,
    };

    render(
      <AnalyticsDashboard {...defaultProps} timeRange={customTimeRange} />
    );

    // Should show filtered date range in the header
    expect(screen.getByText("Jan 15 - Jan 31, 2024")).toBeInTheDocument();
  });

  it("should toggle between different chart views", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    const chartToggle = screen.getByRole("button", { name: /chart type/i });
    fireEvent.click(chartToggle);

    // Should show chart type options
    expect(screen.getByText("Line Chart")).toBeInTheDocument();
    expect(screen.getByText("Bar Chart")).toBeInTheDocument();
    expect(screen.getByText("Area Chart")).toBeInTheDocument();
  });

  it("should show detailed metrics on hover", async () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    const metricsCard = screen.getByText("Total Views").closest("div");
    fireEvent.mouseEnter(metricsCard!);

    await waitFor(() => {
      expect(screen.getByText("Average daily views: 48.4")).toBeInTheDocument();
    });
  });

  it("should handle refresh data action", () => {
    const onRefresh = vi.fn();
    render(<AnalyticsDashboard {...defaultProps} onRefresh={onRefresh} />);

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalled();
  });

  it("should display conversion funnel", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    expect(screen.getByText("Conversion Funnel")).toBeInTheDocument();
    expect(screen.getByText("Views → Contacts")).toBeInTheDocument();
    expect(screen.getByText("1,500 → 75")).toBeInTheDocument();
  });

  it("should show performance insights", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    expect(screen.getByText("Performance Insights")).toBeInTheDocument();
    expect(
      screen.getByText("Your conversion rate is above average")
    ).toBeInTheDocument();
  });

  it("should handle error state", () => {
    const error = new Error("Failed to load analytics");
    render(<AnalyticsDashboard {...defaultProps} error={error} />);

    expect(screen.getByText("Error loading analytics")).toBeInTheDocument();
    expect(screen.getByText("Failed to load analytics")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("should support custom date range selection", () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    const customRangeButton = screen.getByText("Custom Range");
    fireEvent.click(customRangeButton);

    expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
  });

  it("should show comparison with previous period", () => {
    render(<AnalyticsDashboard {...defaultProps} showComparison={true} />);

    expect(screen.getByText("vs Previous Period")).toBeInTheDocument();
    expect(screen.getByText("+15.5%")).toBeInTheDocument(); // Example change
  });

  it("should handle real-time updates", async () => {
    const { rerender } = render(<AnalyticsDashboard {...defaultProps} />);

    const updatedData = {
      ...mockAnalyticsData,
      overview: {
        ...mockAnalyticsData.overview,
        totalViews: 1600, // Updated value
      },
    };

    rerender(<AnalyticsDashboard {...defaultProps} data={updatedData} />);

    await waitFor(() => {
      expect(screen.getByText("1,600")).toBeInTheDocument();
    });
  });
});
