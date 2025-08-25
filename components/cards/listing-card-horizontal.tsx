import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Phone, MessageCircle, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getSanityImageUrl } from "@/sanity/lib/image"
import { Listing } from "@/types" // Import the proper Listing type

interface ListingCardHorizontalProps {
  listing?: Listing
  showSellerInfo?: boolean
  priority?: boolean
  className?: string
}

export function ListingCardHorizontal({
  listing,
  showSellerInfo = true,
  priority = false,
  className,
}: ListingCardHorizontalProps) {
  if (!listing) return null;

  const priceLabel = {
    hourly: "/hour",
    daily: "/day",
    weekly: "/week",
    monthly: "/month",
    yearly: "/year",
  }

  // Use getSanityImageUrl to properly extract the image URL
  const imageUrl = getSanityImageUrl(listing.images?.[0], "/placeholder.svg");

  const seller = listing.seller ? {
    name: listing.seller.profile?.business_name || listing.seller.profile?.username || '',
    avatar: listing.seller.profile?.avatar_url,
    isVerified: listing.seller.is_verified
  } : undefined;

  return (
    <Card className={cn("group overflow-hidden hover:shadow-lg transition-all duration-300 flex", className)}>
      <div className="relative w-1/3">
        <Link href={`/listing/${listing._id}`}>
          <div className="relative h-full w-full">
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges */}
            {listing.badges && listing.badges.length > 0 && (
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

      <CardContent className="p-4 flex-1">
        <div className="h-full flex flex-col">
          {/* Title and Rating */}
          <div className="flex-1">
            <Link href={`/listing/${listing._id}`}>
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors text-base">
                {listing.title}
              </h3>
            </Link>

            {listing.rating && (
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{listing.rating}</span>
                {listing.reviewCount && <span className="text-sm text-muted-foreground">({listing.reviewCount})</span>}
              </div>
            )}

            {/* Location */}
            <div className="flex items-center space-x-1 text-muted-foreground mt-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {listing.location?.area ? `${listing.location.area}, ${listing.location.city}` : listing.location?.city}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {listing.description}
            </p>
          </div>

          {/* Price and Seller Info */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-primary">PKR {listing.price?.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground ml-1">{priceLabel[listing.priceType]}</span>
              </div>
            </div>

            {/* Seller Info */}
            {showSellerInfo && seller && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    {seller.avatar ? (
                      <Image
                        src={seller.avatar || "/placeholder.svg"}
                        alt={seller.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-medium">{seller.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{seller.name}</span>
                  {seller.isVerified && (
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
        </div>
      </CardContent>
    </Card>
  )
}