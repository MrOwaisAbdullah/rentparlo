import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getSellerDashboardData } from "@/lib/data-integration";
import { DashboardContent } from "@/components/seller/dashboard-content";
import { DashboardSkeleton } from "@/components/seller/dashboard-skeleton";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Seller Dashboard | RentParLo.pk",
  description:
    "Manage your rental listings, view analytics, and track your business performance on RentParLo.pk",
  robots: {
    index: false,
    follow: false,
  },
};

async function DashboardPageContent() {
  try {
    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      redirect("/auth/login?redirect=/dashboard");
    }

    // Check if user is a seller
    if (user.role !== "seller") {
      redirect("/auth/become-seller");
    }

    // Get seller dashboard data
    const dashboardData = await getSellerDashboardData(user.id);

    if (!dashboardData) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Dashboard Unavailable
            </h2>
            <p className="text-gray-600 mb-4">
              We're having trouble loading your dashboard data. Please try again
              later.
            </p>
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Retry
            </a>
          </div>
        </div>
      );
    }

    return <DashboardContent user={user} dashboardData={dashboardData} />;
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            Something went wrong while loading your dashboard. Our team has been
            notified.
          </p>
          <div className="space-x-2">
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Try Again
            </a>
            <a
              href="/support"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 inline-block"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardPageContent />
      </Suspense>
    </div>
  );
}
