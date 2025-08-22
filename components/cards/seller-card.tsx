import Link from "next/link"
import { Star, MapPin, Phone, MessageCircle, Shield, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SellerCardProps {
  id: string
  name: string
  username: string
  avatar?: string
  businessName?: string
  location: string
  rating: number
  reviewCount: number
  listingCount: number
  isVerified?: boolean
  isTopSeller?: boolean
  tier?: string
  joinedDate: string
  phone?: string
  whatsapp?: string
}

export function SellerCard({
  id,
  name,
  username,
  avatar,
  businessName,
  location,
  rating,
  reviewCount,
  listingCount,
  isVerified,
  isTopSeller,
  tier,
  joinedDate,
  phone,
  whatsapp,
}: SellerCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
            <AvatarFallback className="text-lg font-semibold">{name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div>
              <Link href={`/seller/${username}`}>
                <h3 className="font-semibold text-lg hover:text-primary transition-colors">{businessName || name}</h3>
              </Link>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1">
              {isVerified && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {isTopSeller && (
                <Badge variant="default" className="text-xs bg-yellow-500 hover:bg-yellow-600">
                  <Award className="h-3 w-3 mr-1" />
                  Top Seller
                </Badge>
              )}
              {tier && tier !== "basic" && (
                <Badge variant="outline" className="text-xs capitalize">
                  {tier}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-semibold text-lg">{rating}</div>
            <div className="flex items-center justify-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">Rating</span>
            </div>
          </div>
          <div>
            <div className="font-semibold text-lg">{reviewCount}</div>
            <div className="text-xs text-muted-foreground">Reviews</div>
          </div>
          <div>
            <div className="font-semibold text-lg">{listingCount}</div>
            <div className="text-xs text-muted-foreground">Listings</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>

        {/* Member Since */}
        <div className="text-sm text-muted-foreground">Member since {joinedDate}</div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {phone && (
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          )}
          {whatsapp && (
            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          )}
        </div>

        {/* View Profile */}
        <Button variant="ghost" className="w-full" asChild>
          <Link href={`/seller/${username}`}>View Full Profile</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
