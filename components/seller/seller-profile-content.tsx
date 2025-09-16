'use client';

import React from 'react';
import Link from 'next/link';
import { VerifiedBadge } from '@/components/seller/verified-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { SellerTierBadge } from '@/components/seller/seller-tier-badge';
import { SellerStats } from '@/components/seller/seller-stats';
import { cn } from '@/lib/utils';
import { trackAnalyticsEventClient } from '@/lib/supabase-queries-client';
import { Listing } from '@/types';
import { 
  AlertCircle, 
  Shield, 
  ChevronDown, 
  MapPin, 
  Calendar, 
  Phone as PhoneIcon, 
  Mail, 
  Globe, 
  Building, 
  Star,
  Map,
  Phone,
} from 'lucide-react';
import { WhatsAppButton } from './whatsapp-button';

interface Seller {
  id: string;
  username: string;
  business_name?: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  website?: string;
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
  is_top_seller: boolean;
  tier: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  tier_points: number;
  verification_status: 'pending' | 'approved' | 'rejected' | 'under_review';
  business_hours?: Record<string, any>;
  response_time_avg: number;
  customer_rating: number;
  total_reviews: number;
  total_sales: number;
  created_at?: string;
  social_media_links?: Record<string, string>;
  business_type?: string;
  // Add optional fields for minimal seller data
  last_login?: string;
  active?: boolean;
  email_verified?: boolean;
  country?: string;
  notification_preferences?: Record<string, boolean>;
  preferred_language?: string;
  // Remove listing_count property since we calculate it from Sanity
}

// Using Listing type from '@/types'

interface Analytics {
  totalViews: number;
  totalContactClicks: number;
  totalWhatsAppClicks: number;
  totalListings: number;
  activeListings: number;
  avgSessionDuration?: number;
  uniqueUsers?: number;
}

interface SellerProfileContentProps {
  seller: Seller;
  listings: Listing[];
  analytics: Analytics;
}

const tierConfig = {
  basic: { 
    color: 'bg-gray-100 text-gray-700 border-gray-200', 
    icon: '🥉', 
    label: 'Basic',
    description: 'New seller getting started'
  },
  bronze: { 
    color: 'bg-orange-100 text-orange-700 border-orange-200', 
    icon: '🥉', 
    label: 'Bronze',
    description: 'Active seller with good performance'
  },
  silver: { 
    color: 'bg-gray-100 text-gray-700 border-gray-300', 
    icon: '🥈', 
    label: 'Silver',
    description: 'Experienced seller with great reviews'
  },
  gold: { 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
    icon: '🥇', 
    label: 'Gold',
    description: 'Top performer with excellent service'
  },
  platinum: { 
    color: 'bg-purple-100 text-purple-700 border-purple-200', 
    icon: '💎', 
    label: 'Platinum',
    description: 'Premium seller with outstanding reputation'
  },
  diamond: { 
    color: 'bg-blue-100 text-blue-700 border-blue-200', 
    icon: '💎', 
    label: 'Diamond',
    description: 'Elite seller with exceptional performance'
  }
};

const verificationConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Verification Pending', icon: AlertCircle },
  approved: { color: 'bg-green-100 text-green-800', label: 'Verified Seller', icon: VerifiedBadge },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Verification Failed', icon: AlertCircle },
  under_review: { color: 'bg-blue-100 text-blue-800', label: 'Under Review', icon: Shield }
};

