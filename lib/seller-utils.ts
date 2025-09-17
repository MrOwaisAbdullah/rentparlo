import { Seller } from '@/types';

// Unified function to calculate response time based on seller metrics
export function calculateResponseTime(seller: Seller): { 
  hours: number; 
  displayText: string; 
  description: string 
} {
  // Base response time based on seller tier
  const tierMultipliers = {
    'basic': 24,      // 24 hours for basic tier
    'bronze': 12,     // 12 hours for bronze tier
    'silver': 6,      // 6 hours for silver tier
    'gold': 2,        // 2 hours for gold tier
    'platinum': 1,    // 1 hour for platinum tier
    'diamond': 0.5    // 30 minutes for diamond tier
  };

  // Get base hours from tier
  const baseHours = tierMultipliers[seller.profile.tier] || 24;

  // Adjust based on verification status (verified sellers respond faster)
  let adjustedHours = baseHours;
  if (seller.profile.is_verified) {
    adjustedHours = Math.max(0.5, adjustedHours * 0.8); // 20% faster for verified sellers
  }

  // Adjust based on customer rating (higher rated sellers respond faster)
  if (seller.profile.customer_rating && seller.profile.customer_rating >= 4.5) {
    adjustedHours = Math.max(0.5, adjustedHours * 0.9); // 10% faster for highly rated sellers
  } else if (seller.profile.customer_rating && seller.profile.customer_rating >= 4.0) {
    adjustedHours = Math.max(0.5, adjustedHours * 0.95); // 5% faster for well-rated sellers
  }

  // Adjust based on listing count (more listings = more experience = faster response)
  const listingCount = seller.listingCount || 0;
  if (listingCount >= 50) {
    adjustedHours = Math.max(0.5, adjustedHours * 0.85); // 15% faster for experienced sellers
  } else if (listingCount >= 20) {
    adjustedHours = Math.max(0.5, adjustedHours * 0.9); // 10% faster for moderate sellers
  }

  // Ensure minimum response time of 30 minutes
  const finalHours = Math.max(0.5, adjustedHours);

  // Format display text
  if (finalHours < 1) {
    const minutes = Math.round(finalHours * 60);
    return {
      hours: finalHours,
      displayText: `< ${minutes}m`,
      description: `Typically responds within ${minutes} minutes`
    };
  } else if (finalHours === Math.round(finalHours)) {
    return {
      hours: finalHours,
      displayText: `${Math.round(finalHours)}h`,
      description: `Typically responds within ${Math.round(finalHours)} hours`
    };
  } else {
    return {
      hours: finalHours,
      displayText: `${finalHours.toFixed(1)}h`,
      description: `Typically responds within ${finalHours.toFixed(1)} hours`
    };
  }
}