import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getUserActiveSubscription,
  getSubscriptionPackages,
  createUserSubscription,
  getSubscriptionPackageByName,
} from "@/lib/supabase-queries";
import { getListingsBySeller } from "@/lib/sanity-queries";
import {
  EnhancedUserSubscription,
  SubscriptionPackage,
  PackageUsage,
  BillingRecord,
  UserSubscription,
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
    let currentSubscription = await getUserActiveSubscription(user.id);
    const availablePackages = await getSubscriptionPackages();
    const billingHistory = await getBillingHistory(user.id);

    // If no active subscription, check if user is a seller and create default Basic package
    if (!currentSubscription) {
      // Check if user is a seller
      const { data: sellerProfile, error: sellerError } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!sellerError && sellerProfile) {
        console.log("User is a seller, creating default Basic subscription");
        // User is a seller, create default Basic subscription
        const basicPackage = await getSubscriptionPackageByName("Basic");
        
        console.log("Basic package found:", basicPackage);
        
        if (basicPackage) {
          // Create default subscription
          const subscriptionData: Partial<UserSubscription> = {
            user_id: user.id,
            package_id: basicPackage.id,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            status: "active"
          };
          
          const success = await createUserSubscription(subscriptionData);
          console.log("Subscription creation success:", success);
          
          if (success) {
            // Fetch the newly created subscription
            currentSubscription = await getUserActiveSubscription(user.id);
            console.log("Newly created subscription:", currentSubscription);
          }
        } else {
          console.log("Basic package not found, trying fallback");
          // Fallback: try to find any basic-like package from available packages
          const basicLikePackage = availablePackages.find(pkg => 
            pkg.name.toLowerCase().includes('basic') || pkg.price === 0
          );
          
          console.log("Basic-like package found:", basicLikePackage);
          
          if (basicLikePackage) {
            // Create default subscription with fallback package
            const subscriptionData: Partial<UserSubscription> = {
              user_id: user.id,
              package_id: basicLikePackage.id,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
              status: "active"
            };
            
            const success = await createUserSubscription(subscriptionData);
            console.log("Fallback subscription creation success:", success);
            
            if (success) {
              // Fetch the newly created subscription
              currentSubscription = await getUserActiveSubscription(user.id);
              console.log("Newly created fallback subscription:", currentSubscription);
            }
          } else {
            console.log("No basic-like package found either");
            // If we still can't find a package, create a minimal one
            if (availablePackages.length > 0) {
              const firstPackage = availablePackages[0];
              console.log("Using first available package as fallback:", firstPackage);
              
              const subscriptionData: Partial<UserSubscription> = {
                user_id: user.id,
                package_id: firstPackage.id,
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
                status: "active"
              };
              
              const success = await createUserSubscription(subscriptionData);
              console.log("Minimal fallback subscription creation success:", success);
              
              if (success) {
                // Fetch the newly created subscription
                currentSubscription = await getUserActiveSubscription(user.id);
                console.log("Newly created minimal fallback subscription:", currentSubscription);
              }
            }
          }
        }
      }
    }

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
  // Get user's listings count from Sanity
  let sellerListings: any[] = [];
  let listingsError: any = null;
  
  try {
    sellerListings = await getListingsBySeller(userId);
  } catch (error) {
    listingsError = error;
    console.error("Error fetching listings from Sanity:", listingsError);
  }

  if (listingsError) {
    console.error("Error fetching listings:", listingsError);
  }

  const listingsUsed = sellerListings?.length || 0;
  const featuredListingsUsed =
    sellerListings?.filter((l) => l.badges && l.badges.includes('featured')).length || 0;

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
    subscriptions?.map((sub: any) => {
      // Handle case where subscription_packages might be an array
      const packageData = Array.isArray(sub.subscription_packages) 
        ? sub.subscription_packages[0] 
        : sub.subscription_packages;
      
      return {
        id: sub.id,
        amount: packageData?.price || 0,
        currency: packageData?.currency || "PKR",
        date: sub.created_at,
        status: "paid" as const, // Assuming all records are paid
        description: `${packageData?.name || "Package"} Subscription`,
        invoiceUrl: undefined, // Would be generated from transaction_id
      };
    }) || []
  );
}
