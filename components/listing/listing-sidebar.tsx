import { AdBanner } from "@/components/ads/ad-banner"

export function ListingSidebar() {
  return (
    <div className="space-y-6">
      {/* Listing sidebar ad */}
      <div className="hidden lg:block">
        <AdBanner 
          placement="listing-sidebar" 
          fallbackText="Advertisement"
        />
      </div>
      
      {/* Other sidebar content would go here */}
    </div>
  )
}