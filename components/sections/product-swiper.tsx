"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft, MapPin, Star, Settings, Calendar, Zap } from "lucide-react"
import Link from "next/link"
import { getHomepageListings } from "@/lib/listings"

interface Listing {
  _id: string
  title: string
  slug: string
  price: number
  pricePerHour?: number
  categoryTitle: string
  images: any[]
  location: {
    city: string
    area?: string
  }
  description?: string
  specifications?: Array<{ key: string; value: string }>
  ownerInfo?: {
    name: string
    tier: string
  }
}

interface ProductSwiperProps {
  title: string
  category: string
  limit?: number
  trending?: boolean
}

const getSpecIcon = (key: string) => {
  const keyLower = key.toLowerCase()
  if (keyLower.includes("year") || keyLower.includes("model") || keyLower.includes("age")) {
    return <Calendar className="h-3 w-3" />
  }
  if (
    keyLower.includes("power") ||
    keyLower.includes("battery") ||
    keyLower.includes("fuel") ||
    keyLower.includes("engine")
  ) {
    return <Zap className="h-3 w-3" />
  }
  return <Settings className="h-3 w-3" />
}

export default function ProductSwiper({ title, category, limit = 8, trending = false }: ProductSwiperProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getHomepageListings()
        const filtered = data
          .filter((item: Listing) => item.categoryTitle.toLowerCase().includes(category.toLowerCase()))
          .slice(0, limit)

        setListings(filtered)
      } catch (error) {
        console.error("Error fetching listings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [category, limit])

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    updateScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", updateScrollButtons)
      return () => container.removeEventListener("scroll", updateScrollButtons)
    }
  }, [listings])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" })
    }
  }

  if (loading) {
    return (
      <section className="py-8 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-muted h-8 w-32 rounded"></div>
              {trending && <div className="bg-muted h-6 w-20 rounded-full"></div>}
            </div>
            <div className="bg-muted h-8 w-20 rounded"></div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 sm:w-80 animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-4"></div>
                <div className="bg-muted h-32 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (listings.length === 0) return null

  return (
    <section className="py-8 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
            {trending && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                Trending
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
              asChild
            >
              <Link href={`/category/${category.toLowerCase()}`} className="flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
              !canScrollLeft ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
            style={{ transform: "translateY(-50%) translateX(-50%)" }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
              !canScrollRight ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
            style={{ transform: "translateY(-50%) translateX(50%)" }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div ref={scrollContainerRef} className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {listings.map((listing) => (
              <Link key={listing._id} href={`/listing/${listing.slug}`} className="flex-shrink-0">
                <Card className="w-72 sm:w-80 h-full bg-white border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer flex flex-col">
                  <div className="relative">
                    <div className="aspect-[4/3] overflow-hidden">
                      {listing.images[0]?.asset?.url ? (
                        <img
                          src={listing.images[0].asset.url || "/placeholder.svg"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📷</div>
                            <p className="text-sm text-gray-600">No Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs font-medium">
                      HOT
                    </Badge>
                  </div>

                  <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
                    <div className="mb-3 flex-1">
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
                      {listing.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{listing.description}</p>
                      )}
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

                    {listing.ownerInfo && (
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium">{listing.ownerInfo.name.charAt(0)}</span>
                          </div>
                          <span className="text-xs text-gray-600 truncate">{listing.ownerInfo.name}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">4.8</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
