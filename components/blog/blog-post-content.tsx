'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, Tag, Share2, Facebook, Twitter, Linkedin, Copy, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { BlogCard } from './blog-card';
import { cn } from '@/lib/utils';
import { BlogPost, BlogPostSummary } from '@/types';
import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from '@portabletext/types';
import { CustomComponent } from './CustomComponent';
import { TableOfContents } from './TableOfContent';

interface BlogPostContentProps {
  post: BlogPost;
  relatedPosts?: BlogPostSummary[];
  className?: string;
}

export function BlogPostContent({ post, relatedPosts = [], className }: BlogPostContentProps) {
  const [copied, setCopied] = React.useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTitle = () => {
    return post.titleUrdu && post.language === 'ur' ? post.titleUrdu : post.title;
  };

  const getContent = () => {
    return post.bodyUrdu && post.language === 'ur' ? post.bodyUrdu : post.body;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = getTitle();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    linkedin: `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`
  };

  return (
    <article className={cn("max-w-4xl mx-auto", className)}>
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((categoryRef) => (
              <Badge key={categoryRef._ref} variant="outline">
                {/* TODO: Resolve category reference to get title */}
                Category
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
          {getTitle()}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          {post.readingTime && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{post.readingTime} min read</span>
            </div>
          )}
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            <span>1.2k views</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
          <Image
            src={post.mainImage?.asset?.url || "/placeholder.svg"}
            alt={post.mainImage?.alt || "Featured image"}
            fill
            className="object-cover"
            priority
          />
          {post.mainImage?.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
              <p className="text-sm">{post.mainImage.caption}</p>
            </div>
          )}
        </div>
      </header>

      {/* Article Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Social Share - Sticky */}
          <div className="hidden lg:block fixed left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Card className="p-2">
              <div className="flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-10 h-10 p-0"
                >
                  <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-10 h-10 p-0"
                >
                  <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-10 h-10 p-0"
                >
                  <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="w-10 h-10 p-0"
                >
                  <Copy className={cn("w-4 h-4", copied && "text-green-600")} />
                </Button>
              </div>
            </Card>
          </div>

          {/* Article Body */}
          <div className="prose prose-gray max-w-none mb-8">
            <PortableText value={getContent()} components={CustomComponent} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Social Share - Mobile */}
          <div className="lg:hidden mb-8">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Share this article
              </h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Author Box */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{post.author}</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Content writer and rental market expert at RentParLo.pk. 
                    Passionate about helping people find the perfect rental solutions.
                  </p>
                    <Button variant="outline" size="sm">
                      More Articles
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Table of Contents */}
            <TableOfContents content={getContent().filter(block => block._type === 'block') as PortableTextBlock[]} />

            {/* Newsletter Signup */}
            {/* <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold mb-2">Stay Updated</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get notified about new articles and rental tips.
                </p>
                <Button size="sm" className="w-full">
                  Subscribe Now
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-12">
          <Separator className="mb-8" />
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.slice(0, 3).map((relatedPost) => (
              <BlogCard
                key={relatedPost._id}
                post={relatedPost}
                variant="default"
                showExcerpt={true}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}