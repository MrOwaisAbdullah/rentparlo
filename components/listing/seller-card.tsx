import Image from "next/image"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import SellerTierBadge from "@/components/seller/seller-tier-badge"
import { VerifiedBadge } from "@/components/seller/verified-badge"
import { WhatsAppButton } from "@/components/seller/whatsapp-button"
import { CallButton } from "@/components/seller/call-button"

interface Owner {
  name: string
  avatar: string
  rating: number
  reviewCount: number
  tier: "basic" | "bronze" | "silver" | "gold" | "platinum" | "diamond"
  verified: boolean
  responseTime: string
  joinedDate: string
  phone?: string
}

interface SellerCardProps {
  owner: Owner
  isMobile?: boolean
}

export default function SellerCard({ owner, isMobile = false }: SellerCardProps) {
  if (isMobile) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={owner.avatar || "/placeholder.svg"}
                alt={owner.name}
                width={60}
                height={60}
                className="rounded-full object-cover"
              />
              {owner.verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                  <VerifiedBadge size="sm" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{owner.name}</h3>
                <SellerTierBadge tier={owner.tier} size="sm" />
              </div>

              <div className="flex items-center gap-1 mb-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{owner.rating}</span>
                <span className="text-xs text-muted-foreground">({owner.reviewCount} reviews)</span>
              </div>

              <p className="text-xs text-muted-foreground">Responds in {owner.responseTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-20 h-20">
            <Image
              src={owner.avatar || "/placeholder.svg"}
              alt={owner.name}
              fill
              className="rounded-full object-cover"
            />
            {owner.verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                  <VerifiedBadge size="sm" />
                </div>
              )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h3 className="font-semibold text-lg">{owner.name}</h3>
              <SellerTierBadge tier={owner.tier} />
            </div>

            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{owner.rating}</span>
              <span className="text-sm text-muted-foreground">({owner.reviewCount} reviews)</span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Responds in {owner.responseTime}</p>
            <p>Member since {owner.joinedDate}</p>
          </div>

          <div className="space-y-2">
            {owner.phone ? (
              <div className="space-y-2">
                <WhatsAppButton 
                  phoneNumber={owner.phone} 
                  sellerName={owner.name}
                />
                <CallButton 
                  phoneNumber={owner.phone} 
                  sellerName={owner.name}
                />
              </div>
            ) : (
              <button 
                className="relative flex items-center md:justify-center gap-5 w-full overflow-hidden rounded-xl bg-gray-300 p-3 font-medium text-gray-500 cursor-not-allowed"
                disabled
              >
                <span className="pl-4">Contact Unavailable</span>
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
