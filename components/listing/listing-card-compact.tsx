'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Eye, Heart, Shield, Star, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getSanityImageUrl } from "@/sanity/lib/image"
import { trackAnalyticsEventClient } from '@/lib/supabase-queries-client';

interface Listing {
  _id: string;
  title: string;
  description?: string;
  price: number;
  priceType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  images: string[];
  condition: string;
  availability: 'available' | 'rented' | 'maintenance';
  location: {
    city: string;
    area: string;
  };
  category: {
    title: string;
    slug: string;
  };
  seller: {
    id: string;
    username: string;
    business_name?: string;
    tier: 'basic' | 'premium' | 'gold';
    isVerified: boolean;
    profile?: {
      city?: string;
      phone?: string;
    };
  };
  createdAt: string;
  views?: number;
  contactClicks?: number;
}

interface ListingCardCompactProps {
  listing: Listing;
  showSellerInfo?: boolean;
  className?: string;
}

const tierConfig = {
  basic: { color: 'bg-gray-100 text-gray-700', icon: '🥉' },
  premium: { color: 'bg-blue-100 text-blue-700', icon: '🥈' },
  gold: { color: 'bg-yellow-100 text-yellow-700', icon: '🥇' }
};

const conditionConfig = {
  new: { color: 'bg-green-100 text-green-800', label: 'New' },
  'like-new': { color: 'bg-green-100 text-green-700', label: 'Like New' },
  good: { color: 'bg-blue-100 text-blue-700', label: 'Good' },
  fair: { color: 'bg-yellow-100 text-yellow-700', label: 'Fair' },
  poor: { color: 'bg-red-100 text-red-700', label: 'Poor' }
};

export function ListingCardCompact({ 
  listing, 
  showSellerInfo = false,
  className 
}: ListingCardCompactProps) {
  const [isLiked, setIsLiked] = React.useState(false);

  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    const typeMap = {
      hourly: 'hr',
      daily: 'day', 
      weekly: 'week',
      monthly: 'month'
    };

    return `${formatted}/${typeMap[priceType as keyof typeof typeMap] || priceType}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleContact = async () => {
    if (listing.seller?.profile?.phone) {
      const cleanPhone = listing.seller.profile.phone.replace(/\D/g, '');
      const whatsappPhone = cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone.replace(/^0/, '')}`;
      const message = encodeURIComponent(`Hi! I'm interested in renting: ${listing.title}`);
      
      window.open(`https://wa.me/${whatsappPhone}?text=${message}`, '_blank');
      
      // Track contact click using trackAnalyticsEventClient
      try {
        await trackAnalyticsEventClient({
          event_type: 'contact_click',
          listing_id: listing._id,
          user_id: listing.seller.id,
          metadata: { source: 'compact_card', contact_method: 'whatsapp' }
        });
      } catch (error) {
        console.error('Error tracking contact click:', error);
      }
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    
    // Track like action using trackAnalyticsEventClient
    try {
      await trackAnalyticsEventClient({
        event_type: 'save',
        listing_id: listing._id,
        user_id: listing.seller.id,
        metadata: { source: 'compact_card' }
      });
    } catch (error) {
      console.error('Error tracking like action:', error);
    }
  };

  const primaryImage = listing.images?.[0];
  const condition = conditionConfig[listing.condition as keyof typeof conditionConfig];
  const imageUrl = getSanityImageUrl(primaryImage, '/images/placeholder-item.jpg');

  return (
    <Card className={cn("group hover:shadow-md transition-all duration-300", className)}>
      <CardContent className="p-0">
        <Link href={`/listing/${listing._id}`} className="block">
          <div className="flex gap-4 p-4">
            {/* Image */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
              <Image
                src={imageUrl}
                alt={listing.title}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 640px) 96px, 128px"
              />
              
              {/* Availability Badge */}
              <Badge
                className={cn(
                  "absolute top-2 left-2 text-xs px-1.5 py-0.5",
                  listing.availability === 'available' 
                    ? 'bg-green-600 text-white' 
                    : listing.availability === 'rented'
                    ? 'bg-red-600 text-white'
                    : 'bg-yellow-600 text-white'
                )}
              >
                {listing.availability === 'available' ? 'Available' : 
                 listing.availability === 'rented' ? 'Rented' : 'Maintenance'}
              </Badge>

              {/* Like Button */}
              <button
                onClick={handleLike}
                className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <Heart className={cn(
                  "w-3 h-3 transition-colors",
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                )} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-primary text-sm sm:text-base">
                        {formatPrice(listing.price, listing.priceType)}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {listing.description && (
                    <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-2">
                      {listing.description}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {listing.category.title}
                    </Badge>
                    {condition && (
                      <Badge className={cn("text-xs", condition.color)}>
                        {condition.label}
                      </Badge>
                    )}
                  </div>

                  {/* Location & Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {listing.location.area}, {listing.location.city}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(listing._createdAt)}
                    </div>
                    {listing.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {listing.views}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  {showSellerInfo && listing.seller && (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${listing.seller.username}`} />
                        <AvatarFallback className="text-xs">
                          {listing.seller.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium truncate">
                            {listing.seller.business_name || listing.seller.username}
                          </span>
                          {listing.seller.isVerified && (
                            <Shield className="w-3 h-3 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge className={cn("text-xs", tierConfig[listing.seller.tier || 'basic'].color)}>
                            {tierConfig[listing.seller.tier || 'basic'].icon}
                          </Badge>
                          {listing.seller.profile?.city && (
                            <span className="text-xs text-muted-foreground">
                              {listing.seller.profile.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Button */}
                  {listing.seller?.profile?.phone && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContact();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1 h-auto"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

export default ListingCardCompact;