import { NextResponse } from 'next/server';
import { getEnhancedListingBySlug } from '@/lib/data-integration';

export async function GET() {
  try {
    console.log('Testing seller profile creation');
    
    // Test with a specific listing slug (replace with an actual slug from your database)
    // We'll use a slug that has a seller ID but no seller profile
    const listing = await getEnhancedListingBySlug('generators-item-2-1756075678423');
    
    if (listing) {
      console.log('Listing data retrieved successfully');
      console.log('Listing title:', listing.title);
      console.log('Seller info:', listing.seller ? 'Available' : 'Not available');
      
      if (listing.seller) {
        console.log('Seller username:', listing.seller.profile?.username);
        console.log('Seller tier:', listing.seller.profile?.tier);
        console.log('Seller verification status:', listing.seller.profile?.verification_status);
        console.log('Seller ID:', listing.seller.profile?.id);
        
        return NextResponse.json({
          success: true,
          message: 'Seller profile created successfully',
          listingTitle: listing.title,
          sellerUsername: listing.seller.profile?.username,
          sellerTier: listing.seller.profile?.tier,
          sellerVerificationStatus: listing.seller.profile?.verification_status,
          sellerId: listing.seller.profile?.id
        });
      }
    } else {
      console.log('No listing found with the provided slug');
      
      return NextResponse.json({
        success: false,
        message: 'No listing found with the provided slug'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test completed successfully'
    });
  } catch (error) {
    console.error('Test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}