# Fix for Reviews Upload Issue

## Issue
Reviews were not being uploaded properly due to an authentication error in the reviews API route:
```
Error submitting review: TypeError: Cannot read properties of undefined (reading 'getUser')
    at POST (app/api/reviews/route.ts:9:52)
```

## Root Cause
The `createClient()` function in the reviews API route was not being awaited properly. The function is async and returns a Promise, but it was being called without `await`, causing the Supabase client to be undefined when trying to call `supabase.auth.getUser()`.

## Solution
Fixed the reviews API route to properly await the Supabase client creation and handle the authentication response correctly.

## Changes Made

### 1. Fixed Reviews API Route (`app/api/reviews/route.ts`)
- Changed `const supabase = createClient();` to `const supabase = await createClient();`
- Updated the authentication check to properly handle the response: 
  `const { data: { user }, error } = await supabase.auth.getUser();`
- Added proper error handling for authentication failures

## Files Modified
1. `app/api/reviews/route.ts` - Fixed Supabase client initialization and authentication handling

## Expected Result
Reviews should now be uploaded properly without authentication errors. The API route will correctly:
1. Create the Supabase client
2. Authenticate the user
3. Process the review submission
4. Handle errors appropriately

## Testing
The changes should be tested to ensure:
1. Reviews can be submitted successfully by authenticated users
2. Proper error messages are returned for unauthenticated users
3. Review data is correctly stored in Sanity
4. Image uploads work correctly
5. Analytics tracking functions properly