"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  BarChart3,
  MapPin,
  Smartphone,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { AnalyticsData, TimeRange, ListingAnalytics } from "@/types/dashboard";
import { ExportButton } from "./export-button";

interface AnalyticsExportProps {
  analyticsData: AnalyticsData;
  timeRange: TimeRange;
  onExport?: () => void;
}

interface ExportOptions {
  includeOverview: boolean;
  includeTrends: boolean;
  includeListings: boolean;
  includeGeographic: boolean;
  includeDevices: boolean;
  includeConversions: boolean;
  format: "csv" | "pdf" | "excel";
  dateRange: "current" | "custom";
}

export function AnalyticsExport({
  analyticsData,
  timeRange,
  onExport,
}: AnalyticsExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeOverview: true,
    includeTrends: true,
    includeListings: true,
    includeGeographic: true,
    includeDevices: true,
    includeConversions: true,
    format: "csv",
    dateRange: "current",
  });

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Prepare data based on selected options
      const exportData = prepareExportData(analyticsData, exportOptions);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `analytics-export-${timestamp}`;

      // Create temporary ExportButton to handle the actual export
      await exportToFormat(exportData, filename, exportOptions.format);

      if (onExport) {
        onExport();
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const prepareExportData = (data: AnalyticsData, options: ExportOptions) => {
    const exportData: any[] = [];

    if (options.includeOverview) {
      exportData.push({
        section: "Overview Metrics",
        metric: "Total Views",
        value: data.overview.totalViews,
        type: "count",
      });
      exportData.push({
        section: "Overview Metrics",
        metric: "Total Contacts",
        value: data.overview.totalContacts,
        type: "count",
      });
      exportData.push({
        section: "Overview Metrics",
        metric: "Contact Rate",
        value: data.overview.totalViews > 0 ? ((data.overview.totalContacts / data.overview.totalViews) * 100) : 0,
        type: "percentage",
      });
      exportData.push({
        section: "Overview Metrics",
        metric: "Unique Visitors",
        value: data.overview.uniqueVisitors,
        type: "count",
      });
      exportData.push({
        section: "Overview Metrics",
        metric: "Avg Session Duration",
        value: data.overview.avgSessionDuration,
        type: "seconds",
      });
      exportData.push({
        section: "Overview Metrics",
        metric: "Bounce Rate",
        value: data.overview.bounceRate,
        type: "percentage",
      });
    }

    if (options.includeTrends && data.trends) {
      data.trends.forEach((trend) => {
        exportData.push({
          section: "Trend Data",
          date: trend.date,
          views: trend.views,
          contacts: trend.contacts,
          conversions: trend.conversions,
          conversion_rate:
            trend.views > 0
              ? ((trend.contacts / trend.views) * 100).toFixed(2)
              : "0.00",
        });
      });
    }

    if (options.includeListings && data.listings) {
      data.listings.forEach((listing) => {
        exportData.push({
          section: "Listing Performance",
          listing_id: listing.listingId,
          title: listing.title,
          views: listing.views,
          contacts: listing.contacts,
          whatsapp_clicks: listing.whatsappClicks,
          shares: listing.shares,
          saves: listing.saves,
          conversion_rate: listing.views > 0 ? ((listing.contacts / listing.views) * 100).toFixed(2) : "0.00",
          avg_time_on_page: listing.avgTimeOnPage,
          created_date: listing.createdAt,
          last_activity: listing.lastActivity,
        });
      });
    }

    if (options.includeGeographic && data.geographic) {
      data.geographic.forEach((geo) => {
        exportData.push({
          section: "Geographic Analytics",
          city: geo.city,
          views: geo.views,
          contacts: geo.contacts,
          percentage: geo.percentage,
        });
      });
    }

    if (options.includeDevices && data.devices) {
      data.devices.forEach((device) => {
        exportData.push({
          section: "Device Analytics",
          device_type: device.device,
          views: device.views,
          contacts: device.contacts,
          percentage: device.percentage,
        });
      });
    }

    if (options.includeConversions && data.conversions) {
      exportData.push({
        section: "Contact Summary",
        metric: "Total Views",
        value: data.conversions.totalViews,
        type: "count",
      });
      exportData.push({
        section: "Contact Summary",
        metric: "Total Contacts",
        value: data.conversions.totalContacts,
        type: "count",
      });
      exportData.push({
        section: "Contact Summary",
        metric: "Overall Contact Rate",
        value: data.conversions.totalViews > 0 ? ((data.conversions.totalContacts / data.conversions.totalViews) * 100) : 0,
        type: "percentage",
      });
    }

    return exportData;
  };

  const exportToFormat = async (
    data: any[],
    filename: string,
    format: string
  ) => {
    // Directly create CSV content with proper handling of different data structures
    switch (format) {
      case "csv":
      case "excel":
        // Import the export utilities
        const { formatCSVValue } = await import("@/lib/export-utils");
        
        let csvContent = "";
        
        // Add metadata header
        csvContent += `# ANALYTICS EXPORT REPORT\n`;
        csvContent += `# Generated: ${new Date().toLocaleString()}\n`;
        csvContent += `# Total Records: ${data.length}\n`;
        csvContent += `\n`;
        
        // Export all data as a flat structure
        if (data.length > 0) {
          // Get all unique keys from all data
          const allKeys = new Set<string>();
          data.forEach(item => {
            Object.keys(item).forEach(key => {
              allKeys.add(key);
            });
          });
          
          const headers = Array.from(allKeys);
          csvContent += headers.map(header => formatCSVValue(header)).join(",") + "\n";
          
          csvContent += data
            .map(item => 
              headers.map(header => formatCSVValue(item[header] || "")).join(",")
            )
            .join("\n");
        }
        
        // Download the CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const fileExtension = format === "excel" ? ".xlsx" : ".csv";
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}${fileExtension}`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        break;
        
      case "pdf":
        // PDF export would go here
        console.log("PDF export not yet implemented");
        break;
    }
  };

  const getSelectedOptionsCount = () => {
    return Object.values(exportOptions).filter(
      (value, index) => index < 6 && value === true
    ).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Advanced Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Analytics Data</DialogTitle>
          <DialogDescription>
            Choose what data to include in your export. Selected data will be
            exported for the period: {timeRange.start} to {timeRange.end}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Export Format</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: "csv" | "pdf" | "excel") =>
                setExportOptions({ ...exportOptions, format: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Comma Separated Values)
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (Enhanced CSV)
                  </div>
                </SelectItem>
                <SelectItem value="pdf" disabled>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    PDF (Coming in next task)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Data Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Data to Include ({getSelectedOptionsCount()} selected)
            </Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overview"
                  checked={exportOptions.includeOverview}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeOverview: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="overview"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview Metrics
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trends"
                  checked={exportOptions.includeTrends}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeTrends: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="trends"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4" />
                  Trend Data ({analyticsData.trends?.length || 0} records)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="listings"
                  checked={exportOptions.includeListings}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeListings: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="listings"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Listing Performance ({analyticsData.listings?.length ||
                    0}{" "}
                  listings)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="geographic"
                  checked={exportOptions.includeGeographic}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeGeographic: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="geographic"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="h-4 w-4" />
                  Geographic Data ({analyticsData.geographic?.length || 0}{" "}
                  cities)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="devices"
                  checked={exportOptions.includeDevices}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeDevices: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="devices"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Smartphone className="h-4 w-4" />
                  Device Analytics ({analyticsData.devices?.length || 0} device
                  types)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conversions"
                  checked={exportOptions.includeConversions}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeConversions: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="conversions"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4" />
                  Contact Summary
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || getSelectedOptionsCount() === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
