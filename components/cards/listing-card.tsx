"use client"
import Image from "next/image"
import Link from "next/link"
import { Trash2, MapPin, Star, Phone, Heart, Share2, Eye, Clock, Settings, Calendar, Zap, Award, Tag, Percent, Leaf, MapPinHouse } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getSanityImageUrl } from "@/sanity/lib/image"
import { Listing, ListingImage, ListingBadge } from "@/types"
import { WhatsAppButton } from "@/components/seller/whatsapp-button"
import { SaveButton } from "@/components/ui/save-button"
import { trackAnalyticsEventClient } from "@/lib/supabase-queries-client"

interface ListingCardProps {
  // Original individual props
  id?: string
  title?: string
  price?: number
  priceType?: "hourly" | "daily" | "weekly" | "monthly"
  location?: string
  image?: any
  rating?: number
  reviewCount?: number
  badges?: string[]
  seller?: {
    name: string
    avatar?: string
    isVerified?: boolean
  }
  variant?: "default" | "category" | "list" | "featured" | "swiper" // Added 'swiper' variant
  className?: string
  onRemove?: (id: string) => void;
  listing: Listing & { 
    hasPriorityPlacement?: boolean; 
    hasSearchTopPlacement?: boolean; 
    hasGuaranteedTopPlacement?: boolean;
    hasEnhancedSearchVisibility?: boolean; // Add enhanced search visibility flag
    hasCategoryTopPlacement?: boolean; // Add category top placement flag for Gold tier
  }; // Extend listing type
  
  // Additional props from SearchResults
  showSellerInfo?: boolean
  priority?: boolean
  
  // Overlay actions for featured variant
  overlayActions?: React.ReactNode

  // for swiper variant
  isMobile?: boolean
}

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


export function ListingCard({
  id,
  title,
  price,
  priceType,
  location,
  image,
  rating,
  reviewCount,
  seller,
  variant = "default",
  className,
  onRemove,
  listing, // New prop
  showSellerInfo = true, // Default to true to match SearchResults
  priority = false, // Default to false to match SearchResults
  overlayActions, // Overlay actions for featured variant
  isMobile = false,
}: ListingCardProps) {
  // If listing prop is provided, extract values from it
  const effectiveId = listing?._id || id || ''
  const effectiveTitle = listing?.title || title || ''
  const effectivePrice = listing?.price || price || 0
  const effectivePriceType = listing?.priceType || priceType || "daily"
  const effectiveLocation = listing?.location?.city || location || ''
  
  // Handle both array and object cases for images with better validation
  let effectiveImage: ListingImage | null = null;
  if (listing?.images) {
    // If images is an array, use the first element
    if (Array.isArray(listing.images) && listing.images.length > 0) {
      const firstImage = listing.images[0];
      // Validate that the image has the required structure
      if (firstImage && typeof firstImage === 'object' && 'asset' in firstImage && 
          firstImage.asset && (firstImage.asset.url || '_ref' in firstImage.asset)) {
        effectiveImage = firstImage;
      }
    } 
    // If images is an object (not an array), validate and use it directly
    else if (!Array.isArray(listing.images)) {
      // Type guard to ensure listing.images is a ListingImage object
      const imagesObj = listing.images as unknown as ListingImage;
      if (imagesObj && typeof imagesObj === 'object' && 'asset' in imagesObj && 
          imagesObj.asset && (imagesObj.asset.url || '_ref' in imagesObj.asset)) {
        effectiveImage = imagesObj;
      }
    }
  }
  // Fallback to image prop if no listing images
  if (!effectiveImage && image) {
    // Check if the fallback image has the required structure
    if (typeof image === 'object' && image !== null && 'asset' in image && 
        image.asset && (image.asset.url || '_ref' in image.asset)) {
      effectiveImage = image;
    }
  }

  const effectiveSeller = listing?.seller ? {
    name: listing.seller.profile?.business_name || listing.seller.profile?.username || '',
    avatar: listing.seller.profile?.avatar_url,
    isVerified: listing.seller.profile?.is_verified
  } : seller

  const priceLabel = {
    hourly: "/hour",
    daily: "/day",
    weekly: "/week",
    monthly: "/month",
    yearly: "/year",
  }

  // Use getSanityImageUrl to properly extract the image URL
  const imageUrl = getSanityImageUrl(effectiveImage, "/placeholder-blog.svg");

  // Format price function
  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    return `${formatted}/${priceType === 'hourly' ? 'hr' : priceType === 'daily' ? 'day' : priceType === 'weekly' ? 'week' : 'month'}`;
  };
  
  // Format time ago function
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    return date.toLocaleDateString();
  };

  if (variant === "swiper") {
    const badgesToDisplay = getBadgesToDisplay(listing?.badges || []);
    const swiperImageUrl = listing?.images?.[0] ? getSanityImageUrl(listing.images[0]) : "/placeholder.svg";

    return (
      <Link href={`/listing/${listing?.slug?.current || listing?._id}`} className="flex-shrink-0 block transform transition-transform duration-300 hover:-translate-y-1"
        onClick={async (e) => {
          // Track listing click
          if (listing?._id) {
            try {
              await trackAnalyticsEventClient({
                event_type: 'listing_click',
                listing_id: listing._id
              });
            } catch (error) {
              console.error('Error tracking listing click:', error);
            }
          }
        }}
      >
        <Card className="w-72 sm:w-80 h-full py-0 gap-1 bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col transform hover:-translate-y-1 hover:border-primary/10 hover:ring-1 hover:ring-primary/20">
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden">
              {swiperImageUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={swiperImageUrl}
                    alt={listing?.title || "Listing image"}
                    fill
                    className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>
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
                {effectiveSeller?.avatar ? (
                  <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <Image 
                      src={effectiveSeller.avatar} 
                      alt={effectiveSeller.name || "Seller"} 
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">
                      {effectiveSeller?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <span className="text-xs text-gray-600 truncate">
                  {effectiveSeller?.name || "User"}
                </span>
                {effectiveSeller?.isVerified && (
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
                <div className="flex items-baseline">
                  <span className="text-black">PKR {listing?.price?.toLocaleString() || "0"}</span>
                  <span className="text-blue-500 text-sm font-medium ml-1">/day</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 text-sm leading-tight">
                {listing?.title}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {listing?.location?.area ? `${listing.location.area}, ` : ""}
                  {listing?.location?.city || "Unknown Location"}
                </span>
              </div>
            </div>

            {listing?.specifications && listing.specifications.length > 0 && (
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

  // Featured variant specific rendering
  if (variant === "featured") {
    return (
      <Card className={cn("group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full flex flex-col py-0", className)}>
        <div className="relative">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {effectiveImage ? (
              <Image
                src={imageUrl}
                alt={effectiveTitle}
                fill
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
            
            {/* Overlay actions passed as prop */}
            {overlayActions || (
              <div className="absolute top-3 right-3 flex gap-2">
                {listing && <SaveButton listing={listing} className="w-8 h-8 p-0 bg-white/90 hover:bg-white" />}
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = `${window.location.origin}/listing/${listing?.slug?.current || listing?._id}`;
                    
                    // Track the share event
                    try {
                      await trackAnalyticsEventClient({
                        event_type: 'share',
                        listing_id: listing?._id,
                        metadata: { 
                          method: navigator.share ? 'native' : 'clipboard',
                          url: url
                        }
                      });
                    } catch (error) {
                      console.error('Error tracking share event:', error);
                    }
                    
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: listing?.title,
                          text: Array.isArray(listing?.description) 
                            ? listing.description
                                .filter((block: any) => block._type === 'block' && block.children)
                                .map((block: any) => block.children.map((child: any) => child.text || '').join(''))
                                .join(' ')
                            : typeof listing?.description === 'string' 
                              ? listing.description 
                              : '',
                          url
                        });
                      } catch (error) {
                        console.error('Error sharing:', error);
                        // Fallback to clipboard
                        await navigator.clipboard.writeText(url);
                      }
                    } else {
                      // Fallback to clipboard
                      await navigator.clipboard.writeText(url);
                    }
                    
                    // Show toast notification
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {/* Status badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {listing?.isFeatured && (
                <Badge className="bg-yellow-500 text-white">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          <div className="p-5 flex-grow flex flex-col">
            {/* Top section with category and title */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {listing?.category?.title || 'Uncategorized'}
                </Badge>
                <div className="text-right">
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold text-black">
                      PKR {effectivePrice?.toLocaleString() || '0'}
                    </span>
                    <span className="text-xs text-blue-500 font-medium ml-1">
                      /{effectivePriceType === 'hourly' ? 'hr' : effectivePriceType === 'daily' ? 'day' : effectivePriceType === 'weekly' ? 'week' : 'month'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Link href={`/listing/${listing?.slug?.current || effectiveId}`}>
                <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {effectiveTitle}
                </h3>
              </Link>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{listing?.location?.area ? `${listing.location.area}, ` : ''}{listing?.location?.city || effectiveLocation || 'Unknown Location'}</span>
            </div>

            {/* Description */}
            {listing?.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {Array.isArray(listing.description) 
                  ? listing.description
                      .filter((block: any) => block._type === 'block')
                      .map((block: any) => block.children?.map((child: any) => child.text).join(''))
                      .join(' ')
                  : typeof listing.description === 'string' 
                    ? listing.description 
                    : ''}
              </p>
            )}

            {/* Bottom section with condition */}
            <div className="mt-auto pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Condition:</span>
                  <Badge className={`text-xs ${
                listing?.condition === 'new' ? 'bg-green-100 text-green-700' :
                listing?.condition === 'like-new' ? 'bg-blue-100 text-blue-700' :
                listing?.condition === 'good' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
                  }`}>
                    {listing?.condition === 'like-new' ? 'Like New' : listing?.condition?.charAt(0).toUpperCase() + (listing?.condition?.slice(1) || '')}
                  </Badge>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Category variant specific rendering
  if (variant === "category") {
    return (
      <Card className={cn("group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm py-0 h-full flex flex-col", className)}>
        <div className="relative">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {effectiveImage ? (
              <Image
                src={imageUrl}
                alt={effectiveTitle}
                fill
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
            
            {/* Overlay actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {listing && <SaveButton listing={listing} className="w-8 h-8 p-0 bg-white/90 hover:bg-white" />}
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                onClick={async (e) => {
                  e.preventDefault();
                  const url = `${window.location.origin}/listing/${listing?.slug?.current || listing?._id}`;
                  
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: listing?.title,
                        text: Array.isArray(listing?.description) 
                          ? listing.description
                              .filter((block: any) => block._type === 'block' && block.children)
                              .map((block: any) => block.children.map((child: any) => child.text || '').join(''))
                              .join(' ')
                          : typeof listing.description === 'string' 
                            ? listing.description 
                            : '',
                        url
                      });
                    } catch (error) {
                      console.error('Error sharing:', error);
                      // Fallback to clipboard
                      await navigator.clipboard.writeText(url);
                    }
                  } else {
                    // Fallback to clipboard
                    await navigator.clipboard.writeText(url);
                  }
                  
                  // Show toast notification
                  toast.success("Link copied to clipboard!");
                }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Status badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {listing?.isFeatured && (
                <Badge className="bg-yellow-500 text-white">
                  Featured
                </Badge>
              )}
            </div>

          </div>

          <div className="p-4 flex-grow flex flex-col">
            {/* Category */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {listing?.category?.title || 'Uncategorized'}
              </Badge>
            </div>

            {/* Title */}
            <Link href={`/listing/${listing?.slug?.current || effectiveId}`} className="flex-grow">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {effectiveTitle}
              </h3>
            </Link>

            {/* Location */}
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{listing?.location?.area ? `${listing.location.area}, ` : ''}{listing?.location?.city || effectiveLocation || 'Unknown Location'}</span>
            </div>

            {/* Description */}
            {listing?.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {Array.isArray(listing.description) 
                  ? listing.description
                      .filter((block: any) => block._type === 'block')
                      .map((block: any) => block.children?.map((child: any) => child.text).join(''))
                      .join(' ')
                  : typeof listing.description === 'string' 
                    ? listing.description 
                    : ''}
              </p>
            )}

            {/* Condition */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">Condition:</span>
              <Badge className={`text-xs ${
                listing?.condition === 'new' ? 'bg-green-100 text-green-700' :
                listing?.condition === 'like-new' ? 'bg-blue-100 text-blue-700' :
                listing?.condition === 'good' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {listing?.condition === 'like-new' ? 'Like New' : listing?.condition?.charAt(0).toUpperCase() + (listing?.condition?.slice(1) || '')}
              </Badge>
            </div>

            {/* Price */}
              <div className="flex items-center justify-between mb-3 mt-auto">
                <div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-black">
                      PKR {effectivePrice?.toLocaleString() || '0'}
                    </span>
                    <span className="text-sm text-blue-500 font-medium ml-1">
                      /{effectivePriceType === 'hourly' ? 'hr' : effectivePriceType === 'daily' ? 'day' : effectivePriceType === 'weekly' ? 'week' : 'month'}
                    </span>
                  </div>
                </div>
              </div>

            {/* Seller info */}
            <div className="flex items-center justify-between pt-3 border-t">
              {listing?.seller?.profile?.username && (
                <Link href={`/seller/${listing.seller.profile.username}`} className="flex items-center gap-2 hover:opacity-80">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {effectiveSeller?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {effectiveSeller?.name || 'Unknown Seller'}
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge className={`text-xs ${
                        listing.seller.profile.tier === 'basic' ? 'bg-gray-100 text-gray-700' :
                        listing.seller.profile.tier === 'bronze' ? 'bg-orange-100 text-orange-700' :
                        listing.seller.profile.tier === 'silver' ? 'bg-gray-100 text-gray-600' :
                        listing.seller.profile.tier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                        listing.seller.profile.tier === 'platinum' ? 'bg-purple-100 text-purple-700' :
                        listing.seller.profile.tier === 'diamond' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {listing.seller.profile.tier || 'basic'}
                      </Badge>
                      {listing.seller.profile.is_verified && (
                        <Badge className="text-xs bg-green-100 text-green-700">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              )}
              

            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  // List variant specific rendering
  if (variant === "list") {
    return (
      <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-md py-0", className)}>
        <div className="flex flex-row h-40 sm:h-56">
          <div className="relative min-w-[40%] h-full overflow-hidden">
            {effectiveImage ? (
              <Image
                src={imageUrl}
                alt={effectiveTitle}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 m-auto"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
            {listing?.isFeatured && (
              <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                <Badge className="bg-yellow-500 text-white text-xs py-0.5 px-1 sm:py-1 sm:px-2">
                  <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">Featured</span>
                </Badge>
              </div>
            )}
          </div>

          <div className="flex-1 p-2 sm:p-3 min-w-0">
            <div className="flex flex-col h-full">
              <div className="flex flex-wrap gap-1 mb-1">
                <Badge variant="outline" className="text-xs py-0.5 px-1">
                  {listing?.category?.title || 'Uncategorized'}
                </Badge>
                <Badge variant="outline" className={`text-xs py-0.5 px-1 ${
                  listing?.condition === 'new' ? 'bg-green-100 text-green-700' :
                  listing?.condition === 'like-new' ? 'bg-blue-100 text-blue-700' :
                  listing?.condition === 'good' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {listing?.condition === 'like-new' ? 'Like New' : listing?.condition?.charAt(0).toUpperCase() + (listing?.condition?.slice(1) || '')}
                </Badge>
              </div>

              <Link href={`/listing/${listing?.slug?.current || effectiveId}`} className="min-w-0">
                <h3 className="text-sm font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors break-words">
                  {effectiveTitle}
                </h3>
              </Link>

              {/* Description - hidden on mobile, visible on desktop */}
              {listing?.description && (
                <p className="text-muted-foreground mb-2 line-clamp-2 flex-grow text-xs hidden sm:block">
                  {Array.isArray(listing.description) 
                    ? listing.description
                        .filter((block: any) => block._type === 'block')
                        .map((block: any) => block.children?.map((child: any) => child.text).join(''))
                        .join(' ')
                    : typeof listing.description === 'string' 
                      ? listing.description 
                      : ''}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-auto">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-muted-foreground min-w-0">
                  <div className="flex items-center min-w-0">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate text-xs">{listing?.location?.area ? `${listing.location.area}, ` : ''}{listing?.location?.city || effectiveLocation || 'Unknown Location'}</span>
                  </div>
                  {/* Time - hidden on mobile, visible on desktop */}
                  {listing?.createdAt && (
                    <div className="flex items-center hidden sm:flex">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="text-xs">{formatTimeAgo(listing.createdAt)}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="flex items-baseline justify-end">
                    <span className="text-base font-bold text-black">
                      PKR {effectivePrice?.toLocaleString() || '0'}
                    </span>
                    <span className="text-xs text-blue-500 font-medium ml-1">
                      /{effectivePriceType === 'hourly' ? 'hr' : effectivePriceType === 'daily' ? 'day' : effectivePriceType === 'weekly' ? 'week' : 'month'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex space-x-1 mt-2">
                {listing?.seller?.phone && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-2 bg-transparent flex-1 min-h-[36px]"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (listing?.seller?.phone) {
                          window.location.href = `tel:${listing.seller.phone}`;
                          trackAnalyticsEventClient({
                            event_type: 'contact_click',
                            listing_id: listing._id,
                            metadata: { contact_method: 'phone' }
                          });
                        } else {
                          toast.error("Phone number is not available.");
                        }
                      }}
                    >
                      <Phone className="h-3 w-3 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline text-xs">Call</span>
                    </Button>
                    <WhatsAppButton
                      phoneNumber={listing.seller.phone}
                      sellerName={listing.seller.profile?.business_name || listing.seller.profile?.username || 'Seller'}
                      size="auto"
                      className="!h-8 px-2 w-full flex-1 min-h-[36px]"
                      onClick={() => {
                        trackAnalyticsEventClient({
                          event_type: 'contact_click',
                          listing_id: listing._id,
                          metadata: { contact_method: 'whatsapp' }
                        });
                      }}
                    />
                  </>
                )}
                {onRemove && listing?._id && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 px-2 flex-1 min-h-[36px]"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemove(listing._id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline text-xs">Remove</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default Card
  return (
    <Card className={cn("group overflow-hidden hover:shadow-lg transition-all duration-300 py-0", className)}>
      <div className="relative">
        <Link href={`/listing/${listing?.slug?.current || effectiveId}`}>
          <div
            className={cn(
              "relative overflow-hidden"
            )}
          >
            <Image
              src={imageUrl}
              alt={effectiveTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />

            {/* Badges */}
            {listing?.badges && listing?.badges.length > 0 && (
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {listing.badges.map((badge) => (
                  <Badge key={badge} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {listing && <SaveButton listing={listing} className="h-8 w-8" />}
              <Button 
                size="icon" 
                variant="secondary" 
                className="h-8 w-8"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const url = `${window.location.origin}/listing/${listing?.slug?.current || listing?._id}`;
                  
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: listing?.title,
                        text: Array.isArray(listing?.description) 
                          ? listing.description
                              .filter((block: any) => block._type === 'block' && block.children)
                              .map((block: any) => block.children.map((child: any) => child.text || '').join(''))
                              .join(' ')
                          : typeof listing?.description === 'string' 
                            ? listing.description 
                            : '',
                        url
                      });
                    } catch (error) {
                      console.error('Error sharing:', error);
                      // Fallback to clipboard
                      await navigator.clipboard.writeText(url);
                    }
                  } else {
                    // Fallback to clipboard
                    await navigator.clipboard.writeText(url);
                  }
                  
                  // Show toast notification
                  toast.success("Link copied to clipboard!");
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Link>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Rating */}
          <div>
            <Link href={`/listing/${listing?.slug?.current || effectiveId}`}>
              <h3
                className={cn(
                  "font-semibold line-clamp-2 group-hover:text-primary transition-colors"
                )}
              >
                {effectiveTitle}
              </h3>
            </Link>

            {rating && (
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{rating}</span>
                {reviewCount && <span className="text-sm text-muted-foreground">({reviewCount})</span>}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{effectiveLocation}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline">
                <span className="text-lg font-bold text-black">
                  PKR {effectivePrice?.toLocaleString() || '0'}
                </span>
                <span className="text-sm text-blue-500 font-medium ml-1">
                  /{effectivePriceType === 'hourly' ? 'hr' : effectivePriceType === 'daily' ? 'day' : effectivePriceType === 'weekly' ? 'week' : 'month'}
                </span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          {showSellerInfo && effectiveSeller && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2">
                {listing?.seller?.profile?.username ? (
                  <Link href={`/seller/${listing.seller.profile.username}`} className="flex items-center space-x-2 hover:opacity-80">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                      {effectiveSeller?.avatar ? (
                        <Image
                          src={effectiveSeller.avatar || "/placeholder-blog.svg"}
                          alt={effectiveSeller.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <span className="text-xs font-medium">{effectiveSeller?.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{effectiveSeller?.name}</span>
                    {effectiveSeller?.isVerified && (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                      {effectiveSeller?.avatar ? (
                        <Image
                          src={effectiveSeller.avatar || "/placeholder-blog.svg"}
                          alt={effectiveSeller.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <span className="text-xs font-medium">{effectiveSeller?.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{effectiveSeller?.name}</span>
                    {effectiveSeller?.isVerified && (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Buttons */}
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 px-2 bg-transparent flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Handle call action
                  }}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Call</span>
                </Button>
                {listing?.seller?.phone && (
                  <div className="flex-1">
                    <WhatsAppButton
                      phoneNumber={listing.seller.phone}
                      sellerName={listing.seller.profile?.business_name || listing.seller.profile?.username || 'Seller'}
                      size="auto"
                      className="h-8 px-2 w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
