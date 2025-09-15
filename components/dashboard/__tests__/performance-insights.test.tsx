import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PerformanceInsights } from "../performance-insights";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("PerformanceInsights Component", () => {
  const mockInsights = [
    {
      type: "positive" as const,
      title: "Excellent Conversion Rate",
      description:
        "Your conversion rate of 5.2% is 30% above the platform average",
      priority: "medium" as const,
      actionUrl: "/dashboard/analytics/conversion",
      impact: "Continue current strategies to maintain high performance",
    },
    {
      type: "negative" as const,
      title: "Low Response Rate",
      description: "Your response rate of 65% is below the recommended 85%",
      priority: "high" as const,
      actionUrl: "/dashboard/messages",
      impact: "Improving response rate could increase conversions by 20%",
    },
    {
      type: "neutral" as const,
      title: "Average Performance",
      description: "Your overall performance is in line with platform averages",
      priority: "low" as const,
      impact: "Consider optimization strategies for improvement",
    },
  ];

  const mockPerformanceScore = {
    overall: 78,
    breakdown: {
      responseRate: 65,
      conversionRate: 85,
      customerRating: 80,
      verification: 75,
    },
    grade: "B+" as const,
    category: "Good" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render performance insights with score", () => {
    render(
      <PerformanceInsights
        insights={mockInsights}
        performanceScore={mockPerformanceScore}
      />
    );

    expect(screen.getByText("Performance Insights")).toBeInTheDocument();
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText("B+")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("should display all insights with correct styling", () => {
    render(<PerformanceInsights insights={mockInsights} />);

    // Positive insight
    const positiveInsight = screen
      .getByText("Excellent Conversion Rate")
      .closest("div");
    expect(positiveInsight).toHaveClass("border-green-200");

    // Negative insight
    const negativeInsight = screen
      .getByText("Low Response Rate")
      .closest("div");
    expect(negativeInsight).toHaveClass("border-red-200");

    // Neutral insight
    const neutralInsight = screen
      .getByText("Average Performance")
      .closest("div");
    expect(neutralInsight).toHaveClass("border-gray-200");
  });

  it("should show insight descriptions and impacts", () => {
    render(<PerformanceInsights insights={mockInsights} />);

    expect(
      screen.getByText(
        "Your conversion rate of 5.2% is 30% above the platform average"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your response rate of 65% is below the recommended 85%")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Improving response rate could increase conversions by 20%"
      )
    ).toBeInTheDocument();
  });

  it("should handle insight click navigation", () => {
    render(<PerformanceInsights insights={mockInsights} />);

    const conversionInsight = screen.getByText("Excellent Conversion Rate");
    fireEvent.click(conversionInsight);

    expect(mockPush).toHaveBeenCalledWith("/dashboard/analytics/conversion");
  });

  it("should prioritize high priority insights", () => {
    render(<PerformanceInsights insights={mockInsights} />);

    const highPriorityInsight = screen
      .getByText("Low Response Rate")
      .closest("div");
    expect(highPriorityInsight).toHaveClass("ring-2", "ring-red-500");
  });

  it("should show performance breakdown", () => {
    render(
      <PerformanceInsights
        insights={mockInsights}
        performanceScore={mockPerformanceScore}
        showBreakdown={true}
      />
    );

    expect(screen.getByText("Response Rate")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();
    expect(screen.getByText("Conversion Rate")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("Customer Rating")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("Verification")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("should handle empty insights", () => {
    render(<PerformanceInsights insights={[]} />);

    expect(screen.getByText("No insights available")).toBeInTheDocument();
    expect(
      screen.getByText("Keep monitoring your performance for new insights")
    ).toBeInTheDocument();
  });

  it("should show loading state", () => {
    render(<PerformanceInsights insights={[]} loading={true} />);

    expect(screen.getByText("Loading insights...")).toBeInTheDocument();
  });

  it("should handle error state", () => {
    render(
      <PerformanceInsights insights={[]} error="Failed to load insights" />
    );

    expect(screen.getByText("Error loading insights")).toBeInTheDocument();
    expect(screen.getByText("Failed to load insights")).toBeInTheDocument();
  });

  it("should filter insights by type", () => {
    render(
      <PerformanceInsights insights={mockInsights} filterType="positive" />
    );

    expect(screen.getByText("Excellent Conversion Rate")).toBeInTheDocument();
    expect(screen.queryByText("Low Response Rate")).not.toBeInTheDocument();
  });

  it("should limit number of insights displayed", () => {
    render(<PerformanceInsights insights={mockInsights} maxInsights={2} />);

    expect(screen.getByText("Excellent Conversion Rate")).toBeInTheDocument();
    expect(screen.getByText("Low Response Rate")).toBeInTheDocument();
    expect(screen.queryByText("Average Performance")).not.toBeInTheDocument();
  });

  it("should show insight icons", () => {
    render(<PerformanceInsights insights={mockInsights} />);

    expect(screen.getByTestId("positive-icon")).toBeInTheDocument();
    expect(screen.getByTestId("negative-icon")).toBeInTheDocument();
    expect(screen.getByTestId("neutral-icon")).toBeInTheDocument();
  });

  it("should handle refresh functionality", () => {
    const onRefresh = vi.fn();
    render(
      <PerformanceInsights insights={mockInsights} onRefresh={onRefresh} />
    );

    const refreshButton = screen.getByLabelText("Refresh insights");
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalled();
  });

  it("should show performance trend", () => {
    const trendData = [
      { period: "Week 1", score: 70 },
      { period: "Week 2", score: 75 },
      { period: "Week 3", score: 78 },
    ];

    render(
      <PerformanceInsights
        insights={mockInsights}
        performanceScore={mockPerformanceScore}
        trendData={trendData}
      />
    );

    expect(screen.getByTestId("performance-trend-chart")).toBeInTheDocument();
  });

  it("should handle insight dismissal", () => {
    const onDismissInsight = vi.fn();
    render(
      <PerformanceInsights
        insights={mockInsights}
        onDismissInsight={onDismissInsight}
        allowDismiss={true}
      />
    );

    const dismissButtons = screen.getAllByLabelText("Dismiss insight");
    fireEvent.click(dismissButtons[0]);

    expect(onDismissInsight).toHaveBeenCalledWith(0);
  });

  it("should show performance grade color correctly", () => {
    const excellentScore = {
      ...mockPerformanceScore,
      overall: 95,
      grade: "A+" as const,
    };

    render(
      <PerformanceInsights
        insights={mockInsights}
        performanceScore={excellentScore}
      />
    );

    const scoreElement = screen.getByText("95");
    expect(scoreElement).toHaveClass("text-green-600");
  });

  it("should handle keyboard navigation", () => {
    render(<PerformanceInsights insights={mockInsights} />);

    const firstInsight = screen.getByText("Excellent Conversion Rate");
    firstInsight.focus();

    fireEvent.keyDown(firstInsight, { key: "Enter" });
    expect(mockPush).toHaveBeenCalledWith("/dashboard/analytics/conversion");
  });

  it("should show detailed breakdown on hover", async () => {
    render(
      <PerformanceInsights
        insights={mockInsights}
        performanceScore={mockPerformanceScore}
        showBreakdown={true}
      />
    );

    const responseRateBar = screen.getByText("Response Rate").closest("div");
    fireEvent.mouseEnter(responseRateBar!);

    expect(screen.getByText("65% - Below recommended 85%")).toBeInTheDocument();
  });

  it("should handle compact view", () => {
    render(<PerformanceInsights insights={mockInsights} compact={true} />);

    const container = screen.getByTestId("performance-insights-container");
    expect(container).toHaveClass("compact");
  });

  it("should show action buttons for insights", () => {
    render(<PerformanceInsights insights={mockInsights} />);

    expect(screen.getByText("View Analytics")).toBeInTheDocument();
    expect(screen.getByText("Improve Response")).toBeInTheDocument();
  });

  it("should handle custom insight actions", () => {
    const onInsightAction = vi.fn();
    render(
      <PerformanceInsights
        insights={mockInsights}
        onInsightAction={onInsightAction}
      />
    );

    const actionButton = screen.getByText("View Analytics");
    fireEvent.click(actionButton);

    expect(onInsightAction).toHaveBeenCalledWith(
      "view-analytics",
      mockInsights[0]
    );
  });
});
