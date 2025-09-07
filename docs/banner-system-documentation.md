# Banner System Documentation

## Overview

The RentParlo.pk banner system provides comprehensive tracking and analytics for advertisement banners across the platform. The system supports multiple banner sizes and placements with detailed tracking for impressions and clicks.

## Components

### 1. Database Tables

#### banner_impressions
Tracks when banners are displayed to users with detailed contextual information:
- `banner_id`: Sanity document ID
- `placement`: Placement location (homepage-top, category-sidebar, etc.)
- `banner_size`: Size of the banner (leaderboard, medium-rectangle, etc.)
- `user_id`: Authenticated user ID
- `guest_id`: Anonymous user ID
- `session_ref`: Session reference
- `ip_address`: User's IP address
- `user_agent`: Browser user agent
- `referrer`: Referring page
- `city`: User's city
- `device_type`: Device type (mobile/tablet/desktop)
- `browser`: Browser name
- `os`: Operating system
- `screen_resolution`: Screen resolution
- `viewport_size`: Viewport size
- `page_url`: Page where banner was displayed
- `page_title`: Page title
- `category_context`: Category context
- `search_query`: Search query
- `created_at`: Timestamp

#### banner_clicks
Tracks when users click on banners with comprehensive tracking:
- `banner_id`: Sanity document ID
- `user_id`: Authenticated user ID
- `guest_id`: Anonymous user ID
- `session_ref`: Session reference
- `location`: Click location
- `device_type`: Device type
- `placement`: Placement location
- `banner_size`: Size of the banner
- `ip_address`: User's IP address
- `user_agent`: Browser user agent
- `referrer`: Referring page
- `city`: User's city
- `browser`: Browser name
- `os`: Operating system
- `page_url`: Page where banner was clicked
- `page_title`: Page title
- `category_context`: Category context
- `search_query`: Search query
- `target_url`: Target URL
- `time_on_page`: Time spent on page before clicking
- `scroll_depth`: Scroll depth percentage
- `created_at`: Timestamp

#### banner_performance_daily
Aggregated daily statistics for banner performance:
- `banner_id`: Sanity document ID
- `placement`: Placement location
- `banner_size`: Size of the banner
- `date`: Date of aggregation
- `impressions`: Total impressions
- `clicks`: Total clicks
- `unique_impressions`: Unique users who saw the banner
- `unique_clicks`: Unique users who clicked the banner
- `ctr`: Click-through rate
- `avg_time_on_page`: Average time on page
- `avg_scroll_depth`: Average scroll depth
- `top_cities`: Top cities by impressions
- `top_devices`: Top devices by impressions
- `top_browsers`: Top browsers by impressions
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### 2. Frontend Components

#### EnhancedAdBanner
Main banner component with responsive design and tracking:
```tsx
import { EnhancedAdBanner } from "@/components/ads/enhanced-ad-banner"

export function MyComponent() {
  return (
    <EnhancedAdBanner
      placement="homepage-top"
      userType="all"
      className="mx-auto"
      fallbackText="Advertisement"
    />
  )
}
```

Props:
- `placement`: Banner placement location
- `size`: Banner size (optional, defaults to placement-specific size)
- `userType`: Target user type ("all", "sellers", "new-users")
- `className`: Additional CSS classes
- `fallbackText`: Text to show when banner fails to load
- `showCloseButton`: Whether to show close button (defaults to true)

#### BannerTestSuite
Comprehensive test suite for verifying banner functionality:
```tsx
import { BannerTestSuite } from "@/components/admin/banner-test-suite"

export function BannerTestPage() {
  return <BannerTestSuite />
}
```

### 3. API Routes

#### GET /api/banners
Fetch active banners from Sanity:
```bash
GET /api/banners?placement=homepage-top&userType=all
```

#### POST /api/banners/impression
Track banner impression:
```bash
POST /api/banners/impression
Content-Type: application/json

{
  "bannerId": "banner-document-id",
  "placement": "homepage-top",
  "bannerSize": "leaderboard"
}
```

#### POST /api/banners/click
Track banner click:
```bash
POST /api/banners/click
Content-Type: application/json

{
  "bannerId": "banner-document-id",
  "placement": "homepage-top",
  "bannerSize": "leaderboard",
  "targetUrl": "https://example.com"
}
```

### 4. Context Provider

#### BannerProvider
Provides banner state management across the application:
```tsx
import { BannerProvider } from "@/contexts/banner-context"

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <BannerProvider>
      {children}
    </BannerProvider>
  )
}
```

#### useBanner
Hook to access banner state and functions:
```tsx
import { useBanner } from "@/contexts/banner-context"

export function MyComponent() {
  const { 
    impressions, 
    clicks, 
    recordedImpressions, 
    recordImpression, 
    recordClick, 
    isBannerVisible, 
    hideBanner 
  } = useBanner()
  
  // Use banner functions...
}
```

## Banner Sizes and Placements

### Supported Sizes:
1. **Large Banner (1400×400)**: Full-width banners for homepage top
2. **Leaderboard (1200×250)**: Standard horizontal banners
3. **Medium Rectangle (300×250)**: Standard sidebar banners
4. **Large Rectangle (336×280)**: Tall rectangular banners
5. **Half Page (300×600)**: Vertical half-page banners
6. **Mobile Banner (320×50)**: Compact banners for mobile devices
7. **Popup (600×400)**: Modal popup banners
8. **Square (250×250)**: Square banners
9. **Vertical Rectangle (300×600)**: Tall vertical banners
10. **Skyscraper (160×600)**: Narrow skyscraper banners

