# Supabase Schema Migration Guide

## Overview
This guide outlines the steps to fix volatile function index issues in the Supabase schema and implement improved session tracking.

## Problems Identified
1. **Volatile Function Indexes**: Indexes on `guest_id` and `session_id` columns that use `gen_random_uuid()` cause performance issues
2. **Inefficient Guest Tracking**: Current guest tracking lacks proper session management
3. **Analytics Limitations**: Current structure doesn't provide comprehensive session analytics

## Solutions Implemented

### 1. Removed Problematic Indexes
- `idx_users_guest_id` - Index on volatile `guest_id` column
- `idx_analytics_guest` - Index on volatile `guest_id` in analytics

### 2. New Tables Created
- `user_guest_tracking` - Links authenticated users to their guest sessions
- `event_sessions` - Manages user sessions with deterministic session IDs

### 3. Enhanced Functions
- `get_or_create_session()` - Session management
- `end_session()` - Proper session termination
- `link_guest_to_user()` - Guest-to-user relationship tracking

## Migration Steps

### Step 1: Apply Schema Fixes
```sql
-- Run the schema-fixes.sql file in Supabase
\i utils/supabase/schema-fixes.sql
```

### Step 2: Update Application Code

#### A. Update Analytics Tracking
```typescript
// OLD: Direct guest_id tracking
const trackEvent = async (eventData: {
  listing_id: string;
  event_type: string;
  guest_id?: string;
}) => {
  // Old implementation
}

// NEW: Session-based tracking
const trackEvent = async (eventData: {
  listing_id: string;
  event_type: string;
  session_id?: string;
}) => {
  const { data: session } = await supabase.rpc('get_or_create_session', {
    p_user_id: user?.id || null,
    p_guest_id: getGuestId(),
    p_ip_address: getClientIP(),
    p_user_agent: navigator.userAgent
  });

  await supabase.from('analytics_events').insert({
    ...eventData,
    session_ref: session
  });
}
```

#### B. Update Session Management
```typescript
// utils/session-manager.ts
export class SessionManager {
  private sessionId: string | null = null;

  async initSession(user?: User) {
    const { data } = await supabase.rpc('get_or_create_session', {
      p_user_id: user?.id || null,
      p_guest_id: this.getGuestId(),
      p_ip_address: await this.getClientIP(),
      p_user_agent: navigator.userAgent,
      p_referrer: document.referrer
    });
    
    this.sessionId = data;
    return data;
  }

  async endSession() {
    if (this.sessionId) {
      await supabase.rpc('end_session', {
        p_session_id: this.sessionId
      });
      this.sessionId = null;
    }
  }

  private getGuestId(): string {
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem('guest_id', guestId);
    }
    return guestId;
  }
}
```

### Step 3: Update Data Integration Layer

#### Update Analytics Queries
```typescript
// lib/supabase-queries.ts - Updated analytics functions
export const getEnhancedListingAnalytics = async (listingId: string) => {
  const { data, error } = await supabase
    .from('enhanced_seller_analytics')
    .select('*')
    .eq('listing_id', listingId)
    .gte('event_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) throw error;
  return data;
};

export const trackAnalyticsEventWithSession = async (
  eventData: Omit<AnalyticsEvent, 'session_ref'> & { sessionId?: string }
) => {
  const sessionId = eventData.sessionId || await sessionManager.initSession();
  
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      ...eventData,
      session_ref: sessionId
    });

  if (error) throw error;
};
```

### Step 4: Migrate Existing Data (Optional)
```sql
-- If you need to preserve existing guest relationships
INSERT INTO public.user_guest_tracking (user_id, guest_id, first_seen, last_seen)
SELECT 
  id as user_id,
  guest_id,
  created_at as first_seen,
  last_login as last_seen
FROM public.users 
WHERE guest_id IS NOT NULL
ON CONFLICT (user_id, guest_id) DO NOTHING;
```

### Step 5: Update API Routes

#### Analytics API Route
```typescript
// app/api/analytics/route.ts - Updated version
import { SessionManager } from '@/utils/session-manager';

export async function POST(request: Request) {
  const sessionManager = new SessionManager();
  const eventData = await request.json();
  
  // Initialize session if not provided
  if (!eventData.sessionId) {
    eventData.sessionId = await sessionManager.initSession();
  }

  // Track event with session reference
  await trackAnalyticsEventWithSession(eventData);
  
  return NextResponse.json({ success: true });
}
```

## Testing the Migration

### 1. Verify Schema Changes
```sql
-- Check that problematic indexes are removed
SELECT indexname FROM pg_indexes 
WHERE tablename = 'users' AND indexname = 'idx_users_guest_id';
-- Should return no rows

-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_guest_tracking', 'event_sessions');
-- Should return both tables
```

### 2. Test Session Functions
```sql
-- Test session creation
SELECT public.get_or_create_session(
  'user-uuid-here'::uuid,
  'guest-uuid-here'::uuid,
  '192.168.1.1'::inet,
  'Mozilla/5.0...'
);
```

### 3. Verify Analytics Performance
```sql
-- Run performance analysis
SELECT * FROM public.analyze_analytics_performance();
```

## Performance Benefits

### Before Migration
- Volatile function indexes caused unpredictable performance
- Guest tracking was inefficient
- Limited session analytics

### After Migration
- ✅ Deterministic, fast indexes
- ✅ Efficient session management
- ✅ Comprehensive analytics with session data
- ✅ Better user journey tracking
- ✅ Reduced database load

## Rollback Plan (If Needed)

### 1. Restore Original Indexes
```sql
-- Only if absolutely necessary and you understand the performance implications
CREATE INDEX idx_users_guest_id ON public.users(guest_id);
CREATE INDEX idx_analytics_guest ON public.analytics_events(guest_id);
```

### 2. Revert Application Code
- Switch back to direct guest_id tracking
- Remove session management calls

## Monitoring and Maintenance

### 1. Regular Performance Checks
```sql
-- Monitor index usage
SELECT * FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('analytics_events', 'event_sessions', 'user_guest_tracking');
```

### 2. Session Cleanup (Recommended Cron Job)
```sql
-- Clean up old ended sessions (run weekly)
DELETE FROM public.event_sessions 
WHERE ended_at < NOW() - INTERVAL '90 days';

-- Clean up inactive guest tracking (run monthly)
UPDATE public.user_guest_tracking 
SET is_active = false 
WHERE last_seen < NOW() - INTERVAL '30 days' AND is_active = true;
```

## Conclusion

This migration solves the volatile function index issues while providing enhanced analytics capabilities. The new session-based tracking offers better performance and more comprehensive user journey insights.

**Estimated Migration Time**: 2-4 hours including testing
**Risk Level**: Low (with proper testing)
**Performance Impact**: Significant improvement