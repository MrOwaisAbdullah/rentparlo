'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Calendar, Star, Phone, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SellerTierBadge } from '@/components/seller/seller-tier-badge';
import { SellerContact } from '@/components/seller/seller-contact';
import { VerifiedBadge } from '@/components/seller/verified-badge';
import { Seller } from '@/types';
import { cn } from '@/lib/utils';

// Unified function to calculate response time based on seller metrics
function calculateResponseTime(seller: Seller): { 
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
  if (seller.listingCount && seller.listingCount >= 50) {
    adjustedHours = Math.max(0.5, adjustedHours * 0.85); // 15% faster for experienced sellers
  } else if (seller.listingCount && seller.listingCount >= 20) {
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

interface SellerProfileHeaderProps {
  seller: Seller;
  listingCount?: number;
  className?: string;
}

export function SellerProfileHeader({ seller, listingCount = 0, className }: SellerProfileHeaderProps) {
  const displayName = seller.profile.business_name || seller.profile.username;
  const joinDate = new Date(seller.profile.created_at);
  const monthsActive = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  
  const formatJoinDate = (date: Date) => {
    if (monthsActive < 1) return 'New seller';
    if (monthsActive < 12) return `${monthsActive} months on RentParlo`;
    const years = Math.floor(monthsActive / 12);
    return `${years} year${years > 1 ? 's' : ''} on RentParlo`;
  };

  // Calculate response time using our unified function
  const responseTimeInfo = calculateResponseTime(seller);

  const handleContact = () => {
    // This will be handled by the SellerContact component
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Avatar and basic info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-shrink-0">
            <div className="relative">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                <AvatarImage 
                  src={seller.profile.avatar_url} 
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-primary/20 to-primary/10">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Verification badge overlay */}
              {seller.profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0 w-8 h-8 shadow-md">
                  <VerifiedBadge size="lg" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {displayName}
                </h1>
                <p className="text-muted-foreground">@{seller.profile.username}</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <SellerTierBadge 
                  tier={seller.profile.tier}
                  points={seller.profile.tier_points}
                  size="sm"
                  variant="compact"
                />
                
                {seller.profile.is_verified && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-1">
                    <VerifiedBadge size="md" />
                    Verified
                  </Badge>
                )}
                
                {seller.profile.is_top_seller && (
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Top Seller
                  </Badge>
                )}
              </div>

              {/* Location and join date */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{seller.city}, {seller.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatJoinDate(joinDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Stats and contact (increased width) */}
          <div className="flex flex-col gap-4 lg:ml-auto lg:w-2/5 xl:w-1/3">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {listingCount}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Listings</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                  {seller.profile.customer_rating ? seller.profile.customer_rating.toFixed(1) : 'N/A'}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Rating</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {responseTimeInfo.displayText}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Response</div>
              </div>
            </div>

            {/* Contact button */}
            <div className="flex w-full justify-center lg:justify-end">
              <SellerContact 
                seller={{
                  id: seller.id,
                  username: seller.profile.username,
                  business_name: seller.profile.business_name,
                  phone: seller.phone,
                  email: seller.email
                }}
                onContact={handleContact}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        {seller.profile.address_line1 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{seller.profile.address_line1}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}