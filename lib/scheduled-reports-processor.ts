// Scheduled reports processor for automated report generation and email delivery
import { createClient } from "@/utils/supabase/server";
import {
  generateAnalyticsReport,
  generateListingReport,
  generateComprehensiveReport,
  PDFReportOptions,
  ReportData,
} from "@/lib/pdf-export-utils";

interface ScheduledReport {
  id: string;
  user_id: string;
  seller_id: string;
  name: string;
  report_type: "analytics" | "listings" | "comprehensive";
  template: "standard" | "executive" | "detailed";
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  email_recipients: string[];
  report_config: any;
  next_run_date: string;
  is_active: boolean;
}

export class ScheduledReportsProcessor {
  private supabase: any;

  constructor() {
    // Note: In a real implementation, this would use a service account
    // For now, we'll assume the supabase client is properly configured
  }

  async processScheduledReports(): Promise<void> {
    try {
      const supabase = await createClient();

      // Get all scheduled reports that are due to run
      const { data: dueReports, error: fetchError } = await supabase
        .from("scheduled_reports")
        .select("*")
        .eq("is_active", true)
        .lte("next_run_date", new Date().toISOString());

      if (fetchError) {
        console.error("Error fetching due reports:", fetchError);
        return;
      }

      if (!dueReports || dueReports.length === 0) {
        console.log("No scheduled reports due for processing");
        return;
      }

      console.log(`Processing ${dueReports.length} scheduled reports`);

      // Process each report
      for (const report of dueReports) {
        try {
          await this.processIndividualReport(report);
          await this.updateNextRunDate(report);
        } catch (error) {
          console.error(`Error processing report ${report.id}:`, error);
          await this.logReportError(report.id, error);
        }
      }
    } catch (error) {
      console.error("Error in scheduled reports processor:", error);
    }
  }

  private async processIndividualReport(
    report: ScheduledReport
  ): Promise<void> {
    const supabase = await createClient();

    // Fetch seller data
    const { data: sellerProfile, error: sellerError } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("id", report.seller_id)
      .single();

    if (sellerError || !sellerProfile) {
      throw new Error(`Seller profile not found for report ${report.id}`);
    }

    // Calculate time range based on frequency
    const timeRange = this.calculateTimeRange(report.frequency);

    // Fetch analytics data
    const { data: analyticsData, error: analyticsError } = await supabase.rpc(
      "get_seller_analytics",
      {
        seller_id: report.seller_id,
        start_date: timeRange.start,
        end_date: timeRange.end,
      }
    );

    if (analyticsError) {
      console.error(
        "Error fetching analytics for scheduled report:",
        analyticsError
      );
    }

    // Fetch listings data
    const { data: listingsData, error: listingsError } = await supabase
      .from("listings")
      .select(
        `
        id,
        title,
        created_at,
        analytics_events!inner(
          event_type,
          created_at
        )
      `
      )
      .eq("seller_id", report.seller_id)
      .eq("status", "active");

    if (listingsError) {
      console.error(
        "Error fetching listings for scheduled report:",
        listingsError
      );
    }

    // Process listings analytics
    const processedListings =
      listingsData?.map((listing) => {
        const events = listing.analytics_events || [];
        const views = events.filter(
          (e) => e.event_type === "listing_view"
        ).length;
        const contacts = events.filter(
          (e) => e.event_type === "contact_seller"
        ).length;

        return {
          listingId: listing.id,
          title: listing.title,
          views,
          contacts,
          whatsappClicks: events.filter(
            (e) => e.event_type === "whatsapp_click"
          ).length,
          shares: 0,
          saves: 0,
          conversionRate: views > 0 ? (contacts / views) * 100 : 0,
          avgTimeOnPage: 0,
          createdAt: listing.created_at,
          lastActivity:
            events.length > 0
              ? events[events.length - 1].created_at
              : listing.created_at,
        };
      }) || [];

    // Generate report
    const pdfBlob = await this.generateReportPDF(
      report,
      analyticsData,
      processedListings,
      sellerProfile,
      timeRange
    );

    // Send email with report attachment
    await this.sendReportEmail(report, pdfBlob, timeRange);

    // Log successful processing
    await this.logReportSuccess(report.id);
  }

  private async generateReportPDF(
    report: ScheduledReport,
    analyticsData: any,
    listingsData: any[],
    sellerProfile: any,
    timeRange: { start: string; end: string }
  ): Promise<Blob> {
    const reportOptions: PDFReportOptions = {
      title: report.name,
      subtitle: `Automated Report - ${timeRange.start} to ${timeRange.end}`,
      timeRange,
      includeCharts: report.report_config?.includeCharts || false,
      includeRecommendations:
        report.report_config?.includeRecommendations || true,
      template: report.template,
      branding: {
        companyName: "RentParLo.pk",
        colors: {
          primary: "#428bca",
          secondary: "#5cb85c",
        },
      },
    };

    switch (report.report_type) {
      case "analytics":
        return await generateAnalyticsReport(analyticsData, reportOptions);

      case "listings":
        return await generateListingReport(listingsData, reportOptions);

      case "comprehensive":
        const reportData: ReportData = {
          analytics: analyticsData,
          listings: listingsData,
          profile: sellerProfile,
          performanceScore: this.calculatePerformanceScore(
            analyticsData,
            listingsData
          ),
          recommendations: this.generateRecommendations(
            analyticsData,
            listingsData
          ),
        };
        return await generateComprehensiveReport(reportData, reportOptions);

      default:
        throw new Error(`Invalid report type: ${report.report_type}`);
    }
  }

