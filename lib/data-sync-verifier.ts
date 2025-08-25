/**
 * =====================================================
 * Data Synchronization Verifier
 * =====================================================
 * Comprehensive system to verify and maintain data consistency
 * between Sanity CMS and Supabase database
 */

import { createClient } from "@/utils/supabase/server";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { client as sanityClient } from "@/lib/sanity";

export interface SyncVerificationResult {
  consistent: boolean;
  errors: SyncError[];
  warnings: SyncWarning[];
  statistics: SyncStatistics;
}

export interface SyncError {
  type:
    | "MISSING_REFERENCE"
    | "DATA_MISMATCH"
    | "ORPHANED_RECORD"
    | "CONSTRAINT_VIOLATION";
  severity: "HIGH" | "MEDIUM" | "LOW";
  entity: string;
  entityId: string;
  description: string;
  suggestedFix?: string;
}

export interface SyncWarning {
  type: "PERFORMANCE" | "DATA_QUALITY" | "DEPRECATED_FIELD";
  entity: string;
  description: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
}

export interface SyncStatistics {
  totalListings: number;
  totalUsers: number;
  totalSellerProfiles: number;
  orphanedListings: number;
  missingReferences: number;
  lastSyncCheck: string;
  avgResponseTime: number;
}

export class DataSyncVerifier {
  private supabase;
  private sanity;
  private isServer: boolean;

  constructor(isServer = true) {
    this.isServer = isServer;
    this.supabase = isServer ? null : createBrowserClient();
    this.sanity = sanityClient;
  }

  private async getSupabaseClient() {
    if (this.isServer) {
      return await createClient();
    }
    return this.supabase!;
  }

  /**
   * Comprehensive data synchronization verification
   */
  async verifyDataSync(): Promise<SyncVerificationResult> {
    const startTime = Date.now();
    const errors: SyncError[] = [];
    const warnings: SyncWarning[] = [];

    try {
      // Verify listing-seller relationships
      const listingErrors = await this.verifyListingSellerSync();
      errors.push(...listingErrors);

      // Verify user-seller profile consistency
      const userErrors = await this.verifyUserSellerProfileSync();
      errors.push(...userErrors);

      // Verify category references
      const categoryErrors = await this.verifyCategoryReferences();
      errors.push(...categoryErrors);

      // Verify analytics data consistency
      const analyticsErrors = await this.verifyAnalyticsConsistency();
      errors.push(...analyticsErrors);

      // Check for orphaned records
      const orphanedErrors = await this.findOrphanedRecords();
      errors.push(...orphanedErrors);

      // Performance and data quality checks
      const qualityWarnings = await this.checkDataQuality();
      warnings.push(...qualityWarnings);

      // Generate statistics
      const statistics = await this.generateSyncStatistics();
      statistics.avgResponseTime = Date.now() - startTime;

      return {
        consistent: errors.filter((e) => e.severity === "HIGH").length === 0,
        errors,
        warnings,
        statistics,
      };
    } catch (error) {
      console.error("Error during sync verification:", error);

      errors.push({
        type: "CONSTRAINT_VIOLATION",
        severity: "HIGH",
        entity: "system",
        entityId: "sync-verifier",
        description: `Sync verification failed: ${error.message}`,
        suggestedFix: "Check database connectivity and permissions",
      });

      return {
        consistent: false,
        errors,
        warnings,
        statistics: await this.generateSyncStatistics(),
      };
    }
  }

