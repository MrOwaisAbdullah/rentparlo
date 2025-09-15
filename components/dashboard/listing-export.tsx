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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileSpreadsheet,
  Filter,
  SortAsc,
  Loader2,
  Eye,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { ListingAnalytics } from "@/types/dashboard";
import { ExportButton } from "./export-button";

interface ListingExportProps {
  listings: ListingAnalytics[];
  onExport?: () => void;
}

interface ListingExportOptions {
  format: "csv" | "pdf" | "excel";
  includeBasicMetrics: boolean;
  includeEngagementMetrics: boolean;
  includePerformanceScores: boolean;
  includeRecommendations: boolean;
  sortBy: "views" | "contacts" | "contactRate" | "title" | "lastActivity";
  sortOrder: "asc" | "desc";
  filterByPerformance: "all" | "high" | "medium" | "low";
  minViews: number;
  maxListings: number;
}

export function ListingExport({ listings, onExport }: ListingExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ListingExportOptions>({
    format: "csv",
    includeBasicMetrics: true,
    includeEngagementMetrics: true,
    includePerformanceScores: true,
    includeRecommendations: false,
    sortBy: "views",
    sortOrder: "desc",
    filterByPerformance: "all",
    minViews: 0,
    maxListings: 1000,
  });

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Filter and sort listings based on options
      const processedListings = processListings(listings, exportOptions);

      // Prepare export data
      const exportData = prepareListingExportData(
        processedListings,
        exportOptions
      );

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `listing-performance-${timestamp}`;

      // Export using the enhanced ExportButton
      await exportToFormat(exportData, filename, exportOptions.format);

      if (onExport) {
        onExport();
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Listing export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const processListings = (
    listings: ListingAnalytics[],
    options: ListingExportOptions
  ): ListingAnalytics[] => {
    let filtered = [...listings];

    // Filter by minimum views
    if (options.minViews > 0) {
      filtered = filtered.filter(
        (listing) => listing.views >= options.minViews
      );
    }

    // Filter by performance level
    if (options.filterByPerformance !== "all") {
      const avgContactRate =
        listings.reduce((sum, l) => sum + l.contactRate, 0) / listings.length;

      filtered = filtered.filter((listing) => {
        switch (options.filterByPerformance) {
          case "high":
            return listing.contactRate > avgContactRate * 1.2;
          case "medium":
            return (
              listing.contactRate >= avgContactRate * 0.8 &&
              listing.contactRate <= avgContactRate * 1.2
            );
          case "low":
            return listing.contactRate < avgContactRate * 0.8;
          default:
            return true;
        }
      });
    }

    // Sort listings
    filtered.sort((a, b) => {
      let aValue: any = a[options.sortBy];
      let bValue: any = b[options.sortBy];

      if (options.sortBy === "lastActivity") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (options.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Limit number of listings
    return filtered.slice(0, options.maxListings);
  };

  const prepareListingExportData = (
    listings: ListingAnalytics[],
    options: ListingExportOptions
  ) => {
    return listings.map((listing, index) => {
      const baseData: any = {
        Row: index + 1,
        "Listing ID": listing.listingId,
        Title: listing.title,
      };

      if (options.includeBasicMetrics) {
        baseData["Views"] = listing.views;
        baseData["Contacts"] = listing.contacts;
        baseData["Contact Rate (%)"] = listing.contactRate.toFixed(2);
        baseData["Avg Time on Page (seconds)"] = listing.avgTimeOnPage;
        baseData["Created Date"] = new Date(
          listing.createdAt
        ).toLocaleDateString();
        baseData["Last Activity"] = new Date(
          listing.lastActivity
        ).toLocaleDateString();
      }

      if (options.includeEngagementMetrics) {
        baseData["WhatsApp Clicks"] = listing.whatsappClicks;
        baseData["Shares"] = listing.shares;
        baseData["Saves"] = listing.saves;
        baseData["Total Engagement"] =
          listing.whatsappClicks + listing.shares + listing.saves;
        baseData["Engagement Rate (%)"] =
          listing.views > 0
            ? (
                ((listing.whatsappClicks + listing.shares + listing.saves) /
                  listing.views) *
                100
              ).toFixed(2)
            : "0.00";
      }

      if (options.includePerformanceScores) {
        const performanceScore = calculateDetailedPerformanceScore(listing);
        baseData["Performance Score"] = performanceScore.overall;
        baseData["Views Score"] = performanceScore.viewsScore;
        baseData["Contact Score"] = performanceScore.contactScore;
        baseData["Engagement Score"] = performanceScore.engagementScore;
        baseData["Performance Category"] = getPerformanceCategory(
          listing,
          listings
        );
      }

      if (options.includeRecommendations) {
        const recommendations = generateListingRecommendations(
          listing,
          listings
        );
        baseData["Recommendations"] = recommendations.join("; ");
        baseData["Priority Actions"] = recommendations.slice(0, 2).join("; ");
      }

      return baseData;
    });
  };

  const calculateDetailedPerformanceScore = (listing: ListingAnalytics) => {
    // Views score (0-30 points)
    const viewsScore = Math.min((listing.views / 100) * 30, 30);

    // Contact score (0-40 points)
    const contactScore = Math.min(listing.contactRate * 10, 40);

    // Engagement score (0-30 points)
    const engagementRate =
      listing.views > 0
        ? ((listing.whatsappClicks + listing.shares + listing.saves) /
            listing.views) *
          100
        : 0;
    const engagementScore = Math.min(engagementRate * 3, 30);

    const overall = Math.round(viewsScore + contactScore + engagementScore);

    return {
      overall,
      viewsScore: Math.round(viewsScore),
      contactScore: Math.round(contactScore),
      engagementScore: Math.round(engagementScore),
    };
  };

  const getPerformanceCategory = (
    listing: ListingAnalytics,
    allListings: ListingAnalytics[]
  ): string => {
    const avgContactRate =
      allListings.reduce((sum, l) => sum + l.contactRate, 0) /
      allListings.length;

    if (listing.contactRate > avgContactRate * 1.2) {
      return "High Performing";
    } else if (listing.contactRate < avgContactRate * 0.8) {
      return "Needs Attention";
    } else {
      return "Average Performance";
    }
  };

  const generateListingRecommendations = (
    listing: ListingAnalytics,
    allListings: ListingAnalytics[]
  ): string[] => {
    const recommendations: string[] = [];
    const avgContactRate =
      allListings.reduce((sum, l) => sum + l.contactRate, 0) /
      allListings.length;

    // Low contact rate
    if (listing.views > 100 && listing.contactRate < 1.0) {
      recommendations.push(
        "Improve photos and description to increase contact rate"
      );
    }

    // Low visibility
    if (
      listing.views < 50 &&
      new Date(listing.createdAt) <
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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
  };

  const exportToFormat = async (
    data: any[],
    filename: string,
    format: string
  ) => {
    // Create a blob for CSV export
    if (format === "csv") {
      let csvContent = "";

      // Add metadata header
      csvContent += `# LISTING PERFORMANCE EXPORT\n`;
      csvContent += `# Generated: ${new Date().toLocaleString()}\n`;
      csvContent += `# Total Listings: ${data.length}\n`;
      csvContent += `# Filters Applied: Performance=${exportOptions.filterByPerformance}, Min Views=${exportOptions.minViews}\n`;
      csvContent += `# Sort: ${exportOptions.sortBy} (${exportOptions.sortOrder})\n`;
      csvContent += `\n`;

      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        csvContent += headers.join(",") + "\n";

        csvContent += data
          .map((row) =>
            headers
              .map((header) => {
                const value = row[header];
                if (value === null || value === undefined) return "";
                if (
                  typeof value === "string" &&
                  (value.includes(",") || value.includes('"'))
                ) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
              })
              .join(",")
          )
          .join("\n");
      }

      // Download the file
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
    }
  };

  const getFilteredCount = () => {
    return processListings(listings, exportOptions).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Listings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export Listing Performance Data</DialogTitle>
          <DialogDescription>
            Export detailed performance data for your listings with customizable
            options and filters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Export Format */}
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
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Data Inclusion Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Data to Include</Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="basic"
                  checked={exportOptions.includeBasicMetrics}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeBasicMetrics: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="basic"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  Basic Metrics (Views, Contacts, Contact Rate)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="engagement"
                  checked={exportOptions.includeEngagementMetrics}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeEngagementMetrics: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="engagement"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Engagement Metrics (WhatsApp, Shares, Saves)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="performance"
                  checked={exportOptions.includePerformanceScores}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includePerformanceScores: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="performance"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4" />
                  Performance Scores & Categories
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={exportOptions.includeRecommendations}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeRecommendations: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="recommendations"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Filter className="h-4 w-4" />
                  AI-Generated Recommendations
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Filtering Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Filters & Sorting</Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="performance-filter" className="text-xs">
                  Performance Level
                </Label>
                <Select
                  value={exportOptions.filterByPerformance}
                  onValueChange={(value: "all" | "high" | "medium" | "low") =>
                    setExportOptions({
                      ...exportOptions,
                      filterByPerformance: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Listings</SelectItem>
                    <SelectItem value="high">High Performing</SelectItem>
                    <SelectItem value="medium">Average Performance</SelectItem>
                    <SelectItem value="low">Needs Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-views" className="text-xs">
                  Minimum Views
                </Label>
                <Input
                  id="min-views"
                  type="number"
                  min="0"
                  value={exportOptions.minViews}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      minViews: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-by" className="text-xs">
                  Sort By
                </Label>
                <Select
                  value={exportOptions.sortBy}
                  onValueChange={(value: any) =>
                    setExportOptions({ ...exportOptions, sortBy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="contacts">Contacts</SelectItem>
                    <SelectItem value="contactRate">Contact Rate</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="lastActivity">Last Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-order" className="text-xs">
                  Sort Order
                </Label>
                <Select
                  value={exportOptions.sortOrder}
                  onValueChange={(value: "asc" | "desc") =>
                    setExportOptions({ ...exportOptions, sortOrder: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Highest First</SelectItem>
                    <SelectItem value="asc">Lowest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-listings" className="text-xs">
                Maximum Listings to Export
              </Label>
              <Input
                id="max-listings"
                type="number"
                min="1"
                max="10000"
                value={exportOptions.maxListings}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    maxListings: parseInt(e.target.value) || 1000,
                  })
                }
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Export Preview:</strong> {getFilteredCount()} of{" "}
              {listings.length} listings will be exported
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || getFilteredCount() === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {getFilteredCount()} Listings
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
