"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Settings, Calendar, Zap, Award, Tag, Percent, Leaf, MapPinHouse } from "lucide-react"
import Link from "next/link"
import { Listing, ListingBadge } from "@/types"

// Pakistan-specific badge configuration
const BADGE_CONFIG = {
  hot: {
    text: "HOT",
    icon: <Award className="h-3 w-3" />,
    className: "bg-red-500 hover:bg-red-600 text-white animate-pulse",
    priority: 1
  },
  new: {
    text: "NEW",
    icon: <Tag className="h-3 w-3" />,
    className: "bg-blue-500 hover:bg-blue-600 text-white",
    priority: 2
  },
  featured: {
    text: "FEATURED",
    icon: <Star className="h-3 w-3 fill-current" />,
    className: "bg-purple-500 hover:bg-purple-600 text-white",
    priority: 3
  },
  verified: {
    text: "VERIFIED",
    icon: <Award className="h-3 w-3" />,
    className: "bg-green-500 hover:bg-green-600 text-white",
    priority: 4
  },
  top_seller: {
    text: "TOP SELLER",
    icon: <Award className="h-3 w-3" />,
    className: "bg-amber-500 hover:bg-amber-600 text-white",
    priority: 5
  },
  discount: {
    text: "DISCOUNT",
    icon: <Percent className="h-3 w-3" />,
    className: "bg-pink-500 hover:bg-pink-600 text-white",
    priority: 6
  },
  eco_friendly: {
    text: "ECO",
    icon: <Leaf className="h-3 w-3" />,
    className: "bg-emerald-500 hover:bg-emerald-600 text-white",
    priority: 7
  },
  local: {
    text: "LOCAL",
    icon: <MapPinHouse className="h-3 w-3" />,
    className: "bg-indigo-500 hover:bg-indigo-600 text-white",
    priority: 8
  },
  instant_delivery: {
    text: "INSTANT",
    icon: <Zap className="h-3 w-3" />,
    className: "bg-orange-500 hover:bg-orange-600 text-white",
    priority: 9
  }
} as const;

type BadgeKey = keyof typeof BADGE_CONFIG;

/**
 * Get appropriate badge configuration based on badge type
 */
const getBadgeConfig = (badge: ListingBadge | string) => {
  const normalizedBadge = badge.toLowerCase().replace(/ /g, '_') as BadgeKey;
  return BADGE_CONFIG[normalizedBadge] || BADGE_CONFIG.hot;
};

const getSpecIcon = (key: string) => {
  const keyLower = key.toLowerCase();
  if (keyLower.includes("year") || keyLower.includes("model") || keyLower.includes("age")) {
    return <Calendar className="h-3 w-3" />;
  }
  if (
    keyLower.includes("power") ||
    keyLower.includes("battery") ||
    keyLower.includes("fuel") ||
    keyLower.includes("engine")
  ) {
    return <Zap className="h-3 w-3" />;
  }
  return <Settings className="h-3 w-3" />;
};

/**
 * Pakistan-specific badge positioning logic
 * - Shows all badges without limitation
 * - Prioritizes most important badges first
 * - Positions badges in top-left corner with proper spacing
 */
const getBadgesToDisplay = (badges: ListingBadge[]) => {
  if (!badges || badges.length === 0) return [];
  
  // Sort by priority
  const sortedBadges = [...badges].sort((a, b) => {
    const priorityA = BADGE_CONFIG[a.toLowerCase().replace(/ /g, '_') as BadgeKey]?.priority || 99;
    const priorityB = BADGE_CONFIG[b.toLowerCase().replace(/ /g, '_') as BadgeKey]?.priority || 99;
    return priorityA - priorityB;
  });
  
  // Show all badges without limitation
  return sortedBadges;
};

interface ProductSwiperCardProps {
  listing: Listing;
  isMobile: boolean;
}

export function ProductSwiperCard({ listing, isMobile }: ProductSwiperCardProps) {
  const badgesToDisplay = getBadgesToDisplay(listing.badges || []);

  return (
    <Link href={`/listing/${listing.slug.current}`} className="flex-shrink-0 block transform transition-transform duration-300 hover:-translate-y-1">
      <Card className="w-72 sm:w-80 h-full py-0 gap-1 bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col transform hover:-translate-y-1 hover:border-primary/10 hover:ring-1 hover:ring-primary/20">
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            {listing.images[0]?.asset?.url ? (
              <img
                src={listing.images[0].asset.url || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm text-gray-600">No Image</p>
                </div>
              </div>
            )}
            
            {/* Multiple Badges Display */}
            {badgesToDisplay.length > 0 && (
              <div className="absolute top-2 left-2 space-y-1 z-10 max-h-[80%] overflow-y-auto">
                {badgesToDisplay.map((badge, index) => {
                  const config = getBadgeConfig(badge);
                  return (
                    <Badge 
                      key={index}
                      className={`${config.className} px-2 py-1 text-xs font-medium flex items-center gap-1 whitespace-nowrap`}
                    >
                      {config.icon}
                      {config.text}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col transition-all duration-300">
          <div className="flex items-center justify-between mt-auto mb-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {listing.seller?.profile?.avatar_url ? (
                <img 
                  src={listing.seller.profile.avatar_url} 
                  alt={listing.seller.profile.username} 
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">
                    {listing.seller?.profile?.username?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-600 truncate">
                {listing.seller?.profile?.username || "User"}
              </span>
              {listing.seller?.profile?.is_verified && (
                <Award className="h-3 w-3 text-green-500 ml-1 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              <span className="text-xs text-gray-600">4.8</span>
            </div>
          </div>
          
          <div className="mb-1 flex-1">
            <div className="font-bold text-base sm:text-lg text-gray-900 mb-1">
              PKR {listing.price.toLocaleString()}/day
            </div>
            <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 text-sm leading-tight">
              {listing.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {listing.location.area ? `${listing.location.area}, ` : ""}
                {listing.location.city}
              </span>
            </div>
          </div>

          {listing.specifications && listing.specifications.length > 0 && (
            <div className="space-y-2 mb-4">
              {listing.specifications.slice(0, 3).map((spec, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-500 min-w-0 flex-1">
                    <div className="flex-shrink-0">{getSpecIcon(spec.key)}</div>
                    <span className="truncate">{spec.key}:</span>
                  </div>
                  <span className="text-gray-700 font-medium ml-2 flex-shrink-0">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