  /**
   * Verify listing-seller relationship consistency
   */
  private async verifyListingSellerSync(): Promise<SyncError[]> {
    const errors: SyncError[] = [];
    const supabase = await this.getSupabaseClient();

    try {
      // Get all listings from Sanity
      const sanityListings = await this.sanity.fetch(`
        *[_type == "listing"] {
          _id,
          title,
          supabaseId,
          status,
          createdAt
        }
      `);

      // Get all seller profiles from Supabase
      const { data: sellerProfiles, error: sellersError } = await supabase
        .from("seller_profiles")
        .select("id, username, is_active");

      if (sellersError) throw sellersError;

      const sellerIds = new Set(sellerProfiles?.map((s) => s.id) || []);

      // Check for listings with missing seller references
      for (const listing of sanityListings) {
        if (!listing.supabaseId) {
          errors.push({
            type: "MISSING_REFERENCE",
            severity: "HIGH",
            entity: "listing",
            entityId: listing._id,
            description: `Listing "${listing.title}" has no supabaseId reference`,
            suggestedFix: "Update listing with valid seller supabaseId",
          });
          continue;
        }

        if (!sellerIds.has(listing.supabaseId)) {
          errors.push({
            type: "MISSING_REFERENCE",
            severity: "HIGH",
            entity: "listing",
            entityId: listing._id,
            description: `Listing "${listing.title}" references non-existent seller: ${listing.supabaseId}`,
            suggestedFix:
              "Either create missing seller profile or update listing reference",
          });
        }
      }

      // Check for inactive sellers with active listings
      const inactiveSellerIds =
        sellerProfiles?.filter((s) => !s.is_active).map((s) => s.id) || [];

      for (const sellerId of inactiveSellerIds) {
        const sellerListings = sanityListings.filter(
          (l) => l.supabaseId === sellerId && l.status === "active"
        );

        if (sellerListings.length > 0) {
          errors.push({
            type: "DATA_MISMATCH",
            severity: "MEDIUM",
            entity: "seller",
            entityId: sellerId,
            description: `Inactive seller has ${sellerListings.length} active listings`,
            suggestedFix:
              "Either reactivate seller or deactivate their listings",
          });
        }
      }
    } catch (error) {
      errors.push({
        type: "CONSTRAINT_VIOLATION",
        severity: "HIGH",
        entity: "listing-seller-sync",
        entityId: "verification",
        description: `Failed to verify listing-seller sync: ${error.message}`,
      });
    }

    return errors;
  }

  /**
   * Verify user-seller profile consistency
   */
  private async verifyUserSellerProfileSync(): Promise<SyncError[]> {
    const errors: SyncError[] = [];
    const supabase = await this.getSupabaseClient();

    try {
      // Get users with seller role
      const { data: sellerUsers, error: usersError } = await supabase
        .from("users")
        .select("id, email, role, created_at")
        .eq("role", "seller");

      if (usersError) throw usersError;

      // Get all seller profiles
      const { data: sellerProfiles, error: profilesError } = await supabase
        .from("seller_profiles")
        .select("id, username, created_at, is_verified");

      if (profilesError) throw profilesError;

      const profileIds = new Set(sellerProfiles?.map((p) => p.id) || []);
      const userIds = new Set(sellerUsers?.map((u) => u.id) || []);

      // Check for seller users without profiles
      for (const user of sellerUsers || []) {
        if (!profileIds.has(user.id)) {
          errors.push({
            type: "MISSING_REFERENCE",
            severity: "HIGH",
            entity: "user",
            entityId: user.id,
            description: `Seller user ${user.email} has no seller profile`,
            suggestedFix: "Create seller profile for this user",
          });
        }
      }

      // Check for seller profiles without users
      for (const profile of sellerProfiles || []) {
        if (!userIds.has(profile.id)) {
          errors.push({
            type: "ORPHANED_RECORD",
            severity: "HIGH",
            entity: "seller_profile",
            entityId: profile.id,
            description: `Seller profile ${profile.username} has no corresponding user`,
            suggestedFix: "Either create user or remove orphaned profile",
          });
        }
      }
    } catch (error) {
      errors.push({
        type: "CONSTRAINT_VIOLATION",
        severity: "HIGH",
        entity: "user-seller-sync",
        entityId: "verification",
        description: `Failed to verify user-seller sync: ${error.message}`,
      });
    }

    return errors;
  }

  /**
   * Verify category references in listings
   */
  private async verifyCategoryReferences(): Promise<SyncError[]> {
    const errors: SyncError[] = [];

    try {
      // Get all categories from Sanity
      const categories = await this.sanity.fetch(`
        *[_type == "category"] {
          _id,
          title,
          slug
        }
      `);

      const categorySlugs = new Set(categories.map((c: any) => c.slug));

      // Get all listings with category references
      const listings = await this.sanity.fetch(`
        *[_type == "listing"] {
          _id,
          title,
          category->{slug}
        }
      `);

      for (const listing of listings) {
        if (
          listing.category?.slug &&
          !categorySlugs.has(listing.category.slug)
        ) {
          errors.push({
            type: "MISSING_REFERENCE",
            severity: "MEDIUM",
            entity: "listing",
            entityId: listing._id,
            description: `Listing "${listing.title}" references non-existent category: ${listing.category.slug}`,
            suggestedFix:
              "Update listing with valid category reference or create missing category",
          });
        }

        if (!listing.category) {
          errors.push({
            type: "MISSING_REFERENCE",
            severity: "LOW",
            entity: "listing",
            entityId: listing._id,
            description: `Listing "${listing.title}" has no category assigned`,
            suggestedFix: "Assign appropriate category to listing",
          });
        }
      }
    } catch (error) {
      errors.push({
        type: "CONSTRAINT_VIOLATION",
        severity: "HIGH",
        entity: "category-references",
        entityId: "verification",
        description: `Failed to verify category references: ${error.message}`,
      });
    }

    return errors;
  }

