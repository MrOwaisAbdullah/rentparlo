"use client";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import {
  createMockSellerProfile,
  createMockSellerAnalytics,
  createMockUserSubscription,
  createMockRecentActivity,
} from "@/lib/dashboard-mock-data";

export default function DashboardPage() {
  // In a real application, this data would be fetched from APIs
  const sellerData = createMockSellerProfile();
  const analytics = createMockSellerAnalytics();
  const subscription = createMockUserSubscription();
  const recentActivity = createMockRecentActivity();

  return (
    <DashboardOverview
      sellerData={sellerData}
      analytics={analytics}
      subscription={subscription}
      recentActivity={recentActivity}
    />
  );
}
