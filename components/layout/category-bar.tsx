"use client"

import Link from "next/link"
import { Camera, Car, Laptop, Home, Gamepad2, Music, Wrench, Shirt, ChevronLeft, ChevronRight } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useRef, useState, useEffect } from "react"

const categories = [
  { name: "Electronics", icon: Laptop, href: "/category/electronics", color: "text-blue-600" },
  { name: "Cameras", icon: Camera, href: "/category/cameras", color: "text-purple-600" },
  { name: "Vehicles", icon: Car, href: "/category/vehicles", color: "text-red-600" },
  { name: "Home & Garden", icon: Home, href: "/category/home-garden", color: "text-green-600" },
  { name: "Gaming", icon: Gamepad2, href: "/category/gaming", color: "text-orange-600" },
  { name: "Music", icon: Music, href: "/category/music", color: "text-pink-600" },
  { name: "Tools", icon: Wrench, href: "/category/tools", color: "text-gray-600" },
  { name: "Fashion", icon: Shirt, href: "/category/fashion", color: "text-indigo-600" },
]

export function CategoryBar() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollability()
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollability)
      return () => scrollElement.removeEventListener("scroll", checkScrollability)
    }
  }, [])

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  return (
    <div className="border-b bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Left Arrow - Mobile Only */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 transition-all duration-200 ${
              canScrollLeft ? "opacity-100 hover:bg-gray-50 hover:shadow-lg" : "opacity-50 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>

          {/* Right Arrow - Mobile Only */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 transition-all duration-200 ${
              canScrollRight ? "opacity-100 hover:bg-gray-50 hover:shadow-lg" : "opacity-50 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>

          <ScrollArea className="w-full">
            <div ref={scrollRef} className="flex items-center space-x-6 py-3 md:justify-center px-8 md:px-0">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="flex flex-col items-center space-y-1 min-w-fit group hover:bg-muted/50 rounded-lg p-2 transition-colors"
                  >
                    <Icon className={`h-5 w-5 ${category.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap">
                      {category.name}
                    </span>
                  </Link>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
