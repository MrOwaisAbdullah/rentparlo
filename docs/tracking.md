# RentParLo.pk Analytics Tracking System

## Overview

The RentParLo.pk Analytics Tracking System is a comprehensive solution for tracking user interactions across the platform. This system handles both authenticated users and anonymous visitors by using persistent guest IDs, ensuring accurate tracking across sessions and user journeys.

## Currently Tracked Events

### 1. Listing Interactions

#### Listing Views (`view`)
- **Trigger**: When a user visits a listing detail page
- **Data Collected**:
  - `listing_id`: The ID of the viewed listing
  - `event_type`: "view"
  - User identification (authenticated user ID or guest ID)
  - Device information (device type, browser, OS)
  - Page context (URL, referrer)
  - Timestamp

#### Listing Card Clicks (`listing_click`)
- **Trigger**: When a user clicks on a listing card in search results or category pages
- **Data Collected**:
  - `listing_id`: The ID of the clicked listing
  - `event_type`: "listing_click"
  - User identification (authenticated user ID or guest ID)
  - Device information
  - Page context
  - Timestamp

### 2. Seller Profile Interactions

#### Profile Views (`profile_view`)
- **Trigger**: When a user visits a seller's profile page
- **Data Collected**:
  - `event_type`: "profile_view"
  - `user_id`: The ID of the seller whose profile was viewed
  - User identification (authenticated user ID or guest ID)
  - Device information
  - Page context
  - Timestamp
  - Metadata: source of view (e.g., "listing_view")

### 3. Contact Interactions

#### Contact Clicks (`contact_click`)
- **Trigger**: When a user attempts to contact a seller via phone call
- **Data Collected**:
  - `listing_id`: The ID of the listing associated with the contact
  - `event_type`: "contact_click"
  - User identification
  - Device information
  - Page context
  - Timestamp
  - Metadata: contact method ("call"), seller ID

#### WhatsApp Clicks (`WhatsApp_click`)
- **Trigger**: When a user attempts to contact a seller via WhatsApp
- **Data Collected**:
  - `listing_id`: The ID of the listing associated with the contact
  - `event_type`: "WhatsApp_click"
  - User identification
  - Device information
  - Page context
  - Timestamp
  - Metadata: contact method ("whatsapp"), seller ID

#### Map Clicks (`map_click`)
- **Trigger**: When a user clicks on a map/location link
- **Data Collected**:
  - `listing_id`: The ID of the listing associated with the location
  - `event_type`: "map_click"
  - User identification
  - Device information
  - Page context
  - Timestamp
  - Metadata: contact method ("map"), seller ID

#### Email Contact
- **Trigger**: When a user sends an email to a seller
- **Data Collected**:
  - `event_type`: "contact_click"
  - User identification
  - Device information
  - Page context
  - Timestamp
  - Metadata: contact method ("email"), source ("seller_profile"), seller ID

### 4. User Engagement

#### Search Queries (`search`)
- **Trigger**: When a user performs a search
- **Data Collected**:
  - `event_type`: "search"
  - User identification
  - Device information
  - Page context
  - Timestamp
  - Metadata: search query, applied filters

#### Share Actions (`share`)
- **Trigger**: When a user shares content (listing or review)
- **Data Collected**:
  - `listing_id`: The ID of the shared listing (when applicable)
  - `event_type`: "share"
  - User identification
  - Device information
  - Page context
  - Timestamp
  - Metadata: sharing platform, review ID (when applicable), helpful click status

#### Save/Favorite Actions (`save`)
- **Trigger**: When a user saves or favorites a listing
- **Data Collected**:
  - `listing_id`: The ID of the saved listing
  - `event_type`: "save"
  - User identification
  - Device information
  - Page context
  - Timestamp

### 5. Advertisement Banner Tracking

#### Banner Impressions (`banner_impression`)
- **Trigger**: When an advertisement banner is displayed to a user
- **Data Collected**:
  - `banner_id`: The Sanity document ID of the banner
  - `placement`: Placement location (e.g., "homepage-top", "category-sidebar")
  - `banner_size`: Size of the banner (e.g., "leaderboard", "medium-rectangle")
  - User identification
  - Session reference
  - Device information (device type, browser, OS)
  - Page context (URL, title, category, search query)
  - Screen and viewport information
  - Timestamp

#### Banner Clicks (`banner_click`)
- **Trigger**: When a user clicks on an advertisement banner
- **Data Collected**:
  - `banner_id`: The Sanity document ID of the banner
  - `placement`: Placement location
  - `banner_size`: Size of the banner
  - `target_url`: The URL the user is directed to
  - User identification
  - Session reference
  - Device information
  - Page context
  - Interaction data (time on page, scroll depth)
  - Timestamp

## User Identification System

### Guest ID Management
The system uses persistent guest IDs to track anonymous users across sessions:

1. **Anonymous Users**:
   - Generate UUID using `crypto.randomUUID()`
   - Store in localStorage and cookies with 1-year expiration
   - Maintain consistent ID across browser sessions

2. **Authenticated Users**:
   - Retrieve `guest_id` from user profile in the database
   - Maintain continuity with anonymous activities
   - Link anonymous activities to authenticated profiles

3. **User Registration/Login**:
   - New users get a `guest_id` generated and stored in their profile
   - Existing users have their `guest_id` retrieved from profile
   - Anonymous activities can be linked to authenticated profiles

## Data Collection Details

### Device Information
- **Device Type**: mobile, tablet, or desktop
- **Browser**: Chrome, Firefox, Safari, Edge, or unknown
- **Operating System**: Windows, MacOS, Linux, Android, iOS, or unknown

### Page Context
- **URL**: Current page URL
- **Title**: Current page title
- **Referrer**: Referring page URL
- **Category Context**: Category information (when applicable)
- **Search Query**: Search terms (when applicable)

### Location Data
- **City**: User's city (when available)
- **IP Address**: User's IP address (server-side only)

### Session Data
- **Session Reference**: Link to user session
- **User Agent**: Browser user agent string

### Custom Metadata
Event-specific data stored in JSONB format for flexible tracking

## Database Schema

### `analytics_events` Table
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

### `banner_impressions` Table
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

### `banner_clicks` Table
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

## Implementation Examples

### Tracking a Listing View
```typescript
import { trackListingView } from '@/lib/analytics-tracking';

// Track when a user views a listing
await trackListingView('listing-123');
```

### Tracking a Contact Interaction
```typescript
import { trackContactClick } from '@/lib/analytics-tracking';

// Track when a user clicks to call a seller
await trackContactClick('listing-123', 'seller-456');
```

### Tracking a Banner Impression
```typescript
import { trackBannerImpression } from '@/lib/analytics-tracking';

// Track when a banner is displayed
await trackBannerImpression('banner-789', 'homepage-top', 'leaderboard');
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

## Analytics Dashboard Data

The tracking system provides data for several analytics dashboards:

### Seller Analytics
- Listing performance (views, contact clicks, WhatsApp clicks)
- Profile analytics (profile views, engagement metrics)
- Comparison reports and geographic insights

### Platform Analytics
- User engagement metrics
- Conversion tracking
- Retention metrics
- Monetization reports

### Banner Analytics
- Impression tracking
- Click tracking
- CTR (Click-Through Rate) analysis
- Performance reports