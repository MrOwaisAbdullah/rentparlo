'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SellerTierBadgeProps {
  tier: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  showPoints?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  className?: string;
}

const tierConfigs = {
  basic: {
    label: 'Basic',
    emoji: '⭐',
    color: 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200',
    gradient: 'from-gray-100 to-gray-200',
    description: 'New seller getting started',
    pointsRange: '0 - 499 points',
    benefits: ['Basic seller profile', 'Standard support', 'Basic analytics']
  },
  bronze: {
    label: 'Bronze',
    emoji: '🥉',
    color: 'bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-200',
    gradient: 'from-orange-100 to-orange-200',
    description: 'Active seller with good performance',
    pointsRange: '500 - 1,499 points',
    benefits: ['Enhanced profile visibility', 'Priority support', 'Extended analytics']
  },
  silver: {
    label: 'Silver',
    emoji: '🥈',
    color: 'bg-slate-100 text-slate-900 border-slate-400 hover:bg-slate-200',
    gradient: 'from-slate-100 to-slate-200',
    description: 'Experienced seller with great reviews',
    pointsRange: '1,500 - 4,999 points',
    benefits: ['Featured in search results', 'Advanced analytics', 'Custom branding options']
  },
  gold: {
    label: 'Gold',
    emoji: '🥇',
    color: 'bg-yellow-100 text-yellow-900 border-yellow-300 hover:bg-yellow-200',
    gradient: 'from-yellow-100 to-yellow-200',
    description: 'Top performer with excellent service',
    pointsRange: '5,000 - 14,999 points',
    benefits: ['Top seller badge', 'Premium placement', 'Dedicated account manager']
  },
  platinum: {
    label: 'Platinum',
    emoji: '👑',
    color: 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200',
    gradient: 'from-purple-100 to-purple-200',
    description: 'Premium seller with outstanding reputation',
    pointsRange: '15,000 - 49,999 points',
    benefits: ['VIP support', 'Marketing assistance', 'Revenue optimization tools']
  },
  diamond: {
    label: 'Diamond',
    emoji: '💎',
    color: 'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200',
    gradient: 'from-blue-100 via-blue-200 to-blue-300',
    description: 'Elite seller with exceptional performance',
    pointsRange: '50,000+ points',
    benefits: ['Exclusive elite status', 'Personal success manager', 'Custom partnership opportunities']
  }
};

const sizeConfigs = {
  sm: {
    badge: 'text-xs px-2 py-1',
    points: 'text-xs ml-1'
  },
  md: {
    badge: 'text-sm px-3 py-1.5',
    points: 'text-sm ml-2'
  },
  lg: {
    badge: 'text-base px-4 py-2',
    points: 'text-base ml-2'
  }
};

