# Banner System Usage Guide

This document explains how to use the RentParlo.pk banner system, including how to configure banners in Sanity and display them on the website.

## Table of Contents
1. [Banner Configuration in Sanity](#banner-configuration-in-sanity)
2. [Banner Display in Website](#banner-display-in-website)
3. [Banner Analytics](#banner-analytics)
4. [Banner Sizes and Placements](#banner-sizes-and-placements)
5. [Troubleshooting](#troubleshooting)

## Banner Configuration in Sanity

### 1. Creating a New Banner
1. Log in to the Sanity Studio at `/studio`
2. Navigate to the "Advertisement Banners" section
3. Click "Create new document"
4. Fill in the required fields:
   - **Banner Title**: A descriptive name for the banner
   - **Placement Location**: Select where the banner should appear
   - **Banner Size**: Select the appropriate size for the placement
   - **Banner Image**: Upload the main banner image
   - **Mobile Image** (Optional): Upload a separate image for mobile devices
   - **Target URL**: The URL users should be directed to when clicking the banner
   - **Target Location** (Optional): Specify a location for geo-targeting
   - **Target Category** (Optional): Specify a category for category-targeting
   - **Target User Type**: Choose "All Users", "Sellers Only", or "New Users Only"
   - **Start Date**: When the banner campaign should begin
   - **End Date** (Optional): When the banner campaign should end
   - **Is Active**: Toggle to activate/deactivate the banner
   - **Display Order**: Lower numbers have higher priority

### 2. Banner Placement Options
The following placement options are available:
- **Homepage Top**: Large banner at the top of the homepage
- **Homepage Middle**: Leaderboard banner in the middle of the homepage
- **Homepage Bottom**: Leaderboard banner at the bottom of the homepage
- **Category Page Sidebar**: Medium rectangle banner in the category page sidebar
- **Category Page Sidebar (Category Specific)**: Medium rectangle banner for specific categories
- **Search Results Top**: Leaderboard banner above search results
- **Search Results Sidebar**: Medium rectangle banner in the search results sidebar
- **Listing Page Top**: Leaderboard banner above listing details
- **Listing Page Sidebar**: Medium rectangle banner in the listing page sidebar
- **User Profile Top**: Leaderboard banner above user profiles
- **User Profile Sidebar**: Medium rectangle banner in user profile sidebar
- **Blog Page Top**: Leaderboard banner above blog posts
- **Blog Page Sidebar**: Medium rectangle banner in blog sidebar
- **Content Page Top**: Leaderboard banner above content pages
- **Content Page Sidebar**: Medium rectangle banner in content page sidebar
- **Mobile Banner**: Banner specifically for mobile devices
- **Mobile Specific**: Banner specifically for mobile devices with unique content
- **Popup Banner**: Popup modal banner
- **Seller Profile Banner**: Leaderboard banner on seller profiles
- **Dashboard Top**: Leaderboard banner at the top of user dashboards
- **Dashboard Sidebar**: Medium rectangle banner in user dashboard sidebar

### 3. Banner Size Options
The following banner sizes are available:
- **Leaderboard (1200x250)**: Wide horizontal banner
- **Large Banner (1400x400)**: Extra wide banner for homepage top
- **Medium Rectangle (300x250)**: Standard sidebar/banner size
- **Large Rectangle (336x280)**: Tall rectangle banner
- **Half Page (300x600)**: Vertical half-page banner
- **Mobile Banner (320x50)**: Narrow banner for mobile
- **Popup (600x400)**: Modal popup banner
- **Square (250x250)**: Square banner
- **Vertical Rectangle (300x600)**: Tall vertical banner
- **Skyscraper (160x600)**: Narrow skyscraper banner

## Banner Display in Website

### 1. Adding Banners to Pages
Banners are automatically displayed on pages using the `EnhancedAdBanner` component:

```tsx
import { EnhancedAdBanner } from "@/components/ads/enhanced-ad-banner"

export default function MyPage() {
  return (
    <div>
      {/* Homepage Top Banner */}
      <EnhancedAdBanner 
        placement="homepage-top" 
        className="mx-auto"
      />
      
      <div className="content">
        {/* Page content */}
      </div>
      
      {/* Homepage Bottom Banner */}
      <EnhancedAdBanner 
        placement="homepage-bottom" 
        className="mx-auto"
      />
    </div>
  )
}
```

### 2. Banner Component Props
The `EnhancedAdBanner` component accepts the following props:

- `placement` (required): The banner placement location
- `size` (optional): Override the default size for the placement
- `className` (optional): Additional CSS classes
- `fallbackText` (optional): Text to display if no banner is available
- `userType` (optional): Target user type ("all", "sellers", "new-users")
- `showCloseButton` (optional): Whether to show the close button (default: true)

### 3. Responsive Behavior
The banner system automatically adapts to different screen sizes:
- Mobile banners only display on mobile devices
- Desktop banners are hidden on mobile devices
- Banner sizes adjust based on screen size
- Separate mobile images can be uploaded for mobile devices

## Banner Analytics

### 1. Impression Tracking
Banner impressions (displays) are automatically tracked when a banner becomes visible:
- Records detailed contextual information about each impression
- Tracks user information, device details, location, and page context
- Prevents duplicate tracking within the same session
- Stores data in the `banner_impressions` table

### 2. Click Tracking
Banner clicks are automatically tracked when a user clicks on a banner:
- Records detailed contextual information about each click
- Tracks click-specific data like target URL, time on page, and scroll depth
- Stores data in the `banner_clicks` table

### 3. Performance Analytics
Daily performance data is aggregated for reporting:
- Impressions and clicks are aggregated by banner, placement, and date
- Click-through rates (CTR) are calculated automatically
- Unique user counts are tracked for accurate metrics
- Data is stored in the `banner_performance_daily` table

### 4. Analytics Dashboard
The admin dashboard provides comprehensive analytics:
- Real-time performance metrics for all banners
- Historical performance trends
- Comparative analysis by placement and size
- Geographic and demographic breakdowns
- Performance alerts and recommendations

## Banner Sizes and Placements

### 1. Homepage Banners
- **Homepage Top**: Large Banner (1400×400px) - Full width at top of homepage
- **Homepage Middle**: Leaderboard (1200×250px) - Centered leaderboard banner
- **Homepage Bottom**: Leaderboard (1200×250px) - Centered leaderboard banner

### 2. Category and Search Banners
- **Category Page Sidebar**: Medium Rectangle (300×250px) - Sidebar placement
- **Category Page Sidebar (Category Specific)**: Medium Rectangle (300×250px) - Category-specific sidebar
- **Search Results Top**: Leaderboard (1200×250px) - Above search results
- **Search Results Sidebar**: Medium Rectangle (300×250px) - Sidebar placement

### 3. Listing Page Banners
- **Listing Page Top**: Leaderboard (1200×250px) - Above listing details
- **Listing Page Sidebar**: Medium Rectangle (300×250px) - Sidebar placement

### 4. User Profile Banners
- **User Profile Top**: Leaderboard (1200×250px) - Above user profile
- **User Profile Sidebar**: Medium Rectangle (300×250px) - Sidebar placement

### 5. Blog and Content Banners
- **Blog Page Top**: Leaderboard (1200×250px) - Above blog posts
- **Blog Page Sidebar**: Medium Rectangle (300×250px) - Sidebar placement
- **Content Page Top**: Leaderboard (1200×250px) - Above content
- **Content Page Sidebar**: Medium Rectangle (300×250px) - Sidebar placement

### 6. Mobile Banners
- **Mobile Banner**: Mobile Banner (320×50px) - Standard mobile banner
- **Mobile Specific**: Mobile Banner (320×50px) - Mobile-specific content

### 7. Special Banners
- **Popup Banner**: Popup (600×400px) - Modal popup
- **Seller Profile Banner**: Leaderboard (1200×250px) - On seller profiles
- **Dashboard Top**: Leaderboard (1200×250px) - At top of dashboard
- **Dashboard Sidebar**: Medium Rectangle (300×250px) - In dashboard sidebar

## Troubleshooting

### 1. Banners Not Displaying
- Check that the banner is marked as "Active" in Sanity
- Verify that the current date is within the banner's start and end dates
- Ensure the banner's target user type matches the current user
- Check that there are enough slots available for the banner placement

### 2. Wrong Banner Size
- Verify that the correct size is selected in Sanity for the placement
- Check that the banner image dimensions match the selected size
- Ensure that responsive behavior is working correctly

### 3. Analytics Not Tracking
- Verify that the Supabase tables exist and have the correct structure
- Check that the API routes are working correctly
- Ensure that the user has proper permissions to insert data

### 4. Performance Issues
- Check that database indexes are properly configured
- Verify that the analytics aggregation jobs are running
- Ensure that the caching strategy is working correctly

## Best Practices

### 1. Banner Design
- Use high-quality images optimized for web
- Ensure text is legible on all backgrounds
- Follow IAB ad standards for sizes
- Create separate mobile versions when needed

### 2. Targeting
- Use specific targeting to improve relevance
- Test different combinations of targeting criteria
- Monitor performance to refine targeting over time
- Avoid overly restrictive targeting that limits reach

### 3. Scheduling
- Plan campaigns with appropriate start and end dates
- Rotate banners regularly to prevent ad fatigue
- Schedule seasonal campaigns in advance
- Monitor performance and adjust schedules as needed

### 4. Analytics
- Regularly review performance metrics
- Compare different banner placements and sizes
- Track conversion rates from banner clicks
- Use insights to optimize future campaigns