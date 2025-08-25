'use client';

import React from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  Shield, 
  BarChart3,
  FileText,
  Users,
  MessageSquare,
  Download,
  Bell,
  Camera,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Profile {
  tier: string;
  is_verified: boolean;
  total_listings: number;
  active_listings: number;
}

interface Subscription {
  package_name: string;
  max_listings: number;
  expires_at: string;
  features: string[];
}

interface QuickActionsProps {
  profile: Profile;
  subscription?: Subscription;
}

export function QuickActions({ profile, subscription }: QuickActionsProps) {
  const usagePercentage = subscription ? (profile.active_listings / subscription.max_listings) * 100 : 0;
  
  const quickActions = [
    {
      title: 'Add New Listing',
      description: 'Create a new rental listing',
      icon: PlusCircle,
      href: '/dashboard/create-listing',
      color: 'bg-green-600 hover:bg-green-700',
      disabled: subscription ? profile.active_listings >= subscription.max_listings : false
    },
    {
      title: 'Analytics Report',
      description: 'Download detailed analytics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Messages',
      description: 'Check customer inquiries',
      icon: MessageSquare,
      href: '/dashboard/messages',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Settings',
      description: 'Manage your account',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  const verificationSteps = [
    {
      title: 'Upload CNIC',
      description: 'Upload a clear photo of your CNIC',
      completed: profile.is_verified,
      icon: Camera
    },
    {
      title: 'Business Info',
      description: 'Complete your business information',
      completed: profile.is_verified,
      icon: FileText
    },
    {
      title: 'Phone Verification',
      description: 'Verify your phone number',
      completed: profile.is_verified,
      icon: Shield
    }
  ];

  const tierBenefits = {
    basic: [
      'Up to 5 listings',
      'Basic analytics',
      'Email support'
    ],
    premium: [
      'Up to 20 listings',
      'Advanced analytics',
      'Priority support',
      'Featured listings'
    ],
    gold: [
      'Up to 50 listings',
      'Real-time analytics',
      'Phone support',
      'Premium badge',
      'Top search ranking'
    ]
  };

  const currentBenefits = tierBenefits[profile.tier as keyof typeof tierBenefits] || tierBenefits.basic;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link 
                  key={index} 
                  href={action.href}
                  className={action.disabled ? 'pointer-events-none' : ''}
                >
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start h-auto p-4 ${action.disabled ? 'opacity-50' : ''}`}
                    disabled={action.disabled}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Listing Usage */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Listing Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {profile.active_listings} of {subscription.max_listings} listings used
                </span>
                <span className="text-sm font-medium">
                  {usagePercentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              {usagePercentage >= 80 && (
                <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  You're approaching your listing limit. Consider upgrading your plan.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Status */}
      {!profile.is_verified && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Get Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Complete verification to gain buyer trust and unlock premium features.
              </p>
              
              <div className="space-y-3">
                {verificationSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          step.completed ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button asChild className="w-full">
                <Link href="/dashboard/verification">
                  Start Verification
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)} Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
            
            {profile.tier !== 'gold' && (
              <div className="pt-3 border-t">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/dashboard/upgrade">
                    Upgrade to {profile.tier === 'basic' ? 'Premium' : 'Gold'}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" size="sm" asChild className="w-full justify-start">
              <Link href="/help">
                <FileText className="w-4 h-4 mr-2" />
                Help Center
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild className="w-full justify-start">
              <Link href="/support">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild className="w-full justify-start">
              <Link href="/tutorials">
                <Users className="w-4 h-4 mr-2" />
                Video Tutorials
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            <Badge variant="secondary">2</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium">New inquiry received</div>
              <div className="text-muted-foreground">Someone is interested in your camera</div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium">Listing approved</div>
              <div className="text-muted-foreground">Your laptop listing is now live</div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              View All Notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuickActions;