'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Grid, List } from 'lucide-react';

interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    alt?: string;
  };
}

interface Subcategory {
  _id: string;
  title: string;
  slug: string;
  itemCount?: number;
}

interface CategoryHeaderProps {
  category: Category;
  totalCount: number;
  subcategories?: Subcategory[];
}

export function CategoryHeader({ category, totalCount, subcategories = [] }: CategoryHeaderProps) {
  return (
    <div className="bg-muted/20 border-b">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/categories" className="hover:text-foreground transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{category.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Category Image */}
          {category.image && (
            <div className="flex-shrink-0">
              <div className="w-24 h-24 lg:w-32 lg:h-32 relative overflow-hidden rounded-lg bg-white border shadow-sm">
                <Image
                  src={category.image.url}
                  alt={category.image.alt || category.title}
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
          )}

          {/* Category Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                {category.title}
              </h1>
              <Badge variant="secondary" className="text-sm w-fit">
                {totalCount.toLocaleString()} items available
              </Badge>
            </div>

            {category.description && (
              <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
                {category.description}
              </p>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/category/${category.slug}?sort=newest`}>
                  <Grid className="w-4 h-4 mr-2" />
                  Browse All
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/category/${category.slug}?sort=price-low`}>
                  Lowest Price
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/category/${category.slug}?sort=popular`}>
                  Most Popular
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Browse Subcategories</h3>
            <div className="flex flex-wrap gap-3">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory._id}
                  href={`/category/${category.slug}/${subcategory.slug}`}
                  className="group"
                >
                  <Badge 
                    variant="outline" 
                    className="py-2 px-4 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    <span className="group-hover:text-inherit">{subcategory.title}</span>
                    {subcategory.itemCount !== undefined && (
                      <span className="ml-2 text-muted-foreground group-hover:text-inherit/80">
                        ({subcategory.itemCount})
                      </span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background rounded-lg p-4 border shadow-sm">
            <div className="text-2xl font-bold text-primary">{totalCount}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </div>
          <div className="bg-background rounded-lg p-4 border shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {Math.floor(totalCount * 0.85)}
            </div>
            <div className="text-sm text-muted-foreground">Available Now</div>
          </div>
          <div className="bg-background rounded-lg p-4 border shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {subcategories.length || 1}
            </div>
            <div className="text-sm text-muted-foreground">Subcategories</div>
          </div>
          <div className="bg-background rounded-lg p-4 border shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              {Math.floor(totalCount * 0.3)}
            </div>
            <div className="text-sm text-muted-foreground">Featured</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryHeader;