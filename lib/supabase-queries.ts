/**
 * =====================================================
 * RentParlo.pk Supabase Database Queries
 * =====================================================
 * Comprehensive collection of Supabase queries for user management,
 * analytics, seller operations, and database interactions
 */

export {
  validateListingData,
  getSellerDashboardData,
} from "./supabase-queries-missing";

import { createClient } from "../utils/supabase/server";
import { createClient as createBrowserClient } from "../utils/supabase/client";
import {
  User,
  SellerProfile,
  Seller,
  AnalyticsEvent,
  SellerAnalytics,
  ListingAnalytics,
  SubscriptionPackage,
  UserSubscription,
  EnhancedUserSubscription,
  SupportTicket,
  AffiliateCode,
  AffiliateReferral,
} from "@/types";

// Helper function to determine which client to use
function getSupabaseClient() {
  // In server components, we can use cookies, so we use the server client
  // In client components, we use the browser client
  // For now, we'll default to server client but this can be enhanced
  return createClient();
}

// Client-side version for use in client components
function getBrowserSupabaseClient() {
  return createBrowserClient();
}

/**
 * =====================================================
 * USER QUERIES
 * =====================================================
 */

// Get user by ID with full profile information
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      seller_profiles (*)
    `
    )
    .eq("id", userId)
    .single();

  if (error) {
    // Don't log as error if user simply doesn't exist - this is expected in many cases
    if (error.code !== "PGRST116") {
      console.error("Error fetching user:", error);
    }
    return null;
  }

  console.log("User data fetched:", data); // Debugging
  return data;
}

// Client-side version of getUserById for use in client components
export async function getUserByIdClient(userId: string): Promise<User | null> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      seller_profiles (*)
    `
    )
    .eq("id", userId)
    .single();

  if (error) {
    // Don't log as error if user simply doesn't exist - this is expected in many cases
    if (error.code !== "PGRST116") {
      console.error("Error fetching user:", error);
    }
    return null;
  }

  console.log("User data fetched (client):", data); // Debugging
  return data;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    // Don't log as error if user simply doesn't exist
    if (error.code !== "PGRST116") {
      console.error("Error fetching user by email:", error);
    }
    return null;
  }

  return data;
}

// Create or update user profile
export async function upsertUser(
  userData: Partial<User>
): Promise<User | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .upsert(userData)
    .select()
    .single();

  if (error) {
    console.error("Error upserting user:", error);
    return null;
  }

  return data;
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user profile:", error);
    return false;
  }

  return true;
}

// Update user last login
export async function updateUserLastLogin(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({
      last_login: new Date().toISOString(),
      login_count: supabase.rpc("increment_login_count", { user_id: userId }),
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating last login:", error);
    return false;
  }

  return true;
}

/**
 * =====================================================
 * SELLER PROFILE QUERIES
 * =====================================================
 */

// Get seller profile by user ID
export async function getSellerProfile(
  userId: string
): Promise<SellerProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // Don't log as error if seller profile simply doesn't exist - this is expected in many cases
    if (error.code !== "PGRST116") {
      console.error("Error fetching seller profile:", error);
    }
    return null;
  }

  console.log("Seller profile data fetched:", data); // Debugging
  return data;
}

// Get seller profile by username
export async function getSellerProfileByUsername(
  username: string
): Promise<Seller | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seller_profiles")
    .select(
      `
      *,
      users (*)
    `
    )
    .eq("username", username)
    .single();

  if (error) {
    console.error("Error fetching seller by username:", error);
    return null;
  }

  // Check if data exists
  if (!data) {
    return null;
  }

  // Transform the data to match our Seller type
  // The users data is nested under data.users due to the join
  const seller: Seller = {
    ...(data.users || {}),
    guest_id: data.users?.guest_id || null,
    profile: data,
  };

  return seller;
}

// Create seller profile
export async function createSellerProfile(
  profileData: Partial<SellerProfile>
): Promise<SellerProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seller_profiles")
    .insert(profileData)
    .select()
    .single();

  if (error) {
    console.error("Error creating seller profile:", error);
    return null;
  }

  return data;
}

// Update seller profile
export async function updateSellerProfile(
  userId: string,
  updates: Partial<SellerProfile>
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("seller_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating seller profile:", error);
    return false;
  }

  return true;
}

// Get top sellers with tier information
export async function getTopSellers(
  limit: number = 10
): Promise<SellerProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seller_profiles")
    .select(
      `
      *,
      users!seller_profiles_id_fkey (
        name,
        email,
        city,
        is_verified
      )
    `
    )
    .eq("is_verified", true)
    .order("tier_points", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top sellers:", error);
    return [];
  }

  return data || [];
}

// Update seller tier
export async function updateSellerTier(
  sellerId: string,
  newTier: string,
  newPoints: number,
  reason?: string
): Promise<boolean> {
  const supabase = await createClient();

  // Get current tier for history
  const { data: currentProfile } = await supabase
    .from("seller_profiles")
    .select("tier, tier_points")
    .eq("id", sellerId)
    .single();

  if (!currentProfile) return false;

  // Update seller profile
  const { error: updateError } = await supabase
    .from("seller_profiles")
    .update({
      tier: newTier,
      tier_points: newPoints,
      tier_last_updated: new Date().toISOString(),
    })
    .eq("id", sellerId);

  if (updateError) {
    console.error("Error updating seller tier:", updateError);
    return false;
  }

  // Add tier history record
  const { error: historyError } = await supabase
    .from("seller_tier_history")
    .insert({
      seller_id: sellerId,
      old_tier: currentProfile.tier,
      new_tier: newTier,
      points_change: newPoints - currentProfile.tier_points,
      reason: reason || "Automatic tier update",
    });

  if (historyError) {
    console.error("Error creating tier history:", historyError);
  }

  return true;
}

