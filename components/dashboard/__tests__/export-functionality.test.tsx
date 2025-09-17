/**
 * Test file for CSV export functionality
 * Tests the core export features implemented in task 7.1
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportButton } from "../export-button";
import { AnalyticsExport } from "../analytics-export";
import { ListingExport } from "../listing-export";
import {
  createCSVContent,
  formatAnalyticsForExport,
  formatListingsForExport,
  validateExportData,
  generateExportFilename,
} from "@/lib/export-utils";
import { AnalyticsData, ListingAnalytics, TimeRange } from "@/types/dashboard";

// Mock data for testing
const mockTimeRange: TimeRange = {
  start: "2024-01-01",
  end: "2024-01-31",
  preset: "month",
};

const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalViews: 1500,
    totalContacts: 75,
    conversionRate: 5.0,
    uniqueVisitors: 1200,
    avgSessionDuration: 180,
    bounceRate: 35.5,
  },
  trends: [
    { date: "2024-01-01", views: 100, contacts: 5, conversions: 2 },
    { date: "2024-01-02", views: 120, contacts: 8, conversions: 3 },
  ],
  listings: [
    {
      listingId: "listing-1",
      title: "Test Listing 1",
      views: 500,
      contacts: 25,
      whatsappClicks: 15,
      shares: 5,
      saves: 3,
      conversionRate: 5.0,
      avgTimeOnPage: 120,
      createdAt: "2024-01-01",
      lastActivity: "2024-01-30",
    },
  ],
  devices: [
    { device: "mobile", views: 900, contacts: 45, percentage: 60.0 },
    { device: "desktop", views: 600, contacts: 30, percentage: 40.0 },
  ],
  conversions: {
    totalViews: 1500,
    totalContacts: 75,
    conversionRate: 5.0,
    conversionsBySource: [],
  },
};

const mockListings: ListingAnalytics[] = [
  {
    listingId: "listing-1",
    title: "BMW 3 Series for Rent",
    views: 500,
    contacts: 25,
    whatsappClicks: 15,
    shares: 5,
    saves: 3,
    conversionRate: 5.0,
    avgTimeOnPage: 120,
    createdAt: "2024-01-01",
    lastActivity: "2024-01-30",
  },
  {
    listingId: "listing-2",
    title: "Canon Camera Rental",
    views: 300,
    contacts: 10,
    whatsappClicks: 8,
    shares: 2,
    saves: 1,
    conversionRate: 3.3,
    avgTimeOnPage: 90,
    createdAt: "2024-01-05",
    lastActivity: "2024-01-28",
  },
];

// Mock DOM methods
Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: vi.fn(() => "mock-url"),
});

Object.defineProperty(URL, "revokeObjectURL", {
  writable: true,
  value: vi.fn(),
});

// Mock document methods
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

Object.defineProperty(document, "createElement", {
  writable: true,
  value: vi.fn(() => ({
    setAttribute: vi.fn(),
    click: mockClick,
    style: {},
  })),
});

Object.defineProperty(document.body, "appendChild", {
  writable: true,
  value: mockAppendChild,
});

Object.defineProperty(document.body, "removeChild", {
  writable: true,
  value: mockRemoveChild,
});

describe("Export Utility Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCSVContent", () => {
    it("should create CSV content with headers and data", () => {
      const data = [
        { name: "John", age: 30, city: "Karachi" },
        { name: "Jane", age: 25, city: "Lahore" },
      ];

      const csvContent = createCSVContent(data);

      expect(csvContent).toContain("name,age,city");
      expect(csvContent).toContain("John,30,Karachi");
      expect(csvContent).toContain("Jane,25,Lahore");
    });

    it("should handle metadata in CSV content", () => {
      const data = [{ test: "value" }];
      const metadata = {
        title: "Test Export",
        dateRange: mockTimeRange,
        totalRecords: 1,
      };

      const csvContent = createCSVContent(data, undefined, metadata);

      expect(csvContent).toContain("# TEST EXPORT");
      expect(csvContent).toContain("# Date Range: 2024-01-01 to 2024-01-31");
      expect(csvContent).toContain("# Total Records: 1");
    });

    it("should escape CSV values properly", () => {
      const data = [{ description: "Test, with comma", notes: 'Has "quotes"' }];

      const csvContent = createCSVContent(data);

      expect(csvContent).toContain('"Test, with comma"');
      expect(csvContent).toContain('"Has ""quotes"""');
    });
  });

  describe("formatAnalyticsForExport", () => {
    it("should format analytics data correctly", () => {
      const formatted = formatAnalyticsForExport(mockAnalyticsData);

      expect(formatted).toHaveLength(12); // 6 overview + 2 trends + 1 listing + 2 geo + 2 devices

      const overviewMetrics = formatted.filter(
        (item) => item.section === "Overview"
      );
      expect(overviewMetrics).toHaveLength(6);
      expect(overviewMetrics[0]).toEqual({
        section: "Overview",
        metric: "Total Views",
        value: 1500,
        type: "count",
      });
    });

    it("should respect inclusion options", () => {
      const formatted = formatAnalyticsForExport(mockAnalyticsData, {
        includeOverview: true,
        includeTrends: false,
        includeListings: false,
        includeDevices: false,
      });

      expect(formatted).toHaveLength(6); // Only overview metrics
      expect(formatted.every((item) => item.section === "Overview")).toBe(true);
    });
  });

  describe("formatListingsForExport", () => {
    it("should format listings data correctly", () => {
      const formatted = formatListingsForExport(mockListings);

      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toMatchObject({
        row: 1,
        listing_id: "listing-1",
        title: "BMW 3 Series for Rent",
        views: 500,
        contacts: 25,
        conversion_rate: "5.00",
      });
    });

    it("should include performance scores when requested", () => {
      const formatted = formatListingsForExport(mockListings, {
        includePerformanceScores: true,
      });

      expect(formatted[0]).toHaveProperty("performance_score");
      expect(formatted[0]).toHaveProperty("views_score");
      expect(formatted[0]).toHaveProperty("conversion_score");
      expect(formatted[0]).toHaveProperty("engagement_score");
    });

    it("should include engagement metrics when requested", () => {
      const formatted = formatListingsForExport(mockListings, {
        includeEngagementMetrics: true,
      });

      expect(formatted[0]).toHaveProperty("whatsapp_clicks");
      expect(formatted[0]).toHaveProperty("shares");
      expect(formatted[0]).toHaveProperty("saves");
      expect(formatted[0]).toHaveProperty("total_engagement");
      expect(formatted[0]).toHaveProperty("engagement_rate");
    });
  });

  describe("validateExportData", () => {
    it("should validate correct data", () => {
      const result = validateExportData(mockListings);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid data", () => {
      const result = validateExportData("not an array" as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Data must be an array");
    });

    it("should warn about empty data", () => {
      const result = validateExportData([]);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("No data to export");
    });

    it("should warn about large datasets", () => {
      const largeData = new Array(15000).fill({ test: "value" });
      const result = validateExportData(largeData);

      expect(result.warnings).toContain(
        "Large dataset - export may take some time"
      );
    });
  });

  describe("generateExportFilename", () => {
    it("should generate filename with timestamp", () => {
      const filename = generateExportFilename("analytics");
      const today = new Date().toISOString().split("T")[0];

      expect(filename).toBe(`analytics-${today}`);
    });

    it("should include time range in filename", () => {
      const filename = generateExportFilename("analytics", mockTimeRange);
      const today = new Date().toISOString().split("T")[0];

      expect(filename).toBe(`analytics-${today}-2024-01-01-2024-01-31`);
    });

    it("should include suffix in filename", () => {
      const filename = generateExportFilename(
        "analytics",
        undefined,
        "detailed"
      );
      const today = new Date().toISOString().split("T")[0];

      expect(filename).toBe(`analytics-${today}-detailed`);
    });
  });
});

describe("ExportButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render export button", () => {
    render(
      <ExportButton data={mockListings} filename="test-export" format="csv" />
    );

    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("should show loading state during export", async () => {
    render(
      <ExportButton data={mockListings} filename="test-export" format="csv" />
    );

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    // Should show loading state briefly
    await waitFor(() => {
      expect(screen.getByText("Export CSV")).toBeInTheDocument();
    });
  });

  it("should be disabled when no data", () => {
    render(<ExportButton data={[]} filename="test-export" format="csv" />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should handle export type correctly", () => {
    render(
      <ExportButton
        data={[mockAnalyticsData]}
        filename="analytics-export"
        format="csv"
        exportType="analytics"
        timeRange={mockTimeRange}
      />
    );

    expect(screen.getByText("Export")).toBeInTheDocument();
  });
});

describe("AnalyticsExport Component", () => {
  it("should render analytics export dialog trigger", () => {
    render(
      <AnalyticsExport
        analyticsData={mockAnalyticsData}
        timeRange={mockTimeRange}
      />
    );

    expect(screen.getByText("Advanced Export")).toBeInTheDocument();
  });

  it("should open dialog when clicked", async () => {
    render(
      <AnalyticsExport
        analyticsData={mockAnalyticsData}
        timeRange={mockTimeRange}
      />
    );

    const trigger = screen.getByText("Advanced Export");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Export Analytics Data")).toBeInTheDocument();
    });
  });
});

describe("ListingExport Component", () => {
  it("should render listing export dialog trigger", () => {
    render(<ListingExport listings={mockListings} />);

    expect(screen.getByText("Export Listings")).toBeInTheDocument();
  });

  it("should show correct listing count in preview", async () => {
    render(<ListingExport listings={mockListings} />);

    const trigger = screen.getByText("Export Listings");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(
        screen.getByText(/2 of 2 listings will be exported/)
      ).toBeInTheDocument();
    });
  });
});

describe("Integration Tests", () => {
  it("should export analytics data with date range filtering", async () => {
    const onExport = vi.fn();

    render(
      <ExportButton
        data={[mockAnalyticsData]}
        filename="analytics-test"
        format="csv"
        exportType="analytics"
        timeRange={mockTimeRange}
        onExport={onExport}
      />
    );

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
      expect(onExport).toHaveBeenCalled();
    });
  });

  it("should export listing performance data with detailed metrics", async () => {
    const onExport = vi.fn();

    render(
      <ExportButton
        data={mockListings}
        filename="listings-test"
        format="csv"
        exportType="listings"
        onExport={onExport}
      />
    );

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
      expect(onExport).toHaveBeenCalled();
    });
  });
});
