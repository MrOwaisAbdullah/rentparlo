# RentParLo.pk Analytics Tracking System

## Overview

The RentParLo.pk Analytics Tracking System is a comprehensive solution for tracking user interactions across the platform. This system handles both authenticated users and anonymous visitors by using persistent guest IDs, ensuring accurate tracking across sessions and user journeys.

## Key Components

### 1. Guest ID Management (`lib/guest-id.ts`)

The guest ID management system handles generation and persistence of unique identifiers for anonymous users:

```typescript
// Generate or retrieve a guest ID
const guestId = getGuestId();

// Get appropriate tracking ID for current user
const trackingId = await getTrackingGuestId();

// Check if current user is a guest
const isGuest = isGuestUser(userId);
```

#### Features:
- **Persistent Storage**: Uses both localStorage and cookies for maximum compatibility
- **Cross-Session Tracking**: Maintains consistent ID across browser sessions
- **User Profile Integration**: Retrieves guest_id from authenticated user profiles
- **UUID Generation**: Uses crypto.randomUUID() for secure, unique IDs

### 2. Analytics Tracking Utility (`lib/analytics-tracking.ts`)

The main analytics tracking utility provides functions for tracking all user interactions:

```typescript
import analytics from '@/lib/analytics-tracking';

// Track a listing view
await analytics.trackListingView('listing-123');

// Track a seller profile view
await analytics.trackProfileView('seller-456');

// Track a contact click
await analytics.trackContactClick('listing-123', 'seller-456');

// Track a WhatsApp click
await analytics.trackWhatsAppClick('listing-123', 'seller-456');

// Track a banner impression
await analytics.trackBannerImpression('banner-789', 'homepage-top', 'leaderboard');

// Track a banner click
await analytics.trackBannerClick('banner-789', 'homepage-top', 'leaderboard', 'https://example.com');
```

#### Available Tracking Functions:
- `trackAnalyticsEvent()` - Generic event tracking
- `trackListingView()` - Track listing views
- `trackProfileView()` - Track seller profile views
- `trackContactClick()` - Track phone contact attempts
- `trackWhatsAppClick()` - Track WhatsApp contact attempts
- `trackMapClick()` - Track map/location clicks
- `trackBannerImpression()` - Track banner/advertisement displays
- `trackBannerClick()` - Track banner/advertisement clicks
- `trackSearch()` - Track search queries
- `trackShare()` - Track content sharing
- `trackSave()` - Track item saving
- `trackListingClick()` - Track listing card clicks

### 3. Database Schema

The analytics tracking system uses several database tables:

#### `analytics_events`
Stores all user interaction events:

```sql
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT, -- Made nullable to allow profile view tracking
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'contact_click', 'WhatsApp_click', 'share', 'save', 'search')),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id UUID,
  session_ref UUID REFERENCES public.event_sessions(session_id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  metadata JSONB, -- Add metadata column for storing additional event data
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `banner_impressions`
Tracks advertisement displays:

```sql
CREATE TABLE public.banner_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id TEXT NOT NULL, -- Sanity document ID
  placement TEXT NOT NULL, -- Placement location (homepage-top, category-sidebar, etc.)
  banner_size TEXT NOT NULL, -- Size of the banner (leaderboard, medium-rectangle, etc.)
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id UUID, -- For anonymous users
  session_ref UUID REFERENCES public.event_sessions(session_id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  os TEXT,
  screen_resolution TEXT, -- e.g., "1920x1080"
  viewport_size TEXT, -- e.g., "1200x800"
  page_url TEXT, -- The page where the banner was displayed
  page_title TEXT, -- Title of the page
  category_context TEXT, -- Category context if applicable
  search_query TEXT, -- Search query if on search results page
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `banner_clicks`
Tracks advertisement clicks:

```sql
CREATE TABLE public.banner_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id TEXT NOT NULL, -- Sanity document ID
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id UUID,
  session_ref UUID REFERENCES public.event_sessions(session_id) ON DELETE SET NULL,
  location TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  placement TEXT,
  banner_size TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  city TEXT,
  browser TEXT,
  os TEXT,
  page_url TEXT,
  page_title TEXT,
  category_context TEXT,
  search_query TEXT,
  target_url TEXT, -- The URL the user was directed to
  time_on_page INTEGER, -- Seconds user spent on page before clicking
  scroll_depth INTEGER, -- Percentage of page scrolled before clicking
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Implementation Details

### Tracking Flow

1. **User Visit**: When a user visits a page, their guest ID is generated/retrieved
2. **Event Tracking**: User interactions are tracked with appropriate metadata
3. **Data Storage**: Events are stored in the database with user/guest identification
4. **Analytics Processing**: Data is processed for reporting and insights

### Guest ID Persistence Strategy

1. **Anonymous Users**:
   - Generate UUID using `crypto.randomUUID()`
   - Store in localStorage and cookies
   - Set 1-year expiration for persistence

2. **Authenticated Users**:
   - Retrieve guest_id from user profile
   - Maintain continuity with anonymous activities
   - Link anonymous activities to authenticated profile

3. **User Registration/Login**:
   - New users get a guest_id generated and stored in their profile
   - Existing users have their guest_id retrieved from profile
   - Anonymous activities can be linked to authenticated profiles

### Data Collection

The system automatically collects contextual information:

- **Device Information**: Device type, browser, operating system
- **Page Context**: URL, title, category context, search query
- **Location Data**: City, IP address
- **Session Data**: Session reference, referrer
- **Custom Metadata**: Event-specific data

## Integration Examples

### Tracking Listing Views

```typescript
// In app/listing/[slug]/page.tsx
import { trackListingView, trackProfileView } from '@/lib/analytics-tracking';

async function trackPageView(listingId: string, sellerId?: string) {
  try {
    // Track the listing view
    await trackListingView(listingId);
    
    // Track seller profile view if sellerId is provided
    if (sellerId) {
      await trackProfileView(sellerId);
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}
```

### Tracking Contact Interactions

```typescript
// In contact seller modal
import { trackContactClick, trackWhatsAppClick } from '@/lib/analytics-tracking';

const handlePhoneCall = async () => {
  if (seller.profile?.phone) {
    window.location.href = `tel:${seller.profile.phone}`;
    
    // Track phone call
    try {
      await trackContactClick(listing._id, seller.id);
    } catch (error) {
      console.error('Error tracking phone call:', error);
    }
  }
};

const handleWhatsAppClick = async () => {
  // Track WhatsApp click
  try {
    await trackWhatsAppClick(listing._id, seller.id);
  } catch (error) {
    console.error('Error tracking WhatsApp click:', error);
  }
};
```

### Tracking Banner Impressions

```typescript
// In banner component
import { trackBannerImpression, trackBannerClick } from '@/lib/analytics-tracking';

const trackImpression = async () => {
  try {
    await trackBannerImpression(
      banner._id,
      placement,
      bannerSize
    );
  } catch (error) {
    console.error('Error tracking banner impression:', error);
  }
};

const handleClick = async () => {
  try {
    await trackBannerClick(
      banner._id,
      placement,
      bannerSize,
      banner.targetUrl
    );
    
    // Open the target URL
    window.open(banner.targetUrl, '_blank');
  } catch (error) {
    console.error('Error tracking banner click:', error);
  }
};
```

## Privacy and Security

### Data Protection
- **Minimal Data Collection**: Only essential tracking data is collected
- **User Consent**: Clear consent mechanisms for data collection
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: Privacy-conscious implementation

### Security Measures
- **UUID Generation**: Cryptographically secure UUID generation
- **Secure Storage**: Encrypted storage of sensitive data
- **Access Control**: Strict RLS policies for data access
- **Audit Trails**: Comprehensive logging of all tracking activities

## Performance Considerations

### Optimization Techniques
- **Batch Processing**: Group multiple events for efficient storage
- **Asynchronous Tracking**: Non-blocking tracking calls
- **Caching**: Cache frequently accessed tracking data
- **Database Indexing**: Optimized database indexes for fast queries

### Error Handling
- **Graceful Degradation**: Tracking failures don't affect user experience
- **Retry Mechanisms**: Automatic retry of failed tracking events
- **Error Logging**: Comprehensive error logging for debugging
- **Monitoring**: Real-time monitoring of tracking system health

## Analytics Dashboard

The system supports a comprehensive analytics dashboard with:

### Seller Analytics
- **Listing Performance**: Views, contact clicks, WhatsApp clicks
- **Profile Analytics**: Profile views, engagement metrics
- **Comparison Reports**: Performance comparisons over time
- **Geographic Insights**: Location-based analytics

### Platform Analytics
- **User Engagement**: Overall platform usage metrics
- **Conversion Tracking**: User journey analysis
- **Retention Metrics**: User retention and loyalty analysis
- **Monetization Reports**: Revenue and advertising performance

### Banner Analytics
- **Impression Tracking**: Detailed banner display analytics
- **Click Tracking**: Comprehensive click analytics
- **CTR Analysis**: Click-through rate calculations
- **Performance Reports**: Daily, weekly, and monthly performance summaries

## Testing and Validation

### Automated Testing
- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end tracking workflows
- **Regression Tests**: Prevent breaking changes
- **Load Testing**: Performance under high traffic

### Manual Verification
- **Browser Testing**: Cross-browser compatibility
- **Mobile Testing**: Mobile device compatibility
- **User Journey Testing**: Complete user flow validation
- **Data Accuracy Testing**: Verification of tracking accuracy

## Future Enhancements

### Advanced Features
- **Machine Learning**: Predictive analytics for user behavior
- **Real-time Analytics**: WebSocket-based real-time tracking
- **Advanced Segmentation**: Sophisticated user segmentation
- **A/B Testing**: Integrated A/B testing framework

### Integration Opportunities
- **Third-party Analytics**: Integration with Google Analytics, etc.
- **Marketing Automation**: Integration with marketing platforms
- **CRM Integration**: Customer relationship management
- **Business Intelligence**: Advanced business analytics

## Troubleshooting

### Common Issues

1. **Tracking Not Working**:
   - Check browser console for JavaScript errors
   - Verify Supabase connection
   - Ensure RLS policies allow tracking

2. **Guest ID Issues**:
   - Clear browser storage and cookies
   - Check localStorage and cookie permissions
   - Verify cross-domain tracking configuration

3. **Database Errors**:
   - Check database connection
   - Verify table schemas and constraints
   - Ensure proper indexing

### Debugging Tips

1. **Enable Verbose Logging**:
   ```typescript
   localStorage.setItem('debug_analytics', 'true');
   ```

2. **Check Network Requests**:
   - Use browser developer tools to monitor tracking requests
   - Verify HTTP status codes and response data

3. **Database Query Debugging**:
   ```sql
   -- Check recent analytics events
   SELECT * FROM analytics_events 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

## Conclusion

The RentParLo.pk Analytics Tracking System provides a robust, privacy-conscious solution for tracking user interactions across the platform. With persistent guest ID management, comprehensive event tracking, and a flexible database schema, the system enables data-driven decision making while maintaining user privacy and platform performance.