import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getUserActiveSubscription,
  getSubscriptionPackages,
} from "@/lib/supabase-queries";
import {
  EnhancedUserSubscription,
  SubscriptionPackage,
  PackageUsage,
  BillingRecord,
} from "@/types";

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

    // Get user's active subscription
    const currentSubscription = await getUserActiveSubscription(user.id);
    const availablePackages = await getSubscriptionPackages();
    const billingHistory = await getBillingHistory(user.id);

    if (!currentSubscription) {
      const emptyUsage: PackageUsage = {
        listingsUsed: 0,
        listingsLimit: 0,
        featuredListingsUsed: 0,
        featuredListingsLimit: 0,
        analyticsAccessDays: 0,
        storageUsed: 0,
        storageLimit: 0,
      };

      return NextResponse.json({
        currentSubscription: null,
        availablePackages,
        usage: emptyUsage,
        billingHistory,
      });
    }

    // Calculate package usage
    const usage = await calculatePackageUsage(user.id, currentSubscription);

    return NextResponse.json({
      currentSubscription,
      availablePackages,
      usage,
      billingHistory,
    });
  } catch (error) {
    console.error("Error fetching package data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function calculatePackageUsage(
  userId: string,
  subscription: EnhancedUserSubscription
): Promise<PackageUsage> {
  const supabase = await createClient();

  // Get user's listings count
  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("id, isFeatured")
    .eq("sellerId", userId)
    .eq("status", "active");

  if (listingsError) {
    console.error("Error fetching listings:", listingsError);
  }

  const listingsUsed = listings?.length || 0;
  const featuredListingsUsed =
    listings?.filter((l) => l.isFeatured).length || 0;

  // Calculate storage usage (placeholder - would need actual file size calculation)
  const storageUsed = listingsUsed * 5; // Estimate 5MB per listing

  // Calculate analytics access days remaining
  const subscriptionStart = new Date(subscription.start_date);
  const now = new Date();
  const daysSinceStart = Math.floor(
    (now.getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const analyticsAccessDays = Math.max(
    0,
    (subscription.subscription_packages?.analytics_days || 30) - daysSinceStart
  );

  const packageLimits = subscription.subscription_packages;

  return {
    listingsUsed,
    listingsLimit: packageLimits?.max_listings || 0,
    featuredListingsUsed,
    featuredListingsLimit: packageLimits?.max_featured_listings || 0,
    analyticsAccessDays,
    storageUsed,
    storageLimit: 1000, // Default 1GB in MB
  };
}

async function getBillingHistory(userId: string): Promise<BillingRecord[]> {
  const supabase = await createClient();

  // Get billing records from user_subscriptions with transaction details
  const { data: subscriptions, error } = await supabase
    .from("user_subscriptions")
    .select(
      `
      id,
      created_at,
      transaction_id,
      payment_method,
      subscription_packages (
        price,
        currency,
        name
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching billing history:", error);
    return [];
  }

  // Transform to BillingRecord format
  return (
    subscriptions?.map((sub, index) => ({
      id: sub.id,
      amount: sub.subscription_packages?.price || 0,
      currency: sub.subscription_packages?.currency || "PKR",
      date: sub.created_at,
      status: "paid" as const, // Assuming all records are paid
      description: `${sub.subscription_packages?.name || "Package"} Subscription`,
      invoiceUrl: undefined, // Would be generated from transaction_id
    })) || []
  );
}
