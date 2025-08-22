// components/SellerTierBadge.tsx
import { Badge } from "@/components/ui/badge"

const TIER_COLORS = {
  basic: "bg-gray-200 text-gray-800",
  bronze: "bg-amber-600 text-white",
  silver: "bg-gray-400 text-gray-900",
  gold: "bg-yellow-500 text-gray-900",
  platinum: "bg-blue-500 text-white",
  diamond: "bg-purple-600 text-white",
} as const

const TIER_ICONS = {
  basic: "★",
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
  diamond: "✨",
} as const

type TierType = keyof typeof TIER_COLORS

interface SellerTierBadgeProps {
  tier: string
}

export default function SellerTierBadge({ tier }: SellerTierBadgeProps) {
  const tierKey = tier.toLowerCase() as TierType
  const colorClass = TIER_COLORS[tierKey] || TIER_COLORS.basic
  const icon = TIER_ICONS[tierKey] || TIER_ICONS.basic

  return (
    <Badge className={`px-3 py-1 ${colorClass} flex items-center gap-1`}>
      {icon}
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </Badge>
  )
}