/**
 * =====================================================
 * ANALYTICS QUERIES
 * =====================================================
 */

/**
 * =====================================================
 * ENHANCED SELLER DASHBOARD ANALYTICS QUERIES
 * =====================================================
 */

// Enhanced seller analytics with comprehensive metrics
export async function getEnhancedSellerAnalytics(
  sellerId: string,
  timeRange?: { start: string; end: string }
): Promise<{
  totalViews: number;
  totalContacts: number;
  totalWhatsAppClicks: number;
  totalShares: number;
  totalSaves: number;
  uniqueVisitors: number;
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
  topCities: Array<{ city: string; count: number }>;
  topDevices: Array<{ device_type: string; count: number }>;
  timeSeriesData: Array<{
    date: string;
    views: number;
    contacts: number;
    conversions: number;
  }>;
  listingPerformance: Array<{
    listingId: string;
    title: string;
    views: number;
    contacts: number;
    whatsappClicks: number;
    shares: number;
    saves: number;
    conversionRate: number;
    avgTimeOnPage: number;
    createdAt: string;
    lastActivity: string;
  }>;
}> {
  const supabase = await createClient();

  // Set default time range to last 30 days if not provided
  const endDate = timeRange?.end || new Date().toISOString();
  const startDate =
    timeRange?.start ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Try to use enhanced analytics view first
    const { data: enhancedData, error: enhancedError } = await supabase.rpc(
      "get_enhanced_seller_analytics",
      {
        p_seller_id: sellerId,
        p_start_date: startDate,
        p_end_date: endDate,
      }
    );

    if (!enhancedError && enhancedData) {
      return enhancedData;
    }

    // Fallback to manual aggregation if enhanced view is not available
    console.warn(
      "Enhanced analytics view not available, falling back to manual aggregation"
    );

    // Get all analytics events for the seller in the time range
    const { data: events, error: eventsError } = await supabase
      .from("analytics_events")
      .select(
        `
        event_type,
        listing_id,
        user_id,
        guest_id,
        session_ref,
        city,
        device_type,
        created_at,
        metadata
      `
      )
      .eq("user_id", sellerId)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (eventsError) {
      console.error("Error fetching analytics events:", eventsError);
      throw eventsError;
    }

    // Aggregate the data manually
    const analytics = {
      totalViews: 0,
      totalContacts: 0,
      totalWhatsAppClicks: 0,
      totalShares: 0,
      totalSaves: 0,
      uniqueVisitors: new Set<string>(),
      topCities: new Map<string, number>(),
      topDevices: new Map<string, number>(),
      timeSeriesData: new Map<
        string,
        { views: number; contacts: number; conversions: number }
      >(),
      listingPerformance: new Map<string, any>(),
    };

    // Process each event
    events?.forEach((event) => {
      const date = event.created_at.split("T")[0];
      const visitorId = event.user_id || event.guest_id;

      // Track unique visitors
      if (visitorId) {
        analytics.uniqueVisitors.add(visitorId);
      }

      // Aggregate by event type
      switch (event.event_type) {
        case "view":
          analytics.totalViews++;
          break;
        case "contact_click":
          analytics.totalContacts++;
          break;
        case "WhatsApp_click":
          analytics.totalWhatsAppClicks++;
          break;
        case "share":
          analytics.totalShares++;
          break;
        case "save":
          analytics.totalSaves++;
          break;
      }

      // Track city data
      if (event.city) {
        analytics.topCities.set(
          event.city,
          (analytics.topCities.get(event.city) || 0) + 1
        );
      }

      // Track device data
      if (event.device_type) {
        analytics.topDevices.set(
          event.device_type,
          (analytics.topDevices.get(event.device_type) || 0) + 1
        );
      }

      // Track time series data
      if (!analytics.timeSeriesData.has(date)) {
        analytics.timeSeriesData.set(date, {
          views: 0,
          contacts: 0,
          conversions: 0,
        });
      }
      const dayData = analytics.timeSeriesData.get(date)!;

      if (event.event_type === "view") dayData.views++;
      if (
        event.event_type === "contact_click" ||
        event.event_type === "WhatsApp_click"
      ) {
        dayData.contacts++;
        dayData.conversions++;
      }

      // Track listing performance
      if (event.listing_id) {
        if (!analytics.listingPerformance.has(event.listing_id)) {
          analytics.listingPerformance.set(event.listing_id, {
            listingId: event.listing_id,
            title: "", // Will be filled later
            views: 0,
            contacts: 0,
            whatsappClicks: 0,
            shares: 0,
            saves: 0,
            conversionRate: 0,
            avgTimeOnPage: 0,
            createdAt: event.created_at,
            lastActivity: event.created_at,
          });
        }

        const listing = analytics.listingPerformance.get(event.listing_id)!;
        listing.lastActivity = event.created_at;

        switch (event.event_type) {
          case "view":
            listing.views++;
            break;
          case "contact_click":
            listing.contacts++;
            break;
          case "WhatsApp_click":
            listing.whatsappClicks++;
            break;
          case "share":
            listing.shares++;
            break;
          case "save":
            listing.saves++;
            break;
        }

        // Calculate conversion rate
        listing.conversionRate =
          listing.views > 0
            ? ((listing.contacts + listing.whatsappClicks) / listing.views) *
              100
            : 0;
      }
    });

    // Calculate conversion rate
    const conversionRate =
      analytics.totalViews > 0
        ? ((analytics.totalContacts + analytics.totalWhatsAppClicks) /
            analytics.totalViews) *
          100
        : 0;

    return {
      totalViews: analytics.totalViews,
      totalContacts: analytics.totalContacts,
      totalWhatsAppClicks: analytics.totalWhatsAppClicks,
      totalShares: analytics.totalShares,
      totalSaves: analytics.totalSaves,
      uniqueVisitors: analytics.uniqueVisitors.size,
      conversionRate,
      avgSessionDuration: 0, // Would need session data to calculate
      bounceRate: 0, // Would need session data to calculate
      topCities: Array.from(analytics.topCities.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topDevices: Array.from(analytics.topDevices.entries())
        .map(([device_type, count]) => ({ device_type, count }))
        .sort((a, b) => b.count - a.count),
      timeSeriesData: Array.from(analytics.timeSeriesData.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      listingPerformance: Array.from(
        analytics.listingPerformance.values()
      ).sort((a, b) => b.views - a.views),
    };
  } catch (error) {
    console.error("Error fetching enhanced seller analytics:", error);
    throw error;
  }
}

// Get seller performance metrics for dashboard overview
export async function getSellerPerformanceMetrics(sellerId: string): Promise<{
  performanceScore: number;
  responseRate: number;
  customerSatisfaction: number;
  verificationScore: number;
  tierProgress: {
    currentTier: string;
    currentPoints: number;
    nextTier: string;
    pointsToNext: number;
    progressPercentage: number;
  };
  benchmarks: {
    avgViewsPerListing: number;
    avgConversionRate: number;
    platformAvgConversion: number;
    performanceRank: string;
  };
}> {
  const supabase = await createClient();

  try {
    // Get seller profile for tier information
    const { data: sellerProfile, error: profileError } = await supabase
      .from("seller_profiles")
      .select("tier, tier_points, is_verified, customer_rating, total_reviews")
      .eq("id", sellerId)
      .single();

    if (profileError) {
      console.error("Error fetching seller profile:", profileError);
      throw profileError;
    }

    // Get analytics for performance calculation
    const analytics = await getEnhancedSellerAnalytics(sellerId);

    // Calculate performance score (0-100)
    const verificationScore = sellerProfile.is_verified ? 25 : 0;
    const ratingScore = (sellerProfile.customer_rating || 0) * 5; // Convert 5-star to 25 points
    const conversionScore = Math.min(analytics.conversionRate * 2, 25); // Cap at 25 points
    const activityScore = Math.min(analytics.totalViews / 100, 25); // Cap at 25 points

    const performanceScore =
      verificationScore + ratingScore + conversionScore + activityScore;

    // Calculate tier progress
    const tierPoints = {
      basic: 0,
      bronze: 100,
      silver: 500,
      gold: 1500,
      platinum: 5000,
      diamond: 15000,
    };

    const tiers = Object.keys(tierPoints) as Array<keyof typeof tierPoints>;
    const currentTierIndex = tiers.indexOf(
      sellerProfile.tier as keyof typeof tierPoints
    );
    const nextTierIndex = Math.min(currentTierIndex + 1, tiers.length - 1);
    const nextTier = tiers[nextTierIndex];

    const currentTierPoints =
      tierPoints[sellerProfile.tier as keyof typeof tierPoints];
    const nextTierPoints = tierPoints[nextTier];
    const pointsToNext = nextTierPoints - sellerProfile.tier_points;
    const progressPercentage =
      nextTierIndex > currentTierIndex
        ? ((sellerProfile.tier_points - currentTierPoints) /
            (nextTierPoints - currentTierPoints)) *
          100
        : 100;

    // Calculate benchmarks (simplified - would need platform-wide data for accurate benchmarks)
    const avgViewsPerListing =
      analytics.listingPerformance.length > 0
        ? analytics.totalViews / analytics.listingPerformance.length
        : 0;

    return {
      performanceScore: Math.round(performanceScore),
      responseRate: 85, // Would need response time data
      customerSatisfaction: sellerProfile.customer_rating || 0,
      verificationScore: sellerProfile.is_verified ? 100 : 0,
      tierProgress: {
        currentTier: sellerProfile.tier,
        currentPoints: sellerProfile.tier_points,
        nextTier,
        pointsToNext: Math.max(0, pointsToNext),
        progressPercentage: Math.round(progressPercentage),
      },
      benchmarks: {
        avgViewsPerListing: Math.round(avgViewsPerListing),
        avgConversionRate: Math.round(analytics.conversionRate * 100) / 100,
        platformAvgConversion: 2.5, // Platform average - would be calculated from all sellers
        performanceRank:
          performanceScore >= 80
            ? "Excellent"
            : performanceScore >= 60
              ? "Good"
              : performanceScore >= 40
                ? "Average"
                : "Needs Improvement",
      },
    };
  } catch (error) {
    console.error("Error calculating seller performance metrics:", error);
    throw error;
  }
}

// Get seller analytics for specific time periods with comparison
export async function getSellerAnalyticsComparison(
  sellerId: string,
  currentPeriod: { start: string; end: string },
  previousPeriod: { start: string; end: string }
): Promise<{
  current: any;
  previous: any;
  changes: {
    views: { value: number; percentage: number };
    contacts: { value: number; percentage: number };
    conversions: { value: number; percentage: number };
    uniqueVisitors: { value: number; percentage: number };
  };
}> {
  try {
    const [currentData, previousData] = await Promise.all([
      getEnhancedSellerAnalytics(sellerId, currentPeriod),
      getEnhancedSellerAnalytics(sellerId, previousPeriod),
    ]);

    // Calculate changes
    const calculateChange = (current: number, previous: number) => {
      const value = current - previous;
      const percentage = previous > 0 ? (value / previous) * 100 : 0;
      return { value, percentage: Math.round(percentage * 100) / 100 };
    };

    return {
      current: currentData,
      previous: previousData,
      changes: {
        views: calculateChange(currentData.totalViews, previousData.totalViews),
        contacts: calculateChange(
          currentData.totalContacts,
          previousData.totalContacts
        ),
        conversions: calculateChange(
          currentData.totalContacts + currentData.totalWhatsAppClicks,
          previousData.totalContacts + previousData.totalWhatsAppClicks
        ),
        uniqueVisitors: calculateChange(
          currentData.uniqueVisitors,
          previousData.uniqueVisitors
        ),
      },
    };
  } catch (error) {
    console.error("Error getting seller analytics comparison:", error);
    throw error;
  }
}

// Get listing analytics with enhanced metrics
export async function getEnhancedListingAnalytics(
  listingId: string,
  timeRange?: { start: string; end: string }
): Promise<{
  views: number;
  contacts: number;
  whatsappClicks: number;
  shares: number;
  saves: number;
  uniqueVisitors: number;
  conversionRate: number;
  avgTimeOnPage: number;
  bounceRate: number;
  topCities: Array<{ city: string; count: number }>;
  topDevices: Array<{ device_type: string; count: number }>;
  hourlyDistribution: Array<{ hour: number; views: number }>;
  dailyTrend: Array<{ date: string; views: number; contacts: number }>;
}> {
  const supabase = await createClient();

  const endDate = timeRange?.end || new Date().toISOString();
  const startDate =
    timeRange?.start ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data: events, error } = await supabase
      .from("analytics_events")
      .select(
        `
        event_type,
        user_id,
        guest_id,
        session_ref,
        city,
        device_type,
        created_at,
        metadata
      `
      )
      .eq("listing_id", listingId)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) {
      console.error("Error fetching listing analytics:", error);
      throw error;
    }

    // Aggregate the data
    const analytics = {
      views: 0,
      contacts: 0,
      whatsappClicks: 0,
      shares: 0,
      saves: 0,
      uniqueVisitors: new Set<string>(),
      topCities: new Map<string, number>(),
      topDevices: new Map<string, number>(),
      hourlyDistribution: new Map<number, number>(),
      dailyTrend: new Map<string, { views: number; contacts: number }>(),
    };

    events?.forEach((event) => {
      const visitorId = event.user_id || event.guest_id;
      const hour = new Date(event.created_at).getHours();
      const date = event.created_at.split("T")[0];

      // Track unique visitors
      if (visitorId) {
        analytics.uniqueVisitors.add(visitorId);
      }

      // Aggregate by event type
      switch (event.event_type) {
        case "view":
          analytics.views++;
          break;
        case "contact_click":
          analytics.contacts++;
          break;
        case "WhatsApp_click":
          analytics.whatsappClicks++;
          break;
        case "share":
          analytics.shares++;
          break;
        case "save":
          analytics.saves++;
          break;
      }

      // Track hourly distribution
      analytics.hourlyDistribution.set(
        hour,
        (analytics.hourlyDistribution.get(hour) || 0) + 1
      );

      // Track daily trend
      if (!analytics.dailyTrend.has(date)) {
        analytics.dailyTrend.set(date, { views: 0, contacts: 0 });
      }
      const dayData = analytics.dailyTrend.get(date)!;
      if (event.event_type === "view") dayData.views++;
      if (
        event.event_type === "contact_click" ||
        event.event_type === "WhatsApp_click"
      ) {
        dayData.contacts++;
      }

      // Track city and device data
      if (event.city) {
        analytics.topCities.set(
          event.city,
          (analytics.topCities.get(event.city) || 0) + 1
        );
      }
      if (event.device_type) {
        analytics.topDevices.set(
          event.device_type,
          (analytics.topDevices.get(event.device_type) || 0) + 1
        );
      }
    });

    const conversionRate =
      analytics.views > 0
        ? ((analytics.contacts + analytics.whatsappClicks) / analytics.views) *
          100
        : 0;

    return {
      views: analytics.views,
      contacts: analytics.contacts,
      whatsappClicks: analytics.whatsappClicks,
      shares: analytics.shares,
      saves: analytics.saves,
      uniqueVisitors: analytics.uniqueVisitors.size,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgTimeOnPage: 0, // Would need session duration data
      bounceRate: 0, // Would need session data
      topCities: Array.from(analytics.topCities.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topDevices: Array.from(analytics.topDevices.entries())
        .map(([device_type, count]) => ({ device_type, count }))
        .sort((a, b) => b.count - a.count),
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        views: analytics.hourlyDistribution.get(hour) || 0,
      })),
      dailyTrend: Array.from(analytics.dailyTrend.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  } catch (error) {
    console.error("Error fetching enhanced listing analytics:", error);
    throw error;
  }
}

