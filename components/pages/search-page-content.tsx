"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { FilterSidebar } from "@/components/search/filter-sidebar"
import { FeaturedListings } from "@/components/sections/featured-listings"
import { ProductGrid } from "@/components/sections/product-grid"
import { AdBanner } from "@/components/ads/ad-banner"
import { getAllListings } from "@/lib/listings"
import { ChevronRight, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function SearchPageContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "all"
  const query = searchParams.get("q") || ""
  const location = searchParams.get("location") || ""

  const [listings, setListings] = useState(getAllListings())
  const [filteredListings, setFilteredListings] = useState(listings)
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    condition: "all",
    dateRange: "all",
  })

  // Filter listings based on search params and filters
  useEffect(() => {
    let filtered = listings

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter((listing) => listing.category.toLowerCase() === category.toLowerCase())
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query.toLowerCase()) ||
          listing.description.toLowerCase().includes(query.toLowerCase()),
      )
    }

    // Filter by location
    if (location) {
      filtered = filtered.filter(
        (listing) =>
          listing.location.city.toLowerCase().includes(location.toLowerCase()) ||
          listing.location.area.toLowerCase().includes(location.toLowerCase()),
      )
    }

    // Apply filters
    filtered = filtered.filter((listing) => {
      const price = listing.price
      const inPriceRange = price >= filters.priceRange[0] && price <= filters.priceRange[1]
      const matchesCondition = filters.condition === "all" || listing.condition === filters.condition

      return inPriceRange && matchesCondition
    })

    setFilteredListings(filtered)
  }, [listings, category, query, location, filters])

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Search", href: "/search" },
    ...(category !== "all"
      ? [{ label: category.charAt(0).toUpperCase() + category.slice(1), href: `/search?category=${category}` }]
      : []),
  ]

  const featuredListings = filteredListings.filter((listing) => listing.featured).slice(0, 3)
  const regularListings = filteredListings.filter((listing) => !listing.featured)

  return (
    <div className="min-h-screen bg-background">
      {/* Top Ad Banner */}
      <div className="w-full bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <AdBanner size="leaderboard" className="mx-auto" fallbackText="Advertisement - 1200x90" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            {breadcrumbItems.map((item, index) => (
              <div key={item.href} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                <a href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </a>
              </div>
            ))}
          </nav>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {category === "all" ? "All Listings" : `${category.charAt(0).toUpperCase() + category.slice(1)} Rentals`}
            {query && ` for "${query}"`}
            {location && ` in ${location}`}
          </h1>
          <p className="text-muted-foreground">{filteredListings.length} results found</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} className="sticky top-24" />
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="rounded-full shadow-lg">
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <FilterSidebar filters={filters} onFiltersChange={setFilters} className="h-full" />
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Featured Listings */}
            {featuredListings.length > 0 && (
              <div className="mb-12">
                <FeaturedListings listings={featuredListings} />
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid listings={regularListings} />
          </div>
        </div>
      </div>
    </div>
  )
}
