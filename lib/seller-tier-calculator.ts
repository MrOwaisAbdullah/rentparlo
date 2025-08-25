/**
 * =====================================================
 * Seller Tier Calculation System
 * =====================================================
 * Automatic calculation and management of seller tier points
 * based on various activities and performance metrics
 */

import { createClient } from '@/utils/supabase/server';
import { createClient as createBrowserClient } from '@/utils/supabase/client';

export interface TierCalculationResult {
  currentTier: string;
  currentPoints: number;
  nextTier: string | null;
  pointsToNext: number;
  tierBenefits: string[];
}

export interface PointsBreakdown {
  verification: number;
  listings: number;
  ratings: number;
  responseTime: number;
  transactions: number;
  reviews: number;
  uptime: number;
  total: number;
}

// Tier thresholds and benefits
export const TIER_SYSTEM = {
  basic: {
    minPoints: 0,
    maxPoints: 99,
    benefits: [
      'Up to 5 active listings',
      'Basic analytics (30 days)',
      'Email support',
      'Standard listing visibility'
    ]
  },
  premium: {
    minPoints: 100,
    maxPoints: 499,
    benefits: [
      'Up to 20 active listings',
      'Advanced analytics (90 days)',
      'Priority email support',
      'Featured listing slot (1/month)',
      'Premium badge display',
      'Higher search ranking'
    ]
  },
  gold: {
    minPoints: 500,
    maxPoints: 999,
    benefits: [
      'Up to 50 active listings',
      'Premium analytics (1 year)',
      'Phone support',
      'Featured listing slots (5/month)',
      'Gold badge display',
      'Top search priority',
      'Custom business hours',
      'Bulk operations'
    ]
  },
  platinum: {
    minPoints: 1000,
    maxPoints: 2499,
    benefits: [
      'Up to 100 active listings',
      'Real-time analytics',
      'Dedicated account manager',
      'Unlimited featured listings',
      'Platinum badge display',
      'Premium search placement',
      'API access',
      'White-label options'
    ]
  },
  diamond: {
    minPoints: 2500,
    maxPoints: 4999,
    benefits: [
      'Unlimited active listings',
      'Enterprise analytics',
      '24/7 phone support',
      'Homepage banner placement',
      'Diamond badge display',
      'Guaranteed top ranking',
      'Custom integrations',
      'Revenue sharing program'
    ]
  },
  elite: {
    minPoints: 5000,
    maxPoints: Infinity,
    benefits: [
      'All Diamond benefits',
      'Personal brand page',
      'Exclusive partnerships',
      'Marketing collaboration',
      'Elite community access',
      'First access to new features'
    ]
  }
};

// Point calculation rules
export const POINTS_SYSTEM = {
  // One-time points
  verification: 50,
  firstListing: 10,
  businessProfileComplete: 25,
  
  // Performance-based points (monthly)
  highRating: { // 4.5+ rating
    points: 20,
    requirement: 4.5
  },
  fastResponse: { // <1 hour response time
    points: 15,
    requirement: 3600 // seconds
  },
  activeListings: { // Points per active listing
    points: 2,
    max: 50 // Maximum points from listings
  },
  
  // Activity-based points
  successfulTransaction: 5,
  positiveReview: 3,
  listingViews: { // Points per 100 views
    points: 1,
    threshold: 100
  },
  
  // Penalty points (negative)
  cancelledBooking: -10,
  lateResponse: -5, // >24 hours
  negativeReview: -15,
  policyViolation: -25,
  
  // Bonus multipliers
  consecutiveMonthsActive: {
    3: 1.1,  // 10% bonus after 3 months
    6: 1.2,  // 20% bonus after 6 months
    12: 1.3  // 30% bonus after 12 months
  }
};

export class SellerTierCalculator {
  private supabase;
  private isServer: boolean;

  constructor(isServer = true) {
    this.isServer = isServer;
    this.supabase = isServer ? null : createBrowserClient();
  }

  private async getSupabaseClient() {
    if (this.isServer) {
      return await createClient();
    }
    return this.supabase!;
  }

