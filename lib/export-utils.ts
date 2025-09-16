// Utility functions for data export functionality

import {
  AnalyticsData,
  ListingAnalytics,
  TimeRange,
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
  csvContent += csvHeaders.map(header => `"${header}"`).join(",") + "\n";

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
 * Formats analytics data for export to CSV
 */
export function processAnalyticsDataForCSV(analyticsData: AnalyticsData): any[] {
    const overview = analyticsData.overview || {};
    const processedData: any[] = [];

    // Overview metrics
    processedData.push({ Category: "Overview", Metric: "Total Views", Value: overview.totalViews || 0 });
    processedData.push({ Category: "Overview", Metric: "Total Contacts", Value: overview.totalContacts || 0 });
    processedData.push({ Category: "Overview", Metric: "Contact Rate (%)", Value: overview.totalViews > 0 ? ((overview.totalContacts / overview.totalViews) * 100).toFixed(2) : "0.00" });
    processedData.push({ Category: "Overview", Metric: "Unique Visitors", Value: overview.uniqueVisitors || 0 });
    processedData.push({ Category: "Overview", Metric: "Avg Session Duration (seconds)", Value: overview.avgSessionDuration || 0 });
    processedData.push({ Category: "Overview", Metric: "Bounce Rate (%)", Value: overview.bounceRate?.toFixed(2) || "0.00" });

    // Trend data
    (analyticsData.trends || []).forEach(trend => {
      processedData.push({ Category: "Trend", Metric: `Views on ${trend.date}`, Value: trend.views });
      processedData.push({ Category: "Trend", Metric: `Contacts on ${trend.date}`, Value: trend.contacts });
    });

    // Geographic data
    (analyticsData.geographic || []).forEach(geo => {
      processedData.push({ Category: "Geographic", Metric: `Views from ${geo.city}`, Value: geo.views });
      processedData.push({ Category: "Geographic", Metric: `Contacts from ${geo.city}`, Value: geo.contacts });
    });

    // Device data
    (analyticsData.devices || []).forEach(device => {
      processedData.push({ Category: "Device", Metric: `Views from ${device.device}`, Value: device.views });
      processedData.push({ Category: "Device", Metric: `Contacts from ${device.device}`, Value: device.contacts });
    });

    return processedData;
  }