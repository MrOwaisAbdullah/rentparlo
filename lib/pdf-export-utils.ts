// PDF export utilities for dashboard reports
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import the function directly
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
  private pageHeight: number = 277; // A4 height minus footer space (297mm - 20mm for footer)
  private margin: number = 20;

  constructor(options: PDFReportOptions) {
    this.doc = new jsPDF();
    this.options = options;
  }

  async generateReport(data: ReportData): Promise<Blob> {
    console.log("=== PDF GENERATION STARTED ===");
    console.log("Input data:", data);
    
    // Add header
    console.log("Adding header...");
    this.addHeader();

    // Add executive summary
    console.log("Adding executive summary...");
    this.addExecutiveSummary(data);

    // Add analytics section
    if (data.analytics) {
      console.log("Analytics data found, adding analytics section...");
      this.addAnalyticsSection(data.analytics);
    } else {
      console.log("No analytics data available");
    }

    // Add listing performance
    if (data.listings && data.listings.length > 0) {
      console.log("Listing data found, adding listing performance section with", data.listings.length, "listings...");
      this.addListingPerformanceSection(data.listings);
    } else {
      console.log("No listing data available");
    }

    // Add performance insights
    if (data.performanceScore) {
      console.log("Performance score data found, adding performance insights section...");
      this.addPerformanceInsightsSection(data.performanceScore);
    } else {
      console.log("No performance score data available");
    }

    // Add recommendations
    if (data.recommendations) {
      console.log("Recommendations data found, adding recommendations section...");
      this.addRecommendationsSection(data.recommendations);
    } else {
      console.log("No recommendations data available");
    }

    // Add footer
    console.log("Adding footer...");
    this.addFooter();

    console.log("=== PDF GENERATION COMPLETED ===");
    
    // Return the PDF as a blob
    return this.doc.output("blob");
  }

  private addHeader(): void {
    // Add company logo if provided
    if (this.options.branding?.logo) {
      try {
        // Add logo at the top left
        // Logo dimensions: 20mm width, 10mm height (adjust as needed)
        this.doc.addImage(this.options.branding.logo, 'PNG', this.margin, 10, 20, 10);
        
        // Position company name to the right of the logo
        this.doc.setFontSize(24);
        this.doc.setTextColor(66, 139, 202); // Bootstrap primary blue
        this.doc.setFont(undefined, "bold");
        this.doc.text(this.options.branding?.companyName || "RentParLo.pk", this.margin + 25, 18);
      } catch (error) {
        console.error("Error adding logo:", error);
        // Fallback to text-only header
        this.doc.setFontSize(24);
        this.doc.setTextColor(66, 139, 202); // Bootstrap primary blue
        this.doc.setFont(undefined, "bold");
        this.doc.text(this.options.branding?.companyName || "RentParLo.pk", this.margin, 20);
      }
    } else {
      // Add company name as text (existing behavior)
      this.doc.setFontSize(24);
      this.doc.setTextColor(66, 139, 202); // Bootstrap primary blue
      this.doc.setFont(undefined, "bold");
      this.doc.text(this.options.branding?.companyName || "RentParLo.pk", this.margin, 20);
    }
    
    // Reset text color and font
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont(undefined, "normal");
    
    // Add report title
    this.doc.setFontSize(18);
    // Adjust position based on whether we have a logo or not
    const titleY = this.options.branding?.logo ? 30 : 35;
    this.doc.text(this.options.title || "Dashboard Report", this.margin, titleY);
    
    // Add subtitle if available
    if (this.options.subtitle) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(108, 117, 125); // Bootstrap secondary gray
      const subtitleY = this.options.branding?.logo ? 40 : 45;
      this.doc.text(this.options.subtitle, this.margin, subtitleY);
      this.doc.setTextColor(0, 0, 0); // Reset to black
    }
    
    // Add separator line with equal margins on both sides
    const separatorY = this.options.branding?.logo ? 45 : 50;
    this.doc.setDrawColor(222, 226, 230); // Light gray
    this.doc.line(this.margin, separatorY, 210 - this.margin, separatorY); // A4 width is 210mm
    this.doc.setDrawColor(0, 0, 0); // Reset to black
    
    this.currentY = separatorY + 10;
  }

  private addExecutiveSummary(data: ReportData): void {
    console.log("Executive Summary - Report Data:", data);
    this.checkPageBreak(60);
    
    // Section title
    this.doc.setFontSize(16);
    this.doc.setTextColor(66, 139, 202); // Bootstrap primary blue
    this.doc.setFont(undefined, "bold");
    this.doc.text("Executive Summary", this.margin, this.currentY);
    this.doc.setFont(undefined, "normal");
    this.doc.setTextColor(0, 0, 0);
    this.currentY += 15;
    
    // Summary content
    this.doc.setFontSize(11);
    
    if (data.analytics) {
      console.log("Analytics data available:", data.analytics);
      const overview = data.analytics.overview || data.analytics;
      console.log("Overview data:", overview);
      this.doc.text(`• Total Views: ${overview.totalViews?.toLocaleString() || '0'}`, this.margin, this.currentY);
      this.currentY += 7;
      this.doc.text(`• Total Contacts: ${overview.totalContacts?.toLocaleString() || '0'}`, this.margin, this.currentY);
      this.currentY += 7;
      
      const contactRate = overview.totalViews > 0 
        ? ((overview.totalContacts / overview.totalViews) * 100).toFixed(2)
        : "0.00";
      this.doc.text(`• Contact Rate: ${contactRate}%`, this.margin, this.currentY);
      this.currentY += 7;
    } else {
      console.log("No analytics data available");
    }
    
    if (data.listings) {
      this.doc.text(`• Active Listings: ${data.listings.length.toLocaleString()}`, this.margin, this.currentY);
      this.currentY += 7;
    }
    
    this.currentY += 10; // Extra space after section
  }

  private addAnalyticsSection(analytics: AnalyticsData): void {
    console.log("Adding analytics section with data:", analytics);
    this.checkPageBreak(80);
    
    // Section title
    this.doc.setFontSize(16);
    this.doc.setTextColor(66, 139, 202);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Analytics Overview", this.margin, this.currentY);
    this.doc.setFont(undefined, "normal");
    this.doc.setTextColor(0, 0, 0);
    this.currentY += 15;
    
    // Check if autoTable function is available
    if (typeof autoTable !== 'function') {
      console.error("autoTable function not available");
      // Fallback: Add simple text instead
      this.doc.setFontSize(12);
      this.doc.text("Analytics data not available", this.margin, this.currentY);
      this.currentY += 10;
      return;
    }
    
    // Prepare analytics data for table
    const overview = analytics.overview || analytics;
    console.log("Analytics overview data:", overview);
    
    const analyticsData = [
      ["Metric", "Value"],
      ["Total Views", overview.totalViews?.toLocaleString() || "0"],
      ["Total Contacts", overview.totalContacts?.toLocaleString() || "0"],
      ["Contact Rate", overview.totalViews > 0 
        ? `${((overview.totalContacts / overview.totalViews) * 100).toFixed(2)}%` 
        : "0.00%"],
      ["Unique Visitors", overview.uniqueVisitors?.toLocaleString() || "0"],
      ["Avg Session Duration", `${overview.avgSessionDuration?.toFixed(0) || "0"} seconds`],
      ["Bounce Rate", `${overview.bounceRate?.toFixed(2) || "0.00"}%`],
    ];
    
    console.log("Analytics data for table:", analyticsData);
    
    // Call autotable function directly
    autoTable(this.doc, {
      head: [analyticsData[0]],
      body: analyticsData.slice(1),
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      tableLineColor: [222, 226, 230],
      tableLineWidth: 0.1,
      theme: 'grid'
    });
    
    // When using autotable as a function, we don't have direct access to lastAutoTable
    // So we'll use a fixed increment as a fallback
    this.currentY += 30; // Fixed increment instead of relying on lastAutoTable
  }

  private addListingPerformanceSection(listings: ListingAnalytics[]): void {
    console.log("Adding listing performance section with", listings.length, "listings");
    this.checkPageBreak(80);

    // Section title
    this.doc.setFontSize(16);
    this.doc.setTextColor(66, 139, 202);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Top Performing Listings", this.margin, this.currentY);
    this.doc.setFont(undefined, "normal");
    this.doc.setTextColor(0, 0, 0);
    this.currentY += 15;

    // Check if autoTable function is available
    if (typeof autoTable !== 'function') {
      console.error("autoTable function not available");
      // Fallback: Add simple text instead
      this.doc.setFontSize(12);
      this.doc.text("Listing performance data not available", this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    // Top performing listings (sorted by views)
    const topListings = [...listings]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    console.log("Top listings:", topListings);

    const listingData = [
      ["Listing Title", "Views", "Contacts", "Contact Rate"],
    ];

    topListings.forEach((listing) => {
      const contactRate =
        listing.views > 0
          ? ((listing.contacts / listing.views) * 100).toFixed(2)
          : "0.00";

      listingData.push([
        listing.title?.substring(0, 30) +
          (listing.title?.length > 30 ? "..." : "") || "Untitled",
        listing.views?.toString() || "0",
        listing.contacts?.toString() || "0",
        `${contactRate}%`,
      ]);
    });

    console.log("Listing data for table:", listingData);

    // Call autotable function directly
    autoTable(this.doc, {
      head: [listingData[0]],
      body: listingData.slice(1),
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      styles: { 
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      tableLineColor: [222, 226, 230],
      tableLineWidth: 0.1,
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
      },
    });

    // When using autotable as a function, we don't have direct access to lastAutoTable
    // So we'll use a fixed increment as a fallback
    this.currentY += 30; // Fixed increment instead of relying on lastAutoTable
  }

  private addPerformanceInsightsSection(
    performanceScore: PerformanceScore
  ): void {
    console.log("Adding performance insights section with data:", performanceScore);
    this.checkPageBreak(50);

    // Section title
    this.doc.setFontSize(16);
    this.doc.setTextColor(66, 139, 202);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Performance Insights", this.margin, this.currentY);
    this.doc.setFont(undefined, "normal");
    this.doc.setTextColor(0, 0, 0);
    this.currentY += 15;

    // Performance score breakdown
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, "bold");
    this.doc.text(
      `Overall Performance Score: ${performanceScore.overall}/100`,
      this.margin,
      this.currentY
    );
    this.doc.setFont(undefined, "normal");
    this.currentY += 10;

    if (performanceScore.breakdown) {
      // Check if autoTable function is available
      if (typeof autoTable !== 'function') {
        console.error("autoTable function not available");
        // Fallback: Add simple text instead
        this.doc.setFontSize(12);
        this.doc.text("Performance breakdown data not available", this.margin, this.currentY);
        this.currentY += 10;
        return;
      } else {
        const breakdownData = [["Category", "Score", "Weight"]];

        performanceScore.breakdown.forEach((item) => {
          breakdownData.push([
            item.category,
            `${item.score}/100`,
            `${(item.weight * 100).toFixed(0)}%`,
          ]);
        });

        // Call autotable function directly
        autoTable(this.doc, {
          head: [breakdownData[0]],
          body: breakdownData.slice(1),
          startY: this.currentY,
          margin: { left: this.margin, right: this.margin },
          styles: { 
            fontSize: 10,
            cellPadding: 2,
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          headStyles: { 
            fillColor: [66, 139, 202],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          tableLineColor: [222, 226, 230],
          tableLineWidth: 0.1,
          theme: 'grid',
        });

        // When using autotable as a function, we don't have direct access to lastAutoTable
        // So we'll use a fixed increment as a fallback
        this.currentY += 30; // Fixed increment instead of relying on lastAutoTable
      }
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

    // Section title
    this.doc.setFontSize(16);
    this.doc.setTextColor(66, 139, 202);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Recommendations", this.margin, this.currentY);
    this.doc.setFont(undefined, "normal");
    this.doc.setTextColor(0, 0, 0);
    this.currentY += 15;

    if (!recommendations || recommendations.length === 0) {
      this.doc.setFontSize(11);
      this.doc.setTextColor(108, 117, 125);
      this.doc.text("No recommendations available at this time.", this.margin, this.currentY);
      this.doc.setTextColor(0, 0, 0);
      this.currentY += 10;
      return;
    }

    // Add recommendations
    recommendations.slice(0, 5).forEach((rec, index) => {
      this.checkPageBreak(40);

      // Priority indicator
      const priorityColor =
        rec.priority === "high"
          ? [220, 53, 69]  // Red
          : rec.priority === "medium"
          ? [255, 193, 7]  // Yellow
          : [40, 167, 69]; // Green

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
      this.doc.setFont(undefined, "normal");
      this.currentY += 8;

      // Recommendation description
      this.doc.setFontSize(10);
      const descLines = this.doc.splitTextToSize(rec.description, this.pageHeight - this.margin * 2 - 10);
      this.doc.text(descLines, this.margin + 10, this.currentY);
      this.currentY += (descLines.length * 5) + 5;

      // Add some spacing
      this.currentY += 5;
    });
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 15;
    
    // Add footer line with equal margins on both sides
    this.doc.setDrawColor(222, 226, 230); // Light gray
    this.doc.line(this.margin, footerY - 5, 210 - this.margin, footerY - 5); // A4 width is 210mm
    this.doc.setDrawColor(0, 0, 0); // Reset to black
    
    // Add generated by text
    this.doc.setFontSize(8);
    this.doc.setTextColor(108, 117, 125); // Bootstrap secondary gray
    this.doc.text("Generated by RentParLo.pk", 210 / 2, footerY, { align: "center" }); // Centered on A4 width
    this.doc.setTextColor(0, 0, 0); // Reset to black
    
    // Add generated date text with proper positioning
    const generatedText = `Generated: ${new Date().toLocaleString()}`;
    const textWidth = this.doc.getTextWidth(generatedText);
    // Position the text with right margin
    this.doc.text(generatedText, 210 - this.margin - textWidth, footerY);
  }

  private checkPageBreak(minHeight: number): void {
    if (this.currentY + minHeight > this.pageHeight - this.margin - 30) { // Leave space for footer and content
      this.doc.addPage();
      this.currentY = this.margin;
      
      // Add header to new page
      this.addHeader();
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
    branding: {
      logo: "/rentparlo.png", // Path to the logo in the public directory
      companyName: "RentParLo.pk",
      colors: {
        primary: "#428bca",
        secondary: "#5cb85c",
      },
    },
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
    branding: {
      logo: "/rentparlo.png", // Path to the logo in the public directory
      companyName: "RentParLo.pk",
      colors: {
        primary: "#428bca",
        secondary: "#5cb85c",
      },
    },
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
    branding: {
      logo: "/rentparlo.png", // Path to the logo in the public directory
      companyName: "RentParLo.pk",
      colors: {
        primary: "#428bca",
        secondary: "#5cb85c",
      },
    },
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
