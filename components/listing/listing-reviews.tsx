'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Shield, ThumbsUp, MessageSquare, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { trackAnalyticsEventClient } from '@/lib/supabase-queries-client';
import { ReviewFormModal } from './review-form-modal';
import { toast } from 'sonner';
import { urlFor } from '@/sanity/lib/image';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: any[];
  user?: {
    name:string;
    city?: string;
    isVerified: boolean;
  };
  helpful?: number;
  reply?: {
    message: string;
    createdAt: string;
    from: 'seller' | 'admin';
  };
}

interface ListingReviewsProps {
  reviews: Review[];
  listingId: string;
  className?: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatRelativeDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) return ''; // Future date
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

export function ListingReviews({ reviews = [], listingId, className }: ListingReviewsProps) {
  const [showAllReviews, setShowAllReviews] = React.useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  
  const hasReviews = reviews && reviews.length > 0;

  const averageRating = hasReviews ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: hasReviews ? reviews.filter(review => review.rating === rating).length : 0,
    percentage: hasReviews ? (reviews.filter(review => review.rating === rating).length / reviews.length) * 100 : 0
  }));

  const displayedReviews = showAllReviews ? reviews : (reviews || []).slice(0, 3);

  const handleHelpfulClick = async (reviewId: string) => {
    try {
      await trackAnalyticsEventClient({
        event_type: 'impressions',
        listing_id: listingId,
        metadata: { review_id: reviewId, helpful_click: true }
      });
      toast.info("Thanks for your feedback!");
    } catch (error) {
      console.error('Error tracking helpful click:', error);
    }
  };

  return (
    <>
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reviews {hasReviews ? `(${reviews.length})` : ''}</CardTitle>
        <Button onClick={() => setIsReviewModalOpen(true)} size="sm">
          <Pencil className="w-4 h-4 mr-2" /> Write a Review
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasReviews ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to share your experience.
            </p>
            <Button className="mt-6" onClick={() => setIsReviewModalOpen(true)}>
              Write a Review
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < Math.floor(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-right">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              {displayedReviews.map((review, index) => (
                <div key={review._id} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.user?.name || 'Anonymous'}`} />
                      <AvatarFallback>
                        {(review.user?.name || 'A').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {review.user?.name || 'Anonymous User'}
                          </span>
                          {review.user?.isVerified && (
                            <Shield className="w-4 h-4 text-green-600" />
                          )}
                          {review.user?.city && (
                            <span className="text-sm text-muted-foreground">
                              from {review.user.city}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 sm:mt-0">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-4 h-4",
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeDate(review.createdAt)}
                          </span>
                        </div>
                      </div>

                      <p className="text-muted-foreground leading-relaxed break-words">
                        {review.comment}
                      </p>

                      {review.images && review.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
                          {review.images.map((image) => (
                            <div key={image.asset._ref} className="relative aspect-square rounded-lg overflow-hidden">
                              <Image
                                src={urlFor(image).width(200).height(200).url()}
                                alt="Review image"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => handleHelpfulClick(review._id)}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful {review.helpful ? `(${review.helpful})` : ''}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>

                      {review.reply && (
                        <div className="mt-4 pl-4 border-l-2 border-muted">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {review.reply.from === 'seller' ? 'Seller Reply' : 'Admin Reply'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeDate(review.reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground break-words">
                            {review.reply.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < displayedReviews.length - 1 && <Separator />}
                </div>
              ))}
            </div>

            {reviews.length > 3 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                >
                  {showAllReviews 
                    ? 'Show Less Reviews'
                    : `Show All ${reviews.length} Reviews`
                  }
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>

    <ReviewFormModal
      listingId={listingId}
      isOpen={isReviewModalOpen}
      onClose={() => setIsReviewModalOpen(false)}
      onReviewSubmitted={() => {
        toast.success("Review submitted! It will appear shortly.");
      }}
    />
    </>
  );
}

export default ListingReviews;