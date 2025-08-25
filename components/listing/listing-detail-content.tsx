'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, Share2, Flag, MapPin, Calendar, Star, User, 
  Shield, Clock, Eye, MessageCircle, Phone, Mail,
  ChevronLeft, ChevronRight, ExternalLink, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FeaturedListings } from '@/components/sections/featured-listings';
import { ListingReviews } from '@/components/listing/listing-reviews';
import { ContactSellerModal } from '@/components/listing/contact-seller-modal';
import { cn } from '@/lib/utils';
import { Listing as SanityListing, Seller, SellerProfile } from '@/types';

interface ListingDetailContentProps {
  listing: SanityListing;
  similarListings?: SanityListing[];
  reviews?: any[];
}

const conditionConfig = {
  new: { color: 'bg-green-100 text-green-800', label: 'New' },
  'like-new': { color: 'bg-blue-100 text-blue-800', label: 'Like New' },
  good: { color: 'bg-yellow-100 text-yellow-800', label: 'Good' },
  fair: { color: 'bg-orange-100 text-orange-800', label: 'Fair' }
};

const availabilityConfig = {
  available: { color: 'bg-green-100 text-green-800', label: 'Available Now' },
  rented: { color: 'bg-red-100 text-red-800', label: 'Currently Rented' },
  maintenance: { color: 'bg-orange-100 text-orange-800', label: 'Under Maintenance' }
};

const tierConfig = {
  basic: { color: 'bg-gray-100 text-gray-700', icon: '🥉' },
  bronze: { color: 'bg-amber-100 text-amber-700', icon: '🥉' },
  silver: { color: 'bg-gray-100 text-gray-600', icon: '🥈' },
  gold: { color: 'bg-yellow-100 text-yellow-700', icon: '🥇' },
  platinum: { color: 'bg-purple-100 text-purple-700', icon: '🏆' },
  diamond: { color: 'bg-blue-100 text-blue-700', icon: '💎' }
};

// Define the correct types for the ContactSellerModal
interface ContactModalListing {
  _id: string;
  title: string;
  price: number;
  priceType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  availability: 'available' | 'rented' | 'maintenance';
}

interface ContactModalSeller {
  id: string;
  username: string;
  tier: 'basic' | 'premium' | 'gold';
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  responseTime?: string;
  profile?: {
    business_name?: string;
    phone?: string;
    email?: string;
    city?: string;
    bio?: string;
  };
}