  /**
   * Calculate total points for a seller
   */
  async calculateSellerPoints(sellerId: string): Promise<PointsBreakdown> {
    const supabase = await this.getSupabaseClient();
    
    try {
      // Get seller profile and statistics
      const { data: profile, error: profileError } = await supabase
        .from('seller_profiles')
        .select(`
          *,
          users!inner(*)
        `)
        .eq('id', sellerId)
        .single();

      if (profileError || !profile) {
        throw new Error('Seller profile not found');
      }

      // Get analytics data
      const { data: analytics } = await supabase
        .from('seller_analytics_summary')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

      const breakdown: PointsBreakdown = {
        verification: 0,
        listings: 0,
        ratings: 0,
        responseTime: 0,
        transactions: 0,
        reviews: 0,
        uptime: 0,
        total: 0
      };

      // Verification points
      if (profile.is_verified) {
        breakdown.verification += POINTS_SYSTEM.verification;
      }

      // Business profile completion
      if (profile.business_name && profile.business_address && profile.business_phone) {
        breakdown.verification += POINTS_SYSTEM.businessProfileComplete;
      }

      // Active listings points
      const activeListings = Math.min(profile.active_listings || 0, 25); // Cap at 25 listings
      breakdown.listings = activeListings * POINTS_SYSTEM.activeListings.points;

      // Rating points (monthly)
      if (analytics?.avg_rating && analytics.avg_rating >= POINTS_SYSTEM.highRating.requirement) {
        breakdown.ratings = POINTS_SYSTEM.highRating.points;
      }

      // Response time points (monthly)
      if (analytics?.avg_response_time && analytics.avg_response_time < POINTS_SYSTEM.fastResponse.requirement) {
        breakdown.responseTime = POINTS_SYSTEM.fastResponse.points;
      }

      // Transaction points
      const transactions = analytics?.successful_transactions || 0;
      breakdown.transactions = transactions * POINTS_SYSTEM.successfulTransaction;

      // Review points
      const positiveReviews = analytics?.positive_reviews || 0;
      const negativeReviews = analytics?.negative_reviews || 0;
      breakdown.reviews = (positiveReviews * POINTS_SYSTEM.positiveReview) + 
                         (negativeReviews * POINTS_SYSTEM.negativeReview);

      // View-based points
      const totalViews = analytics?.total_views || 0;
      const viewPoints = Math.floor(totalViews / POINTS_SYSTEM.listingViews.threshold) * 
                        POINTS_SYSTEM.listingViews.points;
      breakdown.listings += viewPoints;

      // Calculate total
      breakdown.total = Object.values(breakdown).reduce((sum, points) => {
        return typeof points === 'number' ? sum + points : sum;
      }, 0) - breakdown.total; // Subtract the initial total value

      // Apply activity multiplier
      const monthsActive = this.calculateMonthsActive(profile.users.created_at);
      const multiplier = this.getActivityMultiplier(monthsActive);
      breakdown.total = Math.floor(breakdown.total * multiplier);

      return breakdown;

    } catch (error) {
      console.error('Error calculating seller points:', error);
      return {
        verification: 0,
        listings: 0,
        ratings: 0,
        responseTime: 0,
        transactions: 0,
        reviews: 0,
        uptime: 0,
        total: 0
      };
    }
  }

  /**
   * Determine tier based on points
   */
  calculateTier(points: number): TierCalculationResult {
    let currentTier = 'basic';
    let nextTier: string | null = null;
    let pointsToNext = 0;

    // Find current tier
    for (const [tier, config] of Object.entries(TIER_SYSTEM)) {
      if (points >= config.minPoints && points <= config.maxPoints) {
        currentTier = tier;
        break;
      }
    }

    // Find next tier
    const tierEntries = Object.entries(TIER_SYSTEM);
    const currentIndex = tierEntries.findIndex(([tier]) => tier === currentTier);
    
    if (currentIndex < tierEntries.length - 1) {
      const [nextTierName, nextTierConfig] = tierEntries[currentIndex + 1];
      nextTier = nextTierName;
      pointsToNext = nextTierConfig.minPoints - points;
    }

    return {
      currentTier,
      currentPoints: points,
      nextTier,
      pointsToNext: Math.max(pointsToNext, 0),
      tierBenefits: TIER_SYSTEM[currentTier as keyof typeof TIER_SYSTEM].benefits
    };
  }

  /**
   * Update seller tier in database
   */
  async updateSellerTier(sellerId: string): Promise<TierCalculationResult> {
    const supabase = await this.getSupabaseClient();
    
    try {
      // Calculate current points
      const pointsBreakdown = await this.calculateSellerPoints(sellerId);
      const tierResult = this.calculateTier(pointsBreakdown.total);

      // Update seller profile
      const { error } = await supabase
        .from('seller_profiles')
        .update({
          tier: tierResult.currentTier,
          tier_points: tierResult.currentPoints,
          tier_updated_at: new Date().toISOString()
        })
        .eq('id', sellerId);

      if (error) {
        throw error;
      }

      // Log tier change if tier has changed
      await this.logTierChange(sellerId, tierResult.currentTier, tierResult.currentPoints);

      return tierResult;

    } catch (error) {
      console.error('Error updating seller tier:', error);
      throw error;
    }
  }

