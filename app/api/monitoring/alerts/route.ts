import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface PerformanceAlert {
  metric: string;
  threshold: number;
  operator: "gt" | "lt" | "eq";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  url: string;
  userAgent: string;
  value?: number;
}

export async function POST(request: NextRequest) {
  try {
    const alert: PerformanceAlert = await request.json();

    // Validate required fields
    if (!alert.metric || !alert.message || !alert.severity) {
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

    // Store alert in database
    const { error: dbError } = await supabase
      .from("performance_alerts")
      .insert({
        metric: alert.metric,
        threshold: alert.threshold,
        operator: alert.operator,
        severity: alert.severity,
        message: alert.message,
        url: alert.url,
        user_agent: alert.userAgent,
        user_id: user?.id || null,
        value: alert.value,
        created_at: alert.timestamp,
      });

    if (dbError) {
      console.error("Failed to store alert in database:", dbError);
    }

    // Log alert based on severity
    const logLevel = getLogLevel(alert.severity);
    console[logLevel]("Performance Alert:", {
      metric: alert.metric,
      severity: alert.severity,
      message: alert.message,
      url: alert.url,
      userId: user?.id,
      timestamp: alert.timestamp,
    });

    // Send to monitoring service for high/critical alerts
    if (alert.severity === "high" || alert.severity === "critical") {
      await sendAlertToMonitoringService(alert, user?.id);
    }

    // Check for alert patterns that might indicate systemic issues
    await checkAlertPatterns(alert, supabase);

    return NextResponse.json({
      success: true,
      alertId: `alert_${Date.now()}`,
    });
  } catch (error) {
    console.error("Error processing performance alert:", error);

    return NextResponse.json(
      { error: "Failed to process alert" },
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

    // Check if user is admin
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
    const severity = url.searchParams.get("severity");
    const metric = url.searchParams.get("metric");
    const timeRange = url.searchParams.get("timeRange") || "24h";

    // Calculate time filter
    const timeFilter = getTimeFilter(timeRange);

    let query = supabase
      .from("performance_alerts")
      .select("*")
      .gte("created_at", timeFilter)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (severity) {
      query = query.eq("severity", severity);
    }

    if (metric) {
      query = query.eq("metric", metric);
    }

    const { data: alerts, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    // Get alert statistics
    const { data: stats } = await supabase
      .from("performance_alerts")
      .select("severity")
      .gte("created_at", timeFilter);

    const alertStats = {
      total: stats?.length || 0,
      critical: stats?.filter((s) => s.severity === "critical").length || 0,
      high: stats?.filter((s) => s.severity === "high").length || 0,
      medium: stats?.filter((s) => s.severity === "medium").length || 0,
      low: stats?.filter((s) => s.severity === "low").length || 0,
    };

    return NextResponse.json({
      alerts: alerts || [],
      stats: alertStats,
      timeRange,
    });
  } catch (error) {
    console.error("Error fetching performance alerts:", error);

    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

function getLogLevel(severity: string): "log" | "warn" | "error" {
  switch (severity) {
    case "critical":
    case "high":
      return "error";
    case "medium":
      return "warn";
    default:
      return "log";
  }
}

function getTimeFilter(timeRange: string): string {
  const now = new Date();

  switch (timeRange) {
    case "1h":
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    case "6h":
      return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  }
}

async function sendAlertToMonitoringService(
  alert: PerformanceAlert,
  userId?: string
) {
  try {
    // Send to external monitoring services
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MONITORING_WEBHOOK_TOKEN}`,
        },
        body: JSON.stringify({
          ...alert,
          userId,
          environment: process.env.NODE_ENV,
          service: "dashboard",
        }),
      });
    }

    // Send Slack notification for critical alerts
    if (alert.severity === "critical" && process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `🚨 Critical Performance Alert`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Critical Performance Issue Detected*\n\n*Metric:* ${alert.metric}\n*Message:* ${alert.message}\n*URL:* ${alert.url}\n*Time:* ${alert.timestamp}`,
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Threshold: ${alert.threshold} | Operator: ${alert.operator} | User: ${userId || "Anonymous"}`,
                },
              ],
            },
          ],
        }),
      });
    }
  } catch (error) {
    console.error("Failed to send alert to monitoring service:", error);
  }
}

async function checkAlertPatterns(alert: PerformanceAlert, supabase: any) {
  try {
    // Check for alert frequency patterns
    const recentAlerts = await supabase
      .from("performance_alerts")
      .select("metric, severity")
      .eq("metric", alert.metric)
      .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

    if (recentAlerts.data && recentAlerts.data.length > 5) {
      // Too many alerts for the same metric
      console.warn(`Alert storm detected for metric: ${alert.metric}`);

      // You might want to implement alert suppression here
      await supabase.from("alert_suppressions").upsert({
        metric: alert.metric,
        suppressed_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Suppress for 15 minutes
        reason: "Alert storm detected",
      });
    }

    // Check for cascading failures
    const criticalAlerts = await supabase
      .from("performance_alerts")
      .select("metric")
      .eq("severity", "critical")
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString()); // Last 10 minutes

    if (criticalAlerts.data && criticalAlerts.data.length > 3) {
      console.error(
        "Multiple critical alerts detected - possible system failure"
      );

      // Send escalated alert
      if (process.env.ESCALATION_WEBHOOK_URL) {
        await fetch(process.env.ESCALATION_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "system_failure",
            message: "Multiple critical performance alerts detected",
            alertCount: criticalAlerts.data.length,
            timestamp: new Date().toISOString(),
          }),
        });
      }
    }
  } catch (error) {
    console.error("Error checking alert patterns:", error);
  }
}
