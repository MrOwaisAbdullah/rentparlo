'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, Share2, 
  // Flag,
  MapPin, Calendar,
  Shield, Eye, MessageCircle, Phone,
  ChevronLeft, ChevronRight,
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
import { PriceInfoCard } from '@/components/listing/price-info-card';
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
      window.location.href = `tel:${phone}`;
    }
  };

  // Handle WhatsApp action
  const handleWhatsAppSeller = () => {
    const phone = getSellerPhone();
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  // Handle map action
  const handleMapSeller = () => {
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
              <div className="aspect-[16/9] sm:aspect-[21/9] relative overflow-hidden rounded-lg bg-muted">
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
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 p-0 bg-white/90 hover:bg-white"
                      onClick={previousImage}
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 p-0 bg-white/90 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
                <div className="absolute top-4 right-4 flex md:flex-col gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 sm:w-10 sm:h-10 p-0 bg-white/90 hover:bg-white"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart className={cn("w-3 h-3 sm:w-4 sm:h-4", isFavorited && "fill-red-500 text-red-500")} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 sm:w-10 sm:h-10 p-0 bg-white/90 hover:bg-white"
                    onClick={handleShare}
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  {/* Temporary Disabled */}
                  {/* <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 sm:w-10 sm:h-10 p-0 bg-white/90 hover:bg-white"
                  >
                    <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
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
                              <Shield className="w-4 h-4 text-green-600" />
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
                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-primary">{listing.seller?.listingCount || 0}</div>
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
                        disabled={listing.availability?.isAvailable === false}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {listing.availability?.isAvailable !== false ? 'Send Message' : 'Not Available'}
                      </Button>
        
                      {/* New CTA Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCallSeller}
                          disabled={!getSellerPhone()}
                          className="flex flex-col items-center justify-center h-16"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="text-xs mt-1">Call</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleWhatsAppSeller}
                          disabled={!getSellerPhone()}
                          className="flex flex-col items-center justify-center h-16"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span className="text-xs mt-1">WhatsApp</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleMapSeller}
                          disabled={!getSellerMapUrl()}
                          className="flex flex-col items-center justify-center h-16"
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs mt-1">Map</span>
                        </Button>
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
                  size="sm" 
                  onClick={handleCallSeller}
                  disabled={!getSellerPhone() || listing.availability?.isAvailable === false}
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm"
                  onClick={handleWhatsAppSeller}
                  disabled={!getSellerPhone() || listing.availability?.isAvailable === false}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </Button>
                <Button 
                  size="sm"
                  onClick={handleContactSeller}
                  disabled={listing.availability?.isAvailable === false}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingDetailContent;