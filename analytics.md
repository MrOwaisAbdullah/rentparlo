# RentParlo.pk Analytics System Documentation

## 1. Introduction

The RentParlo.pk platform utilizes a robust analytics system designed to provide comprehensive insights into user behavior, listing performance, and advertisement effectiveness. This system is built upon a modern Jamstack architecture, leveraging Sanity.io as a headless CMS for structured content and Supabase as the relational database and backend logic engine. The core principle is to separate content management from transactional data, while maintaining strong, well-defined links between them.

## 2. Core Data Architecture

### A. Sanity.io: The Structured Content Hub

Sanity.io serves as the primary source for all structured, document-like content that is typically managed by content editors or through a structured creation process.

**Key Content Types Stored in Sanity:**
*   `listings`: Core rental items.
*   `adBanner`: Promotional and advertising content, including details like placement, size, target URL, and active dates.

### B. Supabase: The Relational Data & Logic Engine

Supabase handles all relational data, user authentication, and business logic requiring database functions. It is the central repository for all analytics data.

**Key Data Stored in Supabase for Analytics:**
*   `users`: User accounts, linked to `auth.users`.
*   `seller_profiles`: Detailed seller information, including verification status and tier.
*   `event_sessions`: Manages user sessions with deterministic session IDs, crucial for accurate tracking.
*   `user_guest_tracking`: Links authenticated users to their guest sessions.
*   `analytics_events`: Raw data for user interactions with listings (e.g., views, clicks).
*   `banner_impressions`: Raw data for banner displays with detailed contextual information.
*   `banner_clicks`: Raw data for user clicks on ad banners with comprehensive tracking.
*   `banner_performance_daily`: Aggregated daily statistics for banner performance.

### C. The "Golden Link": Connecting Sanity and Supabase

The analytics system relies on seamless integration between Sanity and Supabase:
*   **Listing to Seller:** A `listing` document in Sanity contains a `supabaseId` field, which is a foreign key linking it to a specific user in the `public.users` and `public.seller_profiles` tables in Supabase.
*   **Analytics to Listing:** An `analytics_events` record in Supabase includes a `listing_id` column, which stores the Sanity document ID (`_id`) of the interacted listing.
*   **Banner Analytics to Banner:** `banner_impressions` and `banner_clicks` records in Supabase use a `banner_id` column, storing the Sanity document ID (`_id`) of the `adBanner` that was displayed or clicked.

## 3. Session Management: The Engine of Analytics

A critical component of the analytics system is robust session management, which addresses previous issues with volatile function indexes and ensures accurate tracking.

### `event_sessions` Table
This table (`public.event_sessions`) manages user sessions. It stores a `session_id` (UUID), `user_id` (if authenticated), `guest_id` (for anonymous users), `ip_address`, `user_agent`, `referrer`, `city`, `device_type`, `browser`, `os`, `creation_at`, `last_active`, `session_duration`, `page_views`, and `is_bounce`.

### `get_or_create_session()` Function
This PostgreSQL function is central to session tracking. It attempts to find an existing session for a user (authenticated or guest) that has been active within the last 30 minutes. If found, it updates the `last_active` timestamp and increments `page_views`. If no active session is found, a new `session_id` is generated and a new session record is inserted. This ensures that multiple interactions within a short period are attributed to the same session, preventing inflated counts.

### `user_guest_tracking` Table
This table (`public.user_guest_tracking`) links guest sessions to authenticated users. When an anonymous user logs in, their `guest_id` can be associated with their `user_id`, allowing for a more complete view of their journey across sessions.

## 4. Listing Analytics

This system tracks how users interact with rental listings, providing sellers with valuable performance insights.

