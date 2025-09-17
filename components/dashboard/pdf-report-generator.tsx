"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Calendar,
  Mail,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import {
  AnalyticsData,
  ListingAnalytics,
  TimeRange,
  SellerProfile,
  PerformanceScore,
} from "@/types/dashboard";
import {
  generateAnalyticsReport,
  generateListingReport,
  generateComprehensiveReport,
  PDFReportOptions,
  ReportData,
} from "@/lib/pdf-export-utils";

interface PDFReportGeneratorProps {
  analyticsData?: AnalyticsData;
  listingsData?: ListingAnalytics[];
  sellerProfile?: SellerProfile;
  performanceScore?: PerformanceScore;
  timeRange?: TimeRange;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: string[];
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "executive",
    name: "Executive Summary",
    description: "High-level overview with key metrics and insights",
    icon: TrendingUp,
    sections: [
      "Executive Summary",
      "Key Metrics",
      "Performance Trends",
      "Recommendations",
    ],
  },
  {
    id: "detailed",
    name: "Detailed Analytics",
    description: "Comprehensive analysis with charts and breakdowns",
    icon: BarChart3,
    sections: [
      "Analytics Overview",
      "Listing Performance",
      "Geographic Analysis",
      "Device Analytics",
      "Recommendations",
    ],
  },
  {
    id: "performance",
    name: "Performance Review",
    description: "Focus on performance metrics and improvement areas",
    icon: Users,
    sections: [
      "Performance Score",
      "Benchmarking",
      "Improvement Areas",
      "Action Plan",
    ],
  },
];

export function PDFReportGenerator({
  analyticsData,
  listingsData,
  sellerProfile,
  performanceScore,
  timeRange,
}: PDFReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("executive");
  const [reportTitle, setReportTitle] = useState("Business Performance Report");
  const [reportSubtitle, setReportSubtitle] = useState("");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduledReports, setScheduledReports] = useState<
    Array<{
      id: string;
      name: string;
      frequency: string;
      nextRun: string;
      template: string;
    }>
  >([]);

  // Email scheduling state
  const [emailRecipients, setEmailRecipients] = useState("");
  const [emailFrequency, setEmailFrequency] = useState("weekly");
  const [emailEnabled, setEmailEnabled] = useState(false);

  const handleGenerateReport = async () => {
    if (!analyticsData && !listingsData) {
      console.error("No data available for report generation");
      return;
    }

    setIsGenerating(true);

    try {
      const reportOptions: PDFReportOptions = {
        title: reportTitle,
        subtitle: reportSubtitle || getDefaultSubtitle(),
        timeRange,
        includeCharts,
        includeRecommendations,
        template: selectedTemplate as "standard" | "executive" | "detailed",
        branding: {
          logo: "/rentparlo.png", // Path to the logo in the public directory
          companyName: "RentParLo.pk",
          colors: {
            primary: "#428bca",
            secondary: "#5cb85c",
          },
        },
      };

      let pdfBlob: Blob;
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${reportTitle.toLowerCase().replace(/\s+/g, "-")}-${timestamp}`;

      switch (selectedTemplate) {
        case "executive":
        case "detailed":
          if (analyticsData) {
            pdfBlob = await generateAnalyticsReport(
              analyticsData,
              reportOptions
            );
          } else {
            throw new Error("Analytics data required for this report type");
          }
          break;

        case "performance":
          const reportData: ReportData = {
            analytics: analyticsData,
            listings: listingsData,
            profile: sellerProfile,
            performanceScore,
            recommendations: generateMockRecommendations(),
          };
          pdfBlob = await generateComprehensiveReport(
            reportData,
            reportOptions
          );
          break;

        default:
          throw new Error("Invalid report template selected");
      }

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.pdf`;
      
      // Use safeDOM operations to prevent runtime errors
      safeDOM.appendChild(document.body, link);
      link.click();
      safeDOM.removeChild(document.body, link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleReport = () => {
    if (!emailRecipients || !emailEnabled) return;

    const newScheduledReport = {
      id: Date.now().toString(),
      name: reportTitle,
      frequency: emailFrequency,
      nextRun: getNextRunDate(emailFrequency),
      template: selectedTemplate,
    };

    setScheduledReports((prev) => [...prev, newScheduledReport]);

    // In a real implementation, this would call an API to set up the scheduled report
    console.log("Scheduled report created:", newScheduledReport);
  };

  const getDefaultSubtitle = (): string => {
    const period = timeRange
      ? `${timeRange.start} to ${timeRange.end}`
      : "All Time";
    return `Performance Analysis - ${period}`;
  };

  const getNextRunDate = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case "daily":
        now.setDate(now.getDate() + 1);
        break;
      case "weekly":
        now.setDate(now.getDate() + 7);
        break;
      case "monthly":
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toLocaleDateString();
  };

  const generateMockRecommendations = () => [
    {
      title: "Optimize Listing Photos",
      description:
        "Listings with high-quality photos receive 40% more views. Consider updating photos for underperforming listings.",
      priority: "high" as const,
    },
    {
      title: "Improve Response Time",
      description:
        "Faster response times lead to higher contact rates. Aim to respond to inquiries within 2 hours.",
      priority: "medium" as const,
    },
    {
      title: "Update Pricing Strategy",
      description:
        "Some listings may be overpriced compared to market rates. Consider adjusting prices for better visibility.",
      priority: "medium" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Report Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Template
          </CardTitle>
          <CardDescription>
            Choose a report template that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.sections.map((section) => (
                            <Badge
                              key={section}
                              variant="secondary"
                              className="text-xs"
                            >
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-title">Report Title</Label>
              <Input
                id="report-title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter report title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-subtitle">
                Report Subtitle (Optional)
              </Label>
              <Input
                id="report-subtitle"
                value={reportSubtitle}
                onChange={(e) => setReportSubtitle(e.target.value)}
                placeholder="Enter report subtitle"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-charts"
                checked={includeCharts}
                onCheckedChange={(checked) =>
                  setIncludeCharts(checked as boolean)
                }
              />
              <Label htmlFor="include-charts">Include Charts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-recommendations"
                checked={includeRecommendations}
                onCheckedChange={(checked) =>
                  setIncludeRecommendations(checked as boolean)
                }
              />
              <Label htmlFor="include-recommendations">
                Include Recommendations
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Automated Report Delivery
          </CardTitle>
          <CardDescription>
            Schedule automatic report generation and email delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-email"
              checked={emailEnabled}
              onCheckedChange={(checked) => setEmailEnabled(checked as boolean)}
            />
            <Label htmlFor="enable-email">Enable automated email reports</Label>
          </div>

          {emailEnabled && (
            <div className="space-y-4 pl-6 border-l-2 border-gray-200">
              <div className="space-y-2">
                <Label htmlFor="email-recipients">Email Recipients</Label>
                <Textarea
                  id="email-recipients"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="Enter email addresses separated by commas"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-frequency">Frequency</Label>
                <Select
                  value={emailFrequency}
                  onValueChange={setEmailFrequency}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleScheduleReport}
                disabled={!emailRecipients}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      {scheduledReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-gray-600">
                      {report.frequency} • Next run: {report.nextRun}
                    </p>
                  </div>
                  <Badge variant="outline">{report.template}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Report Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || (!analyticsData && !listingsData)}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate PDF Report
              </>
            )}
          </Button>

          {!analyticsData && !listingsData && (
            <p className="text-sm text-gray-500 text-center mt-2">
              No data available for report generation
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
