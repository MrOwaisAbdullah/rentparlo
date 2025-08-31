'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Star, Shield, MapPin, Calendar, Phone, Mail, MessageCircle,
  Globe, Clock, Award, TrendingUp, Eye, Heart, Share2,
  User, Building, CheckCircle, AlertCircle, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeaturedListings } from '@/components/sections/featured-listings';
import { SellerTierBadge } from '@/components/seller/seller-tier-badge';
import { SellerStats } from '@/components/seller/seller-stats';
import { SellerContact } from '@/components/seller/seller-contact';
import { cn } from '@/lib/utils';
import { Listing } from '@/types';

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
  created_at: string;
  social_media_links?: Record<string, string>;
  business_type?: string;
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
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Verification Pending', icon: Clock },
  approved: { color: 'bg-green-100 text-green-800', label: 'Verified Seller', icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Verification Failed', icon: AlertCircle },
  under_review: { color: 'bg-blue-100 text-blue-800', label: 'Under Review', icon: Clock }
};

export function SellerProfileContent({ seller, listings, analytics }: SellerProfileContentProps) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showAllListings, setShowAllListings] = React.useState(false);

  // Handle case where seller data might be incomplete
  if (!seller) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Seller information is not available. The seller profile may have been removed or the data is incomplete.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayName = seller.business_name || seller.username || 'Unknown Seller';
  const joinDate = new Date(seller.created_at || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  const responseTime = seller.response_time_avg > 0 
    ? `${Math.round(seller.response_time_avg / 60)} hours`
    : '< 1 hour';

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

  const handleContact = () => {
    // Track contact click
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'contact_click',
        seller_id: seller.id,
        metadata: { contact_method: 'profile_view' }
      })
    }).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Profile Info */}
            <div className="flex flex-col sm:flex-row gap-6 items-start flex-1">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={seller.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${seller.username || 'U'}`}
                    alt={displayName}
                  />
                  <AvatarFallback className="text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {seller.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <Shield className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {displayName}
                    </h1>
                    <SellerTierBadge tier={seller.tier || 'basic'} points={seller.tier_points || 0} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    {seller.username && (
                      <span className="text-sm">@{seller.username}</span>
                    )}
                    {seller.business_type && (
                      <>
                        <span>•</span>
                        <span className="text-sm">{seller.business_type}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Verification Status */}
                {seller.verification_status && (
                  <div className="flex items-center gap-2">
                    {React.createElement(
                      verificationConfig[seller.verification_status]?.icon || AlertCircle,
                      { className: "w-4 h-4" }
                    )}
                    <Badge 
                      className={cn(
                        "text-xs",
                        verificationConfig[seller.verification_status]?.color || "bg-gray-100 text-gray-800"
                      )}
                    >
                      {verificationConfig[seller.verification_status]?.label || seller.verification_status}
                    </Badge>
                  </div>
                )}

                {/* Location */}
                {(seller.city || seller.state) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {seller.city}{seller.state ? `, ${seller.state}` : ''}
                    </span>
                  </div>
                )}

                {/* Member since */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Member since {joinDate}</span>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <Button 
                className="w-full lg:w-auto" 
                onClick={() => {
                  handleContact();
                  // Open contact modal or perform contact action
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">
              Listings ({analytics.totalListings})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({seller.total_reviews})
            </TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <SellerStats analytics={analytics} seller={seller} />

            {/* Recent Listings */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Listings</h2>
                {listings.length > 4 && (
                  <Button variant="outline" asChild>
                    <Link href={`/seller/${seller.username}?tab=listings`}>
                      View All →
                    </Link>
                  </Button>
                )}
              </div>
              
              {listings.length > 0 ? (
                <FeaturedListings listings={listings.slice(0, 4)} />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No listings available at the moment.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Listings ({analytics.totalListings})</h2>
              {/* Add filter/sort options here */}
            </div>

            {listings.length > 0 ? (
              <>
                <FeaturedListings listings={displayedListings} />
                
                {!showAllListings && listings.length > 8 && (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAllListings(true)}
                    >
                      Show All {listings.length} Listings
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-lg text-muted-foreground mb-4">
                    This seller hasn't posted any listings yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new listings!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              {seller.customer_rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-5 h-5",
                          i < Math.floor(seller.customer_rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{seller.customer_rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({seller.total_reviews} reviews)</span>
                </div>
              )}
            </div>

            {/* Reviews content - placeholder for now */}
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Reviews section will be implemented with the review system integration.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {seller.business_name && (
                    <div>
                      <label className="font-medium text-sm text-muted-foreground">Business Name</label>
                      <p className="text-foreground">{seller.business_name}</p>
                    </div>
                  )}
                  
                  {seller.owner_name && (
                    <div>
                      <label className="font-medium text-sm text-muted-foreground">Owner Name</label>
                      <p className="text-foreground">{seller.owner_name}</p>
                    </div>
                  )}
                  
                  {seller.business_type && (
                    <div>
                      <label className="font-medium text-sm text-muted-foreground">Business Type</label>
                      <p className="text-foreground">{seller.business_type}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Member Since</label>
                    <p className="text-foreground">{joinDate}</p>
                  </div>
                  
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Total Sales</label>
                    <p className="text-foreground">{seller.total_sales} transactions</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact & Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {seller.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={seller.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {seller.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{seller.city}, {seller.state || 'Pakistan'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Average response time: {responseTime}</span>
                  </div>

                  {/* Social Media Links */}
                  {seller.social_media_links && Object.keys(seller.social_media_links).length > 0 && (
                    <div>
                      <label className="font-medium text-sm text-muted-foreground block mb-2">
                        Social Media
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(seller.social_media_links).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm bg-muted px-3 py-1 rounded-full hover:bg-muted/80 transition-colors"
                          >
                            {platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Business Hours */}
            {seller.business_hours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(seller.business_hours).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="font-medium capitalize">{day}</span>
                        <span className="text-muted-foreground">
                          {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SellerProfileContent;