"use client"

import { getAllListings, type Listing } from "@/lib/listings"
import ProductSwiper from "@/components/sections/product-swiper"

interface SimilarListingsProps {
  currentListing: Listing
  isMobile?: boolean
}

export default function SimilarListings({ currentListing, isMobile = false }: SimilarListingsProps) {
  const allListings = getAllListings()
  const similarListings = allListings
    .filter((listing) => listing.category === currentListing.category && listing.id !== currentListing.id)
    .slice(0, 8)

  if (similarListings.length === 0) {
    return null
  }

  return (
    <ProductSwiper
      title="Similar Listings"
      listings={similarListings}
      showBadge={false}
      viewAllLink={`/search?category=${currentListing.category}`}
    />
  )
}
