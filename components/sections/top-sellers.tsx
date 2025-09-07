'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Marquee } from '@/components/ui/marquee';
import { Seller } from '@/types'; // Assuming Seller type is available
import { VerifiedBadge } from '@/components/seller/verified-badge';
import { Star } from 'lucide-react';

// This card is adapted from the original TestimonialCard
function SellerMarqueeCard({ seller }: { seller: Seller }) {
  const profile = seller.profile;

  // Safely access properties with fallbacks
  const name = profile.business_name || profile.username || 'Unnamed Seller';
  const username = profile.username ? `@${profile.username}` : '';
  const avatarUrl = profile.avatar_url || '';
  const description = profile.description || seller.bio || ''; // Fallback to user bio
  const city = seller.city || '';
  const isVerified = profile.is_verified || false;
  const rating = profile.customer_rating ?? 0;
  const totalReviews = profile.total_reviews ?? 0;

  return (
    <Card className="w-64 mx-2">
      <CardContent className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar className="size-9">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <figcaption className="text-sm font-medium text-foreground">
                {name}
              </figcaption>
              {isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs font-medium text-muted-foreground">{username}</p>
          </div>
        </div>

        {description && (
          <blockquote className="mt-3 text-sm text-secondary-foreground h-10 line-clamp-2">
            {description}
          </blockquote>
        )}

        <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({totalReviews})</span>
            </div>
            {city && <span className="text-xs text-muted-foreground">{city}</span>}
        </div>
      </CardContent>
    </Card>
  );
}


interface TopSellersProps {
    sellers: Seller[];
}

// The main component, renamed from Component to TopSellers
export default function TopSellers({ sellers }: TopSellersProps) {
  if (!sellers || sellers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No top sellers available at the moment.</p>
      </div>
    );
  }

  // To make the marquees look different, we can split the sellers array
  const firstHalf = sellers.slice(0, Math.ceil(sellers.length / 2));
  const secondHalf = sellers.slice(Math.ceil(sellers.length / 2));

  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-1 overflow-hidden py-8">
      {/* Marquee moving left to right (default) */}
      <Marquee pauseOnHover repeat={5} className="[--duration:80s]">
        {firstHalf.map((seller) => (
          <SellerMarqueeCard key={`${seller.id}-first`} seller={seller} />
        ))}
      </Marquee>
      {/* Marquee moving right to left (reverse) */}
      <Marquee pauseOnHover reverse repeat={5} className="[--duration:80s]">
        {secondHalf.map((seller) => (
          <SellerMarqueeCard key={`${seller.id}-second`} seller={seller} />
        ))}
      </Marquee>
      {/* Stylish gradient overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background/95 to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background/95 to-transparent"></div>
      <div className="pointer-events-none absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-background/90 to-transparent"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background/90 to-transparent"></div>
    </div>
  );
}
