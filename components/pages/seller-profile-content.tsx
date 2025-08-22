"use client"

import { useState } from "react"
import Image from "next/image"
import { Phone, MessageCircle, MapPin, Star, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import SellerTierBadge from "@/components/seller/seller-tier-badge"
import ProductGrid from "@/components/sections/product-grid"
import AdBanner from "@/components/ads/ad-banner"

interface Seller {
  id: string
  username: string
  name: string
  avatar: string
  coverImage: string
  rating: number
  reviewCount: number
  responseTime: string
  memberSince: string
  verified: boolean
  tier: string
  phone: string
  whatsapp: string
  location: string
  description: string
  specialties: string[]
  totalListings: number
  activeListings: number
}

interface Listing {
  id: string
  title: string
  price: number
  images: string[]
  location: string
  category: string
  specifications: Record<string, string>
  owner: {
    name: string
    avatar: string
    rating: number
    responseTime: string
  }
  featured: boolean
  condition: string
}

interface SellerProfileContentProps {
  seller: Seller
  listings: Listing[]
}

const mockReviews = [
  {
    id: "1",
    user: "Sarah Ahmed",
    avatar: "/woman-profile.png",
    rating: 5,
    date: "2024-01-15",
    comment:
      "Excellent service! The camera equipment was in perfect condition and Ahmed was very responsive to all my questions.",
  },
  {
    id: "2",
    user: "Muhammad Ali",
    avatar: "/man-profile.png",
    rating: 4,
    date: "2024-01-10",
    comment: "Great experience renting audio equipment. Professional setup and fair pricing.",
  },
  {
    id: "3",
    user: "Fatima Khan",
    avatar: "/woman-profile-two.png",
    rating: 5,
    date: "2024-01-05",
    comment:
      "Highly recommend! The laptop worked perfectly for my presentation and the pickup/drop-off was very convenient.",
  },
]

export default function SellerProfileContent({ seller, listings }: SellerProfileContentProps) {
  const [activeTab, setActiveTab] = useState("listings")
  const [listingFilter, setListingFilter] = useState("all")

  const filteredListings = listings.filter((listing) => {
    if (listingFilter === "all") return true
    return listing.category.toLowerCase() === listingFilter.toLowerCase()
  })

  const categories = Array.from(new Set(listings.map((l) => l.category)))

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 w-full">
        <Image
          src={seller.coverImage || "/placeholder.svg"}
          alt={`${seller.name} cover`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Profile Card */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <Image
                        src={seller.avatar || "/placeholder.svg"}
                        alt={seller.name}
                        width={140}
                        height={140}
                        className="rounded-full mx-auto border-4 border-white shadow-xl"
                      />
                      {seller.verified && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold mb-3">{seller.name}</h1>
                      <div className="flex items-center justify-center gap-2">
                        <SellerTierBadge tier={seller.tier} />
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">{seller.rating}</span>
                      <span className="text-muted-foreground">({seller.reviewCount} reviews)</span>
                    </div>

                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{seller.location}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {seller.memberSince}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>Responds in {seller.responseTime}</span>
                      </div>
                    </div>

                    <div className="pt-6 space-y-3">
                      <Button className="w-full h-12 text-base font-semibold">
                        <Phone className="h-5 w-5 mr-2" />
                        Call Now
                      </Button>
                      <Button variant="outline" className="w-full h-12 text-base font-semibold bg-transparent">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ad Banner */}
              <AdBanner size="medium-rectangle" />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Mobile Profile Card */}
            <div className="lg:hidden mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Image
                        src={seller.avatar || "/placeholder.svg"}
                        alt={seller.name}
                        width={80}
                        height={80}
                        className="rounded-full border-2 border-white shadow-lg"
                      />
                      {seller.verified && (
                        <Badge
                          variant="secondary"
                          className="absolute -bottom-1 -right-1 bg-green-100 text-green-800 text-xs"
                        >
                          <Shield className="h-2 w-2" />
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1">
                      <h1 className="text-lg font-bold">{seller.name}</h1>
                      <SellerTierBadge tier={seller.tier} />

                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{seller.rating}</span>
                        <span className="text-xs text-muted-foreground">({seller.reviewCount})</span>
                      </div>

                      <div className="text-xs text-muted-foreground mt-1">
                        {seller.location} • Member since {seller.memberSince}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="listings" className="text-base">
                  Listings ({seller.activeListings})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-base">
                  Reviews ({seller.reviewCount})
                </TabsTrigger>
                <TabsTrigger value="about" className="text-base">
                  About
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-8">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <Button
                    variant={listingFilter === "all" ? "default" : "outline"}
                    size="default"
                    onClick={() => setListingFilter("all")}
                  >
                    All ({listings.length})
                  </Button>
                  {categories.map((category) => {
                    const count = listings.filter((l) => l.category === category).length
                    return (
                      <Button
                        key={category}
                        variant={listingFilter === category.toLowerCase() ? "default" : "outline"}
                        size="default"
                        onClick={() => setListingFilter(category.toLowerCase())}
                      >
                        {category} ({count})
                      </Button>
                    )
                  })}
                </div>

                <ProductGrid listings={filteredListings} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <Card key={review.id} className="shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Image
                            src={review.avatar || "/placeholder.svg"}
                            alt={review.user}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-base">{review.user}</h4>
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-muted-foreground mt-3 leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-8">
                <div className="space-y-8">
                  <Card className="shadow-sm">
                    <CardContent className="p-8">
                      <h3 className="font-bold text-xl mb-4">About {seller.name}</h3>
                      <p className="text-muted-foreground leading-relaxed text-base">{seller.description}</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-8">
                      <h3 className="font-bold text-xl mb-4">Specialties</h3>
                      <div className="flex flex-wrap gap-3">
                        {seller.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="px-3 py-1 text-sm">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-8">
                      <h3 className="font-bold text-xl mb-6">Statistics</h3>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-2">{seller.totalListings}</div>
                          <div className="text-muted-foreground">Total Listings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-2">{seller.activeListings}</div>
                          <div className="text-muted-foreground">Active Listings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-2">{seller.rating}</div>
                          <div className="text-muted-foreground">Average Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-2">{seller.responseTime}</div>
                          <div className="text-muted-foreground">Response Time</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="lg:hidden mt-8 mb-6">
              <AdBanner size="leaderboard" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-50">
        <div className="flex gap-2">
          <Button className="flex-1" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Padding */}
      <div className="lg:hidden h-20" />
    </div>
  )
}
