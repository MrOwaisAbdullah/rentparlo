import { notFound } from "next/navigation"
import { getAllListings } from "@/lib/listings"
import { getSellerByUsername } from "@/lib/seller"
import SellerProfileContent from "@/components/pages/seller-profile-content"

export default function SellerProfilePage({ params }: { params: { username: string } }) {
  const seller = getSellerByUsername(params.username)

  if (!seller) {
    notFound()
  }

  const allListings = getAllListings()
  const sellerListings = allListings.filter((listing) => listing.seller.profile.username === seller.name)

  return <SellerProfileContent seller={seller} listings={sellerListings} />
}
