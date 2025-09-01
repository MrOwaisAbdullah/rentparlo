"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Eye, TrendingUp } from "lucide-react";

export interface RelatedItem {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface RelatedContentProps {
  contentType: "posts" | "listings" | "categories";
  items: RelatedItem[];
  maxItems?: number;
  title?: string;
  onItemClick?: (itemId: string) => void;
  className?: string;
}

/**
 * Component for displaying related posts, listings, or categories
 * Adapts display based on content type
 */
export function RelatedContent({
  contentType,
  items,
  maxItems = 5,
  title,
  onItemClick,
  className,
}: RelatedContentProps) {
  const displayItems = items.slice(0, maxItems);
  const defaultTitle = getDefaultTitle(contentType);

  const handleItemClick = (item: RelatedItem) => {
    onItemClick?.(item.id);

    // Navigate to the item
    if (item.linkUrl.startsWith("http")) {
      window.open(item.linkUrl, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = item.linkUrl;
    }
  };

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {getContentIcon(contentType)}
          {title || defaultTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayItems.map((item) => (
          <RelatedItemCard
            key={item.id}
            item={item}
            contentType={contentType}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Individual related item card
 */
function RelatedItemCard({
  item,
  contentType,
  onClick,
}: {
  item: RelatedItem;
  contentType: "posts" | "listings" | "categories";
  onClick: () => void;
}) {
  return (
    <div
      className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Item Image */}
      <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            {getContentIcon(contentType, "w-6 h-6 text-gray-500")}
          </div>
        )}
      </div>

      {/* Item Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h4>

        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {item.description}
          </p>
        )}

        {/* Content-specific metadata */}
        <div className="flex items-center gap-2 mt-2">
          {contentType === "listings" && item.metadata && (
            <>
              {item.metadata.price && (
                <Badge variant="secondary" className="text-xs">
                  PKR {item.metadata.price.toLocaleString()}
                </Badge>
              )}
              {item.metadata.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{item.metadata.location}</span>
                </div>
              )}
            </>
          )}

          {contentType === "posts" && item.metadata && (
            <>
              {item.metadata.publishedAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(item.metadata.publishedAt)}</span>
                </div>
              )}
              {item.metadata.views && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span>{item.metadata.views}</span>
                </div>
              )}
            </>
          )}

          {contentType === "categories" && item.metadata && (
            <>
              {item.metadata.itemCount && (
                <Badge variant="outline" className="text-xs">
                  {item.metadata.itemCount} items
                </Badge>
              )}
              {item.metadata.trending && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>Trending</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Get default title based on content type
 */
function getDefaultTitle(
  contentType: "posts" | "listings" | "categories"
): string {
  switch (contentType) {
    case "posts":
      return "Related Posts";
    case "listings":
      return "Popular Listings";
    case "categories":
      return "Browse Categories";
    default:
      return "Related Content";
  }
}

/**
 * Get icon for content type
 */
function getContentIcon(
  contentType: "posts" | "listings" | "categories",
  className = "w-5 h-5"
) {
  switch (contentType) {
    case "posts":
      return <Calendar className={className} />;
    case "listings":
      return <TrendingUp className={className} />;
    case "categories":
      return <MapPin className={className} />;
    default:
      return null;
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Default related content for different page types
 */
export const defaultRelatedContent = {
  search: {
    popularListings: [
      {
        id: "listing-1",
        title: "Professional Camera for Rent",
        linkUrl: "/listing/camera-rent",
        imageUrl: "/samples/camera.jpg",
        metadata: { price: 5000, location: "Karachi" },
      },
      {
        id: "listing-2",
        title: "Luxury Car Rental",
        linkUrl: "/listing/car-rent",
        imageUrl: "/samples/car.jpg",
        metadata: { price: 15000, location: "Lahore" },
      },
    ],
  },
  category: {
    relatedCategories: [
      {
        id: "cat-1",
        title: "Electronics",
        linkUrl: "/category/electronics",
        metadata: { itemCount: 150, trending: true },
      },
      {
        id: "cat-2",
        title: "Vehicles",
        linkUrl: "/category/vehicles",
        metadata: { itemCount: 89 },
      },
    ],
  },
  blog: {
    relatedPosts: [
      {
        id: "post-1",
        title: "How to Choose the Right Rental Equipment",
        linkUrl: "/blog/choose-rental-equipment",
        description:
          "A comprehensive guide to selecting the best rental items for your needs.",
        metadata: { publishedAt: "2024-01-15", views: 1250 },
      },
      {
        id: "post-2",
        title: "Top 10 Rental Tips for Beginners",
        linkUrl: "/blog/rental-tips-beginners",
        description: "Essential tips for first-time renters in Pakistan.",
        metadata: { publishedAt: "2024-01-10", views: 890 },
      },
    ],
  },
} as const;
