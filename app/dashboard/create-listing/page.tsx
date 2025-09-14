import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getCategories } from "@/lib/sanity-queries";
import { CreateListingForm } from "@/components/seller/create-listing-form";
import { CreateListingSkeleton } from "@/components/seller/create-listing-skeleton";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create New Listing | RentParLo.pk",
  description:
    "Add a new rental item to your inventory. Reach thousands of potential customers across Pakistan.",
  robots: {
    index: false,
    follow: false,
  },
};

async function CreateListingPageContent() {
  try {
    // Get current user and verify seller access
    const user = await getCurrentUser();

    if (!user) {
      redirect("/auth/login?redirect=/dashboard/create-listing");
    }

    if (user.role !== "seller") {
      redirect("/auth/become-seller");
    }

    // Map user data to match our interface
    const mappedUser = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role,
      // Add other fields as needed
    };

    // Get categories for the form
    const categories = await getCategories();
    
    // Ensure categories have the correct structure
    const formattedCategories = categories.map(cat => ({
      ...cat,
      slug: typeof cat.slug === 'string' ? cat.slug : cat.slug?.current || cat.title.toLowerCase().replace(/\s+/g, '-')
    }));

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Listing
            </h1>
            <p className="text-gray-600">
              Add a new rental item to your inventory. Make sure to provide
              detailed information and high-quality photos to attract more
              customers.
            </p>
          </div>

          {/* Form */}
          <CreateListingForm user={mappedUser} categories={formattedCategories} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading create listing page:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Form
          </h2>
          <p className="text-gray-600 mb-4">
            Something went wrong while loading the listing creation form.
          </p>
          <a
            href="/dashboard/create-listing"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }
}

export default function CreateListingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<CreateListingSkeleton />}>
        <CreateListingPageContent />
      </Suspense>
    </div>
  );
}
