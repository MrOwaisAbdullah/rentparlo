import { notFound } from "next/navigation"
import { getAllListings } from "@/lib/listings"
import SellerProfileContent from "@/components/pages/seller-profile-content"

// Mock seller data - in real app this would come from API/database
const mockSellers = [
  {
    id: "1",
    username: "ahmed-electronics",
    name: "Ahmed Electronics",
    avatar: "/placeholder-eamrm.png",
    coverImage: "/electronics-store-banner.png",
    rating: 4.8,
    reviewCount: 156,
    responseTime: "2 hours",
    memberSince: "2020",
    verified: true,
    tier: "gold",
    phone: "+92 300 1234567",
    whatsapp: "+92 300 1234567",
    location: "Lahore, Punjab",
    description:
      "Professional electronics rental service with over 4 years of experience. We provide high-quality cameras, laptops, and audio equipment for events, photography, and business needs.",
    specialties: ["Cameras", "Audio Equipment", "Laptops", "Event Equipment"],
    totalListings: 45,
    activeListings: 38,
  },
  {
    id: "2",
    username: "karachi-cars",
    name: "Karachi Car Rentals",
    avatar: "/car-rental-owner.png",
    coverImage: "/placeholder-1m49r.png",
    rating: 4.6,
    reviewCount: 89,
    responseTime: "1 hour",
    memberSince: "2019",
    verified: true,
    tier: "platinum",
    phone: "+92 321 9876543",
    whatsapp: "+92 321 9876543",
    location: "Karachi, Sindh",
    description:
      "Reliable car rental service in Karachi offering a wide range of vehicles from economy to luxury cars. Perfect for business trips, family vacations, and special occasions.",
    specialties: ["Sedans", "SUVs", "Luxury Cars", "Wedding Cars"],
    totalListings: 28,
    activeListings: 24,
  },
]

export default function SellerProfilePage({ params }: { params: { username: string } }) {
  const seller = mockSellers.find((s) => s.username === params.username)

  if (!seller) {
    notFound()
  }

  const allListings = getAllListings()
  const sellerListings = allListings.filter((listing) => listing.owner.name === seller.name)

  return <SellerProfileContent seller={seller} listings={sellerListings} />
}
