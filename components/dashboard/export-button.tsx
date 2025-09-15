"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  ExportButtonProps,
  AnalyticsData,
  ListingAnalytics,
  TimeRange,
  SellerAnalytics,
} from "@/types/dashboard";
import { cn } from "@/lib/utils";
import {
  createCSVContent,
  downloadCSV,
  formatAnalyticsForExport,
  formatListingsForExport,
  generateExportFilename,
  validateExportData,
} from "@/lib/export-utils";

interface EnhancedExportButtonProps extends ExportButtonProps {
  exportType?: "analytics" | "listings" | "performance" | "general";
  timeRange?: TimeRange;
  includeCharts?: boolean;
}

export function ExportButton({
  data,
  filename,
  format,
  onExport,
  disabled = false,
  exportType = "general",
  timeRange,
  includeCharts = false,
}: EnhancedExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (exportFormat: "csv" | "pdf" | "excel") => {
    if (disabled || isExporting) return;

    setIsExporting(true);

    try {
      // Call the onExport callback if provided
      if (onExport) {
        onExport();
      }

      // Add small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      switch (exportFormat) {
        case "csv":
          await exportToCSV(data, filename, exportType, timeRange);
          break;
        case "pdf":
          await exportToPDF(
            data,
            filename,
            exportType,
            timeRange,
            includeCharts
          );
          break;
        case "excel":
          await exportToExcel(data, filename, exportType, timeRange);
          break;
      }
    } catch (error) {
      console.error("Export failed:", error);
      // You could add toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async (
    data: any[],
    filename: string,
    exportType: string,
    timeRange?: TimeRange
  ) => {
    if (!data.length) return;

    let csvContent = "";
    let processedData: any[] = [];

    // Add metadata header
    csvContent += `# ${exportType.toUpperCase()} EXPORT REPORT\n`;
    csvContent += `# Generated: ${new Date().toLocaleString()}\n`;
    if (timeRange) {
      csvContent += `# Date Range: ${timeRange.start} to ${timeRange.end}\n`;
    }
    csvContent += `# Total Records: ${data.length}\n`;
    csvContent += `\n`;

    switch (exportType) {
      case "analytics":
        processedData = processAnalyticsData(data as AnalyticsData[]);
        break;
      case "listings":
        processedData = processListingsData(data as ListingAnalytics[]);
        break;
      case "performance":
        processedData = processPerformanceData(data);
        break;
      default:
        processedData = processGeneralData(data);
    }

    if (processedData.length === 0) return;

    // Get headers from the processed data
    const headers = Object.keys(processedData[0]);

    // Add headers
    csvContent += headers.join(",") + "\n";

    // Add data rows
    csvContent += processedData
      .map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle different data types
            if (value === null || value === undefined) {
              return "";
            }
            // Escape commas, quotes, and newlines in values
            if (typeof value === "string") {
              const escapedValue = value
                .replace(/"/g, '""')
                .replace(/\n/g, " ");
              if (
                escapedValue.includes(",") ||
                escapedValue.includes('"') ||
                escapedValue.includes("\n")
              ) {
                return `"${escapedValue}"`;
              }
              return escapedValue;
            }
            return value;
          })
          .join(",")
      )
      .join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const processAnalyticsData = (data: any[]): any[] => {
    // Handle both single analytics object and array of analytics data
    if (data.length === 1 && data[0].overview) {
      // This is AnalyticsData format
      const analyticsData = data[0] as AnalyticsData;
      return [
        {
          Metric: "Total Views",
          Value: analyticsData.overview.totalViews,
          Type: "Overview",
        },
        {
          Metric: "Total Contacts",
          Value: analyticsData.overview.totalContacts,
          Type: "Overview",
        },
        {
          Metric: "Contact Rate (%)",
          Value: analyticsData.overview.contactRate.toFixed(2),
          Type: "Overview",
        },
        {
          Metric: "Unique Visitors",
          Value: analyticsData.overview.uniqueVisitors,
          Type: "Overview",
        },
        {
          Metric: "Avg Session Duration (seconds)",
          Value: analyticsData.overview.avgSessionDuration,
          Type: "Overview",
        },
        {
          Metric: "Bounce Rate (%)",
          Value: analyticsData.overview.bounceRate.toFixed(2),
          Type: "Overview",
        },
        // Add trend data
        ...analyticsData.trends.map((trend, index) => ({
          Date: trend.date,
          Views: trend.views,
          Contacts: trend.contacts,
          "Contact Clicks": trend.contactClicks,
          Type: "Trend Data",
        })),
        // Add geographic data
        ...analyticsData.geographic.map((geo) => ({
          City: geo.city,
          Views: geo.views,
          Contacts: geo.contacts,
          Percentage: geo.percentage.toFixed(2),
          Type: "Geographic",
        })),
        // Add device data
        ...analyticsData.devices.map((device) => ({
          Device: device.device,
          Views: device.views,
          Contacts: device.contacts,
          Percentage: device.percentage.toFixed(2),
          Type: "Device Analytics",
        })),
      ];
    }

    // Handle array of analytics objects
    return data.map((item, index) => ({
      Record: index + 1,
      "Total Views": item.totalViews || 0,
      "Total Contacts": item.totalContacts || 0,
      "Contact Rate (%)": item.contactRate?.toFixed(2) || "0.00",
      "Unique Visitors": item.uniqueVisitors || 0,
      "Avg Session Duration": item.avgSessionDuration || 0,
      "Bounce Rate (%)": item.bounceRate?.toFixed(2) || "0.00",
    }));
  };

  const processListingsData = (listings: ListingAnalytics[]): any[] => {
    return listings.map((listing) => ({
      "Listing ID": listing.listingId,
      Title: listing.title,
      Views: listing.views,
      Contacts: listing.contacts,
      "WhatsApp Clicks": listing.whatsappClicks,
      Shares: listing.shares,
      Saves: listing.saves,
      "Contact Rate (%)": listing.contactRate.toFixed(2),
      "Avg Time on Page (seconds)": listing.avgTimeOnPage,
      "Created Date": new Date(listing.createdAt).toLocaleDateString(),
      "Last Activity": new Date(listing.lastActivity).toLocaleDateString(),
      "Performance Score": calculatePerformanceScore(listing),
    }));
  };

  const processPerformanceData = (data: any[]): any[] => {
    return data.map((item, index) => ({
      Metric: item.metric || `Performance Item ${index + 1}`,
      "Current Value": item.currentValue || item.value || 0,
      "Target Value": item.targetValue || "N/A",
      "Performance (%)": item.performance || "N/A",
      Trend: item.trend || "Stable",
      Category: item.category || "General",
    }));
  };

  const processGeneralData = (data: any[]): any[] => {
    if (!data.length) return [];

    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => allKeys.add(key));
    });

    return data.map((item) => {
      const processedItem: any = {};
      allKeys.forEach((key) => {
        let value = item[key];

        // Format dates
        if (
          key.toLowerCase().includes("date") ||
          key.toLowerCase().includes("time")
        ) {
          if (value && !isNaN(Date.parse(value))) {
            value = new Date(value).toLocaleDateString();
          }
        }

        // Format numbers
        if (typeof value === "number") {
          if (
            key.toLowerCase().includes("rate") ||
            key.toLowerCase().includes("percentage")
          ) {
            value = value.toFixed(2) + "%";
          } else if (value > 1000) {
            value = value.toLocaleString();
          }
        }

        processedItem[key] = value || "";
      });
      return processedItem;
    });
  };

  const calculatePerformanceScore = (listing: ListingAnalytics): string => {
    // Simple performance scoring algorithm
    let score = 0;

    // Views contribution (0-30 points)
    score += Math.min((listing.views / 100) * 30, 30);

    // Contact rate contribution (0-40 points)
    score += Math.min(listing.contactRate * 10, 40);

    // Engagement contribution (0-30 points)
    const engagementRate =
      ((listing.whatsappClicks + listing.shares + listing.saves) /
        Math.max(listing.views, 1)) *
      100;
    score += Math.min(engagementRate * 3, 30);

    return Math.round(score).toString();
  };

  const exportToPDF = async (
    data: any[],
    filename: string,
    exportType: string,
    timeRange?: TimeRange,
    includeCharts?: boolean
  ) => {
    try {
      const {
        generateAnalyticsReport,
        generateListingReport,
        generateComprehensiveReport,
        PDFReportGenerator,
        ReportData,
      } = await import("@/lib/pdf-export-utils");

      let pdfBlob: Blob;

      const reportOptions = {
        title: getReportTitle(exportType),
        subtitle: getReportSubtitle(exportType, timeRange),
        timeRange,
        includeCharts: includeCharts || false,
        includeRecommendations: true,
        branding: {
          companyName: "RentParLo.pk",
          colors: {
            primary: "#428bca",
            secondary: "#5cb85c",
          },
        },
      };

      switch (exportType) {
        case "analytics":
          if (data[0] && "totalViews" in data[0]) {
            pdfBlob = await generateAnalyticsReport(data[0], reportOptions);
          } else {
            throw new Error("Invalid analytics data for PDF export");
          }
          break;

        case "listings":
          if (Array.isArray(data) && data.every((item) => "title" in item)) {
            pdfBlob = await generateListingReport(data, reportOptions);
          } else {
            throw new Error("Invalid listing data for PDF export");
          }
          break;

        case "performance":
          // For performance reports, we need comprehensive data
          const reportData: ReportData = {
            analytics: data.find((item) => "totalViews" in item),
            listings: data.filter((item) => "title" in item),
            performanceScore: data.find((item) => "overall" in item),
            recommendations: data.find((item) => Array.isArray(item)),
          };
          pdfBlob = await generateComprehensiveReport(
            reportData,
            reportOptions
          );
          break;

        default:
          // Generic PDF export for other data types
          const generator = new PDFReportGenerator(reportOptions);
          const genericData: ReportData = {
            analytics: data.find((item) => "totalViews" in item) || undefined,
            listings: data.filter((item) => "title" in item) || undefined,
          };
          pdfBlob = await generator.generateReport(genericData);
      }

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export failed:", error);
      throw new Error(
        `PDF export failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const getReportTitle = (exportType: string): string => {
    switch (exportType) {
      case "analytics":
        return "Analytics Performance Report";
      case "listings":
        return "Listing Performance Report";
      case "performance":
        return "Comprehensive Business Report";
      default:
        return "Dashboard Report";
    }
  };

  const getReportSubtitle = (
    exportType: string,
    timeRange?: TimeRange
  ): string => {
    const period = timeRange
      ? `${timeRange.start} to ${timeRange.end}`
      : "All Time";

    switch (exportType) {
      case "analytics":
        return `Analytics Overview and Insights - ${period}`;
      case "listings":
        return `Individual Listing Performance Analysis - ${period}`;
      case "performance":
        return `Complete Performance Analysis and Recommendations - ${period}`;
      default:
        return `Dashboard Data Export - ${period}`;
    }
  };

  const exportToExcel = async (
    data: any[],
    filename: string,
    exportType: string,
    timeRange?: TimeRange
  ) => {
    // Excel export - enhanced CSV format for now, proper Excel in future
    console.log("Excel export using enhanced CSV format");
    await exportToCSV(data, filename + "_excel", exportType, timeRange);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  // Single format button
  if (format !== "csv" && format !== "pdf" && format !== "excel") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport(format as any)}
        disabled={disabled || isExporting || !data.length}
        className={cn(disabled && "opacity-50 cursor-not-allowed")}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <>
            {getFormatIcon(format)}
            <span className="ml-2">Export {format.toUpperCase()}</span>
          </>
        )}
      </Button>
    );
  }

  // Multi-format dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || !data.length}
          className={cn(disabled && "opacity-50 cursor-not-allowed")}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
