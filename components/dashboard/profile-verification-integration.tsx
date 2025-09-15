"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  TrendingUp,
  Settings,
  Upload,
  Phone,
  Mail,
  FileText,
  Building,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface VerificationStatus {
  isVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  documentVerified: boolean;
  businessVerified: boolean;
  verificationLevel: "none" | "basic" | "standard" | "premium";
  pendingDocuments: string[];
  rejectedDocuments: Array<{
    type: string;
    reason: string;
    rejectedAt: string;
  }>;
}

interface SellerTier {
  name: "Bronze" | "Silver" | "Gold" | "Platinum";
  level: number;
  points: number;
  maxPoints: number;
  benefits: string[];
  nextTierRequirements: string[];
}

interface ProfileCompletionData {
  completionPercentage: number;
  missingFields: Array<{
    field: string;
    label: string;
    importance: "high" | "medium" | "low";
    description: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    actionUrl: string;
    priority: "high" | "medium" | "low";
  }>;
}

interface ProfileVerificationIntegrationProps {
  sellerId: string;
  initialVerificationStatus?: VerificationStatus;
  initialTierData?: SellerTier;
  initialProfileCompletion?: ProfileCompletionData;
}

export function ProfileVerificationIntegration({
  sellerId,
  initialVerificationStatus,
  initialTierData,
  initialProfileCompletion,
}: ProfileVerificationIntegrationProps) {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(
      initialVerificationStatus || {
        isVerified: false,
        phoneVerified: false,
        emailVerified: false,
        documentVerified: false,
        businessVerified: false,
        verificationLevel: "none",
        pendingDocuments: [],
        rejectedDocuments: [],
      }
    );

  const [tierData, setTierData] = useState<SellerTier>(
    initialTierData || {
      name: "Bronze",
      level: 1,
      points: 0,
      maxPoints: 100,
      benefits: [],
      nextTierRequirements: [],
    }
  );

  const [profileCompletion, setProfileCompletion] =
    useState<ProfileCompletionData>(
      initialProfileCompletion || {
        completionPercentage: 0,
        missingFields: [],
        recommendations: [],
      }
    );

  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Fetch updated verification status, tier data, and profile completion
      const [verificationRes, tierRes, profileRes] = await Promise.all([
        fetch(`/api/verification/status?sellerId=${sellerId}`),
        fetch(`/api/seller/tier?sellerId=${sellerId}`),
        fetch(`/api/profile/completion?sellerId=${sellerId}`),
      ]);

      if (verificationRes.ok) {
        const verificationData = await verificationRes.json();
        setVerificationStatus(verificationData);
      }

      if (tierRes.ok) {
        const tierDataRes = await tierRes.json();
        setTierData(tierDataRes);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfileCompletion(profileData);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh profile data");
    } finally {
      setLoading(false);
    }
  };

  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "standard":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "basic":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case "Platinum":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Silver":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const verificationSteps = [
    {
      key: "emailVerified",
      label: "Email Verification",
      icon: Mail,
      completed: verificationStatus.emailVerified,
      actionUrl: "/dashboard/profile#email",
    },
    {
      key: "phoneVerified",
      label: "Phone Verification",
      icon: Phone,
      completed: verificationStatus.phoneVerified,
      actionUrl: "/dashboard/profile#phone",
    },
    {
      key: "documentVerified",
      label: "Document Verification",
      icon: FileText,
      completed: verificationStatus.documentVerified,
      actionUrl: "/seller/verification",
    },
    {
      key: "businessVerified",
      label: "Business Verification",
      icon: Building,
      completed: verificationStatus.businessVerified,
      actionUrl: "/seller/verification#business",
    },
  ];

  const completedSteps = verificationSteps.filter(
    (step) => step.completed
  ).length;
  const verificationProgress =
    (completedSteps / verificationSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Profile & Verification</h2>
          <p className="text-muted-foreground">
            Manage your profile and verification status
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button asChild>
            <Link href="/dashboard/profile">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Profile Completion
                </p>
                <p
                  className={`text-xl font-bold ${getCompletionColor(profileCompletion.completionPercentage)}`}
                >
                  {profileCompletion.completionPercentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Verification Level
                </p>
                <Badge
                  className={getVerificationLevelColor(
                    verificationStatus.verificationLevel
                  )}
                >
                  {verificationStatus.verificationLevel
                    .charAt(0)
                    .toUpperCase() +
                    verificationStatus.verificationLevel.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seller Tier</p>
                <Badge className={getTierColor(tierData.name)}>
                  {tierData.name} (Level {tierData.level})
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps}/{verificationSteps.length} completed
              </span>
            </div>
            <Progress value={verificationProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verificationSteps.map((step) => (
              <div
                key={step.key}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div
                  className={`p-2 rounded-lg ${
                    step.completed
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{step.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.completed ? "Completed" : "Pending"}
                  </p>
                </div>
                {!step.completed && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={step.actionUrl}>Complete</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Pending/Rejected Documents */}
          {verificationStatus.pendingDocuments.length > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                You have {verificationStatus.pendingDocuments.length}{" "}
                document(s) pending review:{" "}
                {verificationStatus.pendingDocuments.join(", ")}
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus.rejectedDocuments.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some documents were rejected and need to be resubmitted.
                <Button asChild variant="link" className="p-0 h-auto ml-1">
                  <Link href="/seller/verification">View details</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Seller Tier Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Seller Tier Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {tierData.name} Tier (Level {tierData.level})
              </span>
              <span className="text-sm text-muted-foreground">
                {tierData.points}/{tierData.maxPoints} points
              </span>
            </div>
            <Progress
              value={(tierData.points / tierData.maxPoints) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {tierData.maxPoints - tierData.points} points to next tier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Current Benefits</h4>
              <ul className="space-y-1">
                {tierData.benefits.slice(0, 4).map((benefit, index) => (
                  <li
                    key={index}
                    className="text-xs text-muted-foreground flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">
                Next Tier Requirements
              </h4>
              <ul className="space-y-1">
                {tierData.nextTierRequirements
                  .slice(0, 4)
                  .map((requirement, index) => (
                    <li
                      key={index}
                      className="text-xs text-muted-foreground flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3 text-yellow-500" />
                      {requirement}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion Recommendations */}
      {profileCompletion.missingFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Completion Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profileCompletion.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div
                      className={`p-1 rounded ${
                        recommendation.priority === "high"
                          ? "bg-red-100 text-red-600"
                          : recommendation.priority === "medium"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <AlertCircle className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {recommendation.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {recommendation.description}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={recommendation.actionUrl}>Complete</Link>
                    </Button>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/profile">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/seller/verification">
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/analytics">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Performance
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
