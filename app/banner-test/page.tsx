"use client"

import { useState, useEffect } from "react"
import { EnhancedAdBanner } from "@/components/ads/enhanced-ad-banner"
import { Button } from "@/components/ui/button"
import { useBanner } from "@/contexts/banner-context"
import { BannerPlacement } from "@/types"

export default function BannerTestPage() {
  const { impressions, clicks, recordedImpressions, hideBanner } = useBanner()
  const [userType, setUserType] = useState<"all" | "sellers" | "new-users">("all")

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Banner Test Page</h1>
        <p className="text-muted-foreground mb-6">
          Test different banner placements and configurations
        </p>
      </div>

      {/* User Type Selector */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button
          variant={userType === "all" ? "default" : "outline"}
          onClick={() => setUserType("all")}
        >
          All Users
        </Button>
        <Button
          variant={userType === "sellers" ? "default" : "outline"}
          onClick={() => setUserType("sellers")}
        >
          Sellers Only
        </Button>
        <Button
          variant={userType === "new-users" ? "default" : "outline"}
          onClick={() => setUserType("new-users")}
        >
          New Users Only
        </Button>
      </div>

      {/* Homepage Top Banner - Full Width Large Banner */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Homepage Top Banner (Large Banner - 1400×400px)</h2>
        <div className="bg-muted p-4 rounded-lg">
          <EnhancedAdBanner
            placement="homepage-top"
            userType={userType}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Homepage Middle Banner - Leaderboard */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Homepage Middle Banner (Leaderboard - 1200×250px)</h2>
        <div className="bg-muted p-4 rounded-lg">
          <EnhancedAdBanner
            placement="homepage-middle"
            userType={userType}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Homepage Bottom Banner - Leaderboard */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Homepage Bottom Banner (Leaderboard - 1200×250px)</h2>
        <div className="bg-muted p-4 rounded-lg">
          <EnhancedAdBanner
            placement="homepage-bottom"
            userType={userType}
            className="mx-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Sidebar Banner - Medium Rectangle */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Category Sidebar Banner (Medium Rectangle - 300×250px)</h2>
          <div className="bg-muted p-4 rounded-lg flex justify-center">
            <EnhancedAdBanner
              placement="category-sidebar"
              userType={userType}
            />
          </div>
        </div>

        {/* Listing Sidebar Banner - Medium Rectangle */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Listing Sidebar Banner (Medium Rectangle - 300×250px)</h2>
          <div className="bg-muted p-4 rounded-lg flex justify-center">
            <EnhancedAdBanner
              placement="listing-sidebar"
              userType={userType}
            />
          </div>
        </div>
      </div>

      {/* Search Top Banner - Leaderboard */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Search Top Banner (Leaderboard - 1200×250px)</h2>
        <div className="bg-muted p-4 rounded-lg">
          <EnhancedAdBanner
            placement="search-top"
            userType={userType}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Mobile Banner - Mobile Banner */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Mobile Banner (Mobile Banner - 320×50px)</h2>
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-center">
            <EnhancedAdBanner
              placement="mobile-banner"
              userType={userType}
              size="mobile-banner"
            />
          </div>
        </div>
      </div>

      {/* Seller Profile Banner - Leaderboard */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Seller Profile Banner (Leaderboard - 1200×250px)</h2>
        <div className="bg-muted p-4 rounded-lg">
          <EnhancedAdBanner
            placement="seller-profile"
            userType={userType}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Banner Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">Impressions</h3>
            <pre className="text-sm bg-background p-4 rounded overflow-x-auto max-h-40 overflow-y-auto">
              {JSON.stringify(impressions, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Clicks</h3>
            <pre className="text-sm bg-background p-4 rounded overflow-x-auto max-h-40 overflow-y-auto">
              {JSON.stringify(clicks, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Recorded This Session</h3>
            <pre className="text-sm bg-background p-4 rounded overflow-x-auto max-h-40 overflow-y-auto">
              {JSON.stringify(Array.from(recordedImpressions), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}