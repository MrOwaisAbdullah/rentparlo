// Utility functions for data export functionality

import {
  AnalyticsData,
  ListingAnalytics,
  TimeRange,
  SellerAnalytics,
} from "@/types/dashboard";

/**
 * Formats data for CSV export with proper escaping
 */
export function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Escape quotes and handle commas/newlines
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Creates CSV content from array of objects
 */
export function createCSVContent(
  data: any[],
  headers?: string[],
  metadata?: {
    title?: string;
    dateRange?: TimeRange;
    totalRecords?: number;
    additionalInfo?: string[];
  }
): string {
  if (!data.length) return "";

  let csvContent = "";

  // Add metadata if provided
  if (metadata) {
    if (metadata.title) {
      csvContent += `# ${metadata.title.toUpperCase()}\n`;
    }
    csvContent += `# Generated: ${new Date().toLocaleString()}\n`;

    if (metadata.dateRange) {
      csvContent += `# Date Range: ${metadata.dateRange.start} to ${metadata.dateRange.end}\n`;
    }

    if (metadata.totalRecords !== undefined) {
      csvContent += `# Total Records: ${metadata.totalRecords}\n`;
    }

    if (metadata.additionalInfo) {
      metadata.additionalInfo.forEach((info) => {
        csvContent += `# ${info}\n`;
      });
    }

    csvContent += "\n";
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  csvContent += csvHeaders.join(",") + "\n";

  // Add data rows
  csvContent += data
    .map((row) =>
      csvHeaders.map((header) => formatCSVValue(row[header])).join(",")
    )
    .join("\n");

  return csvContent;
}

/**
 * Downloads CSV content as a file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Formats analytics data for export
 */
export function formatAnalyticsForExport(
  data: AnalyticsData,
  options: {
    includeOverview?: boolean;
    includeTrends?: boolean;
    includeListings?: boolean;
    includeGeographic?: boolean;
    includeDevices?: boolean;
  } = {}
): any[] {
  const exportData: any[] = [];

  const {
    includeOverview = true,
    includeTrends = true,
    includeListings = true,
    includeGeographic = true,
    includeDevices = true,
  } = options;

  if (includeOverview) {
    exportData.push(
      {
        section: "Overview",
        metric: "Total Views",
        value: data.overview.totalViews,
        type: "count",
      },
      {
        section: "Overview",
        metric: "Total Contacts",
        value: data.overview.totalContacts,
        type: "count",
      },
      {
        section: "Overview",
        metric: "Conversion Rate",
        value: data.overview.conversionRate,
        type: "percentage",
      },
      {
        section: "Overview",
        metric: "Unique Visitors",
        value: data.overview.uniqueVisitors,
        type: "count",
      },
      {
        section: "Overview",
        metric: "Avg Session Duration",
        value: data.overview.avgSessionDuration,
        type: "seconds",
      },
      {
        section: "Overview",
        metric: "Bounce Rate",
        value: data.overview.bounceRate,
        type: "percentage",
      }
    );
  }

  if (includeTrends && data.trends) {
    data.trends.forEach((trend) => {
      exportData.push({
        section: "Trends",
        date: trend.date,
        views: trend.views,
        contacts: trend.contacts,
        conversions: trend.conversions,
        conversion_rate:
          trend.contacts > 0
            ? ((trend.conversions / trend.contacts) * 100).toFixed(2)
            : "0.00",
      });
    });
  }

  if (includeListings && data.listings) {
    data.listings.forEach((listing) => {
      exportData.push({
        section: "Listings",
        listing_id: listing.listingId,
        title: listing.title,
        views: listing.views,
        contacts: listing.contacts,
        whatsapp_clicks: listing.whatsappClicks,
        shares: listing.shares,
        saves: listing.saves,
        conversion_rate: listing.conversionRate,
        avg_time_on_page: listing.avgTimeOnPage,
        created_date: listing.createdAt,
        last_activity: listing.lastActivity,
      });
    });
  }

  if (includeGeographic && data.geographic) {
    data.geographic.forEach((geo) => {
      exportData.push({
        section: "Geographic",
        city: geo.city,
        views: geo.views,
        contacts: geo.contacts,
        percentage: geo.percentage,
      });
    });
  }

  if (includeDevices && data.devices) {
    data.devices.forEach((device) => {
      exportData.push({
        section: "Devices",
        device_type: device.device,
        views: device.views,
        contacts: device.contacts,
        percentage: device.percentage,
      });
    });
  }

  return exportData;
}

/**
 * Formats listing data for export with performance calculations
 */
export function formatListingsForExport(
  listings: ListingAnalytics[],
  options: {
    includePerformanceScores?: boolean;
    includeRecommendations?: boolean;
    includeEngagementMetrics?: boolean;
  } = {}
): any[] {
  const {
    includePerformanceScores = false,
    includeRecommendations = false,
    includeEngagementMetrics = false,
  } = options;

  return listings.map((listing, index) => {
    const baseData: any = {
      row: index + 1,
      listing_id: listing.listingId,
      title: listing.title,
      views: listing.views,
      contacts: listing.contacts,
      conversion_rate: listing.conversionRate.toFixed(2),
      avg_time_on_page: listing.avgTimeOnPage,
      created_date: new Date(listing.createdAt).toLocaleDateString(),
      last_activity: new Date(listing.lastActivity).toLocaleDateString(),
    };

    if (includeEngagementMetrics) {
      baseData.whatsapp_clicks = listing.whatsappClicks;
      baseData.shares = listing.shares;
      baseData.saves = listing.saves;
      baseData.total_engagement =
        listing.whatsappClicks + listing.shares + listing.saves;
      baseData.engagement_rate =
        listing.views > 0
          ? (
              ((listing.whatsappClicks + listing.shares + listing.saves) /
                listing.views) *
              100
            ).toFixed(2)
          : "0.00";
    }

    if (includePerformanceScores) {
      const performanceScore = calculateListingPerformanceScore(listing);
      baseData.performance_score = performanceScore.overall;
      baseData.views_score = performanceScore.viewsScore;
      baseData.conversion_score = performanceScore.conversionScore;
      baseData.engagement_score = performanceScore.engagementScore;
    }

    if (includeRecommendations) {
      const recommendations = generateListingRecommendations(listing, listings);
      baseData.recommendations = recommendations.join("; ");
      baseData.priority_actions = recommendations.slice(0, 2).join("; ");
    }

    return baseData;
  });
}

/**
 * Calculates performance score for a listing
 */
export function calculateListingPerformanceScore(listing: ListingAnalytics) {
  // Views score (0-30 points)
  const viewsScore = Math.min((listing.views / 100) * 30, 30);

  // Conversion score (0-40 points)
  const conversionScore = Math.min(listing.conversionRate * 10, 40);

  // Engagement score (0-30 points)
  const engagementRate =
    listing.views > 0
      ? ((listing.whatsappClicks + listing.shares + listing.saves) /
          listing.views) *
        100
      : 0;
  const engagementScore = Math.min(engagementRate * 3, 30);

  const overall = Math.round(viewsScore + conversionScore + engagementScore);

  return {
    overall,
    viewsScore: Math.round(viewsScore),
    conversionScore: Math.round(conversionScore),
    engagementScore: Math.round(engagementScore),
  };
}

/**
 * Generates recommendations for a listing
 */
export function generateListingRecommendations(
  listing: ListingAnalytics,
  allListings: ListingAnalytics[]
): string[] {
  const recommendations: string[] = [];
  const avgConversionRate =
    allListings.reduce((sum, l) => sum + l.conversionRate, 0) /
    allListings.length;

  // Low conversion rate
  if (listing.views > 100 && listing.conversionRate < 1.0) {
    recommendations.push(
      "Improve photos and description to increase conversion rate"
    );
  }

  // Low visibility
  if (
    listing.views < 50 &&
    new Date(listing.createdAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ) {
    recommendations.push(
      "Promote listing or update keywords for better visibility"
    );
  }

  // Stale listing
  if (
    new Date(listing.lastActivity) <
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  ) {
    recommendations.push("Refresh listing content or adjust pricing");
  }

  // Short viewing time
  if (listing.avgTimeOnPage < 30) {
    recommendations.push(
      "Improve listing content quality to increase engagement"
    );
  }

  // Low engagement
  const engagementRate =
    listing.views > 0
      ? ((listing.whatsappClicks + listing.shares + listing.saves) /
          listing.views) *
        100
      : 0;
  if (engagementRate < 2 && listing.views > 50) {
    recommendations.push(
      "Add more compelling call-to-action and contact options"
    );
  }

  // High views but low contacts
  if (listing.views > 200 && listing.contacts < 5) {
    recommendations.push(
      "Review pricing and listing details for competitiveness"
    );
  }

  return recommendations.length > 0
    ? recommendations
    : ["Listing performing well - continue current strategy"];
}

/**
 * Formats date range for display
 */
export function formatDateRange(timeRange: TimeRange): string {
  const start = new Date(timeRange.start).toLocaleDateString();
  const end = new Date(timeRange.end).toLocaleDateString();
  return `${start} to ${end}`;
}

/**
 * Generates filename with timestamp
 */
export function generateExportFilename(
  prefix: string,
  timeRange?: TimeRange,
  suffix?: string
): string {
  const timestamp = new Date().toISOString().split("T")[0];
  let filename = `${prefix}-${timestamp}`;

  if (timeRange) {
    filename += `-${timeRange.start}-${timeRange.end}`;
  }

  if (suffix) {
    filename += `-${suffix}`;
  }

  return filename;
}

/**
 * Validates export data before processing
 */
export function validateExportData(data: any[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    errors.push("Data must be an array");
    return { isValid: false, errors, warnings };
  }

  if (data.length === 0) {
    warnings.push("No data to export");
  }

  if (data.length > 10000) {
    warnings.push("Large dataset - export may take some time");
  }

  // Check for consistent data structure
  if (data.length > 1) {
    const firstKeys = Object.keys(data[0] || {});
    const inconsistentRows = data.slice(1).some((row) => {
      const rowKeys = Object.keys(row || {});
      return (
        rowKeys.length !== firstKeys.length ||
        !firstKeys.every((key) => rowKeys.includes(key))
      );
    });

    if (inconsistentRows) {
      warnings.push(
        "Inconsistent data structure detected - some columns may be empty"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
