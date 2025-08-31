"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { urlFor, getOptimizedImageUrl } from "@/sanity/lib/image"
import { CityAreaCombobox } from "@/components/ui/combobox"
import { CITY_AREAS } from '@/lib/area-utils'

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  mobileImage?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  link?: string;
  order: number;
  active: boolean;
}

interface HeroSectionProps {
  banners?: Banner[];
}

const PAKISTAN_CITIES = Object.keys(CITY_AREAS)

export function HeroSection({ banners = [] }: HeroSectionProps) {
  const [location, setLocation] = useState("Karachi")
  const [area, setArea] = useState("")
  const [query, setQuery] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Filter active banners and sort by order
  const activeBanners = banners
    .filter(banner => banner.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  // Set up responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Set up auto-rotation
  useEffect(() => {
    if (activeBanners.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % activeBanners.length)
      }, 5000)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeBanners.length])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchParams = new URLSearchParams()
    
    if (query) {
      searchParams.set('q', query)
    }
    
    if (location) {
      searchParams.set('city', location)
    }
    
    if (area) {
      searchParams.set('area', area)
    }
    
    window.location.href = `/search?${searchParams.toString()}`
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    // Reset the auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % activeBanners.length)
      }, 5000)
    }
  }

  const goToPrevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length)
    // Reset the auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % activeBanners.length)
      }, 5000)
    }
  }

  const goToNextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length)
    // Reset the auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % activeBanners.length)
      }, 5000)
    }
  }

  // Get the current banner or use default
  const currentBanner = activeBanners.length > 0 ? activeBanners[currentIndex] : null;
  const defaultBackground = "/modern-rental-pakistan.png";

  // Determine which image to use based on device and availability
  const getImageUrl = () => {
    if (!currentBanner) return defaultBackground;
    
    // For mobile devices, use mobileImage if available, otherwise use desktop image
    if (isMobile) {
      const mobileImageUrl = currentBanner.mobileImage?.asset?.url 
        ? getOptimizedImageUrl(currentBanner.mobileImage, { width: 1024, height: 340 }, defaultBackground)
        : currentBanner.image?.asset?.url 
          ? getOptimizedImageUrl(currentBanner.image, { width: 1024, height: 340 }, defaultBackground)
          : defaultBackground;
      
      // Ensure we never return an empty string
      return mobileImageUrl || defaultBackground;
    }
    
    // For desktop, use desktop image
    const desktopImageUrl = currentBanner.image?.asset?.url 
      ? getOptimizedImageUrl(currentBanner.image, { width: 1920, height: 400 }, defaultBackground)
      : defaultBackground;
    
    // Ensure we never return an empty string
    return desktopImageUrl || defaultBackground;
  };

  // Get alt text for the image
  const getImageAlt = () => {
    if (!currentBanner) return "RentParLo Pakistan";
    
    if (isMobile && currentBanner.mobileImage?.alt) {
      return currentBanner.mobileImage.alt;
    }
    
    return currentBanner.image?.alt || currentBanner.title || "RentParLo Banner";
  };

  return (
    <section className="relative bg-muted/20">
      <div className="relative h-[400px] bg-cover bg-center bg-no-repeat overflow-hidden">
        {/* Banner Slider with Smooth Animations */}
        <AnimatePresence mode="wait">
          {currentBanner ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={getImageUrl()}
                alt={getImageAlt()}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/40"></div>
              
              <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center">
                <div className="max-w-4xl mx-auto text-center text-white">
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl md:text-5xl font-bold mb-4"
                  >
                    {currentBanner.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-lg md:text-xl mb-8 text-white/90"
                  >
                    {currentBanner.subtitle}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
            >
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${defaultBackground})` }}
              />
              <div className="absolute inset-0 bg-black/40"></div>
              
              <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center">
                <div className="max-w-4xl mx-auto text-center text-white">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    Find Top Rental Items in Pakistan
                  </h1>
                  <p className="text-lg md:text-xl mb-8 text-white/90">
                    Search the best rental items in Pakistan for all your temporary needs.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Arrows for Desktop */}
        {activeBanners.length > 1 && (
          <>
            <button 
              onClick={goToPrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:block bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={goToNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:block bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-30">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto border">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-4/12 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                Location
              </label>
              <CityAreaCombobox
                cities={PAKISTAN_CITIES}
                selectedCity={location}
                selectedArea={area}
                onCityChange={setLocation}
                onAreaChange={setArea}
                cityPlaceholder="City"
                areaPlaceholder="Area"
                className="flex-nowrap"
              />
            </div>

            <div className="w-full md:w-5/12 flex-grow">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-primary" />
                What are you looking for?
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g., Camera, Car, Wedding Hall..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 pl-10 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="w-full md:w-3/12 flex-shrink-0">
              <label className="text-sm font-medium text-transparent block mb-2">
                Search
              </label>
              <Button 
                type="submit" 
                className="w-full h-10 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default HeroSection