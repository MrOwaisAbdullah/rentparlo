import { NextRequest, NextResponse } from "next/server";
import { processScheduledReports } from "@/lib/scheduled-reports-processor";

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job (in production, you'd verify with a secret token)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-secret";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting scheduled reports processing...");

    // Process all scheduled reports
    await processScheduledReports();

    console.log("Scheduled reports processing completed");

    return NextResponse.json({
      success: true,
      message: "Scheduled reports processed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      {
        error: "Failed to process scheduled reports",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Allow POST requests as well for manual triggering
  return GET(request);
}
