"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { AdBannerProps as AdBannerComponentProps } from "@/types/props"
import { AdBanner as AdBannerType } from "@/types"

interface AdBannerProps {
  ad: AdBannerType
  onImpression?: () => void
  className?: string
  placement?: "leaderboard" | "medium-rectangle" | "large-rectangle" | "half-page" | "mobile-banner"
}

const sizeClasses = {
  "leaderboard": "w-full h-[90px] max-w-[728px]", // 728x90
  "medium-rectangle": "w-[300px] h-[250px]", // 300x250
  "large-rectangle": "w-[336px] h-[280px]", // 336x280
  "half-page": "w-[300px] h-[600px]", // 300x600
  "mobile-banner": "w-full h-[50px] max-w-[320px]", // 320x50
}

export function AdBanner({
  ad,
  placement,
  className,
  onImpression,
}: AdBannerProps) {
  const { title, image, mobileImage, targetUrl, size } = ad
  
  const handleClick = () => {
    // Track click analytics here
    window.open(targetUrl, "_blank", "noopener,noreferrer")
  }

  const handleImpression = () => {
    if (onImpression) {
      onImpression()
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border bg-muted/30 cursor-pointer group",
        sizeClasses[size],
        className,
      )}
      onClick={handleClick}
      onLoad={handleImpression}
    >
      {/* Desktop Image */}
      <div className={cn("relative w-full h-full object-cover", mobileImage && "hidden md:block")}>
        <Image
          src={image?.asset?.url || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Mobile Image */}
      {mobileImage && (
        <div className="relative w-full h-full md:hidden">
          <Image
            src={mobileImage?.asset?.url || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

      {/* Ad Label */}
      <div className="absolute top-1 right-1 bg-muted/80 text-muted-foreground text-xs px-1 rounded">Ad</div>
    </div>
  )
}
