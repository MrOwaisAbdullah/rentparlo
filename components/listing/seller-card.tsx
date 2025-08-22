import Image from "next/image"
import { Phone, MessageCircle, Star, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import SellerTierBadge from "@/components/seller/seller-tier-badge"

interface Owner {
  name: string
  avatar: string
  rating: number
  reviewCount: number
  tier: "basic" | "bronze" | "silver" | "gold" | "platinum" | "diamond"
  verified: boolean
  responseTime: string
  joinedDate: string
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
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <Shield className="h-3 w-3 text-white" />
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
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <Shield className="h-4 w-4 text-white" />
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
            <Button className="w-full" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call Seller
            </Button>
            <Button variant="outline" className="w-full bg-transparent" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
