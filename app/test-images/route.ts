import { getHomepageListings } from '@/lib/fetch/listings';

export async function GET() {
  try {
    const listings = await getHomepageListings();
    
    // Get the first listing with images to test
    const firstListingWithImages = listings.find(listing => 
      listing.images && listing.images.length > 0
    );
    
    if (!firstListingWithImages) {
      return Response.json({
        message: "No listings with images found",
        allListingsCount: listings.length
      });
    }
    
    const firstImage = firstListingWithImages.images[0];
    
    return Response.json({
      listingTitle: firstListingWithImages.title,
      imageStructure: firstImage,
      imageUrl: firstImage?.asset?.url,
      hasAsset: !!firstImage?.asset,
      hasUrl: !!firstImage?.asset?.url
    });
  } catch (error) {
    console.error('Error in test route:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}