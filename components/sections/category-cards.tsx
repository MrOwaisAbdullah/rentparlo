"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { POPULAR_CATEGORIES, getCategoryEmoji } from "@/lib/static-categories"

interface CategoryCardsProps {
  categories?: never; // Make categories prop optional/unused
}

// Helper function to safely extract slug value
const getSlugValue = (slug: string | { current: string } | undefined): string => {
  if (!slug) return '';
  if (typeof slug === 'string') {
    return slug;
  }
  if (typeof slug === 'object' && slug !== null && 'current' in slug) {
    return slug.current || '';
  }
  return '';
};

export function CategoryCards({}: CategoryCardsProps) {
  // Use static popular categories
  const displayCategories = POPULAR_CATEGORIES;

  if (!displayCategories || displayCategories.length === 0) {
    return (
      <section className="py-8 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">No categories available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Popular Categories</h2>
          <p className="text-muted-foreground">Browse our most popular rental categories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {displayCategories.map((category) => {
            const slugValue = getSlugValue(category.slug);
            const href = slugValue ? `/category/${slugValue}` : '#';
            
            return (
              <Link 
                key={category._id} 
                href={href}
                className={slugValue ? '' : 'cursor-not-allowed opacity-50'}
              >
                <Card className="hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer h-24 flex flex-col items-center justify-center text-center p-3 group">
                  <div className="mb-1">
                    {category.icon?.asset?.url ? (
                      <div className="w-8 h-8 relative">
                        <Image
                          src={category.icon.asset.url}
                          alt={category.title}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            // If image fails to load, we could handle it here
                            // But for now, we'll just rely on our emoji fallback system
                            // by not providing image URLs in static categories
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-3xl">{getCategoryEmoji(getSlugValue(category.slug))}</div>
                    )}
                  </div>
                  <h3 className="text-[12px] font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  )
}

export default CategoryCards