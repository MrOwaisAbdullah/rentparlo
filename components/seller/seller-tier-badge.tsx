'use client';

import React from 'react';
import { Crown, Award, Star, Trophy, Gem } from 'lucide-react';
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
    icon: Star,
    color: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
    gradient: 'from-gray-100 to-gray-200',
    description: 'New seller getting started',
    pointsRange: '0 - 499 points',
    benefits: ['Basic seller profile', 'Standard support', 'Basic analytics']
  },
  bronze: {
    label: 'Bronze',
    icon: Award,
    color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
    gradient: 'from-orange-100 to-orange-200',
    description: 'Active seller with good performance',
    pointsRange: '500 - 1,499 points',
    benefits: ['Enhanced profile visibility', 'Priority support', 'Extended analytics']
  },
  silver: {
    label: 'Silver',
    icon: Award,
    color: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
    gradient: 'from-slate-100 to-slate-200',
    description: 'Experienced seller with great reviews',
    pointsRange: '1,500 - 4,999 points',
    benefits: ['Featured in search results', 'Advanced analytics', 'Custom branding options']
  },
  gold: {
    label: 'Gold',
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
    gradient: 'from-yellow-100 to-yellow-200',
    description: 'Top performer with excellent service',
    pointsRange: '5,000 - 14,999 points',
    benefits: ['Top seller badge', 'Premium placement', 'Dedicated account manager']
  },
  platinum: {
    label: 'Platinum',
    icon: Trophy,
    color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
    gradient: 'from-purple-100 to-purple-200',
    description: 'Premium seller with outstanding reputation',
    pointsRange: '15,000 - 49,999 points',
    benefits: ['VIP support', 'Marketing assistance', 'Revenue optimization tools']
  },
  diamond: {
    label: 'Diamond',
    icon: Gem,
    color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
    gradient: 'from-blue-100 via-blue-200 to-blue-300',
    description: 'Elite seller with exceptional performance',
    pointsRange: '50,000+ points',
    benefits: ['Exclusive elite status', 'Personal success manager', 'Custom partnership opportunities']
  }
};

const sizeConfigs = {
  sm: {
    badge: 'text-xs px-2 py-1',
    icon: 'w-3 h-3',
    points: 'text-xs ml-1'
  },
  md: {
    badge: 'text-sm px-3 py-1.5',
    icon: 'w-4 h-4',
    points: 'text-sm ml-2'
  },
  lg: {
    badge: 'text-base px-4 py-2',
    icon: 'w-5 h-5',
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
  const IconComponent = config.icon;

  // Calculate progress to next tier
  const getNextTierProgress = () => {
    const thresholds = {
      basic: { current: 0, next: 500 },
      bronze: { current: 500, next: 1500 },
      silver: { current: 1500, next: 5000 },
      gold: { current: 5000, next: 15000 },
      platinum: { current: 15000, next: 50000 },
      diamond: { current: 50000, next: null }
    };

    const threshold = thresholds[tier];
    if (!threshold.next) return null;

    const progress = ((points - threshold.current) / (threshold.next - threshold.current)) * 100;
    return {
      progress: Math.min(100, Math.max(0, progress)),
      pointsToNext: threshold.next - points,
      nextTier: Object.keys(thresholds)[Object.keys(thresholds).indexOf(tier) + 1]
    };
  };

  const progressInfo = getNextTierProgress();

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={cn(
                config.color,
                sizeConfig.badge,
                'cursor-help transition-colors',
                className
              )}
            >
              <IconComponent className={sizeConfig.icon} />
              {showPoints && (
                <span className={sizeConfig.points}>{points.toLocaleString()}</span>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-semibold">{config.label} Seller</div>
              <div className="text-sm text-muted-foreground">{config.description}</div>
              <div className="text-xs">
                <div>{points.toLocaleString()} points ({config.pointsRange})</div>
                {progressInfo && (
                  <div className="mt-1">
                    {progressInfo.pointsToNext > 0 ? (
                      <span>{progressInfo.pointsToNext.toLocaleString()} points to {progressInfo.nextTier}</span>
                    ) : (
                      <span>Maximum tier achieved!</span>
                    )}
                  </div>
                )}
              </div>
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
                'cursor-help transition-colors font-medium',
                `bg-gradient-to-r ${config.gradient}`
              )}
            >
              <IconComponent className={cn(sizeConfig.icon, 'mr-1')} />
              {config.label}
              {showPoints && (
                <span className={sizeConfig.points}>
                  ({points.toLocaleString()})
                </span>
              )}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          <div className="space-y-3">
            <div>
              <div className="font-semibold text-base">{config.label} Seller</div>
              <div className="text-sm text-muted-foreground">{config.description}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">Current Points</div>
              <div className="text-sm">{points.toLocaleString()} points</div>
              <div className="text-xs text-muted-foreground">{config.pointsRange}</div>
            </div>

            {progressInfo && progressInfo.pointsToNext > 0 && (
              <div>
                <div className="text-sm font-medium mb-1">Progress to Next Tier</div>
                <div className="w-full bg-muted rounded-full h-2 mb-1">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progressInfo.progress}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {progressInfo.pointsToNext.toLocaleString()} points to {progressInfo.nextTier}
                </div>
              </div>
            )}

            <div>
              <div className="text-sm font-medium mb-2">Tier Benefits</div>
              <ul className="text-xs space-y-1">
                {config.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{benefit}</span>
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
        <span className="capitalize">{currentTier}</span>
        <span className="capitalize">{tiers[currentIndex + 1]}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300" 
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