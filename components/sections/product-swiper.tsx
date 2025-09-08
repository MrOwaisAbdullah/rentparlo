"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Listing } from "@/types"
import { ListingCard } from "@/components/cards/listing-card"

// Extended interface for homepage listings that includes additional properties
interface HomepageListing extends Listing {
  categoryTitle?: string;
  featured?: boolean;
}

interface ProductSwiperProps {
  title: string
  category: string
  limit?: number
  trending?: boolean
  listings?: HomepageListing[] // Use the extended interface
}

export default function ProductSwiper({ title, category, limit = 8, trending = false, listings: propListings }: ProductSwiperProps) {
  const [filteredlistings, setFilteredlistings] = useState<HomepageListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If listings are provided as props, filter them directly
    if (propListings && propListings.length > 0) {
      const filtered = propListings
        .filter((item: HomepageListing) => {
          // For trending, show featured items from any category
          // If no items are explicitly marked as featured, show all items for trending
          if (trending) {
            // Handle both boolean true and truthy values
            const isFeatured = item.featured === true || item.isFeatured === true;
            // If we're in trending mode and no items are featured, show all items
            // Otherwise, only show featured items
            return isFeatured;
          }
          
          // For specific categories, filter by categoryTitle or category reference
          // Convert both to lowercase for case-insensitive comparison
          const itemCategoryTitle = (item.categoryTitle || 
                                    item.category?.title || 
                                    '').toLowerCase();
          
          // Handle category matching - convert common category names
          const normalizedCategory = category.toLowerCase();
          
          // Debug logging
          // console.log(`Matching item category: "${itemCategoryTitle}" with filter category: "${normalizedCategory}"`);
          
          // Direct match with category slug or title
          if (itemCategoryTitle === normalizedCategory) {
            // console.log(`Direct match found for ${item.title}`);
            return true;
          }
          
          // Handle common category mappings for better matching
          const categoryMappings: Record<string, string[]> = {
            'electronics': ['camera', 'electronics', 'gadgets'],
            'vehicles': ['automobiles', 'vehicles', 'cars'],
            'home': ['home', 'living', 'furniture', 'appliances', 'construction-equipment'],
            'sports': ['sports', 'recreation', 'fitness', 'events'],
            'fashion': ['fashion', 'clothing', 'accessories', 'wedding', 'wedding-couture'],
            'medical': ['medical', 'medical-equipment'],
            'medical-equipment': ['medical', 'medical-equipment'],
            'construction': ['construction', 'construction-equipment'],
            'construction-equipment': ['construction', 'construction-equipment'],
            'events': ['events'],
            'studio': ['studio']
          };
          
          const mappings = categoryMappings[normalizedCategory] || [normalizedCategory];
          const matches = mappings.some(mapping => 
            itemCategoryTitle.includes(mapping)
          );
          
          // if (matches) {
          //   console.log(`Mapping match found for ${item.title} in category ${itemCategoryTitle}`);
          // }
          
          return matches;
        })
        .slice(0, limit);

      // Debug logging
      // console.log(`Filtered ${filtered.length} listings for category ${category}`);
      // console.log('Filtered listings:', filtered);

      setFilteredlistings(filtered);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [propListings, category, limit, trending]);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, [filteredlistings]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-muted h-8 w-32 rounded"></div>
              {trending && <div className="bg-muted h-6 w-20 rounded-full"></div>}
            </div>
            <div className="bg-muted h-8 w-20 rounded"></div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 sm:w-80 animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-4"></div>
                <div className="bg-muted h-32 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Always render the section, even if there are no listings
  return (
    <section className="py-8 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
            {trending && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                Trending
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
              asChild
            >
              <Link href={`/category/${category.toLowerCase()}`} className="flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          {filteredlistings.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
                  !canScrollLeft ? "hidden cursor-not-allowed" : "hover:scale-105"
                }`}
                style={{ transform: "translateY(-50%) translateX(-50%)" }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
                  !canScrollRight ? "hidden cursor-not-allowed" : "hover:scale-105"
                }`}
                style={{ transform: "translateY(-50%) translateX(50%)" }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          <div ref={scrollContainerRef} className="flex gap-3 sm:gap-4 overflow-x-auto px-2 py-2 pb-4 scrollbar-hide">
            {filteredlistings.length > 0 ? (
              filteredlistings.map((listing, index) => (
                <ListingCard variant="swiper" key={`${listing._id}-${index}`} listing={listing} />
              ))
            ) : (
              <div className="w-full text-center py-8">
                <p className="text-gray-500">
                  {trending 
                    ? "No trending listings available at the moment. Check back later for featured items!" 
                    : `No listings available in the ${category} category. Try another category or check back later!`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}