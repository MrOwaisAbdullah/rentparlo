import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getUserActiveSubscription,
  getSubscriptionPackages,
} from "@/lib/supabase-queries";
import { calculateDaysRemaining } from "@/lib/dashboard-utils";

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

    const { packageId, paymentMethod } = await request.json();

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
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

    // Get target package
    const packages = await getSubscriptionPackages();
    const targetPackage = packages.find((pkg) => pkg.id === packageId);

    if (!targetPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Calculate prorated billing
    const daysRemaining = calculateDaysRemaining(currentSubscription.end_date);
    const currentPrice = currentSubscription.subscription_packages?.price || 0;
    const newPrice = targetPackage.price;
    const priceDifference = newPrice - currentPrice;
    const dailyRate = priceDifference / targetPackage.duration;
    const proratedAmount = Math.max(0, dailyRate * daysRemaining);

    const isUpgrade = newPrice > currentPrice;

    // In a real implementation, you would:
    // 1. Process payment for upgrades
    // 2. Handle refunds for downgrades
    // 3. Update subscription in database
    // 4. Send confirmation emails
    // 5. Log the transaction

    // For now, we'll simulate the package change
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        package_id: packageId,
        updated_at: new Date().toISOString(),
        // In real implementation, you'd also update billing fields
      })
      .eq("id", currentSubscription.id);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    // Create a billing record for the change
    const billingRecord = {
      user_id: user.id,
      subscription_id: currentSubscription.id,
      amount: isUpgrade ? proratedAmount : -proratedAmount,
      currency: targetPackage.currency,
      description: `Package ${isUpgrade ? "upgrade" : "downgrade"} to ${targetPackage.name}`,
      status: "completed",
      transaction_type: isUpgrade ? "charge" : "refund",
      created_at: new Date().toISOString(),
    };

    // In a real implementation, you'd save this to a billing_records table
    console.log("Billing record:", billingRecord);

    return NextResponse.json({
      success: true,
      message: `Successfully ${isUpgrade ? "upgraded" : "downgraded"} to ${targetPackage.name}`,
      proratedAmount,
      isUpgrade,
      newPackage: targetPackage,
    });
  } catch (error) {
    console.error("Error changing package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
