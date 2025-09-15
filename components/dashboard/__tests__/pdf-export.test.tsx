import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PDFReportGenerator } from "../pdf-report-generator";
import { AnalyticsData, ListingAnalytics } from "@/types/dashboard";

// Mock the PDF export utilities
vi.mock("@/lib/pdf-export-utils", () => ({
  generateAnalyticsReport: vi
    .fn()
    .mockResolvedValue(new Blob(["mock pdf"], { type: "application/pdf" })),
  generateListingReport: vi
    .fn()
    .mockResolvedValue(new Blob(["mock pdf"], { type: "application/pdf" })),
  generateComprehensiveReport: vi
    .fn()
    .mockResolvedValue(new Blob(["mock pdf"], { type: "application/pdf" })),
  PDFReportGenerator: vi.fn().mockImplementation(() => ({
    generateReport: vi
      .fn()
      .mockResolvedValue(new Blob(["mock pdf"], { type: "application/pdf" })),
  })),
}));

// Mock URL.createObjectURL and related functions
Object.defineProperty(window, "URL", {
  value: {
    createObjectURL: vi.fn(() => "mock-url"),
    revokeObjectURL: vi.fn(),
  },
});

// Mock document.createElement and related DOM methods
Object.defineProperty(document, "createElement", {
  value: vi.fn((tagName) => {
    if (tagName === "a") {
      return {
        href: "",
        download: "",
        click: vi.fn(),
        style: {},
      };
    }
    return {};
  }),
});

Object.defineProperty(document.body, "appendChild", {
  value: vi.fn(),
});

Object.defineProperty(document.body, "removeChild", {
  value: vi.fn(),
});

const mockAnalyticsData: AnalyticsData = {
  totalViews: 1500,
  totalContacts: 75,
  totalWhatsAppClicks: 45,
  totalShares: 20,
  totalSaves: 30,
  uniqueVisitors: 1200,
  conversionRate: 5.0,
  avgSessionDuration: 180,
  bounceRate: 35,
  topCities: [
    { city: "Karachi", views: 500, contacts: 25 },
    { city: "Lahore", views: 400, contacts: 20 },
  ],
  topDevices: [
    { device: "mobile", views: 900, contacts: 45 },
    { device: "desktop", views: 600, contacts: 30 },
  ],
  timeSeriesData: [
    { date: "2024-01-01", views: 100, contacts: 5, conversions: 2 },
    { date: "2024-01-02", views: 120, contacts: 6, conversions: 3 },
  ],
  listingPerformance: [],
};

const mockListingsData: ListingAnalytics[] = [
  {
    listingId: "1",
    title: "Test Listing 1",
    views: 500,
    contacts: 25,
    whatsappClicks: 15,
    shares: 5,
    saves: 10,
    conversionRate: 5.0,
    avgTimeOnPage: 120,
    createdAt: "2024-01-01",
    lastActivity: "2024-01-15",
  },
  {
    listingId: "2",
    title: "Test Listing 2",
    views: 300,
    contacts: 12,
    whatsappClicks: 8,
    shares: 3,
    saves: 6,
    conversionRate: 4.0,
    avgTimeOnPage: 90,
    createdAt: "2024-01-05",
    lastActivity: "2024-01-14",
  },
];

describe("PDFReportGenerator Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render report generator with templates", () => {
    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    expect(screen.getByText("Report Template")).toBeInTheDocument();
    expect(screen.getByText("Executive Summary")).toBeInTheDocument();
    expect(screen.getByText("Detailed Analytics")).toBeInTheDocument();
    expect(screen.getByText("Performance Review")).toBeInTheDocument();
  });

  it("should allow template selection", () => {
    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    const detailedTemplate = screen
      .getByText("Detailed Analytics")
      .closest("div");
    fireEvent.click(detailedTemplate!);

    // The detailed template card should be selected (would have different styling)
    expect(detailedTemplate).toBeInTheDocument();
  });

  it("should render report configuration options", () => {
    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    expect(screen.getByText("Report Configuration")).toBeInTheDocument();
    expect(screen.getByLabelText("Report Title")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Report Subtitle (Optional)")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Include Charts")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Include Recommendations")
    ).toBeInTheDocument();
  });

  it("should allow report title customization", () => {
    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    const titleInput = screen.getByLabelText(
      "Report Title"
    ) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Custom Report Title" } });

    expect(titleInput.value).toBe("Custom Report Title");
  });

  it("should render email scheduling options", () => {
    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    expect(screen.getByText("Automated Report Delivery")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Enable automated email reports")
    ).toBeInTheDocument();
  });

  it("should show email configuration when enabled", () => {
    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    const emailCheckbox = screen.getByLabelText(
      "Enable automated email reports"
    );
    fireEvent.click(emailCheckbox);

    expect(screen.getByLabelText("Email Recipients")).toBeInTheDocument();
    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
    expect(screen.getByText("Schedule Report")).toBeInTheDocument();
  });

  it("should generate PDF report when button is clicked", async () => {
    const { generateAnalyticsReport } = await import("@/lib/pdf-export-utils");

    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    const generateButton = screen.getByText("Generate PDF Report");
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(generateAnalyticsReport).toHaveBeenCalledWith(
        mockAnalyticsData,
        expect.objectContaining({
          title: "Business Performance Report",
          includeCharts: true,
          includeRecommendations: true,
          template: "executive",
        })
      );
    });
  });

  it("should show loading state during report generation", async () => {
    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    const generateButton = screen.getByText("Generate PDF Report");
    fireEvent.click(generateButton);

    expect(screen.getByText("Generating Report...")).toBeInTheDocument();
  });

  it("should be disabled when no data is available", () => {
    render(<PDFReportGenerator />);

    const generateButton = screen.getByText("Generate PDF Report");
    expect(generateButton).toBeDisabled();
    expect(
      screen.getByText("No data available for report generation")
    ).toBeInTheDocument();
  });

  it("should handle report configuration changes", () => {
    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    const chartsCheckbox = screen.getByLabelText("Include Charts");
    const recommendationsCheckbox = screen.getByLabelText(
      "Include Recommendations"
    );

    fireEvent.click(chartsCheckbox);
    fireEvent.click(recommendationsCheckbox);

    // Checkboxes should toggle their state
    expect(chartsCheckbox).not.toBeChecked();
    expect(recommendationsCheckbox).not.toBeChecked();
  });

  it("should handle email recipients input", () => {
    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    const emailCheckbox = screen.getByLabelText(
      "Enable automated email reports"
    );
    fireEvent.click(emailCheckbox);

    const emailInput = screen.getByLabelText(
      "Email Recipients"
    ) as HTMLTextAreaElement;
    fireEvent.change(emailInput, {
      target: { value: "test@example.com, admin@example.com" },
    });

    expect(emailInput.value).toBe("test@example.com, admin@example.com");
  });

  it("should handle frequency selection", () => {
    render(
      <PDFReportGenerator
        analyticsData={mockAnalyticsData}
        listingsData={mockListingsData}
      />
    );

    const emailCheckbox = screen.getByLabelText(
      "Enable automated email reports"
    );
    fireEvent.click(emailCheckbox);

    // The frequency selector should be present
    expect(screen.getByText("Frequency")).toBeInTheDocument();
  });
});
