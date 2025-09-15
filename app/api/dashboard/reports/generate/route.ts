import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  generateAnalyticsReport,
  generateListingReport,
  generateComprehensiveReport,
  PDFReportOptions,
  ReportData,
} from "@/lib/pdf-export-utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      reportType,
      template,
      title,
      subtitle,
      timeRange,
      includeCharts,
      includeRecommendations,
      sellerId,
    } = body;

    // Validate required fields
    if (!reportType || !template || !sellerId) {
      return NextResponse.json(
        { error: "Missing required fields: reportType, template, sellerId" },
        { status: 400 }
      );
    }

    // Verify user has access to this seller data
    const { data: sellerProfile, error: sellerError } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("id", sellerId)
      .single();

    if (sellerError || !sellerProfile) {
      return NextResponse.json(
        { error: "Seller not found or access denied" },
        { status: 403 }
      );
    }

    // Fetch analytics data
    const { data: analyticsData, error: analyticsError } = await supabase.rpc(
      "get_seller_analytics",
      {
        seller_id: sellerId,
        start_date: timeRange?.start || null,
        end_date: timeRange?.end || null,
      }
    );

    if (analyticsError) {
      console.error("Error fetching analytics:", analyticsError);
      return NextResponse.json(
        { error: "Failed to fetch analytics data" },
        { status: 500 }
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
      .eq("seller_id", sellerId)
      .eq("status", "active");

    if (listingsError) {
      console.error("Error fetching listings:", listingsError);
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
        const whatsappClicks = events.filter(
          (e) => e.event_type === "whatsapp_click"
        ).length;

        return {
          listingId: listing.id,
          title: listing.title,
          views,
          contacts,
          whatsappClicks,
          shares: 0, // Would need to be calculated from actual data
          saves: 0, // Would need to be calculated from actual data
          conversionRate: views > 0 ? (contacts / views) * 100 : 0,
          avgTimeOnPage: 0, // Would need session data
          createdAt: listing.created_at,
          lastActivity:
            events.length > 0
              ? events[events.length - 1].created_at
              : listing.created_at,
        };
      }) || [];

    // Generate report options
    const reportOptions: PDFReportOptions = {
      title: title || "Dashboard Report",
      subtitle: subtitle || `Generated on ${new Date().toLocaleDateString()}`,
      timeRange,
      includeCharts: includeCharts || false,
      includeRecommendations: includeRecommendations || true,
      template: template as "standard" | "executive" | "detailed",
      branding: {
        companyName: "RentParLo.pk",
        colors: {
          primary: "#428bca",
          secondary: "#5cb85c",
        },
      },
    };

    // Generate PDF based on report type
    let pdfBlob: Blob;

    switch (reportType) {
      case "analytics":
        if (!analyticsData) {
          return NextResponse.json(
            { error: "No analytics data available" },
            { status: 400 }
          );
        }
        pdfBlob = await generateAnalyticsReport(analyticsData, reportOptions);
        break;

      case "listings":
        if (!processedListings.length) {
          return NextResponse.json(
            { error: "No listings data available" },
            { status: 400 }
          );
        }
        pdfBlob = await generateListingReport(processedListings, reportOptions);
        break;

      case "comprehensive":
        const reportData: ReportData = {
          analytics: analyticsData,
          listings: processedListings,
          profile: sellerProfile,
          performanceScore: calculatePerformanceScore(
            analyticsData,
            processedListings
          ),
          recommendations: generateRecommendations(
            analyticsData,
            processedListings
          ),
        };
        pdfBlob = await generateComprehensiveReport(reportData, reportOptions);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    // Convert blob to buffer for response
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return PDF as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title || "report"}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Internal server error during report generation" },
      { status: 500 }
    );
  }
}

// Helper function to calculate performance score
function calculatePerformanceScore(
  analyticsData: any,
  listingsData: any[]
): any {
  if (!analyticsData) return null;

  const totalViews = analyticsData.totalViews || 0;
  const totalContacts = analyticsData.totalContacts || 0;
  const conversionRate =
    totalViews > 0 ? (totalContacts / totalViews) * 100 : 0;

  // Simple performance scoring algorithm
  const viewsScore = Math.min((totalViews / 1000) * 100, 100);
  const conversionScore = Math.min(conversionRate * 10, 100);
  const listingsScore = Math.min((listingsData.length / 10) * 100, 100);

  const overall =
    viewsScore * 0.4 + conversionScore * 0.4 + listingsScore * 0.2;

  return {
    overall: Math.round(overall),
    responseRate: 85, // Would be calculated from actual response data
    conversionRate: Math.round(conversionRate),
    customerSatisfaction: 90, // Would be calculated from ratings
    verification: 100, // Based on verification status
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

// Helper function to generate recommendations
function generateRecommendations(
  analyticsData: any,
  listingsData: any[]
): any[] {
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
        "Your conversion rate is below average. Consider updating photos, descriptions, and pricing to attract more inquiries.",
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

  if (analyticsData.totalViews < 100) {
    recommendations.push({
      title: "Optimize for Search",
      description:
        "Your listings may not be appearing in search results. Review your titles, descriptions, and categories.",
      priority: "high",
    });
  }

  return recommendations;
}
