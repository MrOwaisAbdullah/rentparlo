# RentParlo.pk: System Architecture and Data Flow

## 1. Introduction

This document provides a detailed explanation of the inner workings of the RentParlo.pk platform. Its purpose is to serve as a comprehensive guide for developers to understand the data architecture, the relationship between the primary services (Sanity and Supabase), and the flow of data for key features, including the analytics system.

## 2. Core Architectural Principles

The platform is built on a modern Jamstack architecture, leveraging the strengths of specialized, API-first services. The two pillars of the backend are **Sanity.io** and **Supabase**.

### A. Sanity.io: The Structured Content Hub

- **Purpose**: Sanity serves as the headless CMS for all structured, document-like content. This is content that is typically managed by content editors, admins, or through a structured creation process (like making a new listing).
- **What it Stores**:
  - `listings`: The core rental items.
  - `blog`: All blog posts and articles.
  - `category`: Product and blog categories.
  - `adBanner`: Promotional and advertising content.
  - `review`: User-submitted reviews (which are moderated).
  - `verificationDocument`: Securely stored images for seller verification (e.g., CNIC photos).
- **Reference**: The schemas for all these types are defined in `sanity/SchemaTypes/`.

### B. Supabase: The Relational Data & Logic Engine

- **Purpose**: Supabase acts as the traditional backend, handling relational data, user authentication, and business logic that requires database functions.
- **What it Stores**:
  - `users`: User accounts, linked to `auth.users`.
  - `seller_profiles`: Detailed information about sellers, including verification status and tier.
  - `analytics_events`: Raw data for user interactions with listings.
  - `banner_impressions`: Raw data for banner impressions (displays) with detailed contextual information.
  - `banner_clicks`: Raw data for user clicks on ad banners with comprehensive tracking.
  - `banner_performance_daily`: Aggregated daily statistics for banner performance.
  - `user_subscriptions`: Manages seller subscription levels.
  - `support_tickets`: User-submitted support requests.
- **Reference**: The complete database structure is defined in `utils/supabase/schema.sql`.

### C. The "Golden Link": How They Work Together

The power of this architecture lies in how Sanity and Supabase are linked. The two systems are not isolated; they reference each other to create a unified data model.

- **Listing to Seller**: A `listing` document in Sanity has a `supabaseId` field. This ID is the foreign key that links the listing to a specific user in the `public.users` and `public.seller_profiles` tables in Supabase. This is how we know who owns which listing.
- **Analytics to Listing**: An `analytics_events` row in Supabase has a `listing_id` column. This ID is the Sanity document ID (`_id`) of the listing that was interacted with. This links a user action back to the specific content.
- **Banner Analytics to Banner**: A `banner_impressions` or `banner_clicks` row in Supabase has a `banner_id` column, which stores the Sanity document ID (`_id`) of the `adBanner` that was displayed or clicked.

This separation of concerns allows for incredible flexibility. Sanity handles complex, nested content beautifully, while Supabase handles relational data, security (RLS), and real-time logic with high performance.

## 3. Data Flow: A Step-by-Step Walkthrough

Let's trace a common user journey: **viewing a listing page**.

1.  **Initial Request**: A user navigates to `/listing/[slug]`. The Next.js server receives the request.
2.  **Fetch Content (Sanity)**: The page component on the server calls a function, likely `getListingBySlug(slug)`, which is defined in `lib/sanity-queries.ts`. This function executes a GROQ query (`LISTING_BY_SLUG_QUERY`) against the Sanity API to fetch the content for that specific listing (title, description, images, etc.).
3.  **Fetch Seller Data (Supabase)**: The `supabaseId` from the fetched Sanity listing is used to query the `seller_profiles` table in Supabase. This retrieves the seller's information, such as their username, verification status, and seller tier. This is done via the Supabase client (`utils/supabase/server.ts` or `client.ts`).
4.  **Fetch Analytics Data (Supabase)**: To display view counts, the application queries the `analytics_events` table (or the `enhanced_seller_analytics` view) in Supabase, filtering by the listing's Sanity ID (`listing_id`) and the event type (`view`).
5.  **Render Page**: The Next.js server combines the data from Sanity and Supabase and server-renders the complete page, sending it to the client.
6.  **Track New View (Client-Side)**: Once the page loads on the client, a `useEffect` hook triggers an API call to our own backend (e.g., `/api/analytics`). This API route then inserts a new row into the `analytics_events` table in Supabase, recording a new `view` event for this `listing_id`.

