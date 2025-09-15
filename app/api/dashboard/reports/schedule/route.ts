import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
      name,
      reportType,
      template,
      frequency,
      emailRecipients,
      reportConfig,
      sellerId,
    } = body;

    // Validate required fields
    if (
      !name ||
      !reportType ||
      !template ||
      !frequency ||
      !emailRecipients ||
      !sellerId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user has access to this seller
    const { data: sellerProfile, error: sellerError } = await supabase
      .from("seller_profiles")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", sellerId)
      .single();

    if (sellerError || !sellerProfile) {
      return NextResponse.json(
        { error: "Seller not found or access denied" },
        { status: 403 }
      );
    }

    // Calculate next run date
    const nextRunDate = calculateNextRunDate(frequency);

    // Create scheduled report record
    const { data: scheduledReport, error: insertError } = await supabase
      .from("scheduled_reports")
      .insert({
        user_id: user.id,
        seller_id: sellerId,
        name,
        report_type: reportType,
        template,
        frequency,
        email_recipients: emailRecipients
          .split(",")
          .map((email: string) => email.trim()),
        report_config: reportConfig || {},
        next_run_date: nextRunDate,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating scheduled report:", insertError);
      return NextResponse.json(
        { error: "Failed to create scheduled report" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      scheduledReport: {
        id: scheduledReport.id,
        name: scheduledReport.name,
        frequency: scheduledReport.frequency,
        nextRun: scheduledReport.next_run_date,
        template: scheduledReport.template,
      },
    });
  } catch (error) {
    console.error("Schedule report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json(
        { error: "sellerId is required" },
        { status: 400 }
      );
    }

    // Fetch scheduled reports for the user and seller
    const { data: scheduledReports, error: fetchError } = await supabase
      .from("scheduled_reports")
      .select("*")
      .eq("user_id", user.id)
      .eq("seller_id", sellerId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching scheduled reports:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch scheduled reports" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scheduledReports: scheduledReports.map((report) => ({
        id: report.id,
        name: report.name,
        frequency: report.frequency,
        nextRun: report.next_run_date,
        template: report.template,
        emailRecipients: report.email_recipients,
        reportType: report.report_type,
        createdAt: report.created_at,
      })),
    });
  } catch (error) {
    console.error("Fetch scheduled reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required" },
        { status: 400 }
      );
    }

    // Delete the scheduled report (soft delete by setting is_active to false)
    const { error: deleteError } = await supabase
      .from("scheduled_reports")
      .update({ is_active: false })
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting scheduled report:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete scheduled report" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete scheduled report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateNextRunDate(frequency: string): string {
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
    default:
      now.setDate(now.getDate() + 7); // Default to weekly
  }

  return now.toISOString();
}