// Get seller's top performing listings
export async function getTopPerformingListings(
  sellerId: string,
  limit: number = 10,
  timeRange?: { start: string; end: string }
): Promise<
  Array<{
    listingId: string;
    title: string;
    views: number;
    contacts: number;
    whatsappClicks: number;
    conversionRate: number;
    revenue: number;
    performanceScore: number;
  }>
> {
  const supabase = await createClient();

  const endDate = timeRange?.end || new Date().toISOString();
  const startDate =
    timeRange?.start ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Get analytics data grouped by listing
    const { data: analyticsData, error } = await supabase.rpc(
      "get_top_performing_listings",
      {
        p_seller_id: sellerId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_limit: limit,
      }
    );

    if (error) {
      console.error("Error fetching top performing listings:", error);
      // Fallback to manual aggregation if RPC function doesn't exist
      return [];
    }

    return analyticsData || [];
  } catch (error) {
    console.error("Error fetching top performing listings:", error);
    return [];
  }
}

// Get analytics insights and recommendations
export async function getAnalyticsInsights(sellerId: string): Promise<{
  insights: Array<{
    type: "improvement" | "optimization" | "feature";
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    impact: string;
    actionUrl?: string;
    estimatedImprovement?: number;
  }>;
  trends: {
    viewsTrend: "up" | "down" | "stable";
    conversionTrend: "up" | "down" | "stable";
    engagementTrend: "up" | "down" | "stable";
  };
  recommendations: Array<{
    category: string;
    suggestion: string;
    expectedImpact: string;
  }>;
}> {
  try {
    // Get current and previous period data for trend analysis
    const currentPeriod = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    };
    const previousPeriod = {
      start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const comparison = await getSellerAnalyticsComparison(
      sellerId,
      currentPeriod,
      previousPeriod
    );
    const performanceMetrics = await getSellerPerformanceMetrics(sellerId);

    // Analyze trends
    const viewsTrend =
      comparison.changes.views.percentage > 5
        ? "up"
        : comparison.changes.views.percentage < -5
          ? "down"
          : "stable";
    const conversionTrend =
      comparison.changes.conversions.percentage > 5
        ? "up"
        : comparison.changes.conversions.percentage < -5
          ? "down"
          : "stable";
    const engagementTrend =
      comparison.changes.uniqueVisitors.percentage > 5
        ? "up"
        : comparison.changes.uniqueVisitors.percentage < -5
          ? "down"
          : "stable";

    // Generate insights based on performance
    const insights = [];
    const recommendations = [];

    // Low conversion rate insight
    if (comparison.current.conversionRate < 2) {
      insights.push({
        type: "improvement" as const,
        priority: "high" as const,
        title: "Low Conversion Rate",
        description:
          "Your conversion rate is below platform average. Consider improving your listing descriptions and images.",
        impact: "Could increase contacts by 30-50%",
        estimatedImprovement: 40,
      });

      recommendations.push({
        category: "Listing Quality",
        suggestion: "Add more detailed descriptions and high-quality images",
        expectedImpact: "Increase conversion rate by 30-50%",
      });
    }

    // Verification insight
    if (!performanceMetrics.verificationScore) {
      insights.push({
        type: "feature" as const,
        priority: "high" as const,
        title: "Complete Verification",
        description:
          "Verified sellers get 3x more contacts. Complete your verification to boost credibility.",
        impact: "Increase contacts by 200%",
        actionUrl: "/profile/verification",
        estimatedImprovement: 200,
      });
    }

    // Low activity insight
    if (comparison.current.totalViews < 50) {
      insights.push({
        type: "optimization" as const,
        priority: "medium" as const,
        title: "Low Visibility",
        description:
          "Your listings are not getting enough views. Consider featuring your listings or improving SEO.",
        impact: "Increase visibility by 100%",
        estimatedImprovement: 100,
      });

      recommendations.push({
        category: "Visibility",
        suggestion:
          "Feature your best listings and optimize titles with relevant keywords",
        expectedImpact: "Double your listing views",
      });
    }

    return {
      insights,
      trends: {
        viewsTrend,
        conversionTrend,
        engagementTrend,
      },
      recommendations,
    };
  } catch (error) {
    console.error("Error generating analytics insights:", error);
    return {
      insights: [],
      trends: {
        viewsTrend: "stable" as const,
        conversionTrend: "stable" as const,
        engagementTrend: "stable" as const,
      },
      recommendations: [],
    };
  }
}