export function SellerProfileContent({ seller, listings, analytics }: SellerProfileContentProps) {
  // Handle case where seller data might be incomplete
  if (!seller) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-destructive mb-2">Seller Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested seller profile could not be found or has been removed.
          </p>
          <Button asChild>
            <Link href="/">Browse Listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Safely extract seller properties with fallbacks
  const displayName = seller.business_name || seller.username || 'Unknown Seller';
  const joinDate = seller.created_at 
    ? new Date(seller.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })
    : 'Unknown';
  
  const responseTime = seller.response_time_avg > 0 
    ? `${Math.round(seller.response_time_avg / 60)} hours`
    : '< 1 hour';

  const [activeTab, setActiveTab] = React.useState('overview');
  const [showAllListings, setShowAllListings] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const displayedListings = showAllListings ? listings : listings.slice(0, 8);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `${displayName} - Seller Profile`,
        text: `Check out ${displayName}'s rental listings on RentParLo.pk`,
        url
      });
    } else {
      await navigator.clipboard.writeText(url);
      // Show toast notification
    }
  };

  const handleWhatsAppClick = async () => {
    // Track WhatsApp click using the proper Supabase function
    try {
      await trackAnalyticsEventClient({
        event_type: 'WhatsApp_click',
        user_id: seller.id,
        listing_id: null, // No listing ID for profile contact actions
        metadata: { contact_method: 'whatsapp_profile_view' }
      });
    } catch (error) {
      console.error('Error tracking WhatsApp click:', error);
    }
    
    // Open WhatsApp if phone number exists
    if (seller.phone) {
      window.open(`https://wa.me/${seller.phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleCallClick = async () => {
    // Track call click using the proper Supabase function
    try {
      await trackAnalyticsEventClient({
        event_type: 'contact_click',
        user_id: seller.id,
        listing_id: null, // No listing ID for profile contact actions
        metadata: { contact_method: 'call_profile_view' }
      });
    } catch (error) {
      console.error('Error tracking call click:', error);
    }
    
    // Initiate call if phone number exists
    if (seller.phone) {
      window.location.href = `tel:${seller.phone}`;
    }
  };

  const handleMapClick = async () => {
    // Track map click using the proper Supabase function
    try {
      await trackAnalyticsEventClient({
        event_type: 'map_click',
        user_id: seller.id,
        listing_id: null, // No listing ID for profile contact actions
        metadata: { contact_method: 'map_profile_view' }
      });
    } catch (error) {
      console.error('Error tracking map click:', error);
    }
    
    // Open map with location if city exists
    if (seller.city) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(seller.city + (seller.state ? ', ' + seller.state : '') + ', Pakistan')}`, '_blank');
    }
  };

  // Mobile-friendly tabs for smaller screens
  const renderMobileTabs = () => (
    <div className="md:hidden mb-6">
      <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="capitalize">{activeTab}</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-md">
          <DropdownMenuItem onSelect={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}>
            Overview
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { setActiveTab('listings'); setIsMobileMenuOpen(false); }}>
            Listings ({listings.length})
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { setActiveTab('reviews'); setIsMobileMenuOpen(false); }}>
            Reviews
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            {/* Profile Info */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start flex-1">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={seller.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${seller.username || 'U'}`}
                    alt={displayName}
                  />
                  <AvatarFallback className="text-xl sm:text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {seller.is_verified && (
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-green-500 text-white rounded-full p-1">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                      {displayName}
                    </h1>
                    <SellerTierBadge tier={seller.tier || 'basic'} points={seller.tier_points || 0} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    {seller.username && (
                      <span className="text-xs sm:text-sm">@{seller.username}</span>
                    )}
                    {seller.business_type && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs sm:text-sm">{seller.business_type}</span>
                      </>
                    )}
                    {/* Display listing count from listings array length */}
                    {listings.length > 0 && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs sm:text-sm">{listings.length} listings</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Verification Status */}
                {seller.verification_status && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    {seller.verification_status === 'approved' ? (
                      <VerifiedBadge size="sm" />
                    ) : (
                      React.createElement(
                        verificationConfig[seller.verification_status]?.icon || AlertCircle,
                        { className: "w-3 h-3 sm:w-4 sm:h-4" }
                      )
                    )}
                    <Badge 
                      className={cn(
                        "text-[10px] sm:text-xs py-0.5 px-1.5 sm:py-1 sm:px-2",
                        verificationConfig[seller.verification_status]?.color || "bg-gray-100 text-gray-800"
                      )}
                    >
                      {verificationConfig[seller.verification_status]?.label || seller.verification_status}
                    </Badge>
                  </div>
                )}

                {/* Location and Member since */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-muted-foreground">
                  {(seller.city || seller.state) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">
                        {seller.city}{seller.state ? `, ${seller.state}` : ''}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Member since {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Actions - WhatsApp, Call, and Map buttons */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3">
              <WhatsAppButton
                className="w-full sm:w-auto lg:w-full h-10 sm:h-11"
                size="default" 
                onClick={handleWhatsAppClick}
                phoneNumber={seller?.phone || ''}
                message={`Hi ${displayName}, I saw your profile on RentParLo.pk`}
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 sm:flex-none h-10 sm:h-11"
                  onClick={handleCallClick}
                >
                  <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2 text-xs sm:text-sm">Call</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 sm:flex-none h-10 sm:h-11"
                  onClick={handleMapClick}
                >
                  <Map className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2 text-xs sm:text-sm">Map</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Mobile Tabs */}
        {renderMobileTabs()}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Desktop Tabs - Now properly inside Tabs component */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
            {/* Stats Section - Moved from sidebar to main content */}
            <SellerStats 
              analytics={analytics}
              seller={seller}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {seller.bio ? (
                      <p className="text-muted-foreground text-sm sm:text-base">{seller.bio}</p>
                    ) : (
                      <p className="text-muted-foreground italic text-sm sm:text-base">
                        This seller hasn't provided a bio yet.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Business Hours */}
                {seller.business_hours && Object.keys(seller.business_hours).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">Business Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(seller.business_hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between text-sm sm:text-base">
                            <span className="capitalize">{day}:</span>
                            <span>{hours.open} - {hours.close}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Contact Information */}
              <div className="space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {seller.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{seller.phone}</span>
                      </div>
                    )}
                    {seller.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{seller.email}</span>
                      </div>
                    )}
                    {seller.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={seller.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          Website
                        </a>
                      </div>
                    )}
                    {(seller.city || seller.state) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {seller.city}{seller.state ? `, ${seller.state}` : ''}, Pakistan
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Social Media */}
                {seller.social_media_links && Object.keys(seller.social_media_links).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">Connect</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(seller.social_media_links).map(([platform, url]) => (
                          <Button key={platform} variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              {platform}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <div className="space-y-6">
              {listings.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {displayedListings.map((listing) => (
                      <div key={listing._id} className="h-full">
                        {/* Use the existing ListingCard component */}
                        {/* You'll need to import and use the appropriate listing card component here */}
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold text-sm sm:text-base">{listing.title}</h3>
                          <p className="text-muted-foreground text-xs sm:text-sm">{listing.category?.title}</p>
                          <p className="text-primary font-semibold mt-2 text-sm sm:text-base">
                            PKR {listing.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {listings.length > 8 && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAllListings(!showAllListings)}
                        className="text-sm"
                      >
                        {showAllListings ? 'Show Less' : `Show All ${listings.length} Listings`}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-muted/20 border rounded-lg p-6 sm:p-8 max-w-md mx-auto">
                    <Building className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">No Listings Found</h3>
                    <p className="text-muted-foreground text-sm sm:text-base mb-4">
                      This seller doesn't have any active listings at the moment.
                    </p>
                    <Button asChild size="sm">
                      <Link href="/">Browse Other Listings</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="text-center py-8 sm:py-12">
              <div className="bg-muted/20 border rounded-lg p-6 sm:p-8 max-w-md mx-auto">
                <Star className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Reviews Coming Soon</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Reviews and ratings for sellers will be available in a future update.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}