  /**
   * Verify analytics data consistency
   */
  private async verifyAnalyticsConsistency(): Promise<SyncError[]> {
    const errors: SyncError[] = [];
    const supabase = await this.getSupabaseClient();

    try {
      // Get analytics events
      const { data: events, error: eventsError } = await supabase
        .from("analytics_events")
        .select("listing_id, user_id, created_at")
        .not("listing_id", "is", null);

      if (eventsError) throw eventsError;

      // Get existing listings from Sanity
      const listings = await this.sanity.fetch(`
        *[_type == "listing"] {
          _id
        }
      `);

      const listingIds = new Set(listings.map((l: any) => l._id));

      // Check for analytics events referencing non-existent listings
      const orphanedEvents =
        events?.filter(
          (event) => event.listing_id && !listingIds.has(event.listing_id)
        ) || [];

      for (const event of orphanedEvents) {
        errors.push({
          type: "ORPHANED_RECORD",
          severity: "LOW",
          entity: "analytics_event",
          entityId: event.listing_id,
          description: `Analytics event references deleted listing: ${event.listing_id}`,
          suggestedFix: "Clean up orphaned analytics events",
        });
      }

      // Check for unusual analytics patterns
      const { data: suspiciousEvents } = await supabase
        .from("analytics_events")
        .select("user_id, COUNT(*) as event_count")
        .group("user_id")
        .having("COUNT(*)", "gt", 1000);

      for (const suspicious of suspiciousEvents || []) {
        errors.push({
          type: "DATA_MISMATCH",
          severity: "MEDIUM",
          entity: "analytics",
          entityId: suspicious.user_id,
          description: `User has unusually high analytics events: ${suspicious.event_count}`,
          suggestedFix: "Review for potential bot activity or spam",
        });
      }
    } catch (error) {
      errors.push({
        type: "CONSTRAINT_VIOLATION",
        severity: "HIGH",
        entity: "analytics-consistency",
        entityId: "verification",
        description: `Failed to verify analytics consistency: ${error.message}`,
      });
    }

    return errors;
  }

  /**
   * Find orphaned records across both systems
   */
  private async findOrphanedRecords(): Promise<SyncError[]> {
    const errors: SyncError[] = [];
    const supabase = await this.getSupabaseClient();

    try {
      // Find Sanity listings without valid seller profiles
      const listings = await this.sanity.fetch(`
        *[_type == "listing" && defined(supabaseId)] {
          _id,
          title,
          supabaseId
        }
      `);

      const { data: activeSellerIds } = await supabase
        .from("seller_profiles")
        .select("id")
        .eq("is_active", true);

      const activeSellers = new Set(activeSellerIds?.map((s) => s.id) || []);

      const orphanedListings = listings.filter(
        (listing: any) => !activeSellers.has(listing.supabaseId)
      );

      for (const listing of orphanedListings) {
        errors.push({
          type: "ORPHANED_RECORD",
          severity: "MEDIUM",
          entity: "listing",
          entityId: listing._id,
          description: `Orphaned listing "${listing.title}" - seller profile inactive or deleted`,
          suggestedFix: "Archive listing or reassign to active seller",
        });
      }
    } catch (error) {
      errors.push({
        type: "CONSTRAINT_VIOLATION",
        severity: "HIGH",
        entity: "orphaned-records",
        entityId: "verification",
        description: `Failed to find orphaned records: ${error.message}`,
      });
    }

    return errors;
  }

