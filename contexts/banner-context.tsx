"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { BannerPlacement } from "@/types"

interface BannerContextType {
  impressions: Record<string, number>
  clicks: Record<string, number>
  recordedImpressions: Set<string> // Track which banners have been recorded in this session
  recordImpression: (bannerId: string) => void
  recordClick: (bannerId: string) => void
  isBannerVisible: (placement: BannerPlacement) => boolean
  hideBanner: (placement: BannerPlacement) => void
}

const BannerContext = createContext<BannerContextType | undefined>(undefined)

export function BannerProvider({ children }: { children: ReactNode }) {
  const [impressions, setImpressions] = useState<Record<string, number>>({})
  const [clicks, setClicks] = useState<Record<string, number>>({})
  const [recordedImpressions, setRecordedImpressions] = useState<Set<string>>(new Set())
  const [hiddenBanners, setHiddenBanners] = useState<Record<BannerPlacement, boolean>>({
    "homepage-top": false,
    "homepage-middle": false,
    "homepage-bottom": false,
    "category-sidebar": false,
    "category-sidebar-specific": false,
    "search-top": false,
    "search-sidebar": false,
    "listing-sidebar": false,
    "mobile-banner": false,
    "seller-profile": false,
    "dashboard-top": false,
    "dashboard-sidebar": false,
    "category-top": false,
    "listing-top": false,
    "profile-top": false,
    "profile-sidebar": false,
    "blog-top": false,
    "blog-sidebar": false,
    "content-top": false,
    "content-sidebar": false,
    "mobile-specific": false,
    "popup-banner": false
  })

  // Load banner state from localStorage on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHiddenBanners = localStorage.getItem("hiddenBanners")
      if (savedHiddenBanners) {
        try {
          setHiddenBanners(JSON.parse(savedHiddenBanners))
        } catch (e) {
          console.error("Failed to parse hidden banners from localStorage", e)
        }
      }
    }
  }, [])

  // Save banner state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hiddenBanners", JSON.stringify(hiddenBanners))
    }
  }, [hiddenBanners])

  const recordImpression = async (bannerId: string) => {
    // Only record impression once per session per banner
    if (recordedImpressions.has(bannerId)) {
      return
    }

    // Add to recorded impressions
    setRecordedImpressions(prev => new Set(prev).add(bannerId))
    
    // Update impression count
    setImpressions(prev => ({
      ...prev,
      [bannerId]: (prev[bannerId] || 0) + 1
    }))

    // Send impression data to API
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

  const recordClick = async (bannerId: string) => {
    setClicks(prev => ({
      ...prev,
      [bannerId]: (prev[bannerId] || 0) + 1
    }))

    // Send click data to API
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

  const isBannerVisible = (placement: BannerPlacement) => {
    return !hiddenBanners[placement]
  }

  const hideBanner = (placement: BannerPlacement) => {
    setHiddenBanners(prev => ({
      ...prev,
      [placement]: true
    }))
  }

  return (
    <BannerContext.Provider
      value={{
        impressions,
        clicks,
        recordedImpressions,
        recordImpression,
        recordClick,
        isBannerVisible,
        hideBanner
      }}
    >
      {children}
    </BannerContext.Provider>
  )
}

export function useBanner() {
  const context = useContext(BannerContext)
  if (context === undefined) {
    throw new Error("useBanner must be used within a BannerProvider")
  }
  return context
}