// Track analytics event with session support
export async function trackAnalyticsEvent(
  eventData: Partial<AnalyticsEvent> & {
    session_id?: string;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    metadata?: Record<string, any>; // Add metadata support
  }
): Promise<boolean> {
  try {
    const supabase = await createClient(); // Use server client for proper authentication

    let sessionId = eventData.session_id;

    // Get or create session if not provided and we have enough data
    if (!sessionId && (eventData.user_id || eventData.guest_id)) {
      try {
        const { data: session, error: sessionError } = await supabase.rpc(
          "get_or_create_session",
          {
            p_user_id: eventData.user_id || null,
            p_guest_id: eventData.guest_id || null,
            p_ip_address: eventData.ip_address || null,
            p_user_agent: eventData.user_agent || null,
            p_referrer: eventData.referrer || null,
          }
        );

        if (!sessionError && session) {
          sessionId = session;
        }
      } catch (error) {
        console.warn(
          "Session creation failed, tracking without session:",
          error
        );
      }
    }

    // For server-side tracking, we want to ensure we always have a guest_id
    // If we have a user_id, we still want to track the guest_id for continuity
    let guestId = eventData.guest_id;
    let userId = eventData.user_id;

    // If we have a user_id, check if the user exists in our database
    if (userId) {
      try {
        const { data: userExists, error: userError } = await supabase
          .from("users")
          .select("id, guest_id")
          .eq("id", userId)
          .single();

        if (userError || !userExists) {
          // User doesn't exist, nullify the user_id
          userId = null;
        } else if (userExists.guest_id) {
          // Use the guest_id from the user profile
          guestId = userExists.guest_id;
        }
      } catch (error) {
        console.warn("Could not verify user existence:", error);
        // If we can't verify, nullify the user_id to avoid FK constraint errors
        userId = null;
      }
    }

    // If we still don't have a guest_id, generate one
    if (!guestId) {
      guestId =
        "guest-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    }

    const { error } = await supabase.from("analytics_events").insert({
      ...eventData,
      user_id: userId, // Use verified user_id or null
      guest_id: guestId, // Ensure guest_id is always set
      session_ref: sessionId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error tracking analytics event:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    return false;
  }
}

// Get listing analytics with enhanced session data
export async function getListingAnalytics(
  listingId: string,
  days: number = 30
): Promise<
  ListingAnalytics & {
    uniqueSessions?: number;
    uniqueUsers?: number;
    avgSessionDuration?: number;
    bounceRate?: number;
  }
> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Try to use enhanced analytics view first
  const { data: enhancedData, error: enhancedError } = await supabase
    .from("enhanced_seller_analytics")
    .select("*")
    .eq("listing_id", listingId)
    .gte("event_date", startDate.toISOString().split("T")[0]);

  if (!enhancedError && enhancedData && enhancedData.length > 0) {
    // Aggregate enhanced data
    const totals = enhancedData.reduce(
      (acc, day) => ({
        views: acc.views + (day.total_views || 0),
        contactClicks: acc.contactClicks + (day.contact_clicks || 0),
        whatsappClicks: acc.whatsappClicks + (day.whatsapp_clicks || 0),
        impressions: acc.impressions + (day.shares || 0), // Using shares as impressions for now
        listingClicks: acc.listingClicks + (day.total_views || 0), // Views as listing clicks
        uniqueSessions: acc.uniqueSessions + (day.unique_sessions || 0),
        uniqueUsers: acc.uniqueUsers + (day.unique_users || 0),
        totalSessionDuration:
          acc.totalSessionDuration + (day.avg_session_duration || 0),
        bounceSessions: acc.bounceSessions + (day.bounce_sessions || 0),
      }),
      {
        views: 0,
        contactClicks: 0,
        whatsappClicks: 0,
        impressions: 0,
        listingClicks: 0,
        uniqueSessions: 0,
        uniqueUsers: 0,
        totalSessionDuration: 0,
        bounceSessions: 0,
      }
    );

    return {
      ...totals,
      avgSessionDuration:
        enhancedData.length > 0
          ? totals.totalSessionDuration / enhancedData.length
          : 0,
      bounceRate:
        totals.uniqueSessions > 0
          ? (totals.bounceSessions / totals.uniqueSessions) * 100
          : 0,
    };
  }

  // Fallback to original analytics query
  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_type, user_id, guest_id, session_ref")
    .eq("listing_id", listingId)
    .gte("created_at", startDate.toISOString());

  if (error) {
    console.error("Error fetching listing analytics:", error);
    return {
      views: 0,
      contactClicks: 0,
      whatsappClicks: 0,
      impressions: 0,
      listingClicks: 0,
      uniqueSessions: 0,
      uniqueUsers: 0,
    };
  }

  const analytics = data.reduce(
    (acc, event) => {
      switch (event.event_type) {
        case "view":
          acc.views++;
          break;
        case "contact_click":
          acc.contactClicks++;
          break;
        case "WhatsApp_click":
          acc.whatsappClicks++;
          break;
        case "impressions":
          acc.impressions++;
          break;
        case "listing_click":
          acc.listingClicks++;
          break;
      }
      return acc;
    },
    {
      views: 0,
      contactClicks: 0,
      whatsappClicks: 0,
      impressions: 0,
      listingClicks: 0,
    }
  );

  // Calculate unique sessions and users
  const uniqueSessions = new Set(
    data.filter((e) => e.session_ref).map((e) => e.session_ref)
  ).size;
  const uniqueUsers = new Set(
    data.filter((e) => e.user_id).map((e) => e.user_id)
  ).size;

  return {
    ...analytics,
    uniqueSessions,
    uniqueUsers,
  };
}

// Get seller analytics
export async function getSellerAnalytics(
  sellerId: string
): Promise<SellerAnalytics> {
  const supabase = await createClient();

  // Get analytics events for seller's listings
  const { data: analyticsData, error: analyticsError } = await supabase.rpc(
    "get_seller_analytics",
    { seller_id: sellerId }
  );

  if (analyticsError) {
    console.error("Error fetching seller analytics:", analyticsError);
  }

  // Get listing counts
  const { count: totalListings } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact" })
    .eq("user_id", sellerId);

  const { count: activeListings } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact" })
    .eq("user_id", sellerId)
    .gte(
      "created_at",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    );

  return {
    totalListings: totalListings || 0,
    activeListings: activeListings || 0,
    totalViews: analyticsData?.total_views || 0,
    totalContactClicks: analyticsData?.total_contact_clicks || 0,
    totalWhatsAppClicks: analyticsData?.total_whatsapp_clicks || 0,
    topListings: analyticsData?.top_listings || [],
    viewsByDay: analyticsData?.views_by_day || [],
  };
}

// Get analytics for date range
export async function getAnalyticsForDateRange(
  startDate: string,
  endDate: string,
  sellerId?: string
) {
  const supabase = await createClient();

  let query = supabase
    .from("analytics_events")
    .select("*")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (sellerId) {
    query = query.eq("user_id", sellerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching analytics for date range:", error);
    return [];
  }

  return data || [];
}

/**
 * =====================================================
 * SUBSCRIPTION QUERIES
 * =====================================================
 */

// Get all subscription packages
export async function getSubscriptionPackages(): Promise<
  SubscriptionPackage[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscription_packages")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) {
    console.error("Error fetching subscription packages:", error);
    return [];
  }

  return data || [];
}

// Get user's active subscription
export async function getUserActiveSubscription(
  userId: string
): Promise<EnhancedUserSubscription | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select(
      `
      *,
      subscription_packages (*)
    `
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("end_date", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }

  return data;
}

// Create user subscription
export async function createUserSubscription(
  subscriptionData: Partial<UserSubscription>
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_subscriptions")
    .insert(subscriptionData);

  if (error) {
    console.error("Error creating user subscription:", error);
    return false;
  }

  return true;
}

/**
 * =====================================================
 * SUPPORT TICKET QUERIES
 * =====================================================
 */

// Create support ticket
export async function createSupportTicket(
  ticketData: Partial<SupportTicket>
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("support_tickets")
    .insert(ticketData)
    .select("id")
    .single();

  if (error) {
    console.error("Error creating support ticket:", error);
    return null;
  }

  return data.id;
}

// Get user's support tickets
export async function getUserSupportTickets(
  userId: string
): Promise<SupportTicket[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user support tickets:", error);
    return [];
  }

  return data || [];
}

// Update support ticket status
export async function updateSupportTicketStatus(
  ticketId: string,
  status: string,
  assignedTo?: string
): Promise<boolean> {
  const supabase = await createClient();

  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (assignedTo) {
    updates.assigned_to = assignedTo;
  }

  if (status === "resolved") {
    updates.resolved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("support_tickets")
    .update(updates)
    .eq("id", ticketId);

  if (error) {
    console.error("Error updating support ticket:", error);
    return false;
  }

  return true;
}

/**
 * =====================================================
 * AFFILIATE PROGRAM QUERIES
 * =====================================================
 */

// Get seller's affiliate codes
export async function getSellerAffiliateCodes(
  sellerId: string
): Promise<AffiliateCode[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("affiliate_codes")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching affiliate codes:", error);
    return [];
  }

  return data || [];
}

// Create affiliate code
export async function createAffiliateCode(
  codeData: Partial<AffiliateCode>
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("affiliate_codes")
    .insert(codeData)
    .select("id")
    .single();

  if (error) {
    console.error("Error creating affiliate code:", error);
    return null;
  }

  return data.id;
}

// Get affiliate code by code string
export async function getAffiliateCodeByCode(
  code: string
): Promise<AffiliateCode | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("affiliate_codes")
    .select("*")
    .eq("code", code)
    .eq("status", "active")
    .single();

  if (error) {
    console.error("Error fetching affiliate code:", error);
    return null;
  }

  return data;
}

