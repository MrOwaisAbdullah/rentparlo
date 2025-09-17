# Fix for Listings Not Showing Immediately in Seller Dashboard

## Issue
Newly uploaded listings were not appearing immediately in the seller dashboard because the query was filtering for only published and active listings (`status == "active" && published == true`). Newly created listings have `status: "pending"` by default and are not published immediately.

## Root Cause
The dashboard was using the `searchListings` function which applies filters for `status == "active" && published == true`. This is appropriate for public search but not for the seller's own dashboard where they should see all their listings regardless of status.

## Solution
Created a new function and API endpoint to fetch all listings for a seller regardless of their status.

## Changes Made

### 1. Added New Query Function (`lib/sanity-queries.ts`)
- Created `getAllListingsBySeller` function that fetches all listings for a seller without status/published filters
- Updated the existing `getListingsBySeller` function to maintain backward compatibility

### 2. Created New API Endpoint (`app/api/seller-listings/route.ts`)
- Created `/api/seller-listings` endpoint that uses the new query function
- Returns all listings for a seller regardless of status

### 3. Updated Dashboard Page (`app/dashboard/listings/page.tsx`)
- Changed import from `searchListings` to `getAllListingsBySeller`
- Updated listing fetching logic to use the new function directly instead of the API

### 4. Updated Listing Management Integration (`components/dashboard/listing-management-integration.tsx`)
- Updated the `refreshListings` function to use the new `/api/seller-listings` endpoint
- Added proper import for the new function

## Files Modified
1. `lib/sanity-queries.ts` - Added new query function
2. `app/dashboard/listings/page.tsx` - Updated to use new function
3. `components/dashboard/listing-management-integration.tsx` - Updated API call
4. `app/api/seller-listings/route.ts` - New API endpoint

## Expected Result
Newly created listings should now appear immediately in the seller dashboard with their "pending" status, allowing sellers to see their uploaded listings right away.

## Testing
The changes should be tested to ensure:
1. Newly created listings appear immediately in the dashboard
2. Listings with different statuses (pending, active, expired, banned) are all shown
3. Existing functionality for public search remains unchanged
4. Performance is acceptable with the new queries