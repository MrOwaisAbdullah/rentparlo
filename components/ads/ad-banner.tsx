"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface AdBannerProps {
  placement?: string
  size?: "leaderboard" | "medium-rectangle" | "wide-skyscraper" | "large-rectangle" | "half-page" | "mobile-banner"
  className?: string
  fallbackText?: string
}

// Mock banner data for demonstration
const MOCK_BANNERS = {
  "homepage-top": {
    _id: "1",
    title: "Premium Camera Rentals",
    image: "/camera-rental-banner.png",
    targetUrl: "/category/cameras",
    size: "leaderboard",
  },
  "category-top": {
    _id: "2",
    title: "Electronics Sale",
    image: "/placeholder-8i3ps.png",
    targetUrl: "/category/electronics",
    size: "leaderboard",
  },
  "listing-sidebar": {
    _id: "3",
    title: "Rent More Items",
    image: "/rental-platform-sidebar-ad.png",
    targetUrl: "/categories",
    size: "medium-rectangle",
  },
}

export function AdBanner({ placement, size, className = "", fallbackText }: AdBannerProps) {
  const [banner, setBanner] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call with mock data
    const fetchBanner = async () => {
      try {
        // In real implementation, this would be an API call
        const mockBanner = placement ? MOCK_BANNERS[placement as keyof typeof MOCK_BANNERS] : null
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
        return "w-full max-w-[1200px] h-[90px]"
      case "medium-rectangle":
        return "w-[300px] h-[250px]"
      case "wide-skyscraper":
        return "w-[160px] h-[600px]"
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
        src={banner.image || "/placeholder.svg"}
        alt={banner.title}
        fill
        className="object-contain rounded-lg"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity rounded-lg" />
    </div>
  )
}

export default AdBanner
