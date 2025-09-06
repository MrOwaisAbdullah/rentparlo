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
  - `adBanner`, `banner`: Promotional and advertising content.
  - `review`: User-submitted reviews (which are moderated).
  - `verificationDocument`: Securely stored images for seller verification (e.g., CNIC photos).
- **Reference**: The schemas for all these types are defined in `sanity/SchemaTypes/`.

### B. Supabase: The Relational Data & Logic Engine

- **Purpose**: Supabase acts as the traditional backend, handling relational data, user authentication, and business logic that requires database functions.
- **What it Stores**:
  - `users`: User accounts, linked to `auth.users`.
  - `seller_profiles`: Detailed information about sellers, including verification status and tier.
  - `analytics_events`: Raw data for user interactions with listings.
  - `banner_clicks`: Raw data for user clicks on ad banners.
  - `user_subscriptions`: Manages seller subscription levels.
  - `support_tickets`: User-submitted support requests.
- **Reference**: The complete database structure is defined in `utils/supabase/schema.sql`.

### C. The "Golden Link": How They Work Together

The power of this architecture lies in how Sanity and Supabase are linked. The two systems are not isolated; they reference each other to create a unified data model.

- **Listing to Seller**: A `listing` document in Sanity has a `supabaseId` field. This ID is the foreign key that links the listing to a specific user in the `public.users` and `public.seller_profiles` tables in Supabase. This is how we know who owns which listing.
- **Analytics to Listing**: An `analytics_events` row in Supabase has a `listing_id` column. This ID is the Sanity document ID (`_id`) of the listing that was interacted with. This links a user action back to the specific content.
- **Banner Analytics to Banner**: A `banner_clicks` row in Supabase has a `banner_id` column, which stores the Sanity document ID (`_id`) of the `adBanner` that was clicked.

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

This system tracks the performance of paid ad placements. The workflow is very similar to listing analytics.

1.  **Event Trigger**: A user clicks on an `AdBanner` component.
2.  **API Call**: The frontend captures the `_id` of the banner from Sanity and sends it in a request to an API route.
3.  **Database Insert**: The API route inserts a new row into the **`public.banner_clicks`** table. This table was recently added to `utils/supabase/schema.sql` to store these specific events.
    - **Reference**: The `BannerClick` type in `types/index.ts` defines the data structure, and the table definition in `utils/supabase/schema.sql` implements it.
4.  **Data Aggregation & Display**: This raw click data can then be aggregated to calculate click-through rates (CTR). This information would typically be displayed on an Admin Dashboard for the team to analyze ad performance and provide reports to advertisers.

By separating the concerns of content and data, and creating strong, well-defined links between them, the RentParlo.pk platform is built to be scalable, maintainable, and highly performant.