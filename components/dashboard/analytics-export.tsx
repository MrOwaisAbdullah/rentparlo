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
        metric: "Conversion Rate",
        value: data.overview.conversionRate,
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
            trend.contacts > 0
              ? ((trend.conversions / trend.contacts) * 100).toFixed(2)
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
          conversion_rate: listing.conversionRate,
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
        section: "Conversion Summary",
        metric: "Total Views",
        value: data.conversions.totalViews,
        type: "count",
      });
      exportData.push({
        section: "Conversion Summary",
        metric: "Total Contacts",
        value: data.conversions.totalContacts,
        type: "count",
      });
      exportData.push({
        section: "Conversion Summary",
        metric: "Overall Conversion Rate",
        value: data.conversions.conversionRate,
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
    // Use the enhanced ExportButton functionality
    const exportButton = new ExportButton({
      data,
      filename,
      format: format as "csv" | "pdf" | "excel",
      exportType: "analytics",
      timeRange,
    });

    // Simulate the export process
    if (format === "csv") {
      await exportButton.exportToCSV(data, filename, "analytics", timeRange);
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
                  Conversion Summary
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
