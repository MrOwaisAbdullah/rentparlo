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
import {
  createCSVContent,
  downloadCSV,
  processAnalyticsDataForCSV,
  formatCSVValue,
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

  const handleExport = async (exportFormat: "csv" | "pdf") => {
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
    csvContent += `# ${((exportType as string) || 'general').toUpperCase()} EXPORT REPORT
`;
    csvContent += `# Generated: ${new Date().toLocaleString()}\n`;
    if (timeRange) {
      csvContent += `# Date Range: ${timeRange.start} to ${timeRange.end}\n`;
    }
    csvContent += `# Total Records: ${data.length}\n`;
    csvContent += `\n`;

    switch (exportType) {
      case "analytics":
        processedData = processAnalyticsDataForCSV(data[0] as AnalyticsData);
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
          Value: (analyticsData.overview.totalViews > 0 ? ((analyticsData.overview.totalContacts / analyticsData.overview.totalViews) * 100).toFixed(2) : "0.00"),
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
          Conversions: trend.conversions,
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
      "Contact Rate (%)": item.totalViews > 0 ? ((item.totalContacts / item.totalViews) * 100).toFixed(2) : "0.00",
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
      "Contact Rate (%)": listing.views > 0 ? ((listing.contacts / listing.views) * 100).toFixed(2) : "0.00",
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
    score += Math.min((listing.views > 0 ? (listing.contacts / listing.views) * 100 : 0) * 10, 40);

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
      console.log("PDF Export - Data:", data);
      console.log("PDF Export - Export Type:", exportType);
      
      const {
        generateAnalyticsReport,
        generateListingReport,
        generateComprehensiveReport,
        PDFReportGenerator,
      } = await import("@/lib/pdf-export-utils");

      let pdfBlob: Blob;

      const reportOptions = {
        title: getReportTitle(exportType),
        subtitle: getReportSubtitle(exportType, timeRange),
        timeRange,
        includeCharts: includeCharts || false,
        includeRecommendations: true,
        branding: {
          logo: "/rentparlo.png", // Path to the logo in the public directory
          companyName: "RentParLo.pk",
          colors: {
            primary: "#428bca",
            secondary: "#5cb85c",
          },
        },
      };

      switch (exportType) {
        case "analytics":
          console.log("Analytics PDF export - Raw data:", data);
          if (data && data.length > 0) {
            // Extract analytics data properly
            let analyticsData = null;
            
            // Check if it's already an analytics object
            if (data[0] && (data[0].overview || data[0].totalViews !== undefined)) {
              analyticsData = data[0];
            } 
            // Check if it's nested in an object
            else if (data[0] && data[0].analytics) {
              analyticsData = data[0].analytics;
            }
            
            console.log("Analytics PDF export - Processed analytics data:", analyticsData);
            
            if (analyticsData) {
              pdfBlob = await generateAnalyticsReport(analyticsData, reportOptions);
            } else {
              throw new Error("Invalid analytics data structure for PDF export");
            }
          } else {
            throw new Error("No analytics data available for PDF export");
          }
          break;

        case "listings":
          console.log("Listings PDF export data:", data);
          if (Array.isArray(data) && data.length > 0) {
            // Try to extract the listings data properly
            const listingsData = data;
            console.log("Listings data structure:", listingsData);
            
            if (listingsData && listingsData.length > 0) {
              pdfBlob = await generateListingReport(listingsData, reportOptions);
            } else {
              throw new Error("Invalid listings data structure for PDF export");
            }
          } else {
            throw new Error("No listings data available for PDF export");
          }
          break;

        case "performance":
          console.log("Performance PDF export data:", data);
          // For performance reports, we need comprehensive data
          const reportData: any = {
            analytics: data.find((item) => item.overview || item.totalViews !== undefined),
            listings: data.filter((item) => item.title || item.listingId),
            performanceScore: data.find((item) => item.overall !== undefined),
            recommendations: data.find((item) => Array.isArray(item) || (item && typeof item === 'object')),
          };
          
          console.log("Performance report data:", reportData);
          
          pdfBlob = await generateComprehensiveReport(
            reportData,
            reportOptions
          );
          break;

        default:
          console.log("Generic PDF export data:", data);
          // Generic PDF export for other data types
          const generator = new PDFReportGenerator(reportOptions);
          const genericData: any = {
            analytics: data.find((item) => item.overview || item.totalViews !== undefined) || undefined,
            listings: data.filter((item) => item.title || item.listingId) || undefined,
          };
          
          console.log("Generic report data:", genericData);
          
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

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  // Single format button
  if (format !== "csv" && format !== "pdf") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport(format as any)}
        disabled={disabled || isExporting || !data.length}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <>
            {getFormatIcon(format)}
            <span className="ml-2">Export {(format as string).toUpperCase()}</span>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
