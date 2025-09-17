# Seller Contact Card Fixes for Listing Detail Page

## Issues Identified

1. **Inconsistent Data Display**: The seller contact card on the listing detail page was not showing the same information as the seller profile page
2. **Missing Calculations**: Response time and other seller metrics were not calculated using the same logic as the seller profile
3. **Data Structure Mismatch**: Some seller data fields were accessed incorrectly
4. **Inconsistent UI Elements**: Seller stats weren't displayed the same way

## Fixes Implemented

### 1. Consistent Data Access
- **Fixed seller profile data access**: Now correctly accessing `listing.seller.profile` fields
- **Added fallbacks**: Proper fallback values for missing data
- **Unified field names**: Using the same field names as the seller profile page

### 2. Response Time Calculation
- **Created utility function**: `calculateResponseTime` in `lib/seller-utils.ts` for consistent calculations
- **Applied to listing page**: Using the same logic as seller profile page
- **Proper fallbacks**: Default values when seller data is incomplete

### 3. Listing Count Display
- **Fixed field access**: Now correctly accessing `listing.seller.profile.listing_count` or fallback to `listing.seller.listingCount`
- **Consistent display**: Same format as seller profile page

### 4. Seller Profile Link
- **Fixed URL generation**: Now correctly linking to `/seller/${listing.seller.profile.username}`

### 5. Seller Avatar
- **Fixed image source**: Now correctly using `listing.seller.profile.avatar_url` with proper fallback

### 6. Seller Verification Badge
- **Consistent display**: Using the same `VerifiedBadge` component as seller profile page
- **Proper positioning**: Same styling and placement

### 7. Seller Tier Badge
- **Unified component**: Using the same `SellerTierBadge` component as seller profile page
- **Consistent props**: Same sizing and variant options

## Key Changes Made

### 1. Data Structure Alignment (`components/listing/listing-detail-content.tsx`)
- Updated all seller data access to match seller profile page structure
- Added proper fallback values for missing data
- Fixed field names to match seller profile implementation

### 2. Response Time Calculation (`lib/seller-utils.ts`)
- Created `calculateResponseTime` utility function
- Implements the same logic as seller profile page:
  - Base response time based on seller tier
  - Adjustments for verification status
  - Adjustments for customer ratings
  - Proper formatting for display

### 3. UI Consistency (`components/listing/listing-detail-content.tsx`)
- Using same components as seller profile page:
  - `VerifiedBadge` for verification status
  - `SellerTierBadge` for tier display
  - Consistent styling and layout
- Fixed seller stats grid to match seller profile

### 4. Import Updates
- Added `calculateResponseTime` import to listing detail component
- Ensured all necessary components are imported

## Benefits Achieved

1. **Consistent User Experience**: Seller information now displays the same way on both pages
2. **Accurate Data**: Using the same calculation logic for response times and other metrics
3. **Better Fallbacks**: Proper handling of missing data with sensible defaults
4. **Maintainability**: Shared utility function makes future updates easier
5. **Visual Consistency**: Same components and styling across the application

## Files Modified

1. `components/listing/listing-detail-content.tsx` - Updated seller data access and UI components
2. `lib/seller-utils.ts` - Created `calculateResponseTime` utility function

## Testing Done

1. Verified seller data displays correctly when all fields are present
2. Tested fallback values when seller profile data is missing
3. Confirmed response time calculations match seller profile page
4. Checked listing count display with different data sources
5. Verified seller profile links work correctly
6. Tested avatar display with and without profile images
7. Confirmed verification and tier badges display properly