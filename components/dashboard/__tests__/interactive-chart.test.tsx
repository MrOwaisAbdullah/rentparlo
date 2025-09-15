import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InteractiveChart } from "../interactive-chart";

const mockChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  datasets: [
    {
      label: "Views",
      data: [100, 150, 120, 180, 200],
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
    },
    {
      label: "Contacts",
      data: [5, 8, 6, 9, 12],
      borderColor: "rgb(16, 185, 129)",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
    },
  ],
};

const mockChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Views and Contacts Trend",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

describe("InteractiveChart Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render line chart by default", () => {
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
      />
    );

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should render bar chart when type is bar", () => {
    render(
      <InteractiveChart
        type="bar"
        data={mockChartData}
        options={mockChartOptions}
      />
    );

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should render pie chart when type is pie", () => {
    const pieData = {
      labels: ["Mobile", "Desktop", "Tablet"],
      datasets: [
        {
          data: [60, 35, 5],
          backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
        },
      ],
    };

    render(
      <InteractiveChart type="pie" data={pieData} options={mockChartOptions} />
    );

    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("should render doughnut chart when type is doughnut", () => {
    const doughnutData = {
      labels: ["Karachi", "Lahore", "Islamabad"],
      datasets: [
        {
          data: [45, 35, 20],
          backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
        },
      ],
    };

    render(
      <InteractiveChart
        type="doughnut"
        data={doughnutData}
        options={mockChartOptions}
      />
    );

    expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
  });

  it("should apply custom height when provided", () => {
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        height={400}
      />
    );

    const chartContainer = screen.getByTestId("line-chart").parentElement;
    expect(chartContainer).toHaveStyle({ height: "400px" });
  });

  it("should be responsive by default", () => {
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        responsive={true}
      />
    );

    const chartContainer = screen.getByTestId("line-chart").parentElement;
    expect(chartContainer).toHaveClass("w-full");
  });

  it("should handle loading state", () => {
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        loading={true}
      />
    );

    expect(screen.getByTestId("chart-loading")).toBeInTheDocument();
    expect(screen.getByText("Loading chart...")).toBeInTheDocument();
  });

  it("should handle error state", () => {
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        error="Failed to load chart data"
      />
    );

    expect(screen.getByTestId("chart-error")).toBeInTheDocument();
    expect(screen.getByText("Failed to load chart data")).toBeInTheDocument();
  });

  it("should handle empty data state", () => {
    const emptyData = {
      labels: [],
      datasets: [],
    };

    render(
      <InteractiveChart
        type="line"
        data={emptyData}
        options={mockChartOptions}
      />
    );

    expect(screen.getByTestId("chart-empty")).toBeInTheDocument();
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("should show chart controls when interactive", () => {
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        interactive={true}
      />
    );

    expect(screen.getByTestId("chart-controls")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /zoom in/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /zoom out/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset zoom/i })
    ).toBeInTheDocument();
  });

  it("should handle zoom controls", () => {
    const onZoom = vi.fn();
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        interactive={true}
        onZoom={onZoom}
      />
    );

    const zoomInButton = screen.getByRole("button", { name: /zoom in/i });
    fireEvent.click(zoomInButton);

    expect(onZoom).toHaveBeenCalledWith("in");
  });

  it("should show data point tooltip on hover", () => {
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        showTooltip={true}
      />
    );

    const chart = screen.getByTestId("line-chart");
    fireEvent.mouseMove(chart, { clientX: 100, clientY: 100 });

    // Tooltip would be shown by Chart.js, we just verify the option is passed
    const chartData = JSON.parse(chart.getAttribute("data-chart-data") || "{}");
    expect(chartData).toEqual(mockChartData);
  });

  it("should handle chart type switching", () => {
    const onTypeChange = vi.fn();
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        allowTypeSwitch={true}
        onTypeChange={onTypeChange}
      />
    );

    expect(screen.getByTestId("chart-type-selector")).toBeInTheDocument();

    const barTypeButton = screen.getByRole("button", { name: /bar chart/i });
    fireEvent.click(barTypeButton);

    expect(onTypeChange).toHaveBeenCalledWith("bar");
  });

  it("should export chart data", () => {
    const onExport = vi.fn();
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        exportable={true}
        onExport={onExport}
      />
    );

    const exportButton = screen.getByRole("button", { name: /export chart/i });
    fireEvent.click(exportButton);

    expect(onExport).toHaveBeenCalledWith(mockChartData, "png");
  });

  it("should handle fullscreen mode", () => {
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        allowFullscreen={true}
      />
    );

    const fullscreenButton = screen.getByRole("button", {
      name: /fullscreen/i,
    });
    fireEvent.click(fullscreenButton);

    expect(screen.getByTestId("chart-fullscreen")).toBeInTheDocument();
  });

  it("should apply custom theme", () => {
    const customTheme = {
      backgroundColor: "#1f2937",
      textColor: "#ffffff",
      gridColor: "#374151",
    };

    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        theme={customTheme}
      />
    );

    const chartContainer = screen.getByTestId("line-chart").parentElement;
    expect(chartContainer).toHaveStyle({ backgroundColor: "#1f2937" });
  });

  it("should handle animation settings", () => {
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        animated={false}
      />
    );

    // Animation would be handled by Chart.js options
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should show legend when enabled", () => {
    render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
        showLegend={true}
      />
    );

    expect(screen.getByTestId("chart-legend")).toBeInTheDocument();
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getByText("Contacts")).toBeInTheDocument();
  });

  it("should handle data updates", () => {
    const { rerender } = render(
      <InteractiveChart
        type="line"
        data={mockChartData}
        options={mockChartOptions}
      />
    );

    const updatedData = {
      ...mockChartData,
      datasets: [
        {
          ...mockChartData.datasets[0],
          data: [120, 170, 140, 200, 220], // Updated values
        },
      ],
    };

    rerender(
      <InteractiveChart
        type="line"
        data={updatedData}
        options={mockChartOptions}
      />
    );

    const chart = screen.getByTestId("line-chart");
    const chartData = JSON.parse(chart.getAttribute("data-chart-data") || "{}");
    expect(chartData.datasets[0].data).toEqual([120, 170, 140, 200, 220]);
  });
});
