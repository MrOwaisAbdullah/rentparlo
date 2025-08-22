"use client"
import { Phone, MessageCircle, MapPin, Share2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ImageGallery from "@/components/listing/image-gallery"
import SellerCard from "@/components/listing/seller-card"
import PriceBlock from "@/components/listing/price-block"
import SpecificationsTable from "@/components/listing/specifications-table"
import RentalRules from "@/components/listing/rental-rules"
import SimilarListings from "@/components/listing/similar-listings"
import AdBanner from "@/components/ads/ad-banner"
import StarRating from "@/components/ui/star-rating"
import type { Listing } from "@/lib/listings"

interface ListingDetailContentProps {
  listing: Listing
}

export default function ListingDetailContent({ listing }: ListingDetailContentProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-20 gap-8">
            {/* Left Content (65%) */}
            <div className="col-span-13 space-y-6">
              {/* Image Gallery */}
              <ImageGallery images={listing.images} title={listing.title} />

              {/* Title and Rating */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
                    <p className="text-lg text-muted-foreground">
                      {listing.location.city}, {listing.location.area}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <StarRating rating={listing.rating} />
                  <span className="text-sm text-muted-foreground">
                    {listing.rating} ({listing.reviewCount} reviews)
                  </span>
                  <Badge variant="secondary">{listing.condition}</Badge>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
              </div>

              {/* Specifications */}
              <SpecificationsTable specifications={listing.specifications} />

              {/* Rental Rules - keeping card as requested */}
              <RentalRules />
            </div>

            {/* Right Sidebar (35%) */}
            <div className="col-span-7 space-y-6">
              <div className="sticky top-6 space-y-6">
                {/* Price Block */}
                <PriceBlock price={listing.price} />

                {/* Seller Card */}
                <SellerCard owner={listing.owner} />

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                </div>

                {/* Ad Banner */}
                <AdBanner size="medium-rectangle" />
              </div>
            </div>
          </div>
        </div>

        {/* Similar Listings - Full Width */}
        <div className="container mx-auto px-4 py-6">
          <SimilarListings currentListing={listing} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="space-y-0">
          {/* Hero Swiper Full Width */}
          <ImageGallery images={listing.images} title={listing.title} isMobile />

          <div className="px-4 py-6 space-y-6 pb-24">
            {/* Title and Basic Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
                  <p className="text-muted-foreground">
                    {listing.location.city}, {listing.location.area}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <StarRating rating={listing.rating} />
                <span className="text-sm text-muted-foreground">
                  {listing.rating} ({listing.reviewCount} reviews)
                </span>
              </div>

              <div className="text-2xl font-bold text-primary">PKR {listing.price.toLocaleString()}/day</div>
            </div>

            {/* Seller Info */}
            <SellerCard owner={listing.owner} isMobile />

            {/* Description - no card wrapper */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
            </div>

            {/* Specifications - no card wrapper */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Specifications</h3>
              <SpecificationsTable specifications={listing.specifications} isMobile />
            </div>

            {/* Rules - keeping card as requested */}
            <RentalRules isMobile />

            {/* Ad Banner Below Fold */}
            <AdBanner size="medium-rectangle" />

            {/* Similar Listings */}
            <SimilarListings currentListing={listing} isMobile />
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
          <div className="flex items-center gap-3">
            <Button className="flex-1" size="lg">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" size="lg">
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="lg">
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
