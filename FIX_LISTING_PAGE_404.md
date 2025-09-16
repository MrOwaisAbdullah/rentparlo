# Fix Listing Page 404 Error and Sanity Query Parameter Issue

## Issues Identified

1. **Server Error**: `NEXT_HTTP_ERROR_FALLBACK;404` - The listing page was returning a 404 error
2. **Sanity Query Error**: `param $userId referenced, but not provided` - The Sanity query was expecting a `$userId` parameter that wasn't being passed

## Root Cause

The issue was in the data flow between components:

1. **Listing Page** (`app/listing/[slug]/page.tsx`) was correctly calling `getEnhancedListingBySlug(slug, user?.id)` with the userId parameter
2. **Data Integration** (`lib/data-integration.ts`) function `getEnhancedListingBySlug` was accepting only the `slug` parameter, ignoring the `userId`
3. **Sanity Query** (`lib/sanity-queries.ts`) function `getListingBySlug` was expecting both `slug` and `userId` parameters
4. **GROQ Query** (`LISTING_BY_SLUG_QUERY`) was using `$userId` in its condition but not receiving it

This caused the Sanity query to fail with "param $userId referenced, but not provided" error, which in turn caused the listing to be null, leading to the 404 error.

## Changes Made

### 1. lib/data-integration.ts

#### Updated Function Signature
```typescript
// Before
export async function getEnhancedListingBySlug(slug: string): Promise<Listing | null>

// After
export async function getEnhancedListingBySlug(slug: string, userId?: string): Promise<Listing | null>
```

#### Updated Function Call
```typescript
// Before
const listing = await getListingBySlug(slug)

// After
const listing = await getListingBySlug(slug, userId)
```

## Technical Details

### Data Flow Fix
1. **Listing Page** → Passes `slug` and `user?.id` to `getEnhancedListingBySlug`
2. **Data Integration** → Now accepts both parameters and passes `userId` to `getListingBySlug`
3. **Sanity Query** → Receives both parameters and passes them to the GROQ query
4. **GROQ Query** → Now receives the `$userId` parameter and can execute successfully

### Query Purpose
The `$userId` parameter in the query is used for owner preview functionality:
```groq
*[_type == "listing" && slug.current == $slug && (status == "active" || (status == "pending" && supabaseId == $userId))][0]
```

This allows listing owners to preview their own pending listings while preventing other users from seeing them.

## Benefits

1. **Fixed 404 Errors**: Listings now load correctly without returning 404 errors
2. **Owner Preview**: Listing owners can now preview their pending listings
3. **Parameter Consistency**: All functions in the data flow now properly handle the userId parameter
4. **Error Prevention**: Prevents Sanity query errors due to missing parameters
5. **Better UX**: Users can access listings without encountering server errors

## Testing

The fix was verified to ensure:
- Listing pages load correctly without 404 errors
- Owners can preview their pending listings
- Regular users cannot see pending listings from other owners
- No Sanity query parameter errors
- Proper error handling for non-existent listings