### How are things updated or deleted?

- **Listings (Sanity)**: When a seller edits their listing, the application uses the Sanity client (`client.patch(...)`) to update the corresponding document in Sanity. Deletion uses `client.delete(...)`. These helpers are defined in `lib/sanity-queries.ts`.
- **User Profiles (Supabase)**: When a user updates their profile, an API call is made to the backend, which runs an `UPDATE` query on the `public.users` or `public.seller_profiles` table in Supabase, secured by Row Level Security (RLS) policies ensuring users can only edit their own data.

## 4. Deep Dive: The Analytics System

The analytics system is designed to be robust and performant, tracking user interactions without slowing down the user experience.

### A. Listing Analytics

This system tracks how users interact with rental listings.

1.  **Event Trigger**: A user performs an action on the frontend (e.g., clicks a "WhatsApp" button).
2.  **API Call**: The frontend sends a request to a dedicated API route (e.g., `/api/analytics/track`). The request payload includes the `listing_id` (from Sanity) and the `event_type` (e.g., `WhatsApp_click`).
3.  **Database Insert**: The API route connects to Supabase and inserts a new record into the `public.analytics_events` table. This table stores the raw, individual events.
    - **Reference**: The `AnalyticsEvent` type in `types/index.ts` defines the shape of this data.
4.  **Data Aggregation**: For performance, raw event data is rarely queried directly for display. Instead, we use:
    - **Database Views**: The `enhanced_seller_analytics` view (defined in `utils/supabase/schema.sql`) pre-aggregates the raw data, calculating total views, clicks, etc., per listing per day. This is very fast to query.
    - **Database Functions**: The `get_seller_analytics` function can be called to get a quick summary for a seller.
5.  **Display**: The aggregated data from the view or function is fetched and displayed in the Seller Dashboard, giving sellers near real-time insights into their listing's performance.

### B. Ad Banner Analytics

This system tracks the performance of paid ad placements with comprehensive tracking for impressions and clicks.

#### 1. Banner Sizes and Placements

The system supports multiple banner sizes and placements to accommodate different advertising needs:

**Banner Sizes:**
- **Large Banner (1400×400)**: Full-width banners for homepage tops
- **Leaderboard (1200×250)**: Standard horizontal banners (1400px wide on desktop, 320px on mobile)
- **Medium Rectangle (300×250)**: Standard sidebar banners
- **Large Rectangle (336×280)**: Tall rectangular banners
- **Half Page (300×600)**: Vertical half-page banners
- **Mobile Banner (320×50)**: Compact banners for mobile devices
- **Popup (600×400)**: Modal popup banners
- **Square (250×250)**: Square banners
- **Vertical Rectangle (300×600)**: Tall vertical banners
- **Skyscraper (160×600)**: Narrow skyscraper banners

**Banner Placements:**
- **Homepage Top**: Large Banner (1400×400) - Full width at top of homepage
- **Homepage Middle**: Leaderboard (1200×250) - Centered leaderboard banner
- **Homepage Bottom**: Leaderboard (1200×250) - Centered leaderboard banner
- **Category Sidebar**: Medium Rectangle (300×250) - Sidebar placement
- **Category Sidebar (Category Specific)**: Medium Rectangle (300×250) - Category-specific sidebar
- **Search Top**: Leaderboard (1200×250) - Above search results
- **Search Sidebar**: Medium Rectangle (300×250) - Sidebar placement
- **Listing Top**: Leaderboard (1200×250) - Above listing details
- **Listing Sidebar**: Medium Rectangle (300×250) - Sidebar placement
- **User Profile Top**: Leaderboard (1200×250) - Above user profiles
- **User Profile Sidebar**: Medium Rectangle (300×250) - Sidebar placement
- **Blog Top**: Leaderboard (1200×250) - Above blog posts
- **Blog Sidebar**: Medium Rectangle (300×250) - Sidebar placement
- **Content Top**: Leaderboard (1200×250) - Above content pages
- **Content Sidebar**: Medium Rectangle (300×250) - Sidebar placement
- **Mobile Banner**: Mobile Banner (320×50) - Standard mobile banner
- **Mobile Specific**: Mobile Banner (320×50) - Mobile-specific content
- **Popup Banner**: Popup (600×400) - Modal popup
- **Seller Profile**: Leaderboard (1200×250) - On seller profiles
- **Dashboard Top**: Leaderboard (1200×250) - At top of user dashboards
- **Dashboard Sidebar**: Medium Rectangle (300×250) - In user dashboard sidebar