export function SellerTierBadge({ 
  tier, 
  points, 
  showPoints = false, 
  size = 'md',
  variant = 'default',
  className 
}: SellerTierBadgeProps) {
  const config = tierConfigs[tier];
  const sizeConfig = sizeConfigs[size];

  // Calculate progress to next tier
  const getNextTierProgress = () => {
    const thresholds = {
      basic: { current: 0, next: 500 },
      bronze: { current: 500, next: 1500 },
      silver: { current: 1500, next: 5000 },
      gold: { current: 5000, next: 15000 },
      platinum: { current: 15000, next: 50000 },
      diamond: { current: 50000, next: 100000 } // Set a high next threshold for diamond
    };

    const threshold = thresholds[tier];
    if (!threshold) return null;

    const progress = threshold.next 
      ? ((points - threshold.current) / (threshold.next - threshold.current)) * 100
      : 100; // For diamond tier, show 100% progress
      
    return {
      progress: Math.min(100, Math.max(0, progress)),
      pointsToNext: threshold.next ? threshold.next - points : 0,
      nextTier: Object.keys(thresholds)[Object.keys(thresholds).indexOf(tier) + 1] || null
    };
  };

  const progressInfo = getNextTierProgress();

  // Special handling for new sellers with 0 points
  const isNewSeller = points === 0 && tier === 'basic';

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={cn(
                config.color,
                sizeConfig.badge,
                'cursor-help transition-colors !text-gray-900',
                className
              )}
            >
              <span className="mr-1">{config.emoji}</span>
              {config.label}
              {showPoints && (
                <span className={cn(sizeConfig.points, '!text-gray-900')}>{points.toLocaleString()}</span>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs bg-background border border-muted">
            <div className="space-y-3">
              <div className="font-semibold !text-gray-900">{config.label} Seller</div>
              <div className="text-sm text-muted-foreground">{config.description}</div>
              
              {isNewSeller ? (
                <div className="text-xs space-y-2">
                  <div>
                    <div className="font-medium !text-gray-900">Welcome! 👋</div>
                    <div className="!text-gray-800">Start earning points by:</div>
                    <ul className="list-disc list-inside mt-1 space-y-1 !text-gray-800">
                      <li>Getting profile views</li>
                      <li>Receiving contact requests</li>
                      <li>Making sales</li>
                      <li>Getting good reviews</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium !text-gray-900">Next Milestone:</div>
                    <div className="!text-gray-800">Earn 500 points to reach Bronze tier</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs">
                  <div className="!text-gray-800">{points.toLocaleString()} points ({config.pointsRange})</div>
                  {progressInfo && progressInfo.nextTier && (
                    <div className="mt-1">
                      {progressInfo.pointsToNext > 0 ? (
                        <span className="!text-gray-800">{progressInfo.pointsToNext.toLocaleString()} points to {progressInfo.nextTier}</span>
                      ) : (
                        <span className="!text-gray-800">Maximum tier achieved!</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-center', className)}>
            <Badge 
              className={cn(
                config.color,
                sizeConfig.badge,
                'cursor-help transition-colors font-medium !text-gray-900',
                `bg-gradient-to-r ${config.gradient}`
              )}
            >
              <span className="mr-1">{config.emoji}</span>
              {config.label}
              {showPoints && (
                <span className={cn(sizeConfig.points, '!text-gray-900')}>
                  ({points.toLocaleString()})
                </span>
              )}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm bg-background border border-muted">
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-base !text-gray-900">{config.label} Seller</div>
              <div className="text-sm text-muted-foreground">{config.description}</div>
            </div>
            
            {isNewSeller ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="font-medium !text-blue-900">🚀 Getting Started</div>
                  <div className="text-sm !text-blue-800 mt-1">
                    Welcome to RentParlo! Start building your seller reputation by:
                  </div>
                  <ul className="text-sm !text-blue-800 list-disc list-inside mt-2 space-y-1">
                    <li>Completing your seller profile</li>
                    <li>Adding quality listings with good photos</li>
                    <li>Responding quickly to customer inquiries</li>
                    <li>Providing excellent service to earn reviews</li>
                  </ul>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2 !text-gray-900">How Tier Points Work</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="!text-gray-800">• Profile views: 10 points each</p>
                    <p className="!text-gray-800">• Contact requests: 20 points each</p>
                    <p className="!text-gray-800">• Successful rentals: 50 points each</p>
                    <p className="!text-gray-800">• Positive reviews: 30 points each</p>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2 !text-gray-900">Your First Goal</div>
                  <div className="text-sm !text-gray-800">Earn 500 points to reach Bronze tier</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: '0%' }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    0 / 500 points
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="text-sm font-medium mb-1 !text-gray-900">Current Points</div>
                  <div className="text-sm !text-gray-800">{points.toLocaleString()} points</div>
                  <div className="text-xs text-muted-foreground">{config.pointsRange}</div>
                </div>

                {progressInfo && progressInfo.nextTier && progressInfo.pointsToNext > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-1 !text-gray-900">Progress to Next Tier</div>
                    <div className="w-full bg-muted rounded-full h-2 mb-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progressInfo.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {progressInfo.pointsToNext.toLocaleString()} points to {progressInfo.nextTier}
                    </div>
                  </div>
                )}

                {progressInfo && progressInfo.nextTier === null && (
                  <div className="text-sm !text-green-800 font-medium">
                    Congratulations! You've reached the highest tier.
                  </div>
                )}
              </>
            )}

            <div>
              <div className="text-sm font-medium mb-2 !text-gray-900">Tier Benefits</div>
              <ul className="text-xs space-y-1">
                {config.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="!text-green-700 mt-0.5">•</span>
                    <span className="!text-gray-800">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper component for displaying tier progression
export function TierProgressBar({ 
  currentTier, 
  currentPoints, 
  className 
}: {
  currentTier: string;
  currentPoints: number;
  className?: string;
}) {
  const tiers = ['basic', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const thresholds = [0, 500, 1500, 5000, 15000, 50000];
  
  const currentIndex = tiers.indexOf(currentTier);
  const nextThreshold = thresholds[currentIndex + 1];
  
  if (!nextThreshold) return null;
  
  const progress = ((currentPoints - thresholds[currentIndex]) / (nextThreshold - thresholds[currentIndex])) * 100;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="capitalize !text-gray-900">{currentTier}</span>
        <span className="capitalize !text-gray-900">{tiers[currentIndex + 1]}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-center">
        {currentPoints.toLocaleString()} / {nextThreshold.toLocaleString()} points
      </div>
    </div>
  );
}

export default SellerTierBadge;