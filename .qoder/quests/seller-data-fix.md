# Seller Data Fix Design Document

## 1. Overview

This document outlines the design and implementation plan to fix the issue where seller information is not displaying correctly on listing detail pages in the RentParLo.pk application. The problem manifests as "Seller information is not available for this listing" with the specific seller ID: `44444444-4444-4444-4444-444444444444`.

The issue stems from the integration between Sanity CMS (where listings are stored) and Supabase (where seller profiles are stored). The listing contains a `supabaseId` reference to link to the seller, but the seller data is not being properly retrieved or displayed.

## 2. Problem Analysis

### 2.1 Current Data Flow

1. **Listing Retrieval**: When a user visits a listing detail page, the application fetches the listing data from Sanity CMS using the slug.
2. **Seller Reference**: The listing document in Sanity contains a `supabaseId` field that references the seller's user ID in Supabase.
3. **Seller Data Fetching**: The application attempts to fetch seller data from Supabase using the `supabaseId`.
4. **Data Combination**: The seller data is combined with the listing data for display.

### 2.2 Identified Issues

1. **Missing Seller Profile**: The seller with ID `44444444-4444-4444-4444-444444444444` may not have a corresponding profile in the `seller_profiles` table in Supabase.
2. **API Endpoint Failure**: The `/api/seller/minimal` endpoint may be failing to retrieve seller data.
3. **Data Integration Logic**: The logic in `getEnhancedListingBySlug` may not be properly handling cases where seller data is missing or incomplete.
4. **Registration/Onboarding Issues**: The seller registration process may not be properly creating seller profiles in Supabase.

## 3. Solution Design

### 3.1 Fix Data Integration Logic

The primary fix will be in the `getEnhancedListingBySlug` function in `lib/data-integration.ts`. The current implementation has several issues:

1. It only attempts to get seller profile data if the user's role is 'seller', but it should also handle cases where the role might be different but a seller profile exists.
2. It doesn't properly handle errors when fetching seller data.
3. It doesn't provide fallback mechanisms when seller data is missing.

### 3.2 Enhance Seller Profile Creation

Improve the seller registration and onboarding process to ensure seller profiles are properly created in Supabase with all required fields.

### 3.3 Improve Error Handling and Logging

Add better error handling and logging to identify when and why seller data is not being retrieved.

### 3.4 Fallback Mechanisms

Implement fallback mechanisms to display minimal seller information even when the full profile is not available.

## 4. Implementation Plan

### 4.1 Update Data Integration Logic

Modify `lib/data-integration.ts` to improve the `getEnhancedListingBySlug` function:

1. Always attempt to fetch seller profile data regardless of user role
2. Implement better error handling
3. Add more detailed logging
4. Provide fallback data when seller profile is missing

### 4.2 Update Seller Profile Creation

Enhance the seller registration process in `components/auth/welcome-content.tsx` and related files to ensure seller profiles are properly created with all required fields.

### 4.3 Improve API Endpoint

Review and improve the `/api/seller/minimal/route.ts` endpoint to handle edge cases better.

### 4.4 Update UI Components

Modify the listing detail page components to gracefully handle missing seller data and display appropriate messages.

## 5. Detailed Implementation

### 5.1 Data Integration Fixes

In `lib/data-integration.ts`, update the `getEnhancedListingBySlug` function:

```typescript
// Get listing with seller information and analytics
export async function getEnhancedListingBySlug(slug: string): Promise<Listing | null> {
  try {
    // Try to get from cache first
    const cacheKey = getCacheKey.listing(slug);
    const cached: Listing | null = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get listing from Sanity
    const listing = await getListingBySlug(slug)
    if (!listing) return null

    // Initialize seller as undefined
    let enhancedSeller: Seller | undefined = undefined;

    // Only try to get seller information if supabaseId exists
    if (listing.supabaseId) {
      try {
        // Get seller information from Supabase
        const seller = await getUserById(listing.supabaseId)
        console.log('Seller data for listing:', seller); // Debugging
        
        if (seller) {
          // Always try to get seller profile, regardless of role
          let sellerProfile: SellerProfile | null = null
          
          // Try to get seller profile first
          sellerProfile = await getSellerProfile(seller.id)
          console.log('Seller profile data:', sellerProfile); // Debugging
          
          // If no seller profile exists, but user is a seller, create a minimal one
          if (!sellerProfile && seller.role === 'seller') {
            console.log('Creating minimal seller profile for seller user');
            sellerProfile = {
              id: seller.id,
              username: seller.email ? seller.email.split('@')[0] : `user-${seller.id.substring(0, 8)}`,
              is_verified: seller.is_verified || false,
              tier: 'basic',
              tier_points: 0,
              tier_last_updated: seller.created_at || new Date().toISOString(),
              verification_status: 'pending',
              verification_documents: {
                cnic_front: null,
                cnic_back: null,
                business_license: null
              },
              created_at: seller.created_at || new Date().toISOString(),
              updated_at: seller.created_at || new Date().toISOString(),
              listing_count: 0
            };
          }
          
          // If we still don't have a seller profile but have user data, create minimal profile
          if (!sellerProfile) {
            console.log('Creating minimal seller profile from user data');
            sellerProfile = {
              id: seller.id,
              username: seller.email ? seller.email.split('@')[0] : `user-${seller.id.substring(0, 8)}`,
              is_verified: seller.is_verified || false,
              tier: 'basic',
              tier_points: 0,
              tier_last_updated: seller.created_at || new Date().toISOString(),
              verification_status: 'pending',
              verification_documents: {
                cnic_front: null,
                cnic_back: null,
                business_license: null
              },
              created_at: seller.created_at || new Date().toISOString(),
              updated_at: seller.created_at || new Date().toISOString(),
              listing_count: 0
            };
          }

          // Combine data
          enhancedSeller = {
            ...seller,
            profile: sellerProfile
          }
        } else {
          console.log('No seller found for listing with supabaseId:', listing.supabaseId); // Debugging
        }
      } catch (sellerError) {
        console.error('Error fetching seller data:', sellerError);
        // Try to create minimal seller profile from listing data if possible
        try {
          // Create a very minimal seller profile with just the ID
          enhancedSeller = {
            id: listing.supabaseId,
            email: 'unknown@example.com',
            role: 'seller',
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            active: true,
            email_verified: false,
            country: 'Pakistan',
            notification_preferences: { email: true, sms: false, push: true },
            preferred_language: 'en',
            profile: {
              id: listing.supabaseId,
              username: `user-${listing.supabaseId.substring(0, 8)}`,
              is_verified: false,
              tier: 'basic',
              tier_points: 0,
              tier_last_updated: new Date().toISOString(),
              verification_status: 'pending',
              verification_documents: {
                cnic_front: null,
                cnic_back: null,
                business_license: null
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              listing_count: 0
            }
          };
        } catch (minimalProfileError) {
          console.error('Error creating minimal seller profile:', minimalProfileError);
        }
      }
    }

    // Get listing analytics
    const analytics = await getListingAnalytics(listing._id)

    // Combine data
    const enhancedListing: Listing = {
      ...listing,
      views: analytics.views,
      contactClicks: analytics.contactClicks,
      seller: enhancedSeller
    }

    console.log('Enhanced listing with seller:', enhancedListing); // Debugging

    // Cache the result
    await cacheManager.set(cacheKey, enhancedListing, { 
      ttl: CACHE_TTL.listing,
      tags: [`listing:${slug}`]
    });

    return enhancedListing
  } catch (error) {
    console.error('Error getting enhanced listing:', error)
    return null
  }
}
```

### 5.2 Seller Registration Enhancement

In `components/auth/welcome-content.tsx`, improve the seller profile creation:

```typescript
// If seller, create seller profile
if (sanitizedData.role === 'seller') {
  // Check if seller profile already exists
  const existingProfile = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  
  if (!existingProfile.data) {
    const { error: sellerError } = await supabase
      .from('seller_profiles')
      .insert({
        id: user.id,
        username: user.email?.split('@')[0] || `seller_${Date.now()}`,
        business_name: sanitizedData.businessName || '',
        owner_cnic: sanitizedData.cnic || '',
        address_line1: sanitizedData.address || '',
        city: sanitizedData.city || '',
        phone: sanitizedData.phone || '',
        email: user.email || '',
        is_verified: false,
        is_top_seller: false,
        tier: 'basic',
        tier_points: 0,
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (sellerError) {
      console.error('Seller profile creation error:', sellerError);
      // Don't throw error, continue with user creation
    } else {
      console.log('Seller profile created successfully for user:', user.id);
    }
  } else {
    console.log('Seller profile already exists for user:', user.id);
  }
}
```

### 5.3 API Endpoint Improvement

In `app/api/seller/minimal/route.ts`, enhance error handling:

```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check cache first
    const cached = await getCachedSellerInfo(userId);
    if (cached) {
      console.log(`Returning cached data for user ${userId}`);
      return Response.json(cached);
    }

    // Fetch minimal data from Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('username, avatar_url, is_verified, tier')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching seller info:', {
        userId,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Try to get basic user info if seller profile doesn't exist
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .maybeSingle();
      
      if (userError) {
        console.error('Error fetching user info:', {
          userId,
          error: userError.message
        });
      }
      
      // Return minimal data based on what we could fetch
      return Response.json({ 
        username: userData?.email ? userData.email.split('@')[0] : `user-${userId.substring(0, 8)}`,
        avatarUrl: null,
        is_verified: false,
        tier: 'basic'
      });
    }

    // Handle case when no data is found
    if (!data) {
      console.log(`No seller profile found for user ${userId}, trying user data`);
      
      // Try to get basic user info if seller profile doesn't exist
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, is_verified')
        .eq('id', userId)
        .maybeSingle();
      
      if (userError) {
        console.error('Error fetching user info:', {
          userId,
          error: userError.message
        });
      }
      
      // Return minimal data based on what we could fetch
      return Response.json({ 
        username: userData?.email ? userData.email.split('@')[0] : `user-${userId.substring(0, 8)}`,
        avatarUrl: null,
        is_verified: userData?.is_verified || false,
        tier: 'basic'
      });
    }

    // Cache the result
    const sellerInfo = {
      username: data.username,
      avatarUrl: data.avatar_url,
      is_verified: data.is_verified,
      tier: data.tier
    };
    
    try {
      await cacheSellerInfo(userId, sellerInfo, 60); // 60 seconds
    } catch (cacheError) {
      console.error('Failed to cache seller info:', {
        userId,
        error: cacheError instanceof Error ? cacheError.message : String(cacheError),
        stack: cacheError instanceof Error ? cacheError.stack : undefined
      });
    }

    console.log(`Returning fresh data for user ${userId}`);
    return Response.json(sellerInfo);
  } catch (error) {
    console.error('Unexpected error in seller info API:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 5.4 UI Component Updates

In `components/listing/listing-detail-content.tsx`, improve the handling of missing seller data:

```tsx
{listing.seller ? (
  <div className="space-y-4">
    {/* Seller Info */}
    <Link href={`/seller/${listing.seller.profile?.username}`} className="block">
      <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <Avatar className="w-12 h-12">
          <AvatarImage src={listing.seller.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${listing.seller.profile?.username}`} />
          <AvatarFallback>
            {listing.seller.profile?.username?.charAt(0).toUpperCase() || listing.seller.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">
              {listing.seller.profile?.business_name || listing.seller.profile?.username || listing.seller.email || 'N/A'}
            </h4>
            {listing.seller.profile?.is_verified && (
              <Shield className="w-4 h-4 text-green-600" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge className={cn("text-xs", tierConfig[listing.seller.profile?.tier as keyof typeof tierConfig]?.color || 'bg-gray-100 text-gray-700')}>
              {tierConfig[listing.seller.profile?.tier as keyof typeof tierConfig]?.icon || '👤'} {listing.seller.profile?.tier || 'N/A'}
            </Badge>
          </div>
        </div>
      </div>
    </Link>

    {/* Seller Stats */}
    <div className="grid grid-cols-2 gap-4 text-center text-sm">
      <div>
        <div className="font-semibold text-primary">{listing.seller.profile?.listing_count || 0}</div>
        <div className="text-muted-foreground">Listings</div>
      </div>
      <div>
        <div className="font-semibold text-green-600">{formatResponseTime()}</div>
        <div className="text-muted-foreground">Response Time</div>
      </div>
    </div>

    <Separator />

    {/* Contact Actions */}
    <div className="space-y-3">
      <Button 
        className="w-full" 
        onClick={handleContactSeller}
        disabled={listing.availability?.isAvailable === false}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {listing.availability?.isAvailable !== false ? 'Send Message' : 'Not Available'}
      </Button>
    
      {/* New CTA Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCallSeller}
          disabled={!getSellerPhone()}
          className="flex flex-col items-center justify-center h-16"
        >
          <Phone className="w-4 h-4" />
          <span className="text-xs mt-1">Call</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleWhatsAppSeller}
          disabled={!getSellerPhone()}
          className="flex flex-col items-center justify-center h-16 bg-green-600 hover:bg-green-700 text-white border-green-600"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-xs mt-1">WhatsApp</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleMapSeller}
          disabled={!getSellerMapUrl()}
          className="flex flex-col items-center justify-center h-16"
        >
          <MapPin className="w-4 h-4" />
          <span className="text-xs mt-1">Map</span>
        </Button>
      </div>
    </div>

    {/* Safety Notice */}
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription className="text-xs">
        Always meet in a public place and inspect the item before making any payment.
      </AlertDescription>
    </Alert>
  </div>
) : (
  <div className="text-center text-muted-foreground">
    {listing.supabaseId ? (
      <div>
        <p>Seller information is temporarily unavailable for this listing.</p>
        <p className="text-sm mt-2">Seller ID: {listing.supabaseId}</p>
        <p className="text-xs mt-2 text-muted-foreground">We're working to resolve this issue. Please check back later.</p>
      </div>
    ) : (
      <p>This listing does not have an associated seller.</p>
    )}
  </div>
)}
```

## 6. Testing Plan

1. **Unit Tests**: Write unit tests for the updated functions in `lib/data-integration.ts` and `lib/supabase-queries.ts`
2. **Integration Tests**: Test the complete flow from listing retrieval to seller data display
3. **Edge Case Testing**: Test with various seller ID scenarios:
   - Valid seller with complete profile
   - Valid seller with minimal profile
   - Invalid seller ID
   - Seller ID with no associated user
4. **UI Testing**: Verify the display of seller information in all scenarios

## 7. Rollout Plan

1. **Development Environment**: Implement and test changes in the development environment
2. **Staging Environment**: Deploy to staging for additional testing
3. **Production Deployment**: Deploy to production with monitoring
4. **Monitoring**: Monitor for any issues after deployment

## 8. Monitoring and Error Handling

1. **Logging**: Add detailed logging to track seller data retrieval
2. **Error Tracking**: Implement error tracking for failed seller data retrieval
3. **Alerts**: Set up alerts for high error rates in seller data retrieval

This design document provides a comprehensive approach to fixing the seller data display issues in RentParLo.pk, ensuring that seller information is properly displayed on listing detail pages.
































