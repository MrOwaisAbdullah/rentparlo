/**
 * Utility function to calculate seller response time consistently across the application
 */

interface SellerProfile {
  tier: string;
  is_verified?: boolean;
  customer_rating?: number;
  response_time_avg?: number;
  [key: string]: any;
}

export function calculateResponseTime(sellerProfile: SellerProfile): { 
  hours: number; 
  displayText: string; 
  description: string 
} {
  // If we have an actual response time average, use it
  if (sellerProfile.response_time_avg !== undefined && sellerProfile.response_time_avg > 0) {
    const hours = sellerProfile.response_time_avg / 60; // Convert minutes to hours
    let displayText = '';
    
    if (hours < 1) {
      const minutes = Math.max(1, Math.round(hours * 60));
      displayText = `< ${minutes}m`;
    } else if (hours === Math.round(hours)) {
      displayText = `${Math.round(hours)}h`;
    } else {
      displayText = `${hours.toFixed(1)}h`;
    }
    
    return {
      hours,
      displayText,
      description: `Typically responds within ${displayText.replace('< ', '')}`
    };
  }
  
  // Base response time based on seller tier
  const tierMultipliers: Record<string, number> = {
    'basic': 24,      // 24 hours for basic tier
    'bronze': 12,     // 12 hours for bronze tier
    'silver': 6,      // 6 hours for silver tier
    'gold': 2,        // 2 hours for gold tier
    'platinum': 1,    // 1 hour for platinum tier
    'diamond': 0.5    // 30 minutes for diamond tier
  };

  // Get base hours from tier
  const baseHours = tierMultipliers[sellerProfile.tier] || 24;

  // Adjust based on verification status (verified sellers respond faster)
  let adjustedHours = baseHours;
  if (sellerProfile.is_verified) {
    adjustedHours = Math.max(0.5, adjustedHours * 0.8); // 20% faster for verified sellers
  }

  // Adjust based on customer rating (higher rated sellers respond faster)
  if (sellerProfile.customer_rating && sellerProfile.customer_rating >= 4.5) {
    adjustedHours = Math.max(0.5, adjustedHours * 0.9); // 10% faster for highly rated sellers
  } else if (sellerProfile.customer_rating && sellerProfile.customer_rating >= 4.0) {
    adjustedHours = Math.max(0.5, adjustedHours * 0.95); // 5% faster for well-rated sellers
  }

  // Ensure minimum response time of 30 minutes
  const finalHours = Math.max(0.5, adjustedHours);

  // Format display text
  let displayText = '';
  if (finalHours < 1) {
    const minutes = Math.round(finalHours * 60);
    displayText = `< ${minutes}m`;
  } else if (finalHours === Math.round(finalHours)) {
    displayText = `${Math.round(finalHours)}h`;
  } else {
    displayText = `${finalHours.toFixed(1)}h`;
  }

  return {
    hours: finalHours,
    displayText,
    description: `Typically responds within ${displayText.replace('< ', '')}`
  };
}