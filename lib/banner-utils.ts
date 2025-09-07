import { BannerPlacement, BannerSize } from "@/types"

/**
 * Get the appropriate banner size based on placement and device
 */
export function getBannerSizeForPlacement(placement: BannerPlacement): BannerSize {
  const sizeMap: Record<BannerPlacement, BannerSize> = {
    "homepage-top": "large-banner",
    "homepage-middle": "leaderboard",
    "homepage-bottom": "leaderboard",
    "dashboard-top": "leaderboard",
    "dashboard-sidebar": "medium-rectangle",
    "category-top": "leaderboard",
    "category-sidebar": "medium-rectangle",
    "category-sidebar-specific": "medium-rectangle",
    "search-top": "leaderboard",
    "search-sidebar": "medium-rectangle",
    "listing-top": "leaderboard",
    "listing-sidebar": "medium-rectangle",
    "profile-top": "leaderboard",
    "profile-sidebar": "medium-rectangle",
    "blog-top": "leaderboard",
    "blog-sidebar": "medium-rectangle",
    "content-top": "leaderboard",
    "content-sidebar": "medium-rectangle",
    "mobile-banner": "mobile-banner",
    "mobile-specific": "mobile-banner",
    "popup-banner": "popup",
    "seller-profile": "leaderboard"
  }

  return sizeMap[placement] || "leaderboard"
}

/**
 * Get the appropriate CSS classes for banner size and device
 */
export function getBannerSizeClasses(size: BannerSize, isMobile: boolean): string {
  // Custom sizes for RentParLo with 1200x250 leaderboard banners
  const sizeClasses: Record<BannerSize, { desktop: string; mobile: string }> = {
    "large-banner": {
      desktop: "w-full max-w-[1400px] h-[400px]",
      mobile: "w-full h-[200px]"
    },
    "leaderboard": {
      desktop: "w-full max-w-[1200px] h-[250px]",
      mobile: "w-full max-w-[320px] h-[50px]"
    },
    "medium-rectangle": {
      desktop: "w-[300px] h-[250px]",
      mobile: "w-[300px] h-[250px]"
    },
    "large-rectangle": {
      desktop: "w-[336px] h-[280px]",
      mobile: "w-full h-[280px]"
    },
    "half-page": {
      desktop: "w-[300px] h-[600px]",
      mobile: "w-full h-[400px]"
    },
    "mobile-banner": {
      desktop: "hidden",
      mobile: "w-full h-[50px]"
    },
    "popup": {
      desktop: "w-[600px] h-[400px]",
      mobile: "w-full h-[200px]"
    },
    "square": {
      desktop: "w-[250px] h-[250px]",
      mobile: "w-[250px] h-[250px]"
    },
    "vertical-rectangle": {
      desktop: "w-[300px] h-[600px]",
      mobile: "w-full h-[400px]"
    },
    "skyscraper": {
      desktop: "w-[160px] h-[600px]",
      mobile: "w-full h-[400px]"
    }
  }

  const sizeConfig = sizeClasses[size] || sizeClasses["leaderboard"]
  return isMobile ? sizeConfig.mobile : sizeConfig.desktop
}

/**
 * Check if a banner should be shown based on placement and device
 */
export function shouldShowBanner(placement: BannerPlacement, isMobile: boolean): boolean {
  // Mobile-specific banners only show on mobile
  if (placement === "mobile-banner" || placement === "mobile-specific") {
    return isMobile
  }

  // Popup banners have special handling (could show on any device)
  if (placement === "popup-banner") {
    return true
  }

  // Sidebar-specific banners should only show on desktop
  if (placement === "search-sidebar" || 
      placement === "category-sidebar-specific" || 
      placement === "dashboard-sidebar" || 
      placement === "profile-sidebar" || 
      placement === "blog-sidebar" || 
      placement === "content-sidebar" ||
      placement === "listing-sidebar") {
    return !isMobile
  }

  // All other banners show on desktop/tablet
  return !isMobile
}

/**
 * Get the display order for banners (lower number = higher priority)
 */
export function getBannerDisplayOrder(placement: BannerPlacement): number {
  const orderMap: Record<BannerPlacement, number> = {
    "homepage-top": 1,
    "homepage-middle": 2,
    "homepage-bottom": 3,
    "dashboard-top": 4,
    "dashboard-sidebar": 5,
    "category-top": 6,
    "category-sidebar": 7,
    "category-sidebar-specific": 8,
    "search-top": 9,
    "search-sidebar": 10,
    "listing-top": 11,
    "listing-sidebar": 12,
    "profile-top": 13,
    "profile-sidebar": 14,
    "blog-top": 15,
    "blog-sidebar": 16,
    "content-top": 17,
    "content-sidebar": 18,
    "mobile-banner": 19,
    "mobile-specific": 20,
    "popup-banner": 21,
    "seller-profile": 22
  }

  return orderMap[placement] || 99
}

/**
 * Track banner impression
 */
export async function trackBannerImpression(bannerId: string) {
  try {
    await fetch("/api/banners/impression", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bannerId })
    })
  } catch (error) {
    console.error("Failed to track banner impression:", error)
  }
}

/**
 * Track banner click
 */
export async function trackBannerClick(bannerId: string) {
  try {
    await fetch("/api/banners/click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bannerId })
    })
  } catch (error) {
    console.error("Failed to track banner click:", error)
  }
}

/**
 * Get banner dimensions for Image component
 */
export function getBannerImageDimensions(size: BannerSize, isMobile: boolean): { width: number; height: number } {
  const dimensions: Record<BannerSize, { desktop: { width: number; height: number }; mobile: { width: number; height: number } }> = {
    "large-banner": {
      desktop: { width: 1400, height: 400 },
      mobile: { width: 1024, height: 200 }
    },
    "leaderboard": {
      desktop: { width: 1200, height: 250 },
      mobile: { width: 320, height: 50 }
    },
    "medium-rectangle": {
      desktop: { width: 300, height: 250 },
      mobile: { width: 300, height: 250 }
    },
    "large-rectangle": {
      desktop: { width: 336, height: 280 },
      mobile: { width: 336, height: 280 }
    },
    "half-page": {
      desktop: { width: 300, height: 600 },
      mobile: { width: 300, height: 400 }
    },
    "mobile-banner": {
      desktop: { width: 0, height: 0 },
      mobile: { width: 320, height: 50 }
    },
    "popup": {
      desktop: { width: 600, height: 400 },
      mobile: { width: 320, height: 200 }
    },
    "square": {
      desktop: { width: 250, height: 250 },
      mobile: { width: 250, height: 250 }
    },
    "vertical-rectangle": {
      desktop: { width: 300, height: 600 },
      mobile: { width: 300, height: 400 }
    },
    "skyscraper": {
      desktop: { width: 160, height: 600 },
      mobile: { width: 160, height: 400 }
    }
  }

  const sizeConfig = dimensions[size] || dimensions["leaderboard"]
  return isMobile ? sizeConfig.mobile : sizeConfig.desktop
}

/**
 * Get the correct size for a banner based on its placement and the size from Sanity
 */
export function getBannerSize(banner: any, placement: BannerPlacement, size?: BannerSize): BannerSize {
  // If size prop is provided, use it
  if (size) {
    return size
  }
  
  // If banner has a size from Sanity, use it
  if (banner?.size) {
    return banner.size
  }
  
  // Otherwise, use the default size for the placement
  return getBannerSizeForPlacement(placement)
}