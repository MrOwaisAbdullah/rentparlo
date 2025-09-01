"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export interface AdBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  priority: number;
  targetAudience?: string[];
  category?: string;
  description?: string;
  ctaText?: string;
}

export interface AdBannerProps {
  banner: AdBanner;
  size?: "small" | "medium" | "large";
  onBannerClick?: (bannerId: string) => void;
  className?: string;
}

/**
 * Advertisement banner component for sidebar display
 * Supports different sizes and click tracking
 */
export function AdBanner({
  banner,
  size = "medium",
  onBannerClick,
  className,
}: AdBannerProps) {
  const handleClick = () => {
    onBannerClick?.(banner.id);

    // Open link in new tab for external links
    if (banner.linkUrl.startsWith("http")) {
      window.open(banner.linkUrl, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = banner.linkUrl;
    }
  };

  const sizeClasses = {
    small: "h-24",
    medium: "h-32",
    large: "h-48",
  };

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
    >
      <CardContent className="p-0">
        <div
          onClick={handleClick}
          className="relative group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label={`Advertisement: ${banner.title}`}
        >
          {/* Banner Image */}
          <div className={cn("relative overflow-hidden", sizeClasses[size])}>
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt={banner.altText}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <h3 className="font-bold text-lg mb-2">{banner.title}</h3>
                  {banner.description && (
                    <p className="text-sm opacity-90">{banner.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Banner Content (if image exists and we have additional content) */}
          {banner.imageUrl && (banner.description || banner.ctaText) && (
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1">{banner.title}</h3>
              {banner.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {banner.description}
                </p>
              )}
              {banner.ctaText && (
                <div className="text-xs font-medium text-primary">
                  {banner.ctaText}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Default ad banners for different page types
 */
export const defaultAdBanners = {
  search: [
    {
      id: "search-ad-1",
      title: "Premium Ad Space",
      imageUrl: "",
      linkUrl: "/advertise",
      altText: "Advertise with us",
      priority: 100,
      description: "Reach thousands of potential customers",
      ctaText: "Learn More",
    },
    {
      id: "search-ad-2",
      title: "Featured Listings",
      imageUrl: "",
      linkUrl: "/premium",
      altText: "Premium listings",
      priority: 90,
      description: "Get your listings featured",
      ctaText: "Upgrade Now",
    },
  ],
  category: [
    {
      id: "category-ad-1",
      title: "Category Sponsor",
      imageUrl: "",
      linkUrl: "/sponsor",
      altText: "Sponsor this category",
      priority: 100,
      description: "Become a category sponsor",
      ctaText: "Contact Us",
    },
  ],
  blog: [
    {
      id: "blog-ad-1",
      title: "Content Marketing",
      imageUrl: "",
      linkUrl: "/content-marketing",
      altText: "Content marketing services",
      priority: 100,
      description: "Grow your business with content",
      ctaText: "Get Started",
    },
  ],
} as const;
