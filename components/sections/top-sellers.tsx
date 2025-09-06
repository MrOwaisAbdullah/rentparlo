'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, Award, TrendingUp } from 'lucide-react';
import { VerifiedBadge } from '@/components/seller/verified-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Seller } from '@/types';


interface TopSellersProps {
  sellers: Seller[];
  className?: string;
}

const tierConfig = {
  basic: {
    color: 'bg-gray-100 text-gray-700',
    icon: '🥉',
    label: 'Basic'
  },
  bronze: {
    color: 'bg-orange-100 text-orange-700',
    icon: '🥉',
    label: 'Bronze'
  },
  silver: {
    color: 'bg-gray-100 text-gray-600',
    icon: '🥈',
    label: 'Silver'
  },
  gold: {
    color: 'bg-yellow-100 text-yellow-700',
    icon: '🥇',
    label: 'Gold'
  },
  platinum: {
    color: 'bg-purple-100 text-purple-700',
    icon: '💎',
    label: 'Platinum'
  },
  diamond: {
    color: 'bg-blue-100 text-blue-700',
    icon: '💎',
    label: 'Diamond'
  }
};

export function TopSellers({ sellers, className }: TopSellersProps) {
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (!sellers || sellers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No top sellers available at the moment.</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4", className)}>
      {sellers.map((seller, index) => (
        <Card key={seller.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            {/* Rank Badge */}
            {index < 3 && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                #{index + 1}
              </div>
            )}

            {/* Avatar */}
            <div className="relative mb-3">
              <Avatar className="w-16 h-16 mx-auto ring-2 ring-muted">
                <AvatarImage 
                  src={seller.profile.avatar_url} 
                  alt={seller.profile.username}
                />
                <AvatarFallback className="text-lg font-semibold">
                  {seller.profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {seller.profile.is_verified && (
                <div className="absolute -bottom-1 -right-1">
                  <VerifiedBadge size="sm" />
                </div>
              )}

              {/* Top seller crown */}
              {seller.profile.is_top_seller && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
              )}
            </div>

            {/* Seller Info */}
            <Link href={`/seller/${seller.profile.username}`} className="block">
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                {seller.profile.business_name || seller.profile.username}
              </h3>
              {seller.profile.business_name && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  @{seller.profile.username}
                </p>
              )}
            </Link>

            {/* Location */}
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1 mb-2">
              <MapPin className="w-3 h-3" />
              <span>{seller.city || 'Location not specified'}</span>
            </div>

            {/* Tier Badge */}
            <div className="flex items-center justify-center gap-1 mb-3">
              <Badge className={cn("text-xs", tierConfig[seller.profile.tier].color)}>
                <span className="mr-1">{tierConfig[seller.profile.tier].icon}</span>
                {tierConfig[seller.profile.tier].label}
              </Badge>
            </div>

            {/* Stats */}
            <div className="space-y-2 mb-3">
              {/* Tier Points */}
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">
                  {formatNumber(seller.profile.tier_points)} pts
                </span>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="flex justify-center gap-1 mb-3">
              {seller.profile.is_top_seller && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                  Top Seller
                </Badge>
              )}
              {seller.is_verified && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Verified
                </Badge>
              )}
            </div>

            {/* Join Date */}
            <div className="text-xs text-muted-foreground">
              Since {formatJoinDate(seller.created_at)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default TopSellers;