  /**
   * Check data quality and performance issues
   */
  private async checkDataQuality(): Promise<SyncWarning[]> {
    const warnings: SyncWarning[] = [];

    try {
      // Check for listings without images
      const listingsWithoutImages = await this.sanity.fetch(`
        *[_type == "listing" && (!defined(images) || length(images) == 0)] {
          _id,
          title
        }
      `);

      if (listingsWithoutImages.length > 0) {
        warnings.push({
          type: "DATA_QUALITY",
          entity: "listing",
          description: `${listingsWithoutImages.length} listings have no images`,
          impact: "MEDIUM",
        });
      }

      // Check for very long descriptions (performance issue)
      const longDescriptions = await this.sanity.fetch(`
        *[_type == "listing" && length(description) > 2000] {
          _id,
          title
        }
      `);

      if (longDescriptions.length > 0) {
        warnings.push({
          type: "PERFORMANCE",
          entity: "listing",
          description: `${longDescriptions.length} listings have very long descriptions (>2000 chars)`,
          impact: "LOW",
        });
      }

      // Check for incomplete seller profiles
      const supabase = await this.getSupabaseClient();
      const { data: incompleteProfiles } = await supabase
        .from("seller_profiles")
        .select("id, username")
        .or(
          "business_name.is.null,business_phone.is.null,business_address.is.null"
        );

      if (incompleteProfiles && incompleteProfiles.length > 0) {
        warnings.push({
          type: "DATA_QUALITY",
          entity: "seller_profile",
          description: `${incompleteProfiles.length} seller profiles are incomplete`,
          impact: "MEDIUM",
        });
      }
    } catch (error) {
      warnings.push({
        type: "PERFORMANCE",
        entity: "data-quality-check",
        description: `Failed to complete data quality checks: ${error.message}`,
        impact: "LOW",
      });
    }

    return warnings;
  }

  /**
   * Generate comprehensive sync statistics
   */
  private async generateSyncStatistics(): Promise<SyncStatistics> {
    const supabase = await this.getSupabaseClient();

    try {
      const [sanityListings, { data: users }, { data: sellerProfiles }] =
        await Promise.all([
          this.sanity.fetch('count(*[_type == "listing"])'),
          supabase.from("users").select("id", { count: "exact" }),
          supabase.from("seller_profiles").select("id", { count: "exact" }),
        ]);

      // Count orphaned listings
      const listings = await this.sanity.fetch(`
        *[_type == "listing"] {
          supabaseId
        }
      `);

      const { data: activeSellerIds } = await supabase
        .from("seller_profiles")
        .select("id")
        .eq("is_active", true);

      const activeSellers = new Set(activeSellerIds?.map((s) => s.id) || []);
      const orphanedListings = listings.filter(
        (l: any) => l.supabaseId && !activeSellers.has(l.supabaseId)
      ).length;

      return {
        totalListings: sanityListings || 0,
        totalUsers: users?.length || 0,
        totalSellerProfiles: sellerProfiles?.length || 0,
        orphanedListings,
        missingReferences: 0, // This would be calculated from errors
        lastSyncCheck: new Date().toISOString(),
        avgResponseTime: 0, // Set by caller
      };
    } catch (error) {
      console.error("Error generating sync statistics:", error);
      return {
        totalListings: 0,
        totalUsers: 0,
        totalSellerProfiles: 0,
        orphanedListings: 0,
        missingReferences: 0,
        lastSyncCheck: new Date().toISOString(),
        avgResponseTime: 0,
      };
    }
  }

  /**
   * Fix common sync issues automatically
   */
  async autoFixSyncIssues(errors: SyncError[]): Promise<{
    fixed: number;
    failed: number;
    details: string[];
  }> {
    let fixed = 0;
    let failed = 0;
    const details: string[] = [];

    for (const error of errors) {
      try {
        switch (error.type) {
          case "ORPHANED_RECORD":
            if (error.entity === "analytics_event") {
              // Clean up orphaned analytics events
              const supabase = await this.getSupabaseClient();
              await supabase
                .from("analytics_events")
                .delete()
                .eq("listing_id", error.entityId);

              fixed++;
              details.push(
                `Cleaned up orphaned analytics for listing ${error.entityId}`
              );
            }
            break;

          // Add more auto-fix cases as needed
          default:
            // Skip issues that can't be auto-fixed
            break;
        }
      } catch (fixError) {
        failed++;
        details.push(
          `Failed to fix ${error.type} for ${error.entityId}: ${fixError.message}`
        );
      }
    }

    return { fixed, failed, details };
  }
}

// Utility function for scheduled sync verification
export async function runScheduledSyncVerification(): Promise<SyncVerificationResult> {
  const verifier = new DataSyncVerifier(true);
  const result = await verifier.verifyDataSync();

  // Log critical issues
  const criticalErrors = result.errors.filter((e) => e.severity === "HIGH");
  if (criticalErrors.length > 0) {
    console.error("Critical sync issues detected:", criticalErrors);

    // Could send alerts here (email, Slack, etc.)
    // await sendSyncAlert(criticalErrors);
  }

  return result;
}

export default DataSyncVerifier;