  private async sendReportEmail(
    report: ScheduledReport,
    pdfBlob: Blob,
    timeRange: { start: string; end: string }
  ): Promise<void> {
    // In a real implementation, this would integrate with an email service like SendGrid, AWS SES, etc.
    // For now, we'll just log the email sending

    const emailData = {
      to: report.email_recipients,
      subject: `${report.name} - ${timeRange.start} to ${timeRange.end}`,
      html: this.generateEmailTemplate(report, timeRange),
      attachments: [
        {
          filename: `${report.name.toLowerCase().replace(/\s+/g, "-")}-${timeRange.start}.pdf`,
          content: await pdfBlob.arrayBuffer(),
        },
      ],
    };

    console.log("Email would be sent with data:", {
      to: emailData.to,
      subject: emailData.subject,
      attachmentSize: emailData.attachments[0].content.byteLength,
    });

    // TODO: Implement actual email sending
    // await emailService.send(emailData);
  }

  private generateEmailTemplate(
    report: ScheduledReport,
    timeRange: { start: string; end: string }
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Automated Report - ${report.name}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #428bca;">RentParLo.pk</h1>
            <h2 style="color: #666;">Automated Report Delivery</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Report Details</h3>
            <p><strong>Report Name:</strong> ${report.name}</p>
            <p><strong>Report Period:</strong> ${timeRange.start} to ${timeRange.end}</p>
            <p><strong>Report Type:</strong> ${report.report_type}</p>
            <p><strong>Template:</strong> ${report.template}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>Your automated report has been generated and is attached to this email as a PDF file.</p>
            <p>This report contains your latest performance metrics, analytics, and insights for the specified period.</p>
          </div>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Next Report:</strong> Your next automated report will be generated and sent according to your ${report.frequency} schedule.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              This is an automated email from RentParLo.pk Dashboard.<br>
              To manage your report settings, please log in to your dashboard.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private calculateTimeRange(frequency: string): {
    start: string;
    end: string;
  } {
    const end = new Date();
    const start = new Date();

    switch (frequency) {
      case "daily":
        start.setDate(start.getDate() - 1);
        break;
      case "weekly":
        start.setDate(start.getDate() - 7);
        break;
      case "monthly":
        start.setMonth(start.getMonth() - 1);
        break;
      case "quarterly":
        start.setMonth(start.getMonth() - 3);
        break;
    }

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }

  private async updateNextRunDate(report: ScheduledReport): Promise<void> {
    const supabase = await createClient();
    const nextRunDate = this.calculateNextRunDate(report.frequency);

    const { error } = await supabase
      .from("scheduled_reports")
      .update({ next_run_date: nextRunDate })
      .eq("id", report.id);

    if (error) {
      console.error("Error updating next run date:", error);
    }
  }

  private calculateNextRunDate(frequency: string): string {
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
      case "quarterly":
        now.setMonth(now.getMonth() + 3);
        break;
    }

    return now.toISOString();
  }

  private async logReportSuccess(reportId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from("report_execution_logs").insert({
      scheduled_report_id: reportId,
      status: "success",
      executed_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error logging report success:", error);
    }
  }

  private async logReportError(reportId: string, error: any): Promise<void> {
    const supabase = await createClient();

    const { error: logError } = await supabase
      .from("report_execution_logs")
      .insert({
        scheduled_report_id: reportId,
        status: "error",
        error_message: error.message || "Unknown error",
        executed_at: new Date().toISOString(),
      });

    if (logError) {
      console.error("Error logging report error:", logError);
    }
  }

  private calculatePerformanceScore(
    analyticsData: any,
    listingsData: any[]
  ): any {
    // Same implementation as in the API route
    if (!analyticsData) return null;

    const totalViews = analyticsData.totalViews || 0;
    const totalContacts = analyticsData.totalContacts || 0;
    const conversionRate =
      totalViews > 0 ? (totalContacts / totalViews) * 100 : 0;

    const viewsScore = Math.min((totalViews / 1000) * 100, 100);
    const conversionScore = Math.min(conversionRate * 10, 100);
    const listingsScore = Math.min((listingsData.length / 10) * 100, 100);

    const overall =
      viewsScore * 0.4 + conversionScore * 0.4 + listingsScore * 0.2;

    return {
      overall: Math.round(overall),
      responseRate: 85,
      conversionRate: Math.round(conversionRate),
      customerSatisfaction: 90,
      verification: 100,
      breakdown: [
        {
          category: "Views Performance",
          score: Math.round(viewsScore),
          weight: 0.4,
        },
        {
          category: "Conversion Rate",
          score: Math.round(conversionScore),
          weight: 0.4,
        },
        {
          category: "Listing Quality",
          score: Math.round(listingsScore),
          weight: 0.2,
        },
      ],
    };
  }

  private generateRecommendations(
    analyticsData: any,
    listingsData: any[]
  ): any[] {
    // Same implementation as in the API route
    const recommendations = [];

    if (!analyticsData) return recommendations;

    const conversionRate =
      analyticsData.totalViews > 0
        ? (analyticsData.totalContacts / analyticsData.totalViews) * 100
        : 0;

    if (conversionRate < 5) {
      recommendations.push({
        title: "Improve Listing Quality",
        description:
          "Your conversion rate is below average. Consider updating photos, descriptions, and pricing.",
        priority: "high",
      });
    }

    if (listingsData.length < 5) {
      recommendations.push({
        title: "Increase Listing Count",
        description:
          "Having more active listings can significantly increase your visibility and potential earnings.",
        priority: "medium",
      });
    }

    return recommendations;
  }
}

// Export function for cron job or background task
export async function processScheduledReports(): Promise<void> {
  const processor = new ScheduledReportsProcessor();
  await processor.processScheduledReports();
}
