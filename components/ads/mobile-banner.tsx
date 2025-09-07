"use client"

import { useEffect, useState } from "react"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { AdBanner } from "@/components/ads/ad-banner"

export function MobileBanner() {
  const { isMobile } = useDeviceDetection()
  const [isVisible, setIsVisible] = useState(true)

  // Hide banner after 5 seconds (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!isMobile || !isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-background border-t shadow-lg">
      <AdBanner 
        placement="mobile-banner" 
        size="mobile-banner"
        className="mx-auto"
        fallbackText="Advertisement"
      />
    </div>
  )
}