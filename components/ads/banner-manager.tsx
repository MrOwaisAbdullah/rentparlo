"use client"

import { useBanner } from "@/contexts/banner-context"
import { EnhancedAdBanner } from "@/components/ads/enhanced-ad-banner"
import { BannerPlacement, BannerSize } from "@/types"

interface BannerManagerProps {
  placement: BannerPlacement
  size?: BannerSize
  className?: string
  fallbackText?: string
}

export function BannerManager({ 
  placement, 
  size, 
  className = "", 
  fallbackText 
}: BannerManagerProps) {
  const { recordImpression, recordClick } = useBanner()

  return (
    <EnhancedAdBanner
      placement={placement}
      size={size}
      className={className}
      fallbackText={fallbackText}
    />
  )
}