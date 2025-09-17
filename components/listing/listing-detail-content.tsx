'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from "sonner"
import { 
  Heart, Share2, 
  // Flag,
  MapPin, Calendar,
  Shield, Eye, MessageCircle, Phone,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { WhatsAppButton } from '@/components/seller/whatsapp-button';
import { SafetyNoticeModal } from '@/components/seller/safety-notice-modal';
import { VerifiedBadge } from '@/components/seller/verified-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FeaturedListings } from '@/components/sections/featured-listings';
import { ListingReviews } from '@/components/listing/listing-reviews';
import { ContactSellerModal } from '@/components/listing/contact-seller-modal';
import { PriceInfoCard } from '@/components/listing/price-info-card';
import { cn } from '@/lib/utils';
import { Listing as SanityListing, Seller, SellerProfile } from '@/types';
import { SaveButton } from '@/components/ui/save-button';
import { useSafeDOM } from '@/hooks/use-safe-dom';
import { safeDOM } from '@/lib/safe-dom';

interface ListingDetailContentProps {
  listing: SanityListing;
  similarListings?: SanityListing[];
  reviews?: any[];
  currentUser?: any;
}

interface ListingDetailContentProps {
  listing: SanityListing;
  similarListings?: SanityListing[];
  reviews?: any[];
  currentUser?: any;
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
  basic: { color: 'bg-gray-100 text-gray-700', icon: '🏅' },
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

export function ListingDetailContent({ listing, similarListings = [], reviews = [], currentUser }: ListingDetailContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  
  const [showContactModal, setShowContactModal] = React.useState(false);
  const [showCallSafetyModal, setShowCallSafetyModal] = React.useState(false);
  const [showMapSafetyModal, setShowMapSafetyModal] = React.useState(false);
  const [viewCount, setViewCount] = React.useState(listing.views || 0);

  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    const typeMap = {
      hourly: '/hr',
      daily: '/day', 
      weekly: '/week',
      monthly: '/month',
      yearly: '/year'
    };

    // Handle case where priceType might be undefined
    const normalizedPriceType = priceType || 'daily';
    return `${formatted}${typeMap[normalizedPriceType as keyof typeof typeMap] || '/' + normalizedPriceType}`;
  };

  const formatDate = (dateString: string) => {
    // Use _createdAt from Sanity if available, otherwise use fallbacks
    const dateToFormat = dateString || listing._createdAt || listing.createdAt || listing.created_at;
    if (!dateToFormat) return 'N/A';
    
    return new Date(dateToFormat).toLocaleDateString('en-US', {
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
    let copied = false;
    
    // Track the share event
    try {
      await trackAnalyticsEventClient({
        event_type: 'share',
        listing_id: listing._id,
        metadata: { 
          method: navigator.share ? 'native' : 'clipboard',
          url: url
        }
      });
    } catch (error) {
      console.error('Error tracking share event:', error);
    }
    
    if (navigator.share) {
      try {
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
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        copied = true;
      }
    } else {
      await navigator.clipboard.writeText(url);
      copied = true;
    }
    
    // Show toast notification
    if (copied) {
      toast.success("Link copied to clipboard!");
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

  // Get seller phone number (from user object)
  const getSellerPhone = () => {
    // Debugging: log the seller object to see what's available
    console.log('Seller object:', listing.seller);
    return listing.seller?.phone || '';
  };

  // Get seller email
  const getSellerEmail = () => {
    return listing.seller?.email || '';
  };

  // Get seller location URL
  const getSellerMapUrl = () => {
    return listing.seller?.profile?.map_location_url || 
           (listing.seller?.last_location ? 
             `https://maps.google.com/?q=${listing.seller.last_location.coordinates[1]},${listing.seller.last_location.coordinates[0]}` : 
             '');
  };

  // Handle call action
  const handleCallSeller = () => {
    const phone = getSellerPhone();
    if (phone) {
      setShowCallSafetyModal(true);
    }
  };

  const handleCallConfirm = () => {
    setShowCallSafetyModal(false);
    const phone = getSellerPhone();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  // Handle map action
  const handleMapSeller = () => {
    const mapUrl = getSellerMapUrl();
    if (mapUrl) {
      setShowMapSafetyModal(true);
    }
  };

  const handleMapConfirm = () => {
    setShowMapSafetyModal(false);
    const mapUrl = getSellerMapUrl();
    if (mapUrl) {
      window.open(mapUrl, '_blank');
    }
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
            <Link href={`/category/${typeof listing.category?.slug === 'string' ? listing.category.slug : listing.category?.slug?.current || listing.category?._id}`} className="hover:text-foreground transition-colors">
              {listing.category?.title}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium line-clamp-1">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Owner Preview Notification */}
        {currentUser && listing.supabaseId === currentUser.id && listing.status === 'pending' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Preview Mode</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This listing is currently in review and not visible to other users. 
                    You can preview how it will look once approved.
                  </p>
                  <p className="mt-1">
                    Status: <span className="font-medium">Pending Approval</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-[4/3] w-full relative overflow-hidden rounded-lg bg-muted">
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    src={listing.images[currentImageIndex]?.asset?.url || "/placeholder.svg"}
                    alt={listing.title}
                    fill
                    className="object-contain"
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
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-white/90 hover:bg-white"
                      onClick={previousImage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-white/90 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-4 h-4" />
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
                <div className="absolute top-4 right-4 flex gap-2">
                  <SaveButton listing={listing} className="w-8 h-8 p-0 bg-white/90 hover:bg-white" />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  {/* Temporary Disabled */}
                  {/* <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <Flag className="w-4 h-4" />
                  </Button> */}
                </div>

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {listing.isFeatured && (
                    <Badge className="bg-yellow-500 text-white text-xs sm:text-sm">Featured</Badge>
                  )}
                  {listing.availability?.isAvailable !== undefined && (
                    <Badge className={cn("text-xs", listing.availability?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                      {listing.availability?.isAvailable ? 'Available' : 'Not Available'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Image Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative overflow-hidden rounded border-2 transition-colors",
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {listing.location?.area ? `${listing.location.area}, ` : ''}
                          {listing.location?.city || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Listed {formatDate(listing._createdAt)}</span>
                      </div>
                      {viewCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{viewCount.toLocaleString()} views</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2 text-right sm:text-right">
                {/* Categories and Condition */}
                <div className="flex flex-wrap items-center gap-2">
                  {listing.category?.title && (
                    <Badge variant="outline">{listing.category?.title}</Badge>
                  )}
                  <Badge className={cn("text-xs", conditionConfig[listing.condition as keyof typeof conditionConfig]?.color || 'bg-gray-100 text-gray-800')}>
                    {conditionConfig[listing.condition as keyof typeof conditionConfig]?.label || listing.condition || 'N/A'}
                  </Badge>
                </div>

                    <div className="text-2xl sm:text-3xl font-bold text-primary">
                      {formatPrice(listing.price, listing.priceType)}
                    </div>

                  </div>
                </div>


                {/* Rating */}
                {listing.seller?.profile?.tier && (
                  <div className="flex items-center gap-1">
                    <Badge className={cn("text-xs", tierConfig[listing.seller.profile.tier as keyof typeof tierConfig]?.color || 'bg-gray-100 text-gray-700')}>
                      {tierConfig[listing.seller.profile.tier as keyof typeof tierConfig]?.icon || '👤'} {listing.seller.profile.tier}
                    </Badge>
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
            {/* Price Information Card */}
            <PriceInfoCard listing={listing} />
            
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
                      <div className="flex items-center gap-3 hover:opacity-80 transition-opacity relative z-0">
                        <Avatar className="w-12 h-12 z-0">
                          <AvatarImage src={listing.seller.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${listing.seller.profile?.username}`} />
                          <AvatarFallback>
                            {listing.seller.profile?.username?.charAt(0).toUpperCase() || listing.seller.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              {listing.seller.profile?.business_name || listing.seller.profile?.username || listing.seller.email || 'N/A'}
                            </h4>
                            {listing.seller.profile?.is_verified && (
                              <VerifiedBadge size="sm" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge className={cn("text-xs", tierConfig[listing.seller.profile?.tier as keyof typeof tierConfig]?.color || 'bg-gray-100 text-gray-700')}>
                              {tierConfig[listing.seller.profile?.tier as keyof typeof tierConfig]?.icon || '👤'} {listing.seller.profile?.tier || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Seller Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-primary">{listing.seller?.listingCount || 0}</div>
                        <div className="text-muted-foreground">Listings</div>
                      </div>
                      <div>
                        <div className="font-semibold text-green-600">{formatResponseTime()}</div>
                        <div className="text-muted-foreground">Response Time</div>
                      </div>
                      <div>
                        <div className="font-semibold text-yellow-500">{listing.seller?.profile?.customer_rating?.toFixed(1) || 'N/A'}</div>
                        <div className="text-muted-foreground">({listing.seller?.profile?.total_reviews || 0} reviews)</div>
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Actions */}
                    <div className="space-y-3">
                      {/* New CTA Buttons */}
                      <div className="space-y-2">
                        {/* WhatsApp button takes full width (double size) */}
                        <div className="w-full">
                          {listing.seller?.phone && (
                            <WhatsAppButton
                              phoneNumber={listing.seller.phone}
                              sellerName={listing.seller.profile?.business_name || listing.seller.profile?.username || 'Seller'}
                              className="w-full"
                            />
                          )}
                        </div>
                        
                        {/* Stacked layout for screens < 400px, side-by-side for larger screens */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full">
                          <div className="w-full sm:w-1/2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleCallSeller}
                              disabled={!getSellerPhone()}
                              className="flex items-center justify-center gap-2 h-12 w-full"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">Call</span>
                            </Button>
                          </div>
                          <div className="w-full sm:w-1/2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleMapSeller}
                              disabled={!getSellerMapUrl()}
                              className="flex items-center justify-center gap-2 h-12 w-full"
                            >
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">Map</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Alert variant="destructive">
                      <AlertDescription>
                        Seller information is not available for this listing.
                        {listing.supabaseId && (
                          <span className="block mt-2 text-sm">
                            Seller ID: {listing.supabaseId}
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                    <p className="text-muted-foreground text-sm mt-4">
                      This may be because the seller account has been deleted or the listing data is incomplete.
                    </p>
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
                  <div className="font-medium">{listing.location?.city || 'N/A'}</div>
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
        <div className="mt-12">
            <ListingReviews reviews={reviews} listingId={listing._id} />
          </div>

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

      {/* Safety Notice Modals */}
      <SafetyNoticeModal
        open={showMapSafetyModal}
        onClose={() => setShowMapSafetyModal(false)}
        onConfirm={handleMapConfirm}
        actionType="map"
        sellerName={listing.seller?.profile?.business_name || listing.seller?.profile?.username || 'Seller'}
      />
      
      <SafetyNoticeModal
        open={showCallSafetyModal}
        onClose={() => setShowCallSafetyModal(false)}
        onConfirm={handleCallConfirm}
        actionType="call"
        sellerName={listing.seller?.profile?.business_name || listing.seller?.profile?.username || 'Seller'}
      />

      {/* Fixed Bottom CTA Bar for Mobile */}
      {listing.seller && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{listing.title}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {formatPrice(listing.price, listing.priceType)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="w-12 h-14 p-1"
                  onClick={handleCallSeller}
                  disabled={!getSellerPhone() || listing.availability?.isAvailable === false}
                >
                  <Phone className="w-6 h-6" />
                </Button>
                {listing.seller?.phone && (
                  <div className="p-1 bg-[#25D366] rounded-md hover:bg-[#128C7E] cursor-pointer">
                    <WhatsAppButton
                      phoneNumber={listing.seller.phone}
                      sellerName={listing.seller.profile?.business_name || listing.seller.profile?.username || 'Seller'}
                      size="compact"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingDetailContent;