import { notFound } from "next/navigation"
import { getAllListings } from "@/lib/listings"
import ListingDetailContent from "@/components/pages/listing-detail-content"

interface ListingPageProps {
  params: {
    slug: string
  }
}

export default function ListingPage({ params }: ListingPageProps) {
  const listings = getAllListings()
  const listing = listings.find((l) => l.slug === params.slug)

  if (!listing) {
    notFound()
  }

  return <ListingDetailContent listing={listing} />
}

// Generate static params for all listings
export function generateStaticParams() {
  const listings = getAllListings()
  return listings.map((listing) => ({
    slug: listing.slug,
  }))
}
