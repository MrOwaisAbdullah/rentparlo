'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  Phone, 
  PlusCircle, 
  Settings, 
  TrendingUp, 
  Calendar, 
  Star,
  DollarSign,
  Users,
  Package,
  BarChart3,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardStats } from '@/components/seller/dashboard-stats';
import { DashboardChart } from '@/components/seller/dashboard-chart';
import { ListingManagement } from '@/components/seller/listing-management';
import { SellerTierBadge } from '@/components/seller/seller-tier-badge';
import { PerformanceInsights } from '@/components/seller/performance-insights';
import { QuickActions } from '@/components/seller/quick-actions';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DashboardData {
  profile: {
    id: string;
    username: string;
    business_name?: string;
    tier: 'basic' | 'premium' | 'gold';
    tier_points: number;
    is_verified: boolean;
    total_listings: number;
    active_listings: number;
    total_views: number;
    total_contacts: number;
    success_rate: number;
    response_time: string;
    member_since: string;
  };
  listings: Array<{
    _id: string;
    title: string;
    price: number;
    priceType: string;
    status: string;
    availability: string;
    images: string[];
    views: number;
    contactClicks: number;
    createdAt: string;
    updatedAt: string;
  }>;
  analytics: {
    todayViews: number;
    todayContacts: number;
    weeklyViews: number;
    weeklyContacts: number;
    monthlyViews: number;
    monthlyContacts: number;
    totalEarnings: number;
    avgRating: number;
    responseRate: number;
  };
  subscription?: {
    package_name: string;
    max_listings: number;
    expires_at: string;
    features: string[];
  };
}

interface DashboardContentProps {
  user: User;
  dashboardData: DashboardData;
}

export function DashboardContent({ user, dashboardData }: DashboardContentProps) {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = React.useState('30d');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { profile, listings, analytics, subscription } = dashboardData;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh page data
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getNextTierInfo = () => {
    const tierThresholds = {
      basic: { next: 'premium', pointsNeeded: 100 },
      premium: { next: 'gold', pointsNeeded: 500 },
      gold: { next: 'diamond', pointsNeeded: 1000 }
    };
    
    return tierThresholds[profile.tier as keyof typeof tierThresholds];
  };

  const nextTier = getNextTierInfo();
  const tierProgress = nextTier ? (profile.tier_points / nextTier.pointsNeeded) * 100 : 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {profile.business_name || user.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome to your seller dashboard. Member since {formatDate(profile.member_since)}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Tier Badge */}
              <SellerTierBadge 
                tier={profile.tier}
                points={profile.tier_points}
                isVerified={profile.is_verified}
                showProgress={true}
              />
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <Button
                  onClick={() => router.push('/dashboard/create-listing')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Listing
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <DashboardStats 
          analytics={analytics}
          profile={profile}
          period={selectedPeriod}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Charts & Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Analytics Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Analytics
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 3 months</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DashboardChart 
                  sellerId={profile.id}
                  period={selectedPeriod}
                />
              </CardContent>
            </Card>

            {/* Listings Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Your Listings
                  <Badge variant="secondary">
                    {profile.active_listings} active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ListingManagement 
                  listings={listings}
                  maxListings={subscription?.max_listings || 5}
                />
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <PerformanceInsights 
              analytics={analytics}
              profile={profile}
              listings={listings}
            />
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions 
              profile={profile}
              subscription={subscription}
            />

            {/* Tier Progress */}
            {nextTier && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tier Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Progress to {nextTier.next}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {profile.tier_points}/{nextTier.pointsNeeded} points
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(tierProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Earn points by:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Getting verified (+50 points)</li>
                      <li>Maintaining high ratings (+10 points/month)</li>
                      <li>Quick response times (+5 points/week)</li>
                      <li>Successful transactions (+2 points each)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Info */}
            {subscription && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subscription.package_name}</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Expires: {formatDate(subscription.expires_at)}</p>
                      <p>Max listings: {subscription.max_listings}</p>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Manage Subscription
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>{analytics.todayViews} views today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span>{analytics.todayContacts} contacts today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{analytics.avgRating.toFixed(1)} average rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span>{analytics.responseRate}% response rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;