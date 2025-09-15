"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  TrendingUp,
  Award,
  Target,
  CheckCircle,
  Lock,
  Gift,
  Zap,
  Crown,
  Trophy,
} from "lucide-react";
import Link from "next/link";

interface TierBenefit {
  name: string;
  description: string;
  available: boolean;
  comingSoon?: boolean;
}

interface TierRequirement {
  name: string;
  description: string;
  current: number;
  required: number;
  completed: boolean;
  unit?: string;
}

interface SellerTierData {
  currentTier: {
    name: "Bronze" | "Silver" | "Gold" | "Platinum";
    level: number;
    points: number;
    maxPoints: number;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  nextTier?: {
    name: "Bronze" | "Silver" | "Gold" | "Platinum";
    level: number;
    requiredPoints: number;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  benefits: TierBenefit[];
  requirements: TierRequirement[];
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    unlockedAt?: string;
    progress?: number;
    maxProgress?: number;
  }>;
  pointsHistory: Array<{
    date: string;
    points: number;
    reason: string;
    type: "earned" | "bonus" | "penalty";
  }>;
}

interface SellerTierManagementProps {
  sellerId: string;
  initialTierData?: SellerTierData;
}

const tierIcons = {
  Bronze: Award,
  Silver: Star,
  Gold: Crown,
  Platinum: Trophy,
};

const tierColors = {
  Bronze: "bg-orange-100 text-orange-800 border-orange-200",
  Silver: "bg-gray-100 text-gray-800 border-gray-200",
  Gold: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Platinum: "bg-purple-100 text-purple-800 border-purple-200",
};

export function SellerTierManagement({
  sellerId,
  initialTierData,
}: SellerTierManagementProps) {
  const [tierData, setTierData] = useState<SellerTierData>(
    initialTierData || {
      currentTier: {
        name: "Bronze",
        level: 1,
        points: 0,
        maxPoints: 100,
        color: "orange",
        icon: Award,
      },
      benefits: [],
      requirements: [],
      achievements: [],
      pointsHistory: [],
    }
  );

  const [loading, setLoading] = useState(false);

  const refreshTierData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/seller/tier-details?sellerId=${sellerId}`
      );
      if (response.ok) {
        const data = await response.json();
        setTierData(data);
      }
    } catch (error) {
      console.error("Error refreshing tier data:", error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage =
    (tierData.currentTier.points / tierData.currentTier.maxPoints) * 100;
  const pointsToNext = tierData.nextTier
    ? tierData.nextTier.requiredPoints - tierData.currentTier.points
    : 0;

  const CurrentTierIcon = tierData.currentTier.icon;
  const NextTierIcon = tierData.nextTier?.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Seller Tier Management</h2>
          <p className="text-muted-foreground">
            Track your progress and unlock new benefits
          </p>
        </div>
        <Button onClick={refreshTierData} variant="outline" disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Current Tier Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CurrentTierIcon className="h-5 w-5" />
            Current Tier Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${tierColors[tierData.currentTier.name].replace("text-", "bg-").replace("border-", "").replace("bg-", "bg-").split(" ")[0]}`}
              >
                <CurrentTierIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {tierData.currentTier.name} Tier
                </h3>
                <p className="text-sm text-muted-foreground">
                  Level {tierData.currentTier.level}
                </p>
              </div>
            </div>
            <Badge className={tierColors[tierData.currentTier.name]}>
              {tierData.currentTier.points} points
            </Badge>
          </div>

          {tierData.nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Progress to {tierData.nextTier.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tierData.currentTier.points}/
                  {tierData.nextTier.requiredPoints}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {pointsToNext} points needed for {tierData.nextTier.name} tier
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="benefits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Tier Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tierData.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        benefit.available
                          ? "bg-green-100 text-green-600"
                          : benefit.comingSoon
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {benefit.available ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : benefit.comingSoon ? (
                        <Zap className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{benefit.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {benefit.description}
                      </p>
                      {benefit.comingSoon && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tier Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tierData.requirements.map((requirement, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1 rounded ${
                            requirement.completed
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {requirement.completed ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Target className="h-3 w-3" />
                          )}
                        </div>
                        <span className="font-medium text-sm">
                          {requirement.name}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {requirement.current}/{requirement.required}{" "}
                        {requirement.unit || ""}
                      </span>
                    </div>
                    <Progress
                      value={(requirement.current / requirement.required) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {requirement.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tierData.achievements.map((achievement) => {
                  const AchievementIcon = achievement.icon;
                  const isUnlocked = !!achievement.unlockedAt;
                  const hasProgress =
                    achievement.progress !== undefined &&
                    achievement.maxProgress !== undefined;

                  return (
                    <div
                      key={achievement.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isUnlocked
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <AchievementIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {achievement.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        {hasProgress && !isUnlocked && (
                          <div className="mt-2 space-y-1">
                            <Progress
                              value={
                                (achievement.progress! /
                                  achievement.maxProgress!) *
                                100
                              }
                              className="h-1"
                            />
                            <p className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.maxProgress}
                            </p>
                          </div>
                        )}
                        {isUnlocked && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Unlocked{" "}
                            {new Date(
                              achievement.unlockedAt!
                            ).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Points History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tierData.pointsHistory.length > 0 ? (
                  tierData.pointsHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            entry.type === "earned"
                              ? "bg-green-100 text-green-600"
                              : entry.type === "bonus"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {entry.type === "earned" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : entry.type === "bonus" ? (
                            <Gift className="h-4 w-4" />
                          ) : (
                            <Target className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{entry.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          entry.type === "penalty" ? "destructive" : "default"
                        }
                      >
                        {entry.type === "penalty" ? "-" : "+"}
                        {entry.points} points
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No points history available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      {tierData.nextTier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Next Steps to {tierData.nextTier.name} Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                {NextTierIcon && (
                  <NextTierIcon className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <p className="font-medium text-sm">
                    Earn {pointsToNext} more points
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Complete more transactions and maintain high ratings
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/dashboard/listings">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Improve Listings
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/seller/verification">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Verification
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