### Tracking Mechanism
1.  **Event Trigger:** A user performs an action on the frontend (e.g., viewing a listing, clicking a "WhatsApp" button, sharing, saving, or performing a search).
2.  **API Call:** The frontend sends a request to a dedicated API route (e.g., `/api/analytics/track`). The payload includes the `listing_id` (from Sanity) and the `event_type` (e.g., `view`, `contact_click`, `WhatsApp_click`, `share`, `save`, `search`).
3.  **Database Insert:** The API route inserts a new record into the `public.analytics_events` table in Supabase. This table stores raw, individual events, along with the `session_ref` (linking to `event_sessions`), `user_id`, `guest_id`, and other contextual data.

### Data Aggregation & Retrieval
For performance, raw event data is rarely queried directly for display. Instead, pre-aggregated data is used:
*   **`enhanced_seller_analytics` View:** This PostgreSQL view pre-aggregates raw `analytics_events` data, calculating total views, contact clicks, WhatsApp clicks, shares, unique sessions, and unique users per listing per day. This view is optimized for fast querying.
*   **`get_seller_analytics()` Function:** This PostgreSQL function provides a quick summary of analytics for a given seller, including total views, contact clicks, and WhatsApp clicks across all their listings.

### Display
Aggregated data from the `enhanced_seller_analytics` view or `get_seller_analytics` function is fetched and displayed in the Seller Dashboard, offering sellers near real-time insights into their listing's performance.

## 5. Ad Banner Analytics

This system tracks the performance of advertisement banners across the platform, providing comprehensive data for advertisers and platform administrators.

### Banner Configuration (Sanity)
Advertisement banners are defined in Sanity using the `adBanner` schema. This includes details such as:
*   `title`, `placement`, `size` (e.g., 'leaderboard', 'medium-rectangle')
*   `image`, `mobileImage`, `targetUrl`
*   `targetLocation`, `targetCategory`, `targetUserType`
*   `startDate`, `endDate`, `isActive`, `displayOrder`

### Impression Tracking
1.  **Banner Display:** When an `EnhancedAdBanner` component is rendered and becomes visible to a user, an impression is recorded.
2.  **Data Collection:** The system collects detailed contextual information, including `banner_id` (Sanity ID), `placement`, `banner_size`, `user_id`, `guest_id`, `session_ref`, `ip_address`, `user_agent`, `referrer`, `city`, `device_type`, `browser`, `os`, `screen_resolution`, `viewport_size`, `page_url`, `page_title`, `category_context`, and `search_query`.
3.  **API Call:** The frontend sends this detailed impression data to the `/api/banners/impression` endpoint.
4.  **Database Insert:** The API route inserts a new row into the `public.banner_impressions` table with all collected information. Impressions are tracked only once per banner per session to prevent inflation.

### Click Tracking
1.  **Event Trigger:** A user clicks on an `EnhancedAdBanner` component.
2.  **Data Collection:** The system collects the same detailed contextual information as impressions, plus click-specific data like `target_url`, `time_on_page` (seconds spent on page before clicking), and `scroll_depth` (percentage of page scrolled before clicking).
3.  **API Call:** The frontend sends this detailed click data to the `/api/banners/click` endpoint.
4.  **Database Insert:** The API route inserts a new row into the `public.banner_clicks` table.

### Data Aggregation & Performance Analytics
*   **`banner_performance_daily` Table:** A scheduled job or database function aggregates raw impression and click data into this table. It calculates key performance indicators daily.
*   **Calculated Metrics:**
    *   `impressions`, `clicks`, `unique_impressions`, `unique_clicks`
    *   `ctr` (Click-Through Rate): Calculated using the `calculate_banner_ctr` function.
    *   `avg_time_on_page`, `avg_scroll_depth`
    *   `top_cities`, `top_devices`, `top_browsers` (as JSONB)
*   **`calculate_banner_ctr()` Function:** A PostgreSQL function that calculates CTR as `(clicks / impressions) * 100`, returning a `DECIMAL(5,4)`.
*   **`get_banner_analytics_summary()` Function:** A PostgreSQL function that returns comprehensive analytics summaries for banners with filtering options (by banner ID, placement, date range).

### Display
Aggregated banner analytics data is displayed in the Admin Dashboard, providing real-time and historical performance metrics, comparative analysis, and geographic/demographic breakdowns.

