'use client';

import React from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Listing } from '@/types';
import { ListingCard } from '@/components/cards/listing-card'; // Import the ListingCard component
import { toast } from "sonner"

interface FeaturedListingsProps {
  listings: Listing[];
  className?: string;
}

export function FeaturedListings({ listings, className }: FeaturedListingsProps) {
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  const toggleFavorite = (listingId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
      } else {
        newFavorites.add(listingId);
      }
      return newFavorites;
    });
  };

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured listings available at the moment.</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {listings.map((listing) => (
        <ListingCard
          key={listing._id}
          listing={listing}
          variant="featured"
          overlayActions={
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(listing._id);
                }}
              >
                <Heart className={cn("w-4 h-4", favorites.has(listing._id) && "fill-red-500 text-red-500")} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const url = `${window.location.origin}/listing/${listing?.slug?.current || listing?._id}`;
                  
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: listing?.title,
                        text: Array.isArray(listing?.description) 
                          ? listing.description
                              .filter((block: any) => block._type === 'block' && block.children)
                              .map((block: any) => block.children.map((child: any) => child.text || '').join(''))
                              .join(' ')
                          : typeof listing?.description === 'string' 
                            ? listing.description 
                            : '',
                        url
                      });
                    } catch (error) {
                      console.error('Error sharing:', error);
                      // Fallback to clipboard
                      await navigator.clipboard.writeText(url);
                    }
                  } else {
                    // Fallback to clipboard
                    await navigator.clipboard.writeText(url);
                  }
                  
                  // Show toast notification
                  toast.success("Link copied to clipboard!");
                }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          }
        />
      ))}
    </div>
  );
}

export default FeaturedListings;