### Supported Placements:
1. **Homepage Top**: Large Banner (1400×400) - Full width at top of homepage
2. **Homepage Middle**: Leaderboard (1200×250) - Centered leaderboard banner
3. **Homepage Bottom**: Leaderboard (1200×250) - Centered leaderboard banner
4. **Category Sidebar**: Medium Rectangle (300×250) - Sidebar placement
5. **Category Sidebar (Category Specific)**: Medium Rectangle (300×250) - Category-specific sidebar
6. **Search Top**: Leaderboard (1200×250) - Above search results
7. **Search Sidebar**: Medium Rectangle (300×250) - Sidebar placement
8. **Listing Top**: Leaderboard (1200×250) - Above listing details
9. **Listing Sidebar**: Medium Rectangle (300×250) - Sidebar placement
10. **User Profile Top**: Leaderboard (1200×250) - Above user profiles
11. **User Profile Sidebar**: Medium Rectangle (300×250) - Sidebar placement
12. **Blog Top**: Leaderboard (1200×250) - Above blog posts
13. **Blog Sidebar**: Medium Rectangle (300×250) - Sidebar placement
14. **Content Top**: Leaderboard (1200×250) - Above content pages
15. **Content Sidebar**: Medium Rectangle (300×250) - Sidebar placement
16. **Mobile Banner**: Mobile Banner (320×50) - Standard mobile banner
17. **Mobile Specific**: Mobile Banner (320×50) - Mobile-specific content
18. **Popup Banner**: Popup (600×400) - Modal popup
19. **Seller Profile Banner**: Leaderboard (1200×250) - On seller profiles
20. **Dashboard Top**: Leaderboard (1200×250) - At top of user dashboards
21. **Dashboard Sidebar**: Medium Rectangle (300×250) - In user dashboard sidebar

## Implementation

### Setting Up Banner Tracking

1. **Database Setup**: Run the banner-analytics-schema.sql file to create all tables and functions
2. **Frontend Integration**: Use the `EnhancedAdBanner` component with appropriate props
3. **API Configuration**: Ensure API routes are properly configured
4. **Context Provider**: Wrap your application with `BannerProvider`
5. **Analytics Dashboard**: Use the banner analytics dashboard for reporting

### Tracking Impressions

Impressions are automatically tracked when banners are displayed:
```tsx
// In EnhancedAdBanner component
useEffect(() => {
  if (banner && recordImpression && !recordedImpressions.has(banner._id)) {
    recordImpression(banner._id)
  }
}, [banner, recordImpression, recordedImpressions])
```

### Tracking Clicks

Clicks are tracked when users interact with banners:
```tsx
// In EnhancedAdBanner component
const handleClick = async () => {
  if (!banner) return

  try {
    if (recordClick) {
      recordClick(banner._id)
    }

    window.open(banner.targetUrl, "_blank", "noopener,noreferrer")
  } catch (err) {
    window.open(banner.targetUrl, "_blank", "noopener,noreferrer")
  }
}
```

## Best Practices

### 1. Performance Optimization
- Use proper image sizes for each banner type
- Implement lazy loading for non-critical banners
- Use skeleton loading states
- Cache banner data appropriately

### 2. Responsive Design
- Provide separate images for mobile and desktop
- Use appropriate banner sizes for each device
- Hide mobile banners on desktop and vice versa
- Test on different screen sizes

### 3. Analytics Accuracy
- Track impressions only once per session per banner
- Record detailed contextual information
- Implement proper error handling
- Validate data before storing

### 4. User Experience
- Provide clear close buttons
- Don't interrupt core user flows
- Respect user preferences
- Ensure accessibility compliance

## Troubleshooting

### Common Issues

1. **Banners Not Displaying**
   - Check that the banner is marked as active in Sanity
   - Verify the current date is within the banner's start and end dates
   - Ensure the banner's target user type matches the current user
   - Check that there are enough slots available for the banner placement

2. **Wrong Banner Size**
   - Verify that the correct size is selected in Sanity for the placement
   - Check that the banner image dimensions match the selected size
   - Ensure that responsive behavior is working correctly

3. **Analytics Not Tracking**
   - Verify that the Supabase tables exist and have the correct structure
   - Check that the API routes are working correctly
   - Ensure that the user has proper permissions to insert data

4. **Performance Issues**
   - Check that database indexes are properly configured
   - Verify that the analytics aggregation jobs are running
   - Ensure that the caching strategy is working correctly

### Debugging Tips

1. **Check Console Logs**: Look for any error messages in the browser console
2. **Verify Network Requests**: Use browser dev tools to check API requests
3. **Test Database Queries**: Run queries directly in Supabase to verify data
4. **Review RLS Policies**: Ensure Row Level Security policies are correctly configured
5. **Validate Sanity Data**: Check that banner data in Sanity is correctly configured

## Security Considerations

### 1. Data Protection
- Use Row Level Security (RLS) to protect sensitive data
- Implement proper input validation
- Sanitize all user inputs
- Encrypt sensitive information

### 2. Access Control
- Restrict banner management to admin users only
- Allow anyone to track impressions and clicks
- Implement proper authentication for API routes
- Use secure session management

### 3. Privacy Compliance
- Respect user privacy settings
- Implement proper data retention policies
- Provide opt-out mechanisms
- Comply with GDPR and local data protection laws

## Maintenance

### 1. Regular Tasks
- Monitor database performance
- Review and optimize indexes
- Check for data inconsistencies
- Update banner content in Sanity

### 2. Performance Monitoring
- Track API response times
- Monitor database query performance
- Review analytics processing jobs
- Check for resource utilization

### 3. Updates and Upgrades
- Keep dependencies up to date
- Apply security patches promptly
- Test changes in staging environment
- Monitor for breaking changes

This comprehensive documentation should help you understand and maintain the banner system effectively.