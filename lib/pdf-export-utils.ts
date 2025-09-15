// PDF export utilities for dashboard reports
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import {
  AnalyticsData,
  ListingAnalytics,
  TimeRange,
  SellerProfile,
  PerformanceScore,
} from "@/types/dashboard";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  timeRange?: TimeRange;
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  template?: "standard" | "executive" | "detailed";
  branding?: {
    logo?: string;
    companyName?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

export interface ReportData {
  analytics?: AnalyticsData;
  listings?: ListingAnalytics[];
  profile?: SellerProfile;
  performanceScore?: PerformanceScore;
  recommendations?: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
}

// PDF Report Templates
export class PDFReportGenerator {
  private doc: jsPDF;
  private options: PDFReportOptions;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;

  constructor(options: PDFReportOptions) {
    this.doc = new jsPDF();
    this.options = options;
  }

  async generateReport(data: ReportData): Promise<Blob> {
    // Add header
    this.addHeader();

    // Add executive summary
    this.addExecutiveSummary(data);

    // Add analytics section
    if (data.analytics) {
      this.addAnalyticsSection(data.analytics);
    }

    // Add listing performance
    if (data.listings && data.listings.length > 0) {
      this.addListingPerformanceSection(data.listings);
    }

    // Add performance insights
    if (data.performanceScore) {
      this.addPerformanceInsightsSection(data.performanceScore);
    }

    // Add recommendations
    if (data.recommendations && data.recommendations.length > 0) {
      this.addRecommendationsSection(data.recommendations);
    }

    // Add footer
    this.addFooter();

    return new Blob([this.doc.output("blob")], { type: "application/pdf" });
  }

  private addHeader(): void {
    const { title, subtitle, branding } = this.options;

    // Add company branding if available
    if (branding?.companyName) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(branding.companyName, this.margin, 15);
    }

    // Add title
    this.doc.setFontSize(20);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.currentY + 10);
    this.currentY += 15;

    // Add subtitle if provided
    if (subtitle) {
      this.doc.setFontSize(14);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, this.margin, this.currentY + 5);
      this.currentY += 10;
    }

    // Add date range if provided
    if (this.options.timeRange) {
      const dateRange = `${this.options.timeRange.start} to ${this.options.timeRange.end}`;
      this.doc.setFontSize(12);
      this.doc.text(
        `Report Period: ${dateRange}`,
        this.margin,
        this.currentY + 5
      );
      this.currentY += 10;
    }

    // Add generation date
    const generatedDate = new Date().toLocaleDateString();
    this.doc.text(
      `Generated: ${generatedDate}`,
      this.margin,
      this.currentY + 5
    );
    this.currentY += 20;
  }

  private addExecutiveSummary(data: ReportData): void {
    this.checkPageBreak(40);

    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Executive Summary", this.margin, this.currentY);
    this.currentY += 10;

    if (data.analytics) {
      const summary = [
        `Total Views: ${data.analytics.totalViews?.toLocaleString() || 0}`,
        `Total Contacts: ${data.analytics.totalContacts?.toLocaleString() || 0}`,
        `Conversion Rate: ${data.analytics.conversionRate?.toFixed(2) || 0}%`,
        `Active Listings: ${data.listings?.length || 0}`,
      ];

      this.doc.setFontSize(12);
      summary.forEach((item, index) => {
        this.doc.text(item, this.margin + 10, this.currentY + index * 6);
      });
      this.currentY += summary.length * 6 + 10;
    }
  }

  private addAnalyticsSection(analytics: AnalyticsData): void {
    this.checkPageBreak(60);

    this.doc.setFontSize(16);
    this.doc.text("Analytics Overview", this.margin, this.currentY);
    this.currentY += 15;

    // Create analytics table
    const analyticsData = [
      ["Metric", "Value", "Change"],
      ["Total Views", analytics.totalViews?.toLocaleString() || "0", "+0%"],
      [
        "Total Contacts",
        analytics.totalContacts?.toLocaleString() || "0",
        "+0%",
      ],
      [
        "WhatsApp Clicks",
        analytics.totalWhatsAppClicks?.toLocaleString() || "0",
        "+0%",
      ],
      [
        "Conversion Rate",
        `${analytics.conversionRate?.toFixed(2) || 0}%`,
        "+0%",
      ],
      [
        "Unique Visitors",
        analytics.uniqueVisitors?.toLocaleString() || "0",
        "+0%",
      ],
    ];

    this.doc.autoTable({
      head: [analyticsData[0]],
      body: analyticsData.slice(1),
      startY: this.currentY,
      margin: { left: this.margin },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addListingPerformanceSection(listings: ListingAnalytics[]): void {
    this.checkPageBreak(80);

    this.doc.setFontSize(16);
    this.doc.text("Listing Performance", this.margin, this.currentY);
    this.currentY += 15;

    // Top performing listings
    const topListings = listings
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    const listingData = [
      ["Listing Title", "Views", "Contacts", "Conversion Rate"],
    ];

    topListings.forEach((listing) => {
      const conversionRate =
        listing.views > 0
          ? ((listing.contacts / listing.views) * 100).toFixed(2)
          : "0.00";

      listingData.push([
        listing.title?.substring(0, 30) +
          (listing.title?.length > 30 ? "..." : "") || "Untitled",
        listing.views?.toString() || "0",
        listing.contacts?.toString() || "0",
        `${conversionRate}%`,
      ]);
    });

    this.doc.autoTable({
      head: [listingData[0]],
      body: listingData.slice(1),
      startY: this.currentY,
      margin: { left: this.margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
      },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addPerformanceInsightsSection(
    performanceScore: PerformanceScore
  ): void {
    this.checkPageBreak(50);

    this.doc.setFontSize(16);
    this.doc.text("Performance Insights", this.margin, this.currentY);
    this.currentY += 15;

    // Performance score breakdown
    this.doc.setFontSize(12);
    this.doc.text(
      `Overall Performance Score: ${performanceScore.overall}/100`,
      this.margin,
      this.currentY
    );
    this.currentY += 10;

    if (performanceScore.breakdown) {
      const breakdownData = [["Category", "Score", "Weight"]];

      performanceScore.breakdown.forEach((item) => {
        breakdownData.push([
          item.category,
          `${item.score}/100`,
          `${(item.weight * 100).toFixed(0)}%`,
        ]);
      });

      this.doc.autoTable({
        head: [breakdownData[0]],
        body: breakdownData.slice(1),
        startY: this.currentY,
        margin: { left: this.margin },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
    }
  }

  private addRecommendationsSection(
    recommendations: Array<{
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
    }>
  ): void {
    this.checkPageBreak(60);

    this.doc.setFontSize(16);
    this.doc.text("Recommendations", this.margin, this.currentY);
    this.currentY += 15;

    recommendations.forEach((rec, index) => {
      this.checkPageBreak(20);

      // Priority indicator
      const priorityColor =
        rec.priority === "high"
          ? [220, 53, 69]
          : rec.priority === "medium"
            ? [255, 193, 7]
            : [40, 167, 69];

      this.doc.setFillColor(
        priorityColor[0],
        priorityColor[1],
        priorityColor[2]
      );
      this.doc.rect(this.margin, this.currentY - 2, 5, 5, "F");

      // Recommendation title
      this.doc.setFontSize(12);
      this.doc.setFont(undefined, "bold");
      this.doc.text(rec.title, this.margin + 10, this.currentY + 2);
      this.currentY += 8;

      // Recommendation description
      this.doc.setFont(undefined, "normal");
      this.doc.setFontSize(10);
      const splitDescription = this.doc.splitTextToSize(rec.description, 160);
      this.doc.text(splitDescription, this.margin + 10, this.currentY);
      this.currentY += splitDescription.length * 4 + 8;
    });
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);

      // Page number
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.doc.internal.pageSize.width - this.margin - 20,
        this.doc.internal.pageSize.height - 10
      );

      // Company info
      this.doc.text(
        "Generated by RentParLo.pk Dashboard",
        this.margin,
        this.doc.internal.pageSize.height - 10
      );
    }
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }
}

// Utility functions for different report types
export async function generateAnalyticsReport(
  data: AnalyticsData,
  options: Partial<PDFReportOptions> = {}
): Promise<Blob> {
  const reportOptions: PDFReportOptions = {
    title: "Analytics Report",
    subtitle: "Performance Overview and Insights",
    template: "standard",
    includeCharts: false,
    ...options,
  };

  const generator = new PDFReportGenerator(reportOptions);
  return generator.generateReport({ analytics: data });
}

export async function generateListingReport(
  listings: ListingAnalytics[],
  options: Partial<PDFReportOptions> = {}
): Promise<Blob> {
  const reportOptions: PDFReportOptions = {
    title: "Listing Performance Report",
    subtitle: "Individual Listing Analytics and Performance",
    template: "detailed",
    includeCharts: false,
    ...options,
  };

  const generator = new PDFReportGenerator(reportOptions);
  return generator.generateReport({ listings });
}

export async function generateComprehensiveReport(
  data: ReportData,
  options: Partial<PDFReportOptions> = {}
): Promise<Blob> {
  const reportOptions: PDFReportOptions = {
    title: "Comprehensive Business Report",
    subtitle: "Complete Performance Analysis and Recommendations",
    template: "executive",
    includeCharts: true,
    includeRecommendations: true,
    ...options,
  };

  const generator = new PDFReportGenerator(reportOptions);
  return generator.generateReport(data);
}

// Chart capture utility for including charts in PDFs
export async function captureChartAsImage(
  chartElement: HTMLElement
): Promise<string> {
  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
    });
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error capturing chart:", error);
    return "";
  }
}
