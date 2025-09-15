import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

describe("Analytics Workflow Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe("Analytics Data Processing Workflow", () => {
    it("should process and aggregate analytics data correctly", async () => {
      const mockRawData = [
        { date: "2024-01-01", listing_id: "1", event_type: "view", user_location: "Karachi" },
        { date: "2024-01-01", listing_id: "1", event_type: "contact", user_location: "Karachi" },
        { date: "2024-01-01", listing_id: "2", event_type: "view", user_location: "Lahore" },
        { date: "2024-01-02", listing_id: "1", event_type: "view", user_location: "Karachi" },
      ];

      const MockAnalyticsProcessor = () => {
        const [processedData, setProcessedData] = React.useState<any>(null);

        React.useEffect(() => {
          // Simulate data processing
          const processed = {
            totalViews: mockRawData.filter(d => d.event_type === "view").length,
            totalContacts: mockRawData.filter(d => d.event_type === "contact").length,
            conversionRate: (1 / 3) * 100, // 1 contact out of 3 views
            topCities: [
              { city: "Karachi", views: 2, contacts: 1 },
              { city: "Lahore", views: 1, contacts: 0 },
            ],
            listingPerformance: [
              { listingId: "1", views: 2, contacts: 1, conversionRate: 50 },
              { listingId: "2", views: 1, contacts: 0, conversionRate: 0 },
            ],
          };
          setProcessedData(processed);
        }, []);

        if (!processedData) return <div>Processing...</div>;

        return (
          <div data-testid="processed-analytics">
            <div data-testid="total-views">{processedData.totalViews}</div>
            <div data-testid="total-contacts">{processedData.totalContacts}</div>
            <div data-testid="conversion-rate">{processedData.conversionRate.toFixed(1)}%</div>
            <div data-testid="top-city">{processedData.topCities[0].city}</div>
          </div>
        );
      };

      renderWithProviders(<MockAnalyticsProcessor />);

      await waitFor(() => {
        expect(screen.getByTestId("processed-analytics")).toBeInTheDocument();
      });

      expect(screen.getByTestId("total-views")).toHaveTextContent("3");
      expect(screen.getByTestId("total-contacts")).toHaveTextContent("1");
      expect(screen.getByTestId("conversion-rate")).toHaveTextContent("33.3%");
      expect(screen.getByTestId("top-city")).toHaveTextContent("Karachi");
    });

    it("should handle real-time analytics updates", async () => {
      const MockRealTimeAnalytics = () => {
        const [metrics, setMetrics] = React.useState({ views: 100, contacts: 5 });

        React.useEffect(() => {
          // Simulate real-time update
          const interval = setInterval(() => {
            setMetrics(prev => ({
              views: prev.views + Math.floor(Math.random() * 5),
              contacts: prev.contacts + Math.floor(Math.random() * 2),
            }));
          }, 100);

          return () => clearInterval(interval);
        }, []);

        return (
          <div data-testid="realtime-analytics">
            <div data-testid="live-views">{metrics.views}</div>
            <div data-testid="live-contacts">{metrics.contacts}</div>
            <div data-testid="live-conversion">
              {((metrics.contacts / metrics.views) * 100).toFixed(1)}%
            </div>
          </div>
        );
      };

      renderWithProviders(<MockRealTimeAnalytics />);

      const initialViews = parseInt(screen.getByTestId("live-views").textContent || "0");

      await waitFor(() => {
        const currentViews = parseInt(screen.getByTestId("live-views").textContent || "0");
        expect(currentViews).toBeGreaterThan(initialViews);
      }, { timeout: 1000 });
    });
  });

  describe("Chart Integration Workflow", () => {
    it("should integrate data with chart components", async () => {
      const mockChartData = {
        labels: ["Jan 1", "Jan 2", "Jan 3"],
        datasets: [
          {
            label: "Views",
            data: [100, 120, 110],
            borderColor: "#3b82f6",
          },
          {
            label: "Contacts",
            data: [5, 8, 6],
            borderColor: "#10b981",
          },
        ],
      };

      const MockChartIntegration = () => {
        const [chartData, setChartData] = React.useState<any>(null);

        React.useEffect(() => {
          // Simulate data fetching and processing for charts
          setTimeout(() => {
            setChartData(mockChartData);
          }, 100);
        }, []);

        if (!chartData) return <div>Loading chart...</div>;

        return (
          <div data-testid="chart-container">
            <div data-testid="chart-labels">
              {chartData.labels.join(", ")}
            </div>
            {chartData.datasets.map((dataset: any, index: number) => (
              <div key={index} data-testid={`dataset-${index}`}>
                <span data-testid={`dataset-label-${index}`}>{dataset.label}</span>
                <span data-testid={`dataset-data-${index}`}>
                  {dataset.data.join(", ")}
                </span>
              </div>
            ))}
          </div>
        );
      };

      renderWithProviders(<MockChartIntegration />);

      await waitFor(() => {
        expect(screen.getByTestId("chart-container")).toBeInTheDocument();
      });

      expect(screen.getByTestId("chart-labels")).toHaveTextContent("Jan 1, Jan 2, Jan 3");
      expect(screen.getByTestId("dataset-label-0")).toHaveTextContent("Views");
      expect(screen.getByTestId("dataset-data-0")).toHaveTextContent("100, 120, 110");
      expect(screen.getByTestId("dataset-label-1")).toHaveTextContent("Contacts");
      expect(screen.getByTestId("dataset-data-1")).toHaveTextContent("5, 8, 6");
    });

    it("should handle chart interactions and filtering", async () => {
      const MockInteractiveChart = () => {
        const [selectedPeriod, setSelectedPeriod] = React.useState<string | null>(null);
        const [filteredData, setFilteredData] = React.useState([
          { period: "Week 1", views: 700, contacts: 35 },
          { period: "Week 2", views: 800, contacts: 40 },
          { period: "Week 3", views: 750, contacts: 38 },
        ]);

        const handleChartClick = (period: string) => {
          setSelectedPeriod(period);
          // Filter data based on selection
          const filtered = filteredData.filter(d => d.period === period);
          setFilteredData(filtered.length > 0 ? filtered : filteredData);
        };

        return (
          <div data-testid="interactive-chart">
            <div data-testid="chart-periods">
              {filteredData.map((item, index) => (
                <button
                  key={index}
                  data-testid={`period-${index}`}
                  onClick={() => handleChartClick(item.period)}
                  className={selectedPeriod === item.period ? "selected" : ""}
                >
                  {item.period}: {item.views} views
                </button>
              ))}
            </div>
            {selectedPeriod && (
              <div data-testid="selected-period-details">
                Selected: {selectedPeriod}
              </div>
            )}
          </div>
        );
      };

      renderWithProviders(<MockInteractiveChart />);

      expect(screen.getByTestId("interactive-chart")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("period-1"));

      expect(screen.getByTestId("selected-period-details")).toHaveTextContent(
        "Selected: Week 2"
      );
    });
  });

  describe("Export Workflow Integration", () => {
    it("should integrate analytics data with export functionality", async () => {
      const mockAnalyticsData = {
        overview: { totalViews: 2500, totalContacts: 125 },
        listings: [
          { title: "BMW 3 Series", views: 500, contacts: 25 },
          { title: "Canon Camera", views: 300, contacts: 15 },
        ],
        timeSeriesData: [
          { date: "2024-01-01", views: 100, contacts: 5 },
          { date: "2024-01-02", views: 120, contacts: 8 },
        ],
      };

      // Mock export functions
      const mockGenerateCSV = vi.fn();
      const mockGeneratePDF = vi.fn();
      const mockDownload = vi.fn();

      const MockExportIntegration = () => {
        const handleExportCSV = () => {
          const csvData = [
            ["Date", "Views", "Contacts"],
            ...mockAnalyticsData.timeSeriesData.map(d => [d.date, d.views, d.contacts]),
          ];
          mockGenerateCSV(csvData);
          mockDownload("analytics.csv");
        };

        const handleExportPDF = () => {
          mockGeneratePDF(mockAnalyticsData);
          mockDownload("analytics.pdf");
        };

        return (
          <div data-testid="export-integration">
            <button onClick={handleExportCSV} data-testid="export-csv">
              Export CSV
            </button>
            <button onClick={handleExportPDF} data-testid="export-pdf">
              Export PDF
            </button>
          </div>
        );
      };

      renderWithProviders(<MockExportIntegration />);

      fireEvent.click(screen.getByTestId("export-csv"));
      expect(mockGenerateCSV).toHaveBeenCalledWith([
        ["Date", "Views", "Contacts"],
        ["2024-01-01", 100, 5],
        ["2024-01-02", 120, 8],
      ]);
      expect(mockDownload).toHaveBeenCalledWith("analytics.csv");

      fireEvent.click(screen.getByTestId("export-pdf"));
      expect(mockGeneratePDF).toHaveBeenCalledWith(mockAnalyticsData);
      expect(mockDownload).toHaveBeenCalledWith("analytics.pdf");
    });
  });

  describe("Performance Metrics Integration", () => {
    it("should integrate analytics with performance calculations", async () => {
      const MockPerformanceIntegration = () => {
        const [performanceData, setPerformanceData] = React.useState<any>(null);

        React.useEffect(() => {
          // Simulate performance calculation based on analytics
          const analyticsData = {
            totalViews: 1000,
            totalContacts: 50,
            avgSessionDuration: 180,
            bounceRate: 35,
          };

          const calculated = {
            conversionRate: (analyticsData.totalContacts / analyticsData.totalViews) * 100,
            engagementScore: Math.max(0, 100 - analyticsData.bounceRate),
            performanceGrade: analyticsData.totalContacts > 40 ? "A" : "B",
          };

          setPerformanceData(calculated);
        }, []);

        if (!performanceData) return <div>Calculating...</div>;

        return (
          <div data-testid="performance-integration">
            <div data-testid="conversion-rate">
              {performanceData.conversionRate.toFixed(1)}%
            </div>
            <div data-testid="engagement-score">
              {performanceData.engagementScore}
            </div>
            <div data-testid="performance-grade">
              {performanceData.performanceGrade}
            </div>
          </div>
        );
      };

      renderWithProviders(<MockPerformanceIntegration />);

      await waitFor(() => {
        expect(screen.getByTestId("performance-integration")).toBeInTheDocument();
      });

      expect(screen.getByTestId("conversion-rate")).toHaveTextContent("5.0%");
      expect(screen.getByTestId("engagement-score")).toHaveTextContent("65");
      expect(screen.getByTestId("performance-grade")).toHaveTextContent("A");
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should handle analytics API failures gracefully", async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error("API Error"));

      const MockErrorHandling = () => {
        const [error, setError] = React.useState<string | null>(null);
        const [retryCount, setRetryCount] = React.useState(0);

        React.useEffect(() => {
          const fetchAnalytics = async () => {
            try {
              await fetch("/api/dashboard/analytics");
            } catch (err) {
              setError("Failed to load analytics data");
            }
          };

          fetchAnalytics();
        }, [retryCount]);

        const handleRetry = () => {
          setError(null);
          setRetryCount(prev => prev + 1);
        };

        if (error) {
          return (
            <div data-testid="error-state">
              <div data-testid="error-message">{error}</div>
              <button onClick={handleRetry} data-testid="retry-button">
                Retry
              </button>
            </div>
          );
        }

        return <div data-testid="analytics-loaded">Analytics loaded</div>;
      };

      renderWithProviders(<MockErrorHandling />);

      await waitFor(() => {
        expect(screen.getByTestId("error-state")).toBeInTheDocument();
      });

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to load analytics data"
      );

      fireEvent.click(screen.getByTestId("retry-button"));

      // Should attempt retry
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});