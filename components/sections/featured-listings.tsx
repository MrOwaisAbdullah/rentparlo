"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Calendar, Zap, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Listing {
  id: string
  title: string
  price: number
  description: string
  images: string[]
  location: {
    city: string
    area: string
  }
  specifications: Record<string, string>
  owner: {
    name: string
    rating: number
    verified: boolean
  }
  featured?: boolean
}

interface FeaturedListingsProps {
  listings: Listing[]
}

const getSpecIcon = (key: string) => {
  const lowerKey = key.toLowerCase()
  if (lowerKey.includes("year") || lowerKey.includes("date") || lowerKey.includes("model")) {
    return Calendar
  }
  if (
    lowerKey.includes("power") ||
    lowerKey.includes("battery") ||
    lowerKey.includes("engine") ||
    lowerKey.includes("fuel")
  ) {
    return Zap
  }
  return Settings
}

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  if (listings.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">Featured Listings</h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Premium
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Link key={listing.id} href={`/listing/${listing.id}`}>
            <Card className="group overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-primary/5 to-transparent h-full">
              <div className="relative">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image
                    src={listing.images[0] || "/placeholder.svg"}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">FEATURED</Badge>
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="text-white text-sm font-semibold">PKR {listing.price.toLocaleString()}/day</span>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{listing.description}</p>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {listing.location.area}, {listing.location.city}
                  </span>
                </div>

                {/* Specifications */}
                <div className="space-y-2">
                  {Object.entries(listing.specifications)
                    .slice(0, 3)
                    .map(([key, value]) => {
                      const IconComponent = getSpecIcon(key)
                      return (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      )
                    })}
                </div>

                {/* Owner Info */}
                {listing.owner && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {listing.owner.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{listing.owner.name || "Unknown User"}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">{listing.owner.rating || 0}</span>
                        </div>
                      </div>
                    </div>
                    {listing.owner.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