  /**
   * Award points for specific actions
   */
  async awardPoints(
    sellerId: string, 
    action: string, 
    points: number, 
    metadata?: Record<string, any>
  ): Promise<void> {
    const supabase = await this.getSupabaseClient();

    try {
      // Log the point award
      await supabase
        .from('seller_point_logs')
        .insert({
          seller_id: sellerId,
          action,
          points,
          metadata,
          created_at: new Date().toISOString()
        });

      // Update seller tier
      await this.updateSellerTier(sellerId);

    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  /**
   * Get seller's tier history
   */
  async getTierHistory(sellerId: string, limit = 10) {
    const supabase = await this.getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('seller_tier_history')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error fetching tier history:', error);
      return [];
    }
  }

  /**
   * Get tier statistics
   */
  async getTierStatistics() {
    const supabase = await this.getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('tier')
        .eq('is_active', true);

      if (error) throw error;

      const stats = data?.reduce((acc, seller) => {
        acc[seller.tier] = (acc[seller.tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return stats;

    } catch (error) {
      console.error('Error fetching tier statistics:', error);
      return {};
    }
  }

  /**
   * Private helper methods
   */
  private calculateMonthsActive(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  }

  private getActivityMultiplier(monthsActive: number): number {
    if (monthsActive >= 12) return POINTS_SYSTEM.consecutiveMonthsActive[12];
    if (monthsActive >= 6) return POINTS_SYSTEM.consecutiveMonthsActive[6];
    if (monthsActive >= 3) return POINTS_SYSTEM.consecutiveMonthsActive[3];
    return 1.0;
  }

  private async logTierChange(sellerId: string, newTier: string, points: number): Promise<void> {
    const supabase = await this.getSupabaseClient();

    try {
      // Check if tier has actually changed
      const { data: currentProfile } = await supabase
        .from('seller_profiles')
        .select('tier')
        .eq('id', sellerId)
        .single();

      if (currentProfile && currentProfile.tier !== newTier) {
        await supabase
          .from('seller_tier_history')
          .insert({
            seller_id: sellerId,
            old_tier: currentProfile.tier,
            new_tier: newTier,
            points_at_change: points,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error logging tier change:', error);
    }
  }
}

// Utility functions for common operations
export const tierUtils = {
  /**
   * Award points for verification
   */
  async awardVerificationPoints(sellerId: string) {
    const calculator = new SellerTierCalculator(false);
    await calculator.awardPoints(
      sellerId, 
      'verification_completed', 
      POINTS_SYSTEM.verification,
      { type: 'verification' }
    );
  },

  /**
   * Award points for first listing
   */
  async awardFirstListingPoints(sellerId: string) {
    const calculator = new SellerTierCalculator(false);
    await calculator.awardPoints(
      sellerId, 
      'first_listing_created', 
      POINTS_SYSTEM.firstListing,
      { type: 'milestone' }
    );
  },

  /**
   * Award points for successful transaction
   */
  async awardTransactionPoints(sellerId: string, transactionValue: number) {
    const calculator = new SellerTierCalculator(false);
    await calculator.awardPoints(
      sellerId, 
      'successful_transaction', 
      POINTS_SYSTEM.successfulTransaction,
      { type: 'transaction', value: transactionValue }
    );
  },

  /**
   * Deduct points for violations
   */
  async deductViolationPoints(sellerId: string, violationType: string) {
    const calculator = new SellerTierCalculator(false);
    const points = violationType === 'policy_violation' 
      ? POINTS_SYSTEM.policyViolation 
      : POINTS_SYSTEM.cancelledBooking;
    
    await calculator.awardPoints(
      sellerId, 
      violationType, 
      points,
      { type: 'penalty', violation: violationType }
    );
  },

  /**
   * Get tier badge configuration
   */
  getTierBadgeConfig(tier: string) {
    const configs = {
      basic: { color: 'bg-gray-100 text-gray-700', icon: '🥉', label: 'Basic' },
      premium: { color: 'bg-blue-100 text-blue-700', icon: '🥈', label: 'Premium' },
      gold: { color: 'bg-yellow-100 text-yellow-700', icon: '🥇', label: 'Gold' },
      platinum: { color: 'bg-purple-100 text-purple-700', icon: '💎', label: 'Platinum' },
      diamond: { color: 'bg-indigo-100 text-indigo-700', icon: '💠', label: 'Diamond' },
      elite: { color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', icon: '👑', label: 'Elite' }
    };
    
    return configs[tier as keyof typeof configs] || configs.basic;
  }
};

export default SellerTierCalculator;