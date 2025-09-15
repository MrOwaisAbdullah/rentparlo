"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Phone,
  Mail,
  MapPin,
  Camera,
  FileText,
  Building,
  Globe,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ProfileField {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  importance: "critical" | "high" | "medium" | "low";
  category: "basic" | "contact" | "business" | "verification" | "media";
  actionUrl: string;
  points: number;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProfileCompletionData {
  overallCompletion: number;
  totalPoints: number;
  earnedPoints: number;
  categoryCompletion: {
    [key: string]: {
      completed: number;
      total: number;
      percentage: number;
    };
  };
  fields: ProfileField[];
  recommendations: Array<{
    title: string;
    description: string;
    actionUrl: string;
    priority: "high" | "medium" | "low";
    estimatedTime: string;
    points: number;
  }>;
}

interface ProfileCompletionTrackerProps {
  sellerId: string;
  initialData?: ProfileCompletionData;
}

const categoryIcons = {
  basic: User,
  contact: Phone,
  business: Building,
  verification: Shield,
  media: Camera,
};

const categoryColors = {
  basic: "bg-blue-100 text-blue-800 border-blue-200",
  contact: "bg-green-100 text-green-800 border-green-200",
  business: "bg-purple-100 text-purple-800 border-purple-200",
  verification: "bg-yellow-100 text-yellow-800 border-yellow-200",
  media: "bg-pink-100 text-pink-800 border-pink-200",
};

const importanceColors = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
};

export function ProfileCompletionTracker({
  sellerId,
  initialData,
}: ProfileCompletionTrackerProps) {
  const [completionData, setCompletionData] = useState<ProfileCompletionData>(
    initialData || {
      overallCompletion: 0,
      totalPoints: 0,
      earnedPoints: 0,
      categoryCompletion: {},
      fields: [],
      recommendations: [],
    }
  );

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/profile/completion-details?sellerId=${sellerId}`
      );
      if (response.ok) {
        const data = await response.json();
        setCompletionData(data);
      }
    } catch (error) {
      console.error("Error refreshing completion data:", error);
      toast.error("Failed to refresh profile data");
    } finally {
      setLoading(false);
    }
  };

  const filteredFields =
    selectedCategory === "all"
      ? completionData.fields
      : completionData.fields.filter(
          (field) => field.category === selectedCategory
        );

  const incompleteFields = completionData.fields.filter(
    (field) => !field.completed
  );
  const criticalFields = incompleteFields.filter(
    (field) => field.importance === "critical"
  );
  const highPriorityFields = incompleteFields.filter(
    (field) => field.importance === "high"
  );

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const categories = Object.keys(completionData.categoryCompletion);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Profile Completion</h2>
          <p className="text-muted-foreground">
            Complete your profile to unlock more features and improve visibility
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`text-2xl font-bold ${getCompletionColor(completionData.overallCompletion)}`}
              >
                {completionData.overallCompletion}%
              </h3>
              <p className="text-sm text-muted-foreground">Profile Complete</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {completionData.earnedPoints}/{completionData.totalPoints}
              </p>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </div>
          </div>

          <Progress value={completionData.overallCompletion} className="h-3" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-red-600">
                {criticalFields.length}
              </p>
              <p className="text-xs text-muted-foreground">Critical Missing</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-600">
                {highPriorityFields.length}
              </p>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {completionData.fields.filter((f) => f.completed).length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">
                {completionData.totalPoints - completionData.earnedPoints}
              </p>
              <p className="text-xs text-muted-foreground">Points Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalFields.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {criticalFields.length} critical field(s) missing. These
            are required for basic functionality.
            <div className="mt-2 space-y-1">
              {criticalFields.slice(0, 3).map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{field.label}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link href={field.actionUrl}>Complete</Link>
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Category Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const CategoryIcon =
                categoryIcons[category as keyof typeof categoryIcons] || User;
              const categoryData = completionData.categoryCompletion[category];

              return (
                <div key={category} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${categoryColors[category as keyof typeof categoryColors]?.split(" ")[0]} ${categoryColors[category as keyof typeof categoryColors]?.split(" ")[1]}`}
                    >
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm capitalize">
                        {category}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {categoryData.completed}/{categoryData.total} completed
                      </p>
                    </div>
                  </div>

                  <Progress value={categoryData.percentage} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm font-medium ${getCompletionColor(categoryData.percentage)}`}
                    >
                      {categoryData.percentage}%
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCategory(category)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Field Details */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Profile Fields
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFields.map((field) => {
              const FieldIcon = field.icon;

              return (
                <div
                  key={field.key}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      field.completed
                        ? "bg-green-100 text-green-600"
                        : importanceColors[field.importance].split(" ")[0] +
                          " " +
                          importanceColors[field.importance].split(" ")[1]
                    }`}
                  >
                    {field.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <FieldIcon className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{field.label}</h4>
                      <Badge
                        className={categoryColors[field.category]}
                        variant="outline"
                      >
                        {field.category}
                      </Badge>
                      {!field.completed && (
                        <Badge
                          className={importanceColors[field.importance]}
                          variant="outline"
                        >
                          {field.importance}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {field.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">+{field.points} pts</p>
                    {!field.completed && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="mt-1"
                      >
                        <Link href={field.actionUrl}>Complete</Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {completionData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completionData.recommendations.map((recommendation, index) => (
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
                    <Star className="h-3 w-3" />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {recommendation.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {recommendation.estimatedTime}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +{recommendation.points} points
                      </Badge>
                    </div>
                  </div>

                  <Button asChild size="sm" variant="outline">
                    <Link href={recommendation.actionUrl}>Start</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
