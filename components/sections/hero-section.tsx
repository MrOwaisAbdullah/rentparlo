"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedImageUrl } from "@/sanity/lib/image";
import UniversalSearchBar from "@/components/search/universal-search-bar";
import { AdBanner } from "@/components/ads/ad-banner";
import { cn } from "@/lib/utils";

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

export function HeroSection({ banners = [] }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter active banners and sort by order
  const activeBanners = banners
    .filter((banner) => banner.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Set up responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set up auto-rotation
  useEffect(() => {
    if (activeBanners.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeBanners.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    // Reset the auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
    }
  };

  const goToPrevSlide = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
    );
    // Reset the auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
    }
  };

  const goToNextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    // Reset the auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
    }
  };

  // Get the current banner or use default
  const currentBanner =
    activeBanners.length > 0 ? activeBanners[currentIndex] : null;
  const defaultBackground = "/modern-rental-pakistan.png";

  // Determine which image to use based on device and availability
  const getImageUrl = () => {
    if (!currentBanner) return defaultBackground;

    // For mobile devices, use mobileImage if available, otherwise use desktop image
    if (isMobile) {
      const mobileImageUrl = currentBanner.mobileImage?.asset?.url
        ? getOptimizedImageUrl(
            currentBanner.mobileImage,
            { width: 1024, height: 400 },
            defaultBackground
          )
        : currentBanner.image?.asset?.url
          ? getOptimizedImageUrl(
              currentBanner.image,
              { width: 1024, height: 400 },
              defaultBackground
            )
          : defaultBackground;

      // Ensure we never return an empty string
      return mobileImageUrl || defaultBackground;
    }

    // For desktop, use desktop image with appropriate dimensions for variable height
    const desktopImageUrl = currentBanner.image?.asset?.url
      ? getOptimizedImageUrl(
          currentBanner.image,
          { width: 1920, height: 700 },
          defaultBackground
        )
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

    return (
      currentBanner.image?.alt || currentBanner.title || "RentParLo Banner"
    );
  };

  return (
    <section className="relative bg-muted/20 overflow-hidden">
      {/* Hero Banner with Responsive Height - Optimized for search bar visibility */}
      <div className="relative h-[350px] md:h-[450px] lg:h-[calc(100vh-250px)] min-h-[350px] max-h-[700px] bg-cover bg-center bg-no-repeat">
        {/* Banner Slider with Smooth Animations */}
        <AnimatePresence initial={false} custom={direction}>
          {currentBanner ? (
            <motion.div
              key={currentIndex}
              variants={{
                enter: (direction: number) => {
                  return {
                    x: direction > 0 ? "100%" : "-100%",
                    opacity: 0
                  };
                },
                center: {
                  zIndex: 1,
                  x: 0,
                  opacity: 1
                },
                exit: (direction: number) => {
                  return {
                    zIndex: 0,
                    x: direction < 0 ? "100%" : "-100%",
                    opacity: 0
                  };
                }
              }}
              initial="enter"
              animate="center"
              exit="exit"
              custom={direction}
              transition={{
                x: { type: "spring", stiffness: 100, damping: 20 },
                opacity: { duration: 0.5 }
              }}
              className="absolute inset-0"
            >
              <Image
                src={getImageUrl()}
                alt={getImageAlt()}
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-black/20"></div>

              <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center">
                <div className="max-w-4xl mx-auto text-center text-white">
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4"
                  >
                    {currentBanner.title}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90"
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
              <div className="absolute inset-0 bg-black/20"></div>

              <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center">
                <div className="max-w-4xl mx-auto text-center text-white">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                    Find Top Rental Items in Pakistan
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90">
                    Search the best rental items in Pakistan for all your
                    temporary needs.
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
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 cursor-pointer z-20 bg-black/30 hover:bg-black/50 text-white p-1 md:p-2 rounded-full transition-all duration-300"
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 cursor-pointer z-20 bg-black/30 hover:bg-black/50 text-white p-1 md:p-2 rounded-full transition-all duration-300"
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      {/* Hero Search Bar - Fully visible and overlapping with proper spacing */}
      <div className="container mx-auto px-4 relative z-10 w-full max-w-6xl -mt-16">
        <UniversalSearchBar
          variant="hero"
          placeholder="e.g., Camera, Car, Wedding Hall..."
          showLocationFilter={true}
          size="lg"
          className="max-w-4xl mx-auto shadow-xl"
        />
      </div>


      {/* Bottom Banner - Leaderboard with proper spacing */}
      <div className="w-full bg-background pt-24">
        <div className="container mx-auto px-4 pt-8 pb-6">
          <AdBanner 
            placement="homepage-bottom" 
            className="mx-auto w-full" 
            fallbackText="Advertisement"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