// Create affiliate referral
export async function createAffiliateReferral(
  referralData: Partial<AffiliateReferral>
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("affiliate_referrals")
    .insert(referralData);

  if (error) {
    console.error("Error creating affiliate referral:", error);
    return false;
  }

  return true;
}

/**
 * =====================================================
 * AUTHENTICATION LOG QUERIES
 * =====================================================
 */

// Log authentication event
export async function logAuthEvent(
  userId: string | null,
  action: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("auth_logs").insert({
    user_id: userId,
    action,
    success,
    ip_address: ipAddress,
    user_agent: userAgent,
    error_message: errorMessage,
  });

  if (error) {
    console.error("Error logging auth event:", error);
    return false;
  }

  return true;
}

// Get user's recent auth logs
export async function getUserAuthLogs(userId: string, limit: number = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("auth_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching auth logs:", error);
    return [];
  }

  return data || [];
}

/**
 * =====================================================
 * UTILITY FUNCTIONS
 * =====================================================
 */

// Check if username is available
export async function isUsernameAvailable(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase
    .from("seller_profiles")
    .select("id")
    .eq("username", username);

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data, error } = await query.single();

  if (error && error.code === "PGRST116") {
    // No rows returned, username is available
    return true;
  }

  return false;
}

// Check if user has active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription: EnhancedUserSubscription | null =
    await getUserActiveSubscription(userId);
  return !!subscription;
}

// Get Pakistani cities
export async function getPakistaniCities() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching cities:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return [];
  }

  return data || [];
}

// Alias for getCities (used in search page)
export const getCities = getPakistaniCities;

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    return !error;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * =====================================================
 * REAL-TIME SUBSCRIPTIONS
 * =====================================================
 */

// Subscribe to analytics events for a seller
export function subscribeToSellerAnalytics(
  sellerId: string,
  onUpdate: (payload: any) => void
) {
  const supabase = createBrowserClient();

  return supabase
    .channel(`seller_analytics_${sellerId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "analytics_events",
        filter: `user_id=eq.${sellerId}`,
      },
      onUpdate
    )
    .subscribe();
}

// Subscribe to support ticket updates
export function subscribeToSupportTickets(
  userId: string,
  onUpdate: (payload: any) => void
) {
  const supabase = createBrowserClient();

  return supabase
    .channel(`support_tickets_${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "support_tickets",
        filter: `user_id=eq.${userId}`,
      },
      onUpdate
    )
    .subscribe();
}

// Calculate conversion rates for different metrics
export function calculateConversionRate(
  conversions: number,
  views: number,
  type: "percentage" | "decimal" = "percentage"
): number {
  if (views === 0) return 0;
  const rate = conversions / views;
  return type === "percentage" ? rate * 100 : rate;
}

