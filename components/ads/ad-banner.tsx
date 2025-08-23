"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AdBanner as AdBannerType, BannerPlacement, BannerSize } from "@/types"

interface AdBannerProps {
  placement?: BannerPlacement
  size?: BannerSize
  className?: string
  fallbackText?: string
}

// Mock banner data for demonstration
const MOCK_BANNERS: Record<BannerPlacement, AdBannerType> = {
  "homepage-top": {
    _id: "1",
    _type: "adBanner",
    title: "Premium Camera Rentals",
    placement: "homepage-top",
    size: "leaderboard",
    image: {
      asset: {
        url: "/camera-rental-banner.png"
      }
    },
    targetUrl: "/category/camera",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "homepage-middle": {
    _id: "2",
    _type: "adBanner",
    title: "Electronics Sale",
    placement: "homepage-middle",
    size: "leaderboard",
    image: {
      asset: {
        url: "/placeholder-8i3ps.png"
      }
    },
    targetUrl: "/category/automobiles",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "homepage-bottom": {
    _id: "3",
    _type: "adBanner",
    title: "Rent More Items",
    placement: "homepage-bottom",
    size: "leaderboard",
    image: {
      asset: {
        url: "/placeholder-8i3ps.png"
      }
    },
    targetUrl: "/categories",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "category-sidebar": {
    _id: "4",
    _type: "adBanner",
    title: "Rent More Items",
    placement: "category-sidebar",
    size: "medium-rectangle",
    image: {
      asset: {
        url: "/rental-platform-sidebar-ad.png"
      }
    },
    targetUrl: "/categories",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "search-top": {
    _id: "5",
    _type: "adBanner",
    title: "Featured Listings",
    placement: "search-top",
    size: "leaderboard",
    image: {
      asset: {
        url: "/placeholder-8i3ps.png"
      }
    },
    targetUrl: "/featured",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "listing-sidebar": {
    _id: "6",
    _type: "adBanner",
    title: "Rent More Items",
    placement: "listing-sidebar",
    size: "medium-rectangle",
    image: {
      asset: {
        url: "/rental-platform-sidebar-ad.png"
      }
    },
    targetUrl: "/categories",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "mobile-banner": {
    _id: "7",
    _type: "adBanner",
    title: "Mobile Special",
    placement: "mobile-banner",
    size: "mobile-banner",
    image: {
      asset: {
        url: "/mobile-banner.png"
      }
    },
    targetUrl: "/mobile",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  }
}

export function AdBanner({ placement, size, className = "", fallbackText }: AdBannerProps) {
  const [banner, setBanner] = useState<AdBannerType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call with mock data
    const fetchBanner = async () => {
      try {
        // In real implementation, this would be an API call
        const mockBanner = placement ? MOCK_BANNERS[placement] : null
        setBanner(mockBanner || null)
      } catch (error) {
        console.error("Error fetching banner:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanner()
  }, [placement])

  const handleClick = async () => {
    if (!banner) return

    try {
      // Track banner click (mock implementation)
      console.log(`Banner clicked: ${banner._id} at ${placement}`)

      // Navigate to target URL
      window.open(banner.targetUrl, "_blank")
    } catch (error) {
      console.error("Error tracking banner click:", error)
      window.open(banner.targetUrl, "_blank")
    }
  }

  const getBannerSizeClasses = () => {
    const bannerSize = size || banner?.size || "leaderboard"
    switch (bannerSize) {
      case "leaderboard":
        return "w-full max-w-[1300px] h-[200px]"
      case "medium-rectangle":
        return "w-[300px] h-[250px]"
      case "large-rectangle":
        return "w-[336px] h-[280px]"
      case "half-page":
        return "w-[300px] h-[600px]"
      case "mobile-banner":
        return "w-full h-[50px]"
      default:
        return "w-full"
    }
  }

  if (loading || !banner) {
    if (fallbackText) {
      return (
        <div
          className={`relative bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center ${getBannerSizeClasses()} ${className}`}
        >
          <span className="text-muted-foreground text-sm">{fallbackText}</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`relative cursor-pointer ${getBannerSizeClasses()} ${className}`} onClick={handleClick}>
      <Image
        src={banner.image?.asset?.url || "/placeholder.svg"}
        alt={banner.title}
        fill
        className="object-cover rounded-lg"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity rounded-lg" />
    </div>
  )
}

export default AdBanner
