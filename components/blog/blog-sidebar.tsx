'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Mail, TrendingUp, Tag, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BlogCard } from './blog-card';
import { FormField } from '@/components/forms/form-field';
import { cn } from '@/lib/utils';
import { BlogCategory, PopularPost, BlogPostSummary } from '@/types';

interface BlogSidebarProps {
  categories: BlogCategory[];
  popularPosts: PopularPost[];
  recentPosts: BlogPostSummary[];
  tags: string[];
  showNewsletter?: boolean;
  showAds?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export function BlogSidebar({
  categories,
  popularPosts,
  recentPosts,
  tags,
  showNewsletter = true,
  showAds = false,
  onSearch,
  className
}: BlogSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterLoading, setNewsletterLoading] = React.useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterLoading(true);
    try {
      // TODO: Implement newsletter subscription API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories Widget */}
      {categories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div key={category._id}>
                  <Link
                    href={`/blog/category/${category.slug.current}`}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors group"
                  >
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {category.title}
                    </span>
                    <Badge variant="secondary" size="sm">
                      {category.postCount || 0}
                    </Badge>
                  </Link>
                  {index < categories.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Posts Widget */}
      {popularPosts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Popular Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {popularPosts.slice(0, 5).map((post, index) => (
                <div key={post._id}>
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-16 h-16 relative overflow-hidden rounded-md">
                      {post.mainImage && (
                        <img
                          src={post.mainImage.asset.url}
                          alt={post.mainImage.alt}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2 mb-1">
                        <Link 
                          href={`/blog/${post.slug.current}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        {post.readingTime && (
                          <>
                            <span>•</span>
                            <span>{post.readingTime} min</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < popularPosts.length - 1 && index < 4 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts Widget */}
      {recentPosts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {recentPosts.slice(0, 3).map((post) => (
                <BlogCard
                  key={post._id}
                  post={post}
                  variant="compact"
                  showExcerpt={false}
                  showAuthor={false}
                  showCategories={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags Widget */}
      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Popular Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 20).map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                  <Badge 
                    variant="outline" 
                    className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Newsletter Widget */}
      {showNewsletter && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Stay Updated
            </CardTitle>
            <CardDescription>
              Get the latest rental tips and marketplace updates delivered to your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {newsletterSuccess ? (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <ArrowRight className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-700">
                  Thank you for subscribing!
                </p>
                <p className="text-xs text-muted-foreground">
                  You'll receive our newsletter soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <FormField
                  id="newsletter-email"
                  name="email"
                  label=""
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  required
                  onChange={(value) => setNewsletterEmail(value as string)}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  loading={newsletterLoading}
                  disabled={!newsletterEmail.trim()}
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  No spam, unsubscribe anytime.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ad Banner Widget */}
      {showAds && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 bg-muted-foreground/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xs font-medium">AD</span>
                </div>
                <p className="text-xs">Advertisement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Archive Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Archive</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              
              return (
                <Link
                  key={i}
                  href={`/blog?month=${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors group"
                >
                  <span className="text-sm group-hover:text-primary transition-colors">
                    {monthName}
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Social Links Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Follow Us</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="https://facebook.com/rentparlo" target="_blank">
                <span className="sr-only">Facebook</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://twitter.com/rentparlo" target="_blank">
                <span className="sr-only">Twitter</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://instagram.com/rentparlo" target="_blank">
                <span className="sr-only">Instagram</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.349-1.051-2.349-2.348 0-1.297 1.052-2.349 2.349-2.349 1.297 0 2.348 1.052 2.348 2.349 0 1.297-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.349-1.051-2.349-2.348 0-1.297 1.052-2.349 2.349-2.349 1.297 0 2.348 1.052 2.348 2.349 0 1.297-1.051 2.348-2.348 2.348z"/>
                </svg>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}