// Get seller dashboard summary data
export async function getSellerDashboardSummary(sellerId: string): Promise<{
  overview: {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalContacts: number;
    conversionRate: number;
    performanceScore: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    metadata?: any;
  }>;
  notifications: Array<{
    type: "info" | "warning" | "success" | "error";
    title: string;
    message: string;
    actionUrl?: string;
  }>;
}> {
  try {
    const [analytics, performanceMetrics] = await Promise.all([
      getEnhancedSellerAnalytics(sellerId),
      getSellerPerformanceMetrics(sellerId),
    ]);

    // Get recent activity (last 7 days)
    const recentStartDate = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const supabase = await createClient();

    const { data: recentEvents } = await supabase
      .from("analytics_events")
      .select("event_type, listing_id, created_at, metadata")
      .eq("user_id", sellerId)
      .gte("created_at", recentStartDate)
      .order("created_at", { ascending: false })
      .limit(10);

    const recentActivity =
      recentEvents?.map((event) => ({
        type: event.event_type,
        description: `${event.event_type} on listing ${event.listing_id}`,
        timestamp: event.created_at,
        metadata: event.metadata,
      })) || [];

    // Generate notifications
    const notifications = [];

    if (analytics.conversionRate < 1) {
      notifications.push({
        type: "warning" as const,
        title: "Low Conversion Rate",
        message:
          "Your conversion rate is below 1%. Consider improving your listings.",
        actionUrl: "/dashboard/analytics",
      });
    }

    if (!performanceMetrics.verificationScore) {
      notifications.push({
        type: "info" as const,
        title: "Complete Verification",
        message: "Verify your profile to increase trust and get more contacts.",
        actionUrl: "/profile/verification",
      });
    }

    if (analytics.totalViews > 0 && analytics.totalContacts === 0) {
      notifications.push({
        type: "warning" as const,
        title: "No Contacts Yet",
        message:
          "Your listings are getting views but no contacts. Check your contact information.",
        actionUrl: "/profile/edit",
      });
    }

    return {
      overview: {
        totalListings: analytics.listingPerformance.length,
        activeListings: analytics.listingPerformance.filter(
          (l) =>
            new Date(l.lastActivity) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        totalViews: analytics.totalViews,
        totalContacts: analytics.totalContacts + analytics.totalWhatsAppClicks,
        conversionRate: analytics.conversionRate,
        performanceScore: performanceMetrics.performanceScore,
      },
      recentActivity,
      notifications,
    };
  } catch (error) {
    console.error("Error fetching seller dashboard summary:", error);
    throw error;
  }
}

// Get geographic analytics for seller
export async function getSellerGeographicAnalytics(
  sellerId: string,
  timeRange?: { start: string; end: string }
): Promise<{
  cityBreakdown: Array<{
    city: string;
    views: number;
    contacts: number;
    conversionRate: number;
  }>;
  topPerformingCities: Array<{ city: string; performanceScore: number }>;
  geographicTrends: Array<{ city: string; trend: "up" | "down" | "stable" }>;
}> {
  const supabase = await createClient();

  const endDate = timeRange?.end || new Date().toISOString();
  const startDate =
    timeRange?.start ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("event_type, city, created_at")
      .eq("user_id", sellerId)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .not("city", "is", null);

    if (error) {
      console.error("Error fetching geographic analytics:", error);
      throw error;
    }

    // Aggregate by city
    const cityData = new Map<string, { views: number; contacts: number }>();

    events?.forEach((event) => {
      if (!event.city) return;

      if (!cityData.has(event.city)) {
        cityData.set(event.city, { views: 0, contacts: 0 });
      }

      const data = cityData.get(event.city)!;
      if (event.event_type === "view") data.views++;
      if (
        event.event_type === "contact_click" ||
        event.event_type === "WhatsApp_click"
      ) {
        data.contacts++;
      }
    });

    // Calculate metrics
    const cityBreakdown = Array.from(cityData.entries())
      .map(([city, data]) => ({
        city,
        views: data.views,
        contacts: data.contacts,
        conversionRate: calculateConversionRate(data.contacts, data.views),
      }))
      .sort((a, b) => b.views - a.views);

    const topPerformingCities = cityBreakdown
      .filter((city) => city.views >= 5) // Minimum threshold for meaningful data
      .map((city) => ({
        city: city.city,
        performanceScore: city.conversionRate * 0.7 + city.views * 0.3, // Weighted score
      }))
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 10);

    return {
      cityBreakdown,
      topPerformingCities,
      geographicTrends: [], // Would need historical data to calculate trends
    };
  } catch (error) {
    console.error("Error fetching geographic analytics:", error);
    throw error;
  }
}