## 6. Data Flow Example: Tracking a Banner Click

1.  **User Interaction:** A user sees and clicks an `EnhancedAdBanner` on the homepage.
2.  **Frontend Event:** The `handleClick` function within the `EnhancedAdBanner` component is triggered.
3.  **Contextual Data Collection:** The frontend gathers all relevant contextual data (user ID, session ID, device info, page URL, etc.).
4.  **API Call:** A `POST` request is sent to `/api/banners/click` with the `bannerId`, `placement`, `bannerSize`, `targetUrl`, and all collected contextual data.
5.  **Backend Processing:** The `/api/banners/click` route receives the request.
6.  **Session Management:** If a `sessionId` is not already present in the event data, the backend calls `public.get_or_create_session()` to ensure the click is associated with an active session.
7.  **Database Insert:** The backend inserts a new record into the `public.banner_clicks` table with all the provided data.
8.  **Redirection:** The user is redirected to the `targetUrl` of the banner.
9.  **Aggregation (Scheduled):** Periodically, a background process or database function aggregates the raw `banner_clicks` data into the `public.banner_performance_daily` table, updating metrics like clicks, unique clicks, and CTR.
10. **Reporting:** Administrators can then view these aggregated metrics in the Admin Dashboard.

## 7. Troubleshooting & Common Issues

### Problem: Slow Analytics Queries
*   **Cause:** Directly querying large raw event tables (`analytics_events`, `banner_impressions`, `banner_clicks`) for reporting.
*   **Solution:** Always use the pre-aggregated views (`enhanced_seller_analytics`, `banner_performance_daily`) or dedicated analytics functions (`get_seller_analytics`, `get_banner_analytics_summary`) for displaying performance metrics. These are designed for fast retrieval.

### Problem: Inaccurate Impression/View Counts (Inflated)
*   **Cause:** Counting every page refresh or component re-render as a new impression/view.
*   **Solution:** The system implements session-based tracking. Impressions and views are recorded only once per banner/listing per session. The `get_or_create_session()` function ensures that multiple interactions within a 30-minute window are tied to the same session, preventing duplicate counts.

### Problem: Foreign Key Constraint Errors During Seeding
*   **Cause:** Attempting to insert records into `public.users` or other tables that reference `auth.users` before the corresponding user exists in `auth.users`.
*   **Solution:** The seeding workflow (`docs/seeding-workflow.md`) has been updated to ensure that users are first created in `auth.users` via the Supabase Admin API before being inserted into `public.users`. This maintains referential integrity.

### Problem: Volatile Function Index Issues
*   **Cause:** Using `gen_random_uuid()` directly in indexed columns, leading to unpredictable query performance.
*   **Solution:** The Supabase schema has been migrated (`docs/supabase-schema-migration.md`) to address this. The `event_sessions` table now manages session IDs deterministically, and `analytics_events` uses `session_ref` instead of volatile IDs. Problematic indexes have been removed, and new indexes are created on deterministic columns only, significantly improving performance and reliability.

### Problem: Analytics Not Tracking
*   **Cause:** Incorrect Supabase table setup, API route misconfiguration, or RLS policy issues.
*   **Solution:**
    1.  Verify that all Supabase tables (`banner_impressions`, `banner_clicks`, `analytics_events`, `event_sessions`, `user_guest_tracking`) exist and have the correct schema as defined in `utils/supabase/schema.sql`.
    2.  Check that the API routes (`/api/banners/impression`, `/api/banners/click`, `/api/analytics/track`) are correctly implemented and accessible.
    3.  Review Row Level Security (RLS) policies in Supabase to ensure that `authenticated` and `anon` roles have appropriate `INSERT` permissions on the tracking tables, and `admin`/`seller` roles have `SELECT` permissions on aggregated data.

By understanding these architectural principles, data flows, and common troubleshooting steps, developers can effectively work with and maintain the RentParlo.pk analytics system.
