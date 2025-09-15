import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserActiveSubscription } from "@/lib/supabase-queries";

export async function POST(request: NextRequest) {
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

    const { enabled } = await request.json();

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid enabled value" },
        { status: 400 }
      );
    }

    // Get current subscription
    const currentSubscription = await getUserActiveSubscription(user.id);

    if (!currentSubscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Calculate next billing date if enabling auto-renew
    let nextBillingDate = null;
    if (enabled) {
      const endDate = new Date(currentSubscription.end_date);
      const packageDuration =
        currentSubscription.subscription_packages?.duration || 30;
      nextBillingDate = new Date(
        endDate.getTime() + packageDuration * 24 * 60 * 60 * 1000
      );
    }

    // Update subscription auto-renew setting
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        // Note: These fields might need to be added to your schema
        auto_renew: enabled,
        next_billing_date: nextBillingDate?.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentSubscription.id);

    if (updateError) {
      console.error("Error updating auto-renew setting:", updateError);
      return NextResponse.json(
        { error: "Failed to update auto-renew setting" },
        { status: 500 }
      );
    }

    // Log the change for audit purposes
    console.log(
      `Auto-renew ${enabled ? "enabled" : "disabled"} for user ${user.id}`
    );

    return NextResponse.json({
      success: true,
      message: `Auto-renew ${enabled ? "enabled" : "disabled"} successfully`,
      autoRenew: enabled,
      nextBillingDate: nextBillingDate?.toISOString(),
    });
  } catch (error) {
    console.error("Error updating auto-renew:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
