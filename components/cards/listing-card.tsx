import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Phone, MessageCircle, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ListingCardProps {
  id: string
  title: string
  price: number
  priceType: "hourly" | "daily" | "weekly" | "monthly"
  location: string
  image: string
  rating?: number
  reviewCount?: number
  badges?: string[]
  seller: {
    name: string
    avatar?: string
    isVerified?: boolean
  }
  variant?: "small" | "medium" | "large"
  className?: string
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
}: ListingCardProps) {
  const priceLabel = {
    hourly: "/hour",
    daily: "/day",
    weekly: "/week",
    monthly: "/month",
  }

  return (
    <Card className={cn("group overflow-hidden hover:shadow-lg transition-all duration-300", className)}>
      <div className="relative">
        <Link href={`/listing/${id}`}>
          <div
            className={cn(
              "relative overflow-hidden",
              variant === "small" && "aspect-square",
              variant === "medium" && "aspect-[4/3]",
              variant === "large" && "aspect-[16/9]",
            )}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
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
            <Link href={`/listing/${id}`}>
              <h3
                className={cn(
                  "font-semibold line-clamp-2 group-hover:text-primary transition-colors",
                  variant === "small" && "text-sm",
                  variant === "medium" && "text-base",
                  variant === "large" && "text-lg",
                )}
              >
                {title}
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
            <span className="text-sm">{location}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary">PKR {price.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground ml-1">{priceLabel[priceType]}</span>
            </div>
          </div>

          {/* Seller Info */}
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
                  <span className="text-xs font-medium">{seller.name.charAt(0).toUpperCase()}</span>
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
        </div>
      </CardContent>
    </Card>
  )
}
