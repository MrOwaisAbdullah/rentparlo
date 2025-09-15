"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Calendar,
  Target,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { InteractiveChart } from "./interactive-chart";
import { Listing } from "@/types";

interface ListingAnalyticsData {
  listingId: string;
  title: string;
  image?: string;
  views: number;
  contacts: number;
  whatsappClicks: number;
  shares: number;
  saves: number;
  contactRate: number;
  avgTimeOnPage: number;
  lastActivity: string;
  trend: {
    views: number;
    contacts: number;
    contactRate: number;
  };
  dailyData: Array<{
    date: string;
    views: number;
    contacts: number;
  }>;
}

interface ListingAnalyticsIntegrationProps {
  listings: Listing[];
  analyticsData: ListingAnalyticsData[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export function ListingAnalyticsIntegration({
  listings,
  analyticsData,
  timeRange,
  onTimeRangeChange,
}: ListingAnalyticsIntegrationProps) {
  const [sortBy, setSortBy] = useState("views");
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [sortedData, setSortedData] = useState<ListingAnalyticsData[]>([]);

  // Sort analytics data based on selected criteria
  useEffect(() => {
    let sorted = [...analyticsData];

    switch (sortBy) {
      case "views":
        sorted.sort((a, b) => b.views - a.views);
        break;
      case "contacts":
        sorted.sort((a, b) => b.contacts - a.contacts);
        break;
      case "contact":
        sorted.sort((a, b) => b.contactRate - a.contactRate);
        break;
      case "engagement":
        sorted.sort((a, b) => b.shares + b.saves - (a.shares + a.saves));
        break;
      case "recent":
        sorted.sort(
          (a, b) =>
            new Date(b.lastActivity).getTime() -
            new Date(a.lastActivity).getTime()
        );
        break;
    }

    setSortedData(sorted);
  }, [analyticsData, sortBy]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-400";
  };

  const formatTrend = (trend: number) => {
    const sign = trend > 0 ? "+" : "";
    return `${sign}${trend.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalViews = analyticsData.reduce((sum, item) => sum + item.views, 0);
  const totalContacts = analyticsData.reduce(
    (sum, item) => sum + item.contacts,
    0
  );
  const avgConversionRate =
    analyticsData.length > 0
      ? analyticsData.reduce((sum, item) => sum + item.conversionRate, 0) /
        analyticsData.length
      : 0;

  // Prepare chart data for selected listing
  const selectedListingData = selectedListing
    ? analyticsData.find((item) => item.listingId === selectedListing)
    : null;

  const chartData = selectedListingData
    ? {
        labels: selectedListingData.dailyData.map((d) => d.date),
        datasets: [
          {
            label: "Views",
            data: selectedListingData.dailyData.map((d) => d.views),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
          },
          {
            label: "Contacts",
            data: selectedListingData.dailyData.map((d) => d.contacts),
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Listing Analytics</h2>
          <p className="text-muted-foreground">
            Track performance and engagement for each of your listings
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild variant="outline">
            <Link href="/dashboard/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Full Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-xl font-bold">
                  {totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
                <p className="text-xl font-bold">
                  {totalContacts.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Conversion</p>
                <p className="text-xl font-bold">
                  {avgConversionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart for Selected Listing */}
      {selectedListingData && chartData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Trend: {selectedListingData.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveChart
              type="line"
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
              height={300}
            />
          </CardContent>
        </Card>
      )}

      {/* Listings Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Listing Performance</CardTitle>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="contacts">Most Contacts</SelectItem>
                <SelectItem value="conversion">Best Conversion</SelectItem>
                <SelectItem value="engagement">Most Engagement</SelectItem>
                <SelectItem value="recent">Most Recent Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.length > 0 ? (
                  sortedData.map((item) => (
                    <TableRow
                      key={item.listingId}
                      className={
                        selectedListing === item.listingId ? "bg-muted/50" : ""
                      }
                    >
                      <TableCell>
                        <Image
                          src={item.image || "https://placehold.co/400"}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Avg. time: {Math.round(item.avgTimeOnPage)}s
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {item.views.toLocaleString()}
                          </span>
                          {getTrendIcon(item.trend.views)}
                          <span
                            className={`text-xs ${getTrendColor(item.trend.views)}`}
                          >
                            {formatTrend(item.trend.views)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {item.contacts.toLocaleString()}
                          </span>
                          {getTrendIcon(item.trend.contacts)}
                          <span
                            className={`text-xs ${getTrendColor(item.trend.contacts)}`}
                          >
                            {formatTrend(item.trend.contacts)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {item.conversionRate.toFixed(1)}%
                          </span>
                          {getTrendIcon(item.trend.conversionRate)}
                          <span
                            className={`text-xs ${getTrendColor(item.trend.conversionRate)}`}
                          >
                            {formatTrend(item.trend.conversionRate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {item.shares} shares
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.saves} saves
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(item.lastActivity)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={
                              selectedListing === item.listingId
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setSelectedListing(
                                selectedListing === item.listingId
                                  ? null
                                  : item.listingId
                              )
                            }
                          >
                            {selectedListing === item.listingId
                              ? "Hide Chart"
                              : "Show Chart"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      <div>
                        <p>No analytics data available.</p>
                        <p className="text-sm text-muted-foreground">
                          Analytics will appear once your listings start
                          receiving views.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {sortedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Top Performers</h4>
                <div className="space-y-1">
                  {sortedData.slice(0, 3).map((item, index) => (
                    <div
                      key={item.listingId}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Badge
                        variant="outline"
                        className="w-6 h-6 p-0 flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                      <span className="truncate">{item.title}</span>
                      <span className="text-muted-foreground">
                        {item.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Needs Attention</h4>
                <div className="space-y-1">
                  {sortedData
                    .filter(
                      (item) => item.conversionRate < 2.0 && item.views > 10
                    )
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.listingId}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Badge
                          variant="destructive"
                          className="w-6 h-6 p-0 flex items-center justify-center"
                        >
                          !
                        </Badge>
                        <span className="truncate">{item.title}</span>
                        <span className="text-muted-foreground">
                          {item.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  {sortedData.filter(
                    (item) => item.conversionRate < 2.0 && item.views > 10
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      All listings performing well!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
