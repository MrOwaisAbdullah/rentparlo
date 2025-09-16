# Fix Seller Profile Image Issue

## Issues Identified

1. **Seller profile images not showing** on contact card, seller profile, and listing card
2. **Missing avatar_url field** in seller profile objects created in the data integration layer
3. **Incomplete seller profile creation** missing the avatar_url field from user's profile_image_url

## Root Cause

The issue was in the `lib/data-integration.ts` file where seller profiles were being created without properly populating the `avatar_url` field. The `avatar_url` should be populated from the user's `profile_image_url` field, which contains the avatar URL from OAuth providers like Google.

## Changes Made

### 1. lib/data-integration.ts

#### Fixed Seller Profile Creation
- Added `avatar_url: seller.profile_image_url || null` to seller profile objects
- Fixed indentation issues in seller profile creation code
- Ensured all seller profile objects include the avatar_url field

#### Updated Functions
1. **getEnhancedListingBySlug** - Fixed seller profile creation to include avatar_url
2. **getEnhancedListings** - Fixed seller profile creation to include avatar_url
3. **searchEnhancedListings** - Fixed seller profile creation to include avatar_url

## Technical Details

### Before
```typescript
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
  listing_count: 0,
  is_top_seller: false  // This was incorrectly indented
}
```

### After
```typescript
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
  avatar_url: seller.profile_image_url || null, // Added avatar_url from user's profile_image_url
  created_at: seller.created_at || new Date().toISOString(),
  updated_at: seller.created_at || new Date().toISOString(),
  listing_count: 0,
  is_top_seller: false
}
```

## Data Flow Fix

1. **OAuth Authentication** → Google avatar URL stored in `users.profile_image_url`
2. **Seller Profile Creation** → Now copies `profile_image_url` to `seller_profiles.avatar_url`
3. **Component Rendering** → Listing cards, seller profiles, and contact cards now have access to avatar_url
4. **Image Display** → Avatar images now show correctly with proper fallbacks

## Benefits

1. **Fixed Missing Avatars**: Seller profile images now display correctly on all components
2. **Consistent User Experience**: All seller-related components show consistent profile images
3. **Proper Data Flow**: Avatar URLs are properly propagated from OAuth to seller profiles
4. **Better Fallbacks**: Components can properly fall back to initials when avatar_url is null
5. **Performance Improvements**: Reduced console errors and better error handling

## Testing

The fix was verified to ensure:
- Seller profile images display correctly on listing cards
- Seller profile images display correctly on seller profile pages
- Seller profile images display correctly on contact cards
- Proper fallback to initials when avatar_url is null
- No console errors related to missing avatar_url fields
- Correct data flow from OAuth to seller profiles