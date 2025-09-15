import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface ErrorReport {
  errorId: string;
  timestamp: string;
  componentName: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo?: {
    componentStack: string;
  };
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
}

export async function POST(request: NextRequest) {
  try {
    const errorReport: ErrorReport = await request.json();

    // Validate required fields
    if (!errorReport.errorId || !errorReport.error?.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Store error in database
    const { error: dbError } = await supabase.from("error_logs").insert({
      error_id: errorReport.errorId,
      component_name: errorReport.componentName,
      error_name: errorReport.error.name,
      error_message: errorReport.error.message,
      error_stack: errorReport.error.stack,
      component_stack: errorReport.errorInfo?.componentStack,
      user_agent: errorReport.userAgent,
      url: errorReport.url,
      user_id: user?.id || null,
      session_id: errorReport.sessionId,
      build_version: errorReport.buildVersion,
      created_at: errorReport.timestamp,
    });

    if (dbError) {
      console.error("Failed to store error in database:", dbError);
      // Don't return error to client, just log it
    }

    // Log error for immediate attention in production
    if (process.env.NODE_ENV === "production") {
      console.error("Production Error Report:", {
        errorId: errorReport.errorId,
        component: errorReport.componentName,
        message: errorReport.error.message,
        url: errorReport.url,
        userId: user?.id,
        timestamp: errorReport.timestamp,
      });
    }

    // Send to external monitoring service (e.g., Sentry, LogRocket)
    await sendToMonitoringService(errorReport, user?.id);

    // Check if this is a critical error that needs immediate attention
    const isCritical = checkIfCriticalError(errorReport);
    if (isCritical) {
      await sendCriticalErrorAlert(errorReport, user?.id);
    }

    return NextResponse.json({
      success: true,
      errorId: errorReport.errorId,
    });
  } catch (error) {
    console.error("Error processing error report:", error);

    return NextResponse.json(
      { error: "Failed to process error report" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (you might want to implement proper role checking)
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const component = url.searchParams.get("component");
    const severity = url.searchParams.get("severity");

    let query = supabase
      .from("error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (component) {
      query = query.eq("component_name", component);
    }

    if (severity) {
      // You might want to add a severity field to your error_logs table
      // For now, we'll filter based on error patterns
      if (severity === "critical") {
        query = query.or(
          "error_name.eq.ChunkLoadError,error_message.ilike.%network%"
        );
      }
    }

    const { data: errors, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json({
      errors: errors || [],
      total: errors?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching error logs:", error);

    return NextResponse.json(
      { error: "Failed to fetch error logs" },
      { status: 500 }
    );
  }
}

async function sendToMonitoringService(
  errorReport: ErrorReport,
  userId?: string
) {
  // Example integration with external monitoring service
  // Replace with your actual monitoring service (Sentry, LogRocket, etc.)

  try {
    if (process.env.SENTRY_DSN) {
      // Example Sentry integration
      // You would use @sentry/nextjs for this
      console.log("Would send to Sentry:", errorReport.errorId);
    }

    if (process.env.LOGROCKET_APP_ID) {
      // Example LogRocket integration
      console.log("Would send to LogRocket:", errorReport.errorId);
    }

    // Custom webhook integration
    if (process.env.ERROR_WEBHOOK_URL) {
      await fetch(process.env.ERROR_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ERROR_WEBHOOK_TOKEN}`,
        },
        body: JSON.stringify({
          ...errorReport,
          userId,
          environment: process.env.NODE_ENV,
        }),
      });
    }
  } catch (error) {
    console.error("Failed to send to monitoring service:", error);
  }
}

function checkIfCriticalError(errorReport: ErrorReport): boolean {
  const criticalPatterns = [
    "ChunkLoadError",
    "Network Error",
    "TypeError: Cannot read property",
    "ReferenceError",
    "Payment",
    "Authentication",
    "Database",
  ];

  const errorMessage = errorReport.error.message.toLowerCase();
  const componentName = errorReport.componentName.toLowerCase();

  return criticalPatterns.some(
    (pattern) =>
      errorMessage.includes(pattern.toLowerCase()) ||
      componentName.includes(pattern.toLowerCase())
  );
}

async function sendCriticalErrorAlert(
  errorReport: ErrorReport,
  userId?: string
) {
  try {
    // Send email alert to development team
    if (process.env.ALERT_EMAIL_WEBHOOK) {
      await fetch(process.env.ALERT_EMAIL_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: `🚨 Critical Error in ${errorReport.componentName}`,
          message: `
Critical Error Detected:

Error ID: ${errorReport.errorId}
Component: ${errorReport.componentName}
Error: ${errorReport.error.name}: ${errorReport.error.message}
URL: ${errorReport.url}
User ID: ${userId || "Anonymous"}
Timestamp: ${errorReport.timestamp}

Stack Trace:
${errorReport.error.stack}

Component Stack:
${errorReport.errorInfo?.componentStack}
          `,
          priority: "high",
        }),
      });
    }

    // Send Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `🚨 Critical Error in Dashboard`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Critical Error Detected*\n\n*Component:* ${errorReport.componentName}\n*Error:* ${errorReport.error.message}\n*URL:* ${errorReport.url}\n*Time:* ${errorReport.timestamp}`,
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "View Details",
                  },
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/errors/${errorReport.errorId}`,
                },
              ],
            },
          ],
        }),
      });
    }
  } catch (error) {
    console.error("Failed to send critical error alert:", error);
  }
}
