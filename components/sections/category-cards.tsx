"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Category } from "@/types";
import { getSanityImageUrl } from "@/sanity/lib/image";


interface CategoryCardsProps {
  categories?: Category[];
}

const iconMap: Record<string, string> = {
  automobiles: "🚗",
  "medical-equipment": "🏥",
  camera: "📷",
  generators: "⚡",
  "wedding-couture": "💒",
  events: "🎉",
  "construction-equipment": "🏗️",
  studio: "🎬",
  advertisements: "📢",
}

// Helper function to safely extract slug value
const getSlugValue = (slug: string | { current: string } | undefined): string => {
  if (!slug) return '';
  if (typeof slug === 'string') {
    return slug;
  }
  if (typeof slug === 'object' && 'current' in slug) {
    return slug.current || '';
  }
  return '';
};

export function CategoryCards({ categories = [] }: CategoryCardsProps) {
  // Show up to 8 categories
  const displayCategories = categories.slice(0, 8);

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
    <section className="py-8 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Popular Categories</h2>
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
                    {category.icon ? (
                      <div className="w-8 h-8 relative">
                        <Image
                          src={getSanityImageUrl(category.icon)}
                          alt={category.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="text-3xl">{iconMap[slugValue] || "📦"}</div>
                    )}
                  </div>
                  <h3 className="text-[12px] font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  {category.itemCount !== undefined && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {category.itemCount} items
                    </p>
                  )}
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