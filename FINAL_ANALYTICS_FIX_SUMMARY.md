# Analytics Tracking Session ID Fix Summary

## Problem
The analytics tracking system was generating session IDs in the format `session_<timestamp>` (e.g., `session_1758043599390`) which is not a valid UUID format. This caused PostgreSQL errors when inserting records into the `analytics_events` table, as the `session_ref` column expects UUID values.

Error message:
```
Error tracking analytics event: {
  code: '22P02',
  details: null,
  hint: null,
  message: 'invalid input syntax for type uuid: "session_1758043599390"'
}
```

## Root Cause
In `app/listing/[slug]/page.tsx`, the server-side analytics tracking code was manually generating session IDs using:
```javascript
session_id: `session_${Date.now()}`,
```

This format is not compatible with the UUID type expected by the database.

## Solution
Removed the manual session ID generation from the `trackAnalyticsEvent` call in `app/listing/[slug]/page.tsx`. This allows the server-side `trackAnalyticsEvent` function in `lib/supabase-queries.ts` to properly handle session creation using the PostgreSQL `get_or_create_session` function, which correctly returns UUID values.

### Before (incorrect):
```javascript
await trackAnalyticsEvent({
  event_type: 'page_view',
  listing_id: listing._id,
  // ... other properties
  session_id: `session_${Date.now()}`, // Incorrect format
});
```

### After (correct):
```javascript
await trackAnalyticsEvent({
  event_type: 'page_view',
  listing_id: listing._id,
  // ... other properties
  // session_id removed - let server handle session creation
});
```

## How the Fix Works
1. The server-side `trackAnalyticsEvent` function in `lib/supabase-queries.ts` automatically calls the PostgreSQL `get_or_create_session` function when a session is needed but not provided
2. The `get_or_create_session` function properly generates and returns UUID values for session IDs
3. These UUID values are correctly inserted into the `session_ref` column of the `analytics_events` table

## Verification
- Confirmed no other files in the codebase were generating session IDs in the incorrect format
- Verified that client-side tracking functions don't generate session IDs but only use provided ones
- Ensured that other server-side tracking implementations (like seller profile views) were already correctly implemented

This fix resolves the UUID format error and ensures proper session tracking for all analytics events.