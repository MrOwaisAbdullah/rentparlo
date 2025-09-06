"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

interface ProductGridProps {
  listings: Listing[]
}

const ITEMS_PER_PAGE = 12

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

function ProductGrid({ listings }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentListings = listings.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No listings found matching your criteria.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentListings.map((listing) => (
          <Link key={listing.id} href={`/listing/${listing?.slug?.current || listing?.id}`}>
            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              <div className="relative">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image
                    src={listing.images[0] || "/placeholder.svg"}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-white text-sm font-semibold">PKR {listing.price.toLocaleString()}/day</span>
                </div>
              </div>

              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{listing.description}</p>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">
                      {listing.location.area}, {listing.location.city}
                    </span>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-1">
                    {listing.specifications &&
                      Object.entries(listing.specifications)
                        .slice(0, 2)
                        .map(([key, value]) => {
                          const IconComponent = getSpecIcon(key)
                          // Ensure value is a string or number, not an object
                          const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value)
                          return (
                            <div key={key} className="flex items-center gap-2 text-sm">
                              <IconComponent className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground text-xs">{key}:</span>
                              <span className="font-medium text-xs">{displayValue}</span>
                            </div>
                          )
                        })}
                  </div>
                </div>

                {/* Owner Info */}
                {listing.owner && (
                  <div className="flex items-center justify-between pt-3 border-t mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {listing.owner.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium line-clamp-1">{listing.owner.name || "Unknown"}</p>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export { ProductGrid }
export default ProductGrid
