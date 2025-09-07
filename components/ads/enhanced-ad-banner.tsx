"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { AdBanner, BannerPlacement, BannerSize } from "@/types"
import { cn } from "@/lib/utils"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { useBanner } from "@/contexts/banner-context"
import { getBannerSizeClasses as getBannerSizeClassesUtil, getBannerImageDimensions, getBannerSize } from "@/lib/banner-utils"
import { BannerCloseButton } from "@/components/ads/banner-close-button"
import { trackBannerImpression, trackBannerClick, initializeBannerTrackingData } from "@/lib/banner-analytics"
import { v4 as uuidv4 } from 'uuid'

interface EnhancedAdBannerProps {
  placement: BannerPlacement
  size?: BannerSize
  className?: string
  fallbackText?: string
  userType?: "all" | "sellers" | "new-users"
  showCloseButton?: boolean
  userId?: string
  sessionId?: string
}

// Mock banner data for demonstration with proper sizes
const MOCK_BANNERS: Record<BannerPlacement, AdBanner> = {
  "homepage-top": {
    _id: "1",
    _type: "adBanner",
    title: "Premium Camera Rentals",
    placement: "homepage-top",
    size: "large-banner",
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
  },
  "seller-profile": {
    _id: "8",
    _type: "adBanner",
    title: "Premium Camera Rentals",
    placement: "seller-profile",
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
  "dashboard-top": {
    _id: "9",
    _type: "adBanner",
    title: "Dashboard Promotion",
    placement: "dashboard-top",
    size: "leaderboard",
    image: {
      asset: {
        url: "/dashboard-promo.png"
      }
    },
    targetUrl: "/dashboard",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "dashboard-sidebar": {
    _id: "10",
    _type: "adBanner",
    title: "Dashboard Sidebar Ad",
    placement: "dashboard-sidebar",
    size: "medium-rectangle",
    image: {
      asset: {
        url: "/dashboard-sidebar-ad.png"
      }
    },
    targetUrl: "/dashboard",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "category-top": {
    _id: "11",
    _type: "adBanner",
    title: "Category Page Ad",
    placement: "category-top",
    size: "leaderboard",
    image: {
      asset: {
        url: "/category-top-ad.png"
      }
    },
    targetUrl: "/categories",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "category-sidebar-specific": {
    _id: "12",
    _type: "adBanner",
    title: "Category Specific Ad",
    placement: "category-sidebar-specific",
    size: "medium-rectangle",
    image: {
      asset: {
        url: "/category-specific-ad.png"
      }
    },
    targetUrl: "/categories",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "search-sidebar": {
    _id: "13",
    _type: "adBanner",
    title: "Search Sidebar Ad",
    placement: "search-sidebar",
    size: "medium-rectangle",
    image: {
      asset: {
        url: "/search-sidebar-ad.png"
      }
    },
    targetUrl: "/search",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "listing-top": {
    _id: "14",
    _type: "adBanner",
    title: "Listing Page Ad",
    placement: "listing-top",
    size: "leaderboard",
    image: {
      asset: {
        url: "/listing-top-ad.png"
      }
    },
    targetUrl: "/listings",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "profile-top": {
    _id: "15",
    _type: "adBanner",
    title: "Profile Page Ad",
    placement: "profile-top",
    size: "leaderboard",
    image: {
      asset: {
        url: "/profile-top-ad.png"
      }
    },
    targetUrl: "/profile",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "profile-sidebar": {
    _id: "16",
    _type: "adBanner",
    title: "Profile Sidebar Ad",
    placement: "profile-sidebar",
    size: "medium-rectangle",
    image: {
      asset: {
        url: "/profile-sidebar-ad.png"
      }
    },
    targetUrl: "/profile",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "blog-top": {
    _id: "17",
    _type: "adBanner",
    title: "Blog Page Ad",
    placement: "blog-top",
    size: "leaderboard",
    image: {
      asset: {
        url: "/blog-top-ad.png"
      }
    },
    targetUrl: "/blog",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "blog-sidebar": {
    _id: "18",
    _type: "adBanner",
    title: "Blog Sidebar Ad",
    placement: "blog-sidebar",
    size: "medium-rectangle",
    image: {
      asset: {
        url: "/blog-sidebar-ad.png"
      }
    },
    targetUrl: "/blog",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "content-top": {
    _id: "19",
    _type: "adBanner",
    title: "Content Page Ad",
    placement: "content-top",
    size: "leaderboard",
    image: {
      asset: {
        url: "/content-top-ad.png"
      }
    },
    targetUrl: "/content",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "content-sidebar": {
    _id: "20",
    _type: "adBanner",
    title: "Content Sidebar Ad",
    placement: "content-sidebar",
    size: "medium-rectangle",
    image: {
      asset: {
        url: "/content-sidebar-ad.png"
      }
    },
    targetUrl: "/content",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "mobile-specific": {
    _id: "21",
    _type: "adBanner",
    title: "Mobile Specific Ad",
    placement: "mobile-specific",
    size: "mobile-banner",
    image: {
      asset: {
        url: "/mobile-specific-ad.png"
      }
    },
    targetUrl: "/mobile",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  },
  "popup-banner": {
    _id: "22",
    _type: "adBanner",
    title: "Popup Ad",
    placement: "popup-banner",
    size: "popup",
    image: {
      asset: {
        url: "/popup-ad.png"
      }
    },
    targetUrl: "/popup",
    targetUserType: "all",
    startDate: new Date().toISOString(),
    isActive: true,
    displayOrder: 0,
    clicks: 0
  }
}

export function EnhancedAdBanner({ 
  placement, 
  size,
  className = "", 
  fallbackText,
  userType = "all",
  showCloseButton = true,
  userId,
  sessionId
}: EnhancedAdBannerProps) {
  const [banner, setBanner] = useState<AdBanner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isMobile } = useDeviceDetection()
  const { recordImpression, recordClick, isBannerVisible, hideBanner, recordedImpressions } = useBanner()

  // Check if banner should be visible
  const isVisible = isBannerVisible(placement)
  
  useEffect(() => {
    // Fetch banner from API
    const fetchBanner = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Don't fetch if banner is not visible
        if (!isVisible) {
          setBanner(null)
          setLoading(false)
          return
        }
        
        // In a real implementation, uncomment this section:
        /*
        const response = await fetch(`/api/banners?placement=${placement}&userType=${userType}`)
        const data = await response.json()
        
        if (data.success && data.banners.length > 0) {
          // Use the first banner (they're already sorted by displayOrder)
          setBanner(data.banners[0])
        } else {
          // Fallback to mock data
          setBanner(MOCK_BANNERS[placement] || null)
        }
        */
        
        // For now, we'll use mock data
        setBanner(MOCK_BANNERS[placement] || null)
      } catch (err) {
        console.error("Error fetching banner:", err)
        // Fallback to mock data on error
        setBanner(MOCK_BANNERS[placement] || null)
        setError("Failed to load banner")
      } finally {
        setLoading(false)
      }
    }

    fetchBanner()
  }, [placement, userType, isVisible])

  useEffect(() => {
    // Track impression when banner is loaded and visible
    if (banner && recordImpression && !recordedImpressions.has(banner._id)) {
      // In a real implementation, we would check if the banner is actually visible
      recordImpression(banner._id)
      
      // Track detailed impression analytics
      const trackingData = initializeBannerTrackingData(
        banner._id,
        placement,
        banner.size || "leaderboard",
        userId,
        sessionId
      );
      
      // Add user ID and session ID if available
      if (userId) trackingData.user_id = userId;
      if (sessionId) trackingData.session_ref = sessionId;
      
      trackBannerImpression(trackingData);
    }
  }, [banner, recordImpression, recordedImpressions, placement, userId, sessionId])

  const handleClick = async () => {
    if (!banner) return

    try {
      // Track banner click
      if (recordClick) {
        recordClick(banner._id)
      }

      // Track detailed click analytics
      const trackingData = initializeBannerTrackingData(
        banner._id,
        placement,
        banner.size || "leaderboard",
        userId,
        sessionId
      );
      
      // Add click-specific data
      trackingData.target_url = banner.targetUrl;
      
      trackBannerClick(trackingData);

      // Navigate to target URL
      window.open(banner.targetUrl, "_blank", "noopener,noreferrer")
    } catch (err) {
      console.error("Error tracking banner click:", err)
      // Still navigate to target URL even if tracking fails
      window.open(banner.targetUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hideBanner) {
      hideBanner(placement)
    }
  }

  const getBannerSizeClasses = () => {
    // Use the getBannerSize utility to determine the correct size
    const bannerSize = getBannerSize(banner, placement, size)
    return getBannerSizeClassesUtil(bannerSize, isMobile)
  }

  const getBannerImageSize = () => {
    // Use the getBannerSize utility to determine the correct size
    const bannerSize = getBannerSize(banner, placement, size)
    return getBannerImageDimensions(bannerSize, isMobile)
  }

  // Don't render anything if banner is not visible
  if (!isVisible) {
    return null
  }

  // Don't render anything if banner is not active or not found
  if (!banner && !loading) {
    if (fallbackText) {
      return (
        <div
          className={cn(
            "relative bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center",
            getBannerSizeClasses(),
            className
          )}
        >
          <span className="text-muted-foreground text-sm">{fallbackText}</span>
        </div>
      )
    }
    return null
  }

  // Show loading state
  if (loading) {
    return (
      <div
        className={cn(
          "relative bg-muted/30 animate-pulse rounded-lg",
          getBannerSizeClasses(),
          className
        )}
      />
    )
  }

  // Show error state
  if (error) {
    return (
      <div
        className={cn(
          "relative bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-center",
          getBannerSizeClasses(),
          className
        )}
      >
        <span className="text-destructive text-sm">Banner failed to load</span>
      </div>
    )
  }

  if (!banner) return null

  // Determine which image to use
  const imageUrl = isMobile && banner.mobileImage?.asset?.url 
    ? banner.mobileImage.asset.url 
    : banner.image?.asset?.url

  // For mobile banner placement, only show on mobile devices
  if (placement === "mobile-banner" && !isMobile) {
    return null
  }

  // For non-mobile placements, hide mobile banner component on desktop
  if (placement !== "mobile-banner" && isMobile && size === "mobile-banner") {
    return null
  }

  // Get image dimensions
  const imageDimensions = getBannerImageSize()

  return (
    <div 
      className={cn(
        "relative cursor-pointer rounded-lg overflow-hidden",
        getBannerSizeClasses(),
        className
      )} 
      onClick={handleClick}
    >
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={banner.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity rounded-lg" />
        </>
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Banner Image</span>
        </div>
      )}
      
      {/* Ad label */}
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        Ad
      </div>
      
      {/* Close button */}
      {showCloseButton && (
        <BannerCloseButton 
          onClick={handleClose}
          className="top-1 right-1"
        />
      )}
    </div>
  )
}

export default EnhancedAdBanner