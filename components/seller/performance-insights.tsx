'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Target,
  Lightbulb,
  ArrowRight,
  Eye,
  Phone,
  Star,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Analytics {
  todayViews: number;
  todayContacts: number;
  weeklyViews: number;
  weeklyContacts: number;
  monthlyViews: number;
  monthlyContacts: number;
  totalEarnings: number;
  avgRating: number;
  responseRate: number;
}

interface Profile {
  total_listings: number;
  active_listings: number;
  total_views: number;
  total_contacts: number;
  success_rate: number;
  response_time: string;
  tier: string;
  is_verified: boolean;
}

interface Listing {
  _id: string;
  title: string;
  views: number;
  contactClicks: number;
  _createdAt: string;
}

interface PerformanceInsightsProps {
  analytics: Analytics;
  profile: Profile;
  listings: Listing[];
}

export function PerformanceInsights({ analytics, profile, listings }: PerformanceInsightsProps) {
  
  // Calculate insights
  const conversionRate = profile.total_views > 0 ? (profile.total_contacts / profile.total_views) * 100 : 0;
  const avgViewsPerListing = profile.active_listings > 0 ? profile.total_views / profile.active_listings : 0;
  const avgContactsPerListing = profile.active_listings > 0 ? profile.total_contacts / profile.active_listings : 0;
  
  // Get top performing listing
  const topPerformingListing = listings.reduce((top, listing) => 
    (listing.views || 0) > (top.views || 0) ? listing : top, listings[0] || null
  );
  
  // Get underperforming listings (less than 10 views in 30 days)
  const underperformingListings = listings.filter(listing => {
    const daysSinceCreated = Math.floor(
      (new Date().getTime() - new Date(listing._createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCreated >= 7 && (listing.views || 0) < 10;
  });

  // Performance score calculation
  const getPerformanceScore = () => {
    let score = 0;
    
    // Response rate (40% weight)
    score += (analytics.responseRate / 100) * 40;
    
    // Conversion rate (30% weight)
    score += Math.min(conversionRate / 5, 1) * 30; // Cap at 5% conversion rate
    
    // Rating (20% weight)
    score += (analytics.avgRating / 5) * 20;
    
    // Verification status (10% weight)
    score += profile.is_verified ? 10 : 0;
    
    return Math.round(score);
  };

  const performanceScore = getPerformanceScore();

  const insights = [
    {
      type: 'positive',
      icon: CheckCircle,
      title: 'Great Response Rate',
      description: `Your ${analytics.responseRate}% response rate is excellent. Keep responding quickly to maintain buyer trust.`,
      show: analytics.responseRate >= 80
    },
    {
      type: 'warning',
      icon: AlertCircle,
      title: 'Improve Response Time',
      description: `Consider responding faster to inquiries. Quick responses can increase your conversion rate by up to 40%.`,
      show: analytics.responseRate < 70
    },
    {
      type: 'tip',
      icon: Lightbulb,
      title: 'Optimize Your Listings',
      description: `${underperformingListings.length} listings have low views. Try updating photos or descriptions.`,
      show: underperformingListings.length > 0
    },
    {
      type: 'positive',
      icon: TrendingUp,
      title: 'High Conversion Rate',
      description: `Your ${conversionRate.toFixed(1)}% conversion rate is above average. Great job engaging with viewers!`,
      show: conversionRate >= 3
    },
    {
      type: 'tip',
      icon: Target,
      title: 'Boost Your Tier',
      description: `Get verified to unlock more features and increase buyer trust. This could boost your views by 25%.`,
      show: !profile.is_verified
    },
    {
      type: 'warning',
      icon: TrendingDown,
      title: 'Low Engagement',
      description: `Your conversion rate is ${conversionRate.toFixed(1)}%. Consider improving your listing descriptions and photos.`,
      show: conversionRate < 2
    }
  ];

  const visibleInsights = insights.filter(insight => insight.show);

  const recommendations = [
    {
      title: 'Upload High-Quality Photos',
      description: 'Listings with professional photos get 3x more views',
      priority: 'high',
      show: avgViewsPerListing < 50
    },
    {
      title: 'Complete Your Verification',
      description: 'Verified sellers get 25% more inquiries',
      priority: 'high',
      show: !profile.is_verified
    },
    {
      title: 'Respond Within 1 Hour',
      description: 'Fast responses increase conversion rates significantly',
      priority: 'medium',
      show: analytics.responseRate < 80
    },
    {
      title: 'Update Listing Descriptions',
      description: 'Detailed descriptions help buyers make decisions',
      priority: 'medium',
      show: underperformingListings.length > 0
    },
    {
      title: 'Set Competitive Prices',
      description: 'Research market rates to optimize your pricing',
      priority: 'low',
      show: conversionRate < 2
    }
  ];

  const visibleRecommendations = recommendations.filter(rec => rec.show).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">
                {performanceScore}/100
              </span>
              <Badge className={
                performanceScore >= 80 ? 'bg-green-100 text-green-800' :
                performanceScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {performanceScore >= 80 ? 'Excellent' :
                 performanceScore >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <Progress value={performanceScore} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Response Rate</div>
                <div className="font-medium">{analytics.responseRate}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Avg Rating</div>
                <div className="font-medium">{analytics.avgRating.toFixed(1)}/5</div>
              </div>
              <div>
                <div className="text-muted-foreground">Conversion Rate</div>
                <div className="font-medium">{conversionRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Verification</div>
                <div className="font-medium">{profile.is_verified ? 'Verified' : 'Pending'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Eye className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{avgViewsPerListing.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Avg Views per Listing</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Phone className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{avgContactsPerListing.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Contacts per Listing</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleInsights.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Great job! No specific insights at the moment. Keep up the good work!
              </p>
            ) : (
              visibleInsights.map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                  <Alert key={index} className={
                    insight.type === 'positive' ? 'border-green-200 bg-green-50' :
                    insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }>
                    <IconComponent className={`h-4 w-4 ${
                      insight.type === 'positive' ? 'text-green-600' :
                      insight.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <AlertDescription>
                      <div className="font-medium mb-1">{insight.title}</div>
                      <div className="text-sm">{insight.description}</div>
                    </AlertDescription>
                  </Alert>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {visibleRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visibleRecommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge variant={
                        rec.priority === 'high' ? 'destructive' :
                        rec.priority === 'medium' ? 'default' :
                        'secondary'
                      } className="text-xs">
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Listing */}
      {topPerformingListing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Top Performing Listing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium mb-1">{topPerformingListing.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {topPerformingListing.views || 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {topPerformingListing.contactClicks || 0} contacts
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PerformanceInsights;