export function ListingDetailContent({ listing, similarListings = [], reviews = [] }: ListingDetailContentProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [showContactModal, setShowContactModal] = React.useState(false);
  const [viewCount, setViewCount] = React.useState(listing.views || 0);

  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    const typeMap = {
      hourly: 'per hour',
      daily: 'per day', 
      weekly: 'per week',
      monthly: 'per month',
      yearly: 'per year'
    };

    return `${formatted} ${typeMap[priceType as keyof typeof typeMap] || priceType}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleContactSeller = () => {
    setShowContactModal(true);
    // Track contact click
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'contact_click',
        listing_id: listing._id,
        metadata: { contact_method: 'modal' }
      })
    }).catch(console.error);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: listing.title,
        text: Array.isArray(listing.description) 
          ? listing.description
              .filter((block: any) => block._type === 'block' && block.children)
              .map((block: any) => block.children.map((child: any) => child.text || '').join(''))
              .join(' ')
          : typeof listing.description === 'string' 
            ? listing.description 
            : '',
        url
      });
    } else {
      await navigator.clipboard.writeText(url);
      // Show toast notification
    }
  };

  const nextImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  // Extract text from Portable Text description
  const extractDescriptionText = () => {
    if (Array.isArray(listing.description)) {
      return listing.description
        .filter((block: any) => block._type === 'block' && block.children)
        .map((block: any) => block.children.map((child: any) => child.text || '').join(''))
        .join(' ');
    }
    return typeof listing.description === 'string' ? listing.description : '';
  };

  // Format seller response time
  const formatResponseTime = () => {
    // Use a default value since response_time is not in the SellerProfile type
    return '< 1 hour';
  };

  // Transform listing for ContactSellerModal
  const transformListingForContactModal = (): ContactModalListing => {
    return {
      _id: listing._id,
      title: listing.title,
      price: listing.price,
      priceType: listing.priceType === 'yearly' ? 'monthly' : listing.priceType, // Map yearly to monthly
      availability: listing.availability?.isAvailable ? 'available' : 'rented'
    };
  };

  // Transform seller for ContactSellerModal
  const transformSellerForContactModal = (): ContactModalSeller | null => {
    if (!listing.seller) return null;
    
    return {
      id: listing.seller.id,
      username: listing.seller.profile?.username || '',
      tier: listing.seller.profile?.tier === 'diamond' ? 'gold' : 
            listing.seller.profile?.tier === 'platinum' ? 'gold' : 
            listing.seller.profile?.tier === 'gold' ? 'gold' : 
            listing.seller.profile?.tier === 'silver' ? 'premium' : 
            listing.seller.profile?.tier === 'bronze' ? 'premium' : 'basic',
      isVerified: listing.seller.profile?.is_verified || false,
      rating: undefined, // Not available in current type
      reviewCount: undefined, // Not available in current type
      responseTime: undefined, // Not available in current type
      profile: {
        business_name: listing.seller.profile?.business_name,
        phone: undefined, // Not available in current type
        email: undefined, // Not available in current type
        city: undefined, // Not available in current type (it's on the User object, not SellerProfile)
        bio: undefined // Not available in current type
      }
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/20 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/category/${listing.category?._ref}`} className="hover:text-foreground transition-colors">
              {listing.category?.title}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium line-clamp-1">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-[16/9] relative overflow-hidden rounded-lg bg-muted">
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    src={listing.images[currentImageIndex]?.asset?.url || "/placeholder.svg"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground">No image available</span>
                  </div>
                )}
                
                {/* Image Navigation */}
                {listing.images && listing.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 p-0 bg-white/90 hover:bg-white"
                      onClick={previousImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 p-0 bg-white/90 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {listing.images.map((_, index) => (
                        <button
                          key={index}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            index === currentImageIndex ? "bg-white" : "bg-white/50"
                          )}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-10 h-10 p-0 bg-white/90 hover:bg-white"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart className={cn("w-4 h-4", isFavorited && "fill-red-500 text-red-500")} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-10 h-10 p-0 bg-white/90 hover:bg-white"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-10 h-10 p-0 bg-white/90 hover:bg-white"
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {listing.isFeatured && (
                    <Badge className="bg-yellow-500 text-white">Featured</Badge>
                  )}
                  <Badge className={cn("text-xs", listing.availability?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                    {listing.availability?.isAvailable ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </div>

              {/* Image Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 relative overflow-hidden rounded border-2 transition-colors",
                        index === currentImageIndex ? "border-primary" : "border-transparent hover:border-muted-foreground"
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <Image
                        src={image?.asset?.url || "/placeholder.svg"}
                        alt={`${listing.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Info */}
            <div className="space-y-6">
              {/* Title and Basic Info */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {listing.location?.area ? `${listing.location.area}, ` : ''}
                          {listing.location?.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Listed {formatDate(listing.createdAt)}</span>
                      </div>
                      {viewCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{viewCount.toLocaleString()} views</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formatPrice(listing.price, listing.priceType)}
                    </div>
                  </div>
                </div>

                {/* Categories and Condition */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline">{listing.category?.title}</Badge>
                  <Badge className={cn("text-xs", conditionConfig[listing.condition as keyof typeof conditionConfig]?.color || 'bg-gray-100 text-gray-800')}>
                    {conditionConfig[listing.condition as keyof typeof conditionConfig]?.label || listing.condition}
                  </Badge>
                </div>

                {/* Rating */}
                {listing.seller?.profile?.tier && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Badge className={cn("text-xs", tierConfig[listing.seller.profile.tier as keyof typeof tierConfig]?.color || 'bg-gray-100 text-gray-700')}>
                        {tierConfig[listing.seller.profile.tier as keyof typeof tierConfig]?.icon || '👤'} {listing.seller.profile.tier}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {listing.description && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {extractDescriptionText()}
                    </p>
                  </div>
                </div>
              )}

              {/* Features */}
              {listing.specifications && listing.specifications.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {listing.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-muted">
                        <span className="font-medium capitalize">{spec.key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-muted-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rental Rules */}
              {listing.rentalRules && listing.rentalRules.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Rental Rules</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {listing.rentalRules.map((rule, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Seller</CardTitle>
              </CardHeader>
              <CardContent>
                {listing.seller ? (
                  <div className="space-y-4">
                    {/* Seller Info */}
                    <Link href={`/seller/${listing.seller.profile?.username}`} className="block">
                      <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={listing.seller.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${listing.seller.profile?.username}`} />
                          <AvatarFallback>
                            {listing.seller.profile?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              {listing.seller.profile?.business_name || listing.seller.profile?.username}
                            </h4>
                            {listing.seller.profile?.is_verified && (
                              <Shield className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge className={cn("text-xs", tierConfig[listing.seller.profile?.tier as keyof typeof tierConfig]?.color || 'bg-gray-100 text-gray-700')}>
                              {tierConfig[listing.seller.profile?.tier as keyof typeof tierConfig]?.icon || '👤'} {listing.seller.profile?.tier}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Seller Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-primary">1</div>
                        <div className="text-muted-foreground">Listings</div>
                      </div>
                      <div>
                        <div className="font-semibold text-green-600">{formatResponseTime()}</div>
                        <div className="text-muted-foreground">Response Time</div>
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Actions */}
                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        onClick={handleContactSeller}
                        disabled={!listing.availability?.isAvailable}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {listing.availability?.isAvailable ? 'Send Message' : 'Not Available'}
                      </Button>
                    </div>

                    {/* Safety Notice */}
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Always meet in a public place and inspect the item before making any payment.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Seller information not available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{listing.location?.city}</div>
                  {listing.location?.area && (
                    <div className="text-muted-foreground">{listing.location.area}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Meet in a public place</li>
                  <li>• Inspect the item thoroughly</li>
                  <li>• Don't pay in advance</li>
                  <li>• Trust your instincts</li>
                  <li>• Report suspicious activity</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews && reviews.length > 0 && (
          <div className="mt-12">
            <ListingReviews reviews={reviews} listingId={listing._id} />
          </div>
        )}

        {/* Similar Listings */}
        {similarListings && similarListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Listings</h2>
            <FeaturedListings listings={similarListings} />
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && listing.seller && transformSellerForContactModal() && (
        <ContactSellerModal
          listing={transformListingForContactModal()}
          seller={transformSellerForContactModal() as ContactModalSeller}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}

export default ListingDetailContent;