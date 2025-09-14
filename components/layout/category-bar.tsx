"use client"

import Link from "next/link"
import { 
  Car, 
  HeartPulse, 
  Camera as CameraIcon, 
  Zap, 
  Heart, 
  Calendar, 
  Construction, 
  Palette, 
  Megaphone,
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"
import { useRef, useState, useEffect, useCallback } from "react"
import { STATIC_CATEGORIES } from "@/lib/static-categories"
import { getCategoryEmoji } from "@/lib/static-categories"

const iconMap: Record<string, React.ComponentType<any>> = {
  automobiles: Car,
  "medical-equipment": HeartPulse,
  camera: CameraIcon,
  generators: Zap,
  "wedding-couture": Heart,
  events: Calendar,
  "construction-equipment": Construction,
  studio: Palette,
  advertisements: Megaphone,
}

const colorMap: Record<string, string> = {
  automobiles: "text-blue-600",
  "medical-equipment": "text-red-600",
  camera: "text-purple-600",
  generators: "text-yellow-600",
  "wedding-couture": "text-pink-600",
  events: "text-orange-600",
  "construction-equipment": "text-gray-600",
  studio: "text-indigo-600",
  advertisements: "text-green-600",
}

export function CategoryBar() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [categories] = useState(STATIC_CATEGORIES.slice(0, 9))

  const checkScrollability = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      
      // Simple, robust check
      const isLeft = scrollLeft > 0
      const isRight = scrollLeft < (scrollWidth - clientWidth)
      
      setCanScrollLeft(isLeft)
      setCanScrollRight(isRight)
    }
  }, [])

  useEffect(() => {
    // Check on mount and after a short delay for rendering
    const timer1 = setTimeout(checkScrollability, 100)
    
    const scrollElement = scrollRef.current
    if (scrollElement) {
      // Add listeners
      scrollElement.addEventListener("scroll", checkScrollability)
      window.addEventListener("resize", checkScrollability)
      
      // Cleanup
      return () => {
        scrollElement.removeEventListener("scroll", checkScrollability)
        window.removeEventListener("resize", checkScrollability)
        clearTimeout(timer1)
      }
    }
    
    return () => {
      clearTimeout(timer1)
    }
  }, [checkScrollability])

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -150, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 150, behavior: "smooth" })
    }
  }

  return (
    <div className="border-b bg-white/60 backdrop-blur-xl relative">
      <div className="container mx-auto px-4">
        <div className="relative py-3">
          {/* Left Arrow - Always visible but enabled/disabled based on scroll */}
          <button
            onClick={scrollLeft}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md rounded-full p-2 transition-opacity duration-200 ${
              canScrollLeft ? "opacity-100 hover:bg-gray-50 hover:shadow-lg cursor-pointer" : "opacity-0 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>

          {/* Right Arrow - Always visible but enabled/disabled based on scroll */}
          <button
            onClick={scrollRight}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md rounded-full p-2 transition-opacity duration-200 ${
              canScrollRight ? "opacity-100 hover:bg-gray-50 hover:shadow-lg cursor-pointer" : "opacity-0 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>

          {/* Category Items - Horizontally scrollable */}
          <div 
            ref={scrollRef}
            className="flex items-center space-x-6 md:justify-center px-2 md:px-16 overflow-x-auto scrollbar-hide py-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((category) => {
              // Ensure category.slug is a valid string before using it as an index
              const slug = typeof category.slug === 'string' ? category.slug : category.slug?.current || '';
              const Icon = (slug in iconMap) ? iconMap[slug] : null;
              const color = (slug in colorMap) ? colorMap[slug] : "text-gray-600";
              
              return (
                <Link
                  key={category._id}
                  href={`/category/${slug}`}
                  className="flex flex-col items-center space-y-1 min-w-fit group hover:bg-muted/50 rounded-lg p-2 transition-colors flex-shrink-0"
                >
                  {Icon ? (
                    <Icon className={`h-5 w-5 ${color} group-hover:scale-110 transition-transform`} />
                  ) : (
                    <span className={`text-xl ${color} group-hover:scale-110 transition-transform`}>
                      {getCategoryEmoji(slug)}
                    </span>
                  )}
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap">
                    {category.title}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}