// Get device analytics for seller
export async function getSellerDeviceAnalytics(
  sellerId: string,
  timeRange?: { start: string; end: string }
): Promise<{
  deviceBreakdown: Array<{
    device_type: string;
    views: number;
    contacts: number;
    conversionRate: number;
    percentage: number;
  }>;
  browserBreakdown: Array<{
    browser: string;
    views: number;
    percentage: number;
  }>;
  osBreakdown: Array<{ os: string; views: number; percentage: number }>;
}> {
  const supabase = await createClient();

  const endDate = timeRange?.end || new Date().toISOString();
  const startDate =
    timeRange?.start ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("event_type, device_type, browser, os")
      .eq("user_id", sellerId)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) {
      console.error("Error fetching device analytics:", error);
      throw error;
    }

    // Aggregate device data
    const deviceData = new Map<string, { views: number; contacts: number }>();
    const browserData = new Map<string, number>();
    const osData = new Map<string, number>();
    let totalViews = 0;

    events?.forEach((event) => {
      if (event.event_type === "view") totalViews++;

      // Device breakdown
      if (event.device_type) {
        if (!deviceData.has(event.device_type)) {
          deviceData.set(event.device_type, { views: 0, contacts: 0 });
        }
        const data = deviceData.get(event.device_type)!;
        if (event.event_type === "view") data.views++;
        if (
          event.event_type === "contact_click" ||
          event.event_type === "WhatsApp_click"
        ) {
          data.contacts++;
        }
      }

      // Browser breakdown
      if (event.browser && event.event_type === "view") {
        browserData.set(
          event.browser,
          (browserData.get(event.browser) || 0) + 1
        );
      }

      // OS breakdown
      if (event.os && event.event_type === "view") {
        osData.set(event.os, (osData.get(event.os) || 0) + 1);
      }
    });

    const deviceBreakdown = Array.from(deviceData.entries())
      .map(([device_type, data]) => ({
        device_type,
        views: data.views,
        contacts: data.contacts,
        conversionRate: calculateConversionRate(data.contacts, data.views),
        percentage: totalViews > 0 ? (data.views / totalViews) * 100 : 0,
      }))
      .sort((a, b) => b.views - a.views);

    const browserBreakdown = Array.from(browserData.entries())
      .map(([browser, views]) => ({
        browser,
        views,
        percentage: totalViews > 0 ? (views / totalViews) * 100 : 0,
      }))
      .sort((a, b) => b.views - a.views);

    const osBreakdown = Array.from(osData.entries())
      .map(([os, views]) => ({
        os,
        views,
        percentage: totalViews > 0 ? (views / totalViews) * 100 : 0,
      }))
      .sort((a, b) => b.views - a.views);

    return {
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
    };
  } catch (error) {
    console.error("Error fetching device analytics:", error);
    throw error;
  }
}
