"use client"

import { BannerManager } from "@/components/ads/banner-manager"
import { BannerPlacement, BannerSize } from "@/types"

interface AdBannerProps {
  placement: BannerPlacement
  size?: BannerSize
  className?: string
  fallbackText?: string
}

export function AdBanner({ placement, size, className = "", fallbackText }: AdBannerProps) {
  return (
    <BannerManager
      placement={placement}
      size={size}
      className={className}
      fallbackText={fallbackText}
    />
  )
}

export default AdBanner
