"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { getHomepageListings } from "@/lib/listings"
import { Listing } from "@/types"
import { ProductSwiperCard } from "@/components/cards/product-swiper-card"

interface ProductSwiperProps {
  title: string
  category: string
  limit?: number
  trending?: boolean
}

export default function ProductSwiper({ title, category, limit = 8, trending = false }: ProductSwiperProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      updateScrollButtons();
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getHomepageListings();
        const filtered = data
          .filter((item: Listing) => 
            item.category.title?.toLowerCase().includes(category.toLowerCase())
          )
          .slice(0, limit);

        setListings(filtered);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [category, limit]);

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
  }, [listings, isMobile]);

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

  if (listings.length === 0) return null;

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

          <div ref={scrollContainerRef} className="flex gap-3 sm:gap-4 overflow-x-auto py-2 pb-4 scrollbar-hide">
            {listings.map((listing, index) => (
              <ProductSwiperCard key={index} listing={listing} isMobile={isMobile} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}