'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BlogPostSummary } from '@/types';

interface BlogCardProps {
  post: BlogPostSummary;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
  showExcerpt?: boolean;
  showDate?: boolean;
  showCategories?: boolean;
  showReadingTime?: boolean;
  className?: string;
}

export function BlogCard({
  post,
  variant = 'default',
  showExcerpt = true,
  showDate = true,
  showCategories = true,
  showReadingTime = true,
  className
}: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExcerpt = () => {
    const excerpt = post.excerptUrdu && post.language === 'ur' 
      ? post.excerptUrdu 
      : post.excerpt;
    return excerpt.length > 120 ? excerpt.substring(0, 120) + '...' : excerpt;
  };

  const getTitle = () => {
    return post.titleUrdu && post.language === 'ur' 
      ? post.titleUrdu 
      : post.title;
  };

  // Featured variant - large card with prominent display
  if (variant === 'featured') {
    return (
      <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-lg py-0", className)}>
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.mainImage?.asset?.url || "/placeholder-blog-new.svg"}
            alt={post.mainImage?.alt || "Blog image"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-blog-new.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Featured badge */}
          {post.featured && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-primary-foreground">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* Language badge */}
          {post.language !== 'en' && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary">
                {post.language === 'ur' ? 'اردو' : 'Both'}
              </Badge>
            </div>
          )}

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {showCategories && post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories.slice(0, 2).map((category) => (
                  <Badge key={category._id} variant="outline" className="text-white border-white/30">
                    {category.title}
                  </Badge>
                ))}
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-2 line-clamp-2">
              <Link 
                href={`/blog/${post.slug.current}`}
                className="hover:text-primary-foreground transition-colors"
              >
                {getTitle()}
              </Link>
            </h3>
            
            {showExcerpt && (
              <p className="text-white/90 mb-4 line-clamp-2">
                {getExcerpt()}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-white/80">
                {showDate && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(post.publishedAt)}
                  </div>
                )}
                {showReadingTime && post.readingTime && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readingTime} min
                  </div>
                )}
              </div>

              <Button variant="secondary" size="sm" asChild>
                <Link href={`/blog/${post.slug.current}`}>
                  <span className="flex items-center">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Horizontal variant - for list view
  if (variant === 'horizontal') {
    return (
      <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-md py-0", className)}>
        <div className="flex">
          <div className="relative w-1/3 aspect-video overflow-hidden">
            <Image
              src={post.mainImage?.asset?.url || "/placeholder-blog-new.svg"}
              alt={post.mainImage?.alt || "Blog image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-blog-new.svg";
              }}
            />
            {post.featured && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="w-3 h-3" />
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="flex-1 p-6">
            <div className="flex flex-col h-full">
              {showCategories && post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.categories.slice(0, 2).map((category) => (
                    <Badge key={category._id} variant="outline">
                      {category.title}
                    </Badge>
                  ))}
                </div>
              )}

              <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug.current}`}>
                  {getTitle()}
                </Link>
              </h3>

              {showExcerpt && (
                <p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">
                  {getExcerpt()}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  {showDate && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(post.publishedAt)}
                    </div>
                  )}
                  {showReadingTime && post.readingTime && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.readingTime} min
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Compact variant - for sidebar or related posts
  if (variant === 'compact') {
    return (
      <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-md py-0", className)}>
        <div className="flex space-x-3 p-4">
          <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={post.mainImage?.asset?.url || "/placeholder-blog-new.svg"}
              alt={post.mainImage?.alt || "Blog image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-blog-new.svg";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              <Link href={`/blog/${post.slug.current}`}>
                {getTitle()}
              </Link>
            </h4>

            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {showDate && (
                <span>{formatDate(post.publishedAt)}</span>
              )}
              {showReadingTime && post.readingTime && (
                <>
                  <span>•</span>
                  <span>{post.readingTime} min</span>
                </>
              )}
            </div>

            {showCategories && post.categories && post.categories.length > 0 && (
              <div className="mt-2">
                <Badge variant="outline">
                  {post.categories[0].title}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Default variant - standard grid card
  return (
    <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-lg py-0", className)}>
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={post.mainImage?.asset?.url || "/placeholder-blog-new.svg"}
          alt={post.mainImage?.alt || "Blog image"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-blog-new.svg";
          }}
        />
        
        {post.featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        {post.language !== 'en' && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary">
              {post.language === 'ur' ? 'اردو' : 'Both'}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {showCategories && post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories.slice(0, 2).map((category) => (
              <Badge key={category._id} variant="outline">
                {category.title}
              </Badge>
            ))}
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug.current}`}>
            {getTitle()}
          </Link>
        </h3>

        {showExcerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {getExcerpt()}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            {showDate && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(post.publishedAt)}
              </div>
            )}
            {showReadingTime && post.readingTime && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {post.readingTime} min
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}