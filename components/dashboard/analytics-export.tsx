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
  format: "csv" | "pdf";
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
      
      // Debug: Log the export data to see what's being generated
      console.log("Export data:", exportData);
      console.log("Export data length:", exportData.length);

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
      console.log("Adding trend data:", data.trends.length, "records");
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
      console.log("Adding listing data:", data.listings.length, "records");
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
      console.log("Adding geographic data:", data.geographic.length, "records");
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
      console.log("Adding device data:", data.devices.length, "records");
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
    
    console.log("Prepared export data:", exportData);
    console.log("Total export records:", exportData.length);

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
        // Import the export utilities
        const { formatCSVValue } = await import("@/lib/export-utils");
        
        let csvContent = "";
        
        // Add metadata header
        csvContent += `# ANALYTICS EXPORT REPORT\n`;
        csvContent += `# Generated: ${new Date().toLocaleString()}\n`;
        csvContent += `# Total Records: ${data.length}\n`;
        csvContent += `\n`;
        
        // Separate different types of data
        const overviewData = data.filter(item => item.section === "Overview Metrics");
        const trendData = data.filter(item => item.section === "Trend Data");
        const listingData = data.filter(item => item.section === "Listing Performance");
        const geographicData = data.filter(item => item.section === "Geographic Analytics");
        const deviceData = data.filter(item => item.section === "Device Analytics");
        const contactSummaryData = data.filter(item => item.section === "Contact Summary");
        
        // Export Overview Metrics
        if (overviewData.length > 0) {
          csvContent += `# OVERVIEW METRICS\n`;
          csvContent += `"Metric","Value","Type"\n`;
          csvContent += overviewData
            .map(item => 
              `${formatCSVValue(item.metric)},${formatCSVValue(item.value)},${formatCSVValue(item.type || "")}`
            )
            .join("\n");
          csvContent += "\n\n";
        }
        
        // Export Trend Data
        if (trendData.length > 0) {
          csvContent += `# TREND DATA\n`;
          // Get headers from the first item
          const headers = Object.keys(trendData[0]).filter(key => key !== "section");
          csvContent += headers.map(header => formatCSVValue(header)).join(",") + "\n";
          csvContent += trendData
            .map(item => 
              headers.map(header => formatCSVValue(item[header])).join(",")
            )
            .join("\n");
          csvContent += "\n\n";
        }
        
        // Export Listing Performance
        if (listingData.length > 0) {
          csvContent += `# LISTING PERFORMANCE\n`;
          // Get headers from the first item
          const headers = Object.keys(listingData[0]).filter(key => key !== "section");
          csvContent += headers.map(header => formatCSVValue(header)).join(",") + "\n";
          csvContent += listingData
            .map(item => 
              headers.map(header => formatCSVValue(item[header])).join(",")
            )
            .join("\n");
          csvContent += "\n\n";
        }
        
        // Export Geographic Analytics
        if (geographicData.length > 0) {
          csvContent += `# GEOGRAPHIC ANALYTICS\n`;
          // Get headers from the first item
          const headers = Object.keys(geographicData[0]).filter(key => key !== "section");
          csvContent += headers.map(header => formatCSVValue(header)).join(",") + "\n";
          csvContent += geographicData
            .map(item => 
              headers.map(header => formatCSVValue(item[header])).join(",")
            )
            .join("\n");
          csvContent += "\n\n";
        }
        
        // Export Device Analytics
        if (deviceData.length > 0) {
          csvContent += `# DEVICE ANALYTICS\n`;
          // Get headers from the first item
          const headers = Object.keys(deviceData[0]).filter(key => key !== "section");
          csvContent += headers.map(header => formatCSVValue(header)).join(",") + "\n";
          csvContent += deviceData
            .map(item => 
              headers.map(header => formatCSVValue(item[header])).join(",")
            )
            .join("\n");
          csvContent += "\n\n";
        }
        
        // Export Contact Summary
        if (contactSummaryData.length > 0) {
          csvContent += `# CONTACT SUMMARY\n`;
          csvContent += `"Metric","Value","Type"\n`;
          csvContent += contactSummaryData
            .map(item => 
              `${formatCSVValue(item.metric)},${formatCSVValue(item.value)},${formatCSVValue(item.type || "")}`
            )
            .join("\n");
          csvContent += "\n\n";
        }
        
        // Debug: Log the CSV content
        console.log("Final CSV Content:", csvContent);
        
        // Download the CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const fileExtension = ".csv";
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}${fileExtension}`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        break;
        
      case "pdf":
        // Import PDF export utilities
        const { generateAnalyticsReport } = await import("@/lib/pdf-export-utils");
        
        // Prepare data for PDF report
        const analyticsData: any = {
          overview: {},
          trends: [],
          listings: [],
          geographic: [],
          devices: [],
          conversions: {}
        };
        
        // Separate different types of data for PDF
        const pdfOverviewData = data.filter(item => item.section === "Overview Metrics");
        const pdfTrendData = data.filter(item => item.section === "Trend Data");
        const pdfListingData = data.filter(item => item.section === "Listing Performance");
        const pdfGeographicData = data.filter(item => item.section === "Geographic Analytics");
        const pdfDeviceData = data.filter(item => item.section === "Device Analytics");
        const pdfContactSummaryData = data.filter(item => item.section === "Contact Summary");
        
        // Extract and organize data for PDF report
        pdfOverviewData.forEach(item => {
          if (item.metric === "Total Views") analyticsData.overview.totalViews = item.value;
          if (item.metric === "Total Contacts") analyticsData.overview.totalContacts = item.value;
          if (item.metric === "Contact Rate") analyticsData.overview.contactRate = item.value;
          if (item.metric === "Unique Visitors") analyticsData.overview.uniqueVisitors = item.value;
          if (item.metric === "Avg Session Duration") analyticsData.overview.avgSessionDuration = item.value;
          if (item.metric === "Bounce Rate") analyticsData.overview.bounceRate = item.value;
        });
        
        pdfTrendData.forEach(item => {
          analyticsData.trends.push({
            date: item.date,
            views: item.views,
            contacts: item.contacts,
            conversions: item.conversions
          });
        });
        
        pdfListingData.forEach(item => {
          analyticsData.listings.push({
            listingId: item.listing_id,
            title: item.title,
            views: item.views,
            contacts: item.contacts,
            whatsappClicks: item.whatsapp_clicks,
            shares: item.shares,
            saves: item.saves,
            avgTimeOnPage: item.avg_time_on_page,
            createdAt: item.created_date,
            lastActivity: item.last_activity
          });
        });
        
        pdfGeographicData.forEach(item => {
          analyticsData.geographic.push({
            city: item.city,
            views: item.views,
            contacts: item.contacts,
            percentage: item.percentage
          });
        });
        
        pdfDeviceData.forEach(item => {
          analyticsData.devices.push({
            device: item.device_type,
            views: item.views,
            contacts: item.contacts,
            percentage: item.percentage
          });
        });
        
        pdfContactSummaryData.forEach(item => {
          if (item.metric === "Total Views") analyticsData.conversions.totalViews = item.value;
          if (item.metric === "Total Contacts") analyticsData.conversions.totalContacts = item.value;
          if (item.metric === "Overall Contact Rate") analyticsData.conversions.contactRate = item.value;
        });
        
        // Generate PDF report
        const reportOptions = {
          title: "Analytics Performance Report",
          subtitle: `Generated on ${new Date().toLocaleDateString()}`,
          timeRange: timeRange,
          includeCharts: true,
          includeRecommendations: true,
          branding: {
            logo: "/rentparlo.png",
            companyName: "RentParLo.pk",
            colors: {
              primary: "#428bca",
              secondary: "#5cb85c",
            },
          },
        };
        
        try {
          const pdfBlob = await generateAnalyticsReport(analyticsData, reportOptions);
          
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
          throw new Error(`PDF export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
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
              onValueChange={(value: "csv" | "pdf") =>
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
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    PDF Report
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
