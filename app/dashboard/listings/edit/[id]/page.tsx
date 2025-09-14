import { createClient } from '@/utils/supabase/server';
import { getListingById } from '@/lib/sanity-queries';
import { redirect } from 'next/navigation';
import { Listing } from '@/types';
import CreateListingForm from '@/components/seller/create-listing-form';

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch the listing by ID
  const listing: Listing | null = await getListingById(params.id);

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <a 
            href="/dashboard/listings" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Back to My Listings
          </a>
        </div>
      </div>
    );
  }

  // Check if the user owns this listing
  if (listing.supabaseId !== user.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to edit this listing.</p>
          <a 
            href="/dashboard/listings" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Back to My Listings
          </a>
        </div>
      </div>
    );
  }

  // Get categories for the form
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('title');

  // Ensure categories have the correct structure
  const formattedCategories = categories?.map(cat => ({
    ...cat,
    slug: cat.slug || { current: cat.title.toLowerCase().replace(/\s+/g, '-') }
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Listing
          </h1>
          <p className="text-gray-600">
            Update your listing details. Make sure to provide accurate information.
          </p>
        </div>

        {/* Form */}
        <CreateListingForm 
          user={{
            id: user.id,
            name: (user as any).name || '',
            email: user.email,
            role: user.role,
          }} 
          categories={formattedCategories} 
          editMode={true}
          listing={listing}
        />
      </div>
    </div>
  );
}