#### 2. Banner Impressions Tracking

1.  **Banner Display**: When an `AdBanner` component is rendered and becomes visible to a user, an impression is recorded.
2.  **Data Collection**: The system collects detailed contextual information:
    - **User Information**: Authenticated user ID or guest ID
    - **Session Data**: Session reference and session duration
    - **Device Information**: Device type (mobile/tablet/desktop), browser, operating system
    - **Network Data**: IP address, user agent, referrer
    - **Location Data**: City, geographic location
    - **Page Context**: Current page URL, page title, category context, search query
    - **Display Information**: Screen resolution, viewport size
3.  **API Call**: The frontend sends detailed impression data to `/api/banners/impression` including:
    - `banner_id`: Sanity document ID of the banner
    - `placement`: Placement location (e.g., "homepage-top", "category-sidebar")
    - `banner_size`: Size of the banner (e.g., "leaderboard", "medium-rectangle")
    - Contextual data collected above
4.  **Database Insert**: The API route inserts a new row into the `public.banner_impressions` table with all collected information.

#### 3. Banner Clicks Tracking

1.  **Event Trigger**: A user clicks on an `AdBanner` component.
2.  **Data Collection**: The system collects the same detailed contextual information as impressions, plus:
    - **Click-Specific Data**: Target URL, time on page before clicking, scroll depth percentage
3.  **API Call**: The frontend sends detailed click data to `/api/banners/click` including:
    - `banner_id`: Sanity document ID of the banner
    - `placement`: Placement location
    - `banner_size`: Size of the banner
    - `target_url`: The URL the user is being directed to
    - Contextual data collected above
4.  **Database Insert**: The API route inserts a new row into the `public.banner_clicks` table with all collected information.

#### 4. Data Aggregation and Performance Analytics

1.  **Daily Aggregation**: A scheduled job or database function aggregates raw impression and click data into the `public.banner_performance_daily` table.
2.  **Calculated Metrics**: The aggregation process calculates key performance indicators:
    - **Impressions**: Total number of times the banner was displayed
    - **Clicks**: Total number of clicks on the banner
    - **Unique Impressions**: Number of unique users who saw the banner
    - **Unique Clicks**: Number of unique users who clicked the banner
    - **Click-Through Rate (CTR)**: (Clicks / Impressions) * 100, calculated using the `calculate_banner_ctr` function
    - **Average Time on Page**: Average time users spent on the page before clicking
    - **Average Scroll Depth**: Average percentage of the page scrolled before clicking
    - **Top Performers**: Aggregated data by cities, devices, and browsers
3.  **Database Functions**: The system provides database functions for querying analytics:
    - `calculate_banner_ctr(impressions, clicks)`: Calculates precise CTR with proper decimal precision
    - `get_banner_analytics_summary()`: Returns comprehensive analytics summary with filtering options

#### 5. Display and Reporting

1.  **Admin Dashboard**: Aggregated data is displayed in the Admin Dashboard, providing:
    - Real-time performance metrics for all banners
    - Historical performance trends
    - Comparative analysis by placement and size
    - Geographic and demographic breakdowns
    - Performance alerts and recommendations
2.  **Seller Reports**: Sellers can access performance reports for their sponsored content
3.  **Advertiser Portal**: External advertisers can access performance data through a dedicated portal

#### 6. Advanced Features

1.  **A/B Testing**: The system supports A/B testing of different banner designs and placements
2.  **Targeting Analytics**: Detailed analysis of targeting effectiveness (geographic, demographic, behavioral)
3.  **Conversion Tracking**: Integration with conversion tracking for measuring ROI
4.  **Fraud Detection**: Automated detection of suspicious activity patterns
5.  **Real-Time Monitoring**: Live monitoring of campaign performance with alerts
6.  **Session-Based Tracking**: One impression per banner per session to prevent inflation
7.  **Device-Specific Analytics**: Separate tracking for mobile, tablet, and desktop devices
8.  **User Type Segmentation**: Analytics broken down by user types (all users, sellers, new users)

By separating the concerns of content and data, and creating strong, well-defined links between them, the RentParlo.pk platform is built to be scalable, maintainable, and highly performant. The comprehensive banner analytics system provides deep insights into advertising performance while maintaining user privacy and data integrity.