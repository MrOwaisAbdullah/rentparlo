import { AdBanner } from "@/components/ads/ad-banner"

export function BannerDemo() {
  return (
    <div className="space-y-8">
      {/* Large Banner Demo */}
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Large Banner (1400px wide, 400px tall)</h3>
        <div className="flex justify-center">
          <AdBanner 
            placement="homepage-top" 
            size="large-banner"
            className="mx-auto"
            fallbackText="Large Banner Advertisement"
          />
        </div>
      </div>

      {/* Leaderboard Banner Demo */}
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Leaderboard Banner (728px wide, 90px tall)</h3>
        <div className="flex justify-center">
          <AdBanner 
            placement="homepage-middle" 
            size="leaderboard"
            className="mx-auto"
            fallbackText="Leaderboard Advertisement"
          />
        </div>
      </div>

      {/* Medium Rectangle Demo */}
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Medium Rectangle (300px wide, 250px tall)</h3>
        <div className="flex justify-center">
          <AdBanner 
            placement="category-sidebar" 
            size="medium-rectangle"
            fallbackText="Medium Rectangle Advertisement"
          />
        </div>
      </div>
    </div>
  )
}