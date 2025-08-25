import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Phone, MessageCircle, Heart, Share2, Eye, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getSanityImageUrl } from "@/sanity/lib/image"
import { Listing, ListingImage } from "@/types" // Import the proper Listing type and ListingImage

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
  variant?: "small" | "medium" | "large" | "category" | "list" | "featured" // Added 'featured' variant
  className?: string
  
  // New listing prop for compatibility with SearchResults
  listing?: Listing
  
  // Additional props from SearchResults
  showSellerInfo?: boolean
  priority?: boolean
  
  // Overlay actions for featured variant
  overlayActions?: React.ReactNode
}

export function ListingCard({
  id,
  title,
  price,
  priceType,
  location,
  image,
  rating,
  reviewCount,
  badges = [],
  seller,
  variant = "medium",
  className,
  listing, // New prop
  showSellerInfo = true, // Default to true to match SearchResults
  priority = false, // Default to false to match SearchResults
  overlayActions, // Overlay actions for featured variant
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
            {overlayActions}
            
            {/* Status badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {listing?.isFeatured && (
                <Badge className="bg-yellow-500 text-white">
                  Featured
                </Badge>
              )}
              {listing?.availability && (
                <Badge className={`text-xs ${listing.availability.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {listing.availability.isAvailable ? 'Available' : 'Not Available'}
                </Badge>
              )}
            </div>

            {/* View count */}
            {listing?.views && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded text-xs">
                <Eye className="w-3 h-3" />
                {listing.views}
              </div>
            )}
          </div>

          <div className="p-5 flex-grow flex flex-col">
            {/* Top section with category and title */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {listing?.category?.title || 'Uncategorized'}
                </Badge>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(effectivePrice || 0, effectivePriceType || 'daily')}
                </span>
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

            {/* Bottom section with condition and seller */}
            <div className="mt-auto pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Condition:</span>
                  <Badge className={`text-xs ${
                    listing?.condition === 'new' ? 'bg-green-100 text-green-800' :
                    listing?.condition === 'like-new' ? 'bg-green-100 text-green-700' :
                    listing?.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {listing?.condition === 'like-new' ? 'Like New' : listing?.condition?.charAt(0).toUpperCase() + (listing?.condition?.slice(1) || '')}
                  </Badge>
                </div>
              </div>

              {/* Seller info */}
              {effectiveSeller && listing?.seller?.profile && (
                <Link href={`/seller/${listing.seller.profile.username}`} className="flex items-center gap-3 hover:opacity-80">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">
                      {effectiveSeller?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {effectiveSeller?.name || 'Unknown Seller'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
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
              <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/90 hover:bg-white">
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/90 hover:bg-white">
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
              {listing?.availability && (
                <Badge className={`text-xs ${listing.availability.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {listing.availability.isAvailable ? 'Available' : 'Not Available'}
                </Badge>
              )}
            </div>

            {/* View count */}
            {listing?.views && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded text-xs">
                <Eye className="w-3 h-3" />
                {listing.views}
              </div>
            )}
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
                listing?.condition === 'new' ? 'bg-green-100 text-green-800' :
                listing?.condition === 'like-new' ? 'bg-green-100 text-green-700' :
                listing?.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {listing?.condition === 'like-new' ? 'Like New' : listing?.condition?.charAt(0).toUpperCase() + (listing?.condition?.slice(1) || '')}
              </Badge>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mb-3 mt-auto">
              <div>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(effectivePrice || 0, effectivePriceType || 'daily')}
                </span>
              </div>
            </div>

            {/* Seller info */}
            <div className="flex items-center justify-between pt-3 border-t">
              {effectiveSeller && listing?.seller?.profile && (
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
      <div className={cn("bg-background border rounded-lg p-4 hover:shadow-md transition-shadow py-0", className)}>
        <div className="flex gap-4">
          <div className="w-24 h-24 flex-shrink-0">
            {effectiveImage ? (
              <Image
                src={imageUrl}
                alt={effectiveTitle}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                <span className="text-muted-foreground text-xs">No image</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <Link href={`/listing/${listing?.slug?.current || effectiveId}`}>
                <h3 className="font-semibold hover:text-primary transition-colors">
                  {effectiveTitle}
                </h3>
              </Link>
              <div className="text-right">
                <p className="font-bold text-lg text-primary">
                  {formatPrice(effectivePrice || 0, effectivePriceType || 'daily')}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {listing?.description && Array.isArray(listing.description) 
                ? listing.description
                    .filter((block: any) => block._type === 'block')
                    .map((block: any) => block.children?.map((child: any) => child.text).join(''))
                    .join(' ')
                : typeof listing?.description === 'string' 
                  ? listing.description 
                  : ''}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {listing?.condition || 'N/A'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {listing?.location?.city || effectiveLocation}
                </span>
              </div>
              {effectiveSeller && listing?.seller?.profile && (
                <Link href={`/seller/${listing.seller.profile.username}`} className="text-sm text-primary hover:underline">
                  @{listing.seller.profile.username}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("group overflow-hidden hover:shadow-lg transition-all duration-300 py-0", className)}>
      <div className="relative">
        <Link href={`/listing/${effectiveId}`}>
          <div
            className={cn(
              "relative overflow-hidden",
              variant === "small" && "aspect-square",
              variant === "medium" && "aspect-[4/3]",
              variant === "large" && "aspect-[16/9]",
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
            {badges.length > 0 && (
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {badges.map((badge) => (
                  <Badge key={badge} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-8 w-8">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="h-8 w-8">
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
            <Link href={`/listing/${effectiveId}`}>
              <h3
                className={cn(
                  "font-semibold line-clamp-2 group-hover:text-primary transition-colors",
                  variant === "small" && "text-sm",
                  variant === "medium" && "text-base",
                  variant === "large" && "text-lg",
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
              <span className="text-lg font-bold text-primary">PKR {effectivePrice.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground ml-1">{priceLabel[effectivePriceType]}</span>
            </div>
          </div>

          {/* Seller Info */}
          {showSellerInfo && effectiveSeller && (
            <div className="flex items-center justify-between pt-2 border-t">
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

              {/* Contact Buttons */}
              <div className="flex space-x-1">
                <Button size="sm" variant="outline" className="h-8 px-2 bg-transparent">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
                <Button size="sm" className="h-8 px-2 bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}