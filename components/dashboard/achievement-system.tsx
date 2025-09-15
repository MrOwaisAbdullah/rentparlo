"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Star,
  Target,
  Award,
  CheckCircle,
  Lock,
  TrendingUp,
  Users,
  MessageCircle,
  Shield,
  Crown,
  Zap,
} from "lucide-react";
import { SellerProfile, SellerAnalytics } from "@/types/dashboard";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "performance" | "engagement" | "trust" | "growth" | "milestone";
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  points: number;
  requirement: {
    type: "score" | "count" | "rate" | "tier" | "streak";
    target: number;
    current?: number;
  };
  unlocked: boolean;
  unlockedAt?: string;
  reward?: {
    type: "badge" | "feature" | "discount" | "priority";
    description: string;
  };
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: "listings" | "views" | "contacts" | "ratings" | "tier";
  completed: boolean;
  completedAt?: string;
  nextMilestone?: {
    title: string;
    targetValue: number;
  };
}

interface AchievementSystemProps {
  seller: SellerProfile;
  analytics: SellerAnalytics;
  achievements: Achievement[];
  milestones: Milestone[];
}

export function AchievementSystem({
  seller,
  analytics,
  achievements,
  milestones,
}: AchievementSystemProps) {
  const getTierColor = (tier: string) => {
    const colors = {
      bronze: "text-orange-600 bg-orange-50 border-orange-200",
      silver: "text-gray-600 bg-gray-50 border-gray-200",
      gold: "text-yellow-600 bg-yellow-50 border-yellow-200",
      platinum: "text-purple-600 bg-purple-50 border-purple-200",
      diamond: "text-blue-600 bg-blue-50 border-blue-200",
    };
    return colors[tier as keyof typeof colors] || colors.bronze;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      performance: TrendingUp,
      engagement: Users,
      trust: Shield,
      growth: Target,
      milestone: Award,
    };
    return icons[category as keyof typeof icons] || Award;
  };

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);
  const recentAchievements = unlockedAchievements
    .filter((a) => a.unlockedAt)
    .sort(
      (a, b) =>
        new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
    )
    .slice(0, 3);

  const completedMilestones = milestones.filter((m) => m.completed);
  const activeMilestones = milestones.filter((m) => !m.completed);

  const totalPoints = unlockedAchievements.reduce(
    (sum, achievement) => sum + achievement.points,
    0
  );

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {unlockedAchievements.length}
                </div>
                <div className="text-sm text-gray-600">
                  Achievements Unlocked
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalPoints}</div>
                <div className="text-sm text-gray-600">Achievement Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold capitalize">
                  {seller.tier.name}
                </div>
                <div className="text-sm text-gray-600">Current Tier</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAchievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-lg ${getTierColor(achievement.tier)}`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <Badge
                          className={getTierColor(achievement.tier)}
                          variant="secondary"
                        >
                          {achievement.tier}
                        </Badge>
                        <Badge variant="outline" className="text-green-600">
                          +{achievement.points} points
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>
                      {achievement.reward && (
                        <p className="text-xs text-green-600 mt-1">
                          Reward: {achievement.reward.description}
                        </p>
                      )}
                    </div>

                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Milestones
          </CardTitle>
          <CardDescription>
            Track your progress towards key milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activeMilestones.slice(0, 4).map((milestone) => {
              const IconComponent = milestone.icon;
              const progress =
                (milestone.currentValue / milestone.targetValue) * 100;

              return (
                <div key={milestone.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{milestone.title}</h4>
                        <p className="text-sm text-gray-600">
                          {milestone.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {milestone.currentValue.toLocaleString()} /{" "}
                        {milestone.targetValue.toLocaleString()}{" "}
                        {milestone.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        {progress.toFixed(0)}% complete
                      </div>
                    </div>
                  </div>

                  <Progress value={progress} className="h-2" />

                  {milestone.nextMilestone && (
                    <div className="text-xs text-gray-500">
                      Next: {milestone.nextMilestone.title} (
                      {milestone.nextMilestone.targetValue.toLocaleString()}{" "}
                      {milestone.unit})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Available Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Available Achievements
          </CardTitle>
          <CardDescription>
            Unlock these achievements to earn points and rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {lockedAchievements.slice(0, 6).map((achievement) => {
              const IconComponent = achievement.icon;
              const CategoryIcon = getCategoryIcon(achievement.category);
              const progress = achievement.requirement.current
                ? (achievement.requirement.current /
                    achievement.requirement.target) *
                  100
                : 0;

              return (
                <div
                  key={achievement.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div
                        className={`p-2 rounded-lg ${getTierColor(achievement.tier)} opacity-60`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <Lock className="h-3 w-3 absolute -top-1 -right-1 text-gray-400" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-700">
                          {achievement.title}
                        </h4>
                        <Badge
                          className={getTierColor(achievement.tier)}
                          variant="secondary"
                          size="sm"
                        >
                          {achievement.tier}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>
                            {achievement.requirement.current || 0} /{" "}
                            {achievement.requirement.target}
                          </span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <CategoryIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 capitalize">
                            {achievement.category}
                          </span>
                        </div>
                        <Badge variant="outline" size="sm">
                          +{achievement.points} points
                        </Badge>
                      </div>

                      {achievement.reward && (
                        <p className="text-xs text-blue-600">
                          Reward: {achievement.reward.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {lockedAchievements.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="outline">
                View All Achievements ({lockedAchievements.length - 6} more)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completed Milestones
            </CardTitle>
            <CardDescription>
              Milestones you've already achieved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {completedMilestones.slice(0, 4).map((milestone) => {
                const IconComponent = milestone.icon;

                return (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-green-600" />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-green-600">
                        {milestone.targetValue.toLocaleString()}{" "}
                        {milestone.unit} achieved
                      </p>
                      {milestone.completedAt && (
                        <p className="text-xs text-green-500">
                          Completed{" "}
                          {new Date(milestone.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to generate sample achievements
export function generateSampleAchievements(
  seller: SellerProfile,
  analytics: SellerAnalytics
): Achievement[] {
  return [
    {
      id: "first-listing",
      title: "First Steps",
      description: "Create your first listing",
      icon: Target,
      category: "milestone",
      tier: "bronze",
      points: 10,
      requirement: {
        type: "count",
        target: 1,
        current: analytics.listingPerformance.length,
      },
      unlocked: analytics.listingPerformance.length >= 1,
      unlockedAt:
        analytics.listingPerformance.length >= 1 ? "2024-01-15" : undefined,
      reward: { type: "badge", description: "First Listing badge" },
    },
    {
      id: "verified-seller",
      title: "Verified Seller",
      description: "Complete email and phone verification",
      icon: Shield,
      category: "trust",
      tier: "silver",
      points: 25,
      requirement: {
        type: "count",
        target: 2,
        current:
          (seller.verificationStatus.emailVerified ? 1 : 0) +
          (seller.verificationStatus.phoneVerified ? 1 : 0),
      },
      unlocked:
        seller.verificationStatus.emailVerified &&
        seller.verificationStatus.phoneVerified,
      reward: { type: "feature", description: "Priority support access" },
    },
    {
      id: "hundred-views",
      title: "Popular Seller",
      description: "Reach 100 total views",
      icon: TrendingUp,
      category: "performance",
      tier: "silver",
      points: 30,
      requirement: {
        type: "count",
        target: 100,
        current: analytics.totalViews,
      },
      unlocked: analytics.totalViews >= 100,
      reward: { type: "badge", description: "Popular Seller badge" },
    },
    {
      id: "high-conversion",
      title: "Conversion Master",
      description: "Achieve 5% conversion rate",
      icon: Target,
      category: "performance",
      tier: "gold",
      points: 50,
      requirement: {
        type: "rate",
        target: 5,
        current: analytics.conversionRate,
      },
      unlocked: analytics.conversionRate >= 5,
      reward: { type: "feature", description: "Advanced analytics access" },
    },
    {
      id: "five-star-rating",
      title: "Five Star Service",
      description: "Maintain 5.0 star rating with 10+ reviews",
      icon: Star,
      category: "trust",
      tier: "platinum",
      points: 75,
      requirement: { type: "rate", target: 5, current: seller.avgRating },
      unlocked: seller.avgRating >= 5 && seller.totalRatings >= 10,
      reward: { type: "badge", description: "Five Star Service badge" },
    },
    {
      id: "business-verified",
      title: "Business Professional",
      description: "Complete business verification",
      icon: Award,
      category: "trust",
      tier: "gold",
      points: 40,
      requirement: {
        type: "count",
        target: 1,
        current: seller.verificationStatus.businessVerified ? 1 : 0,
      },
      unlocked: seller.verificationStatus.businessVerified,
      reward: {
        type: "feature",
        description: "Business badge and premium features",
      },
    },
  ];
}

// Helper function to generate sample milestones
export function generateSampleMilestones(
  seller: SellerProfile,
  analytics: SellerAnalytics
): Milestone[] {
  return [
    {
      id: "views-milestone",
      title: "Reach 1,000 Views",
      description: "Get 1,000 total views across all listings",
      icon: TrendingUp,
      targetValue: 1000,
      currentValue: analytics.totalViews,
      unit: "views",
      category: "views",
      completed: analytics.totalViews >= 1000,
      completedAt: analytics.totalViews >= 1000 ? "2024-02-01" : undefined,
      nextMilestone: { title: "Reach 5,000 Views", targetValue: 5000 },
    },
    {
      id: "contacts-milestone",
      title: "Get 100 Contacts",
      description: "Receive 100 customer contacts",
      icon: MessageCircle,
      targetValue: 100,
      currentValue: analytics.totalContacts,
      unit: "contacts",
      category: "contacts",
      completed: analytics.totalContacts >= 100,
      nextMilestone: { title: "Get 500 Contacts", targetValue: 500 },
    },
    {
      id: "listings-milestone",
      title: "Create 10 Listings",
      description: "Build a diverse portfolio of listings",
      icon: Target,
      targetValue: 10,
      currentValue: analytics.listingPerformance.length,
      unit: "listings",
      category: "listings",
      completed: analytics.listingPerformance.length >= 10,
      nextMilestone: { title: "Create 25 Listings", targetValue: 25 },
    },
    {
      id: "tier-milestone",
      title: "Reach Silver Tier",
      description: "Earn enough points to reach Silver tier",
      icon: Crown,
      targetValue: 500,
      currentValue: seller.tierPoints,
      unit: "points",
      category: "tier",
      completed: seller.tierPoints >= 500,
      nextMilestone: { title: "Reach Gold Tier", targetValue: 1500 },
    },
  ];
}
