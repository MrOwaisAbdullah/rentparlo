import { test, expect } from "@playwright/test";

test.describe("Complete Dashboard User Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication
    await page.route("**/api/auth/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "test-seller-id",
            email: "seller@example.com",
            name: "Test Seller",
            tier: "Premium",
          },
        }),
      });
    });

    // Mock all dashboard APIs
    await page.route("**/api/dashboard/**", (route) => {
      const url = route.request().url();

      if (url.includes("/summary")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            overview: {
              totalListings: 25,
              activeListings: 20,
              totalViews: 5000,
              totalContacts: 250,
              conversionRate: 5.0,
              uniqueVisitors: 4000,
              avgSessionDuration: 200,
              bounceRate: 30,
            },
            recentActivity: [
              {
                id: "1",
                type: "view",
                listing_title: "MacBook Pro 16-inch",
                timestamp: "2024-01-15T14:30:00Z",
                user_location: "Karachi",
              },
              {
                id: "2",
                type: "contact",
                listing_title: "BMW X5 2022",
                timestamp: "2024-01-15T13:45:00Z",
                user_location: "Lahore",
              },
            ],
            notifications: [
              {
                id: "1",
                type: "verification",
                message:
                  "Complete business verification to unlock premium features",
                priority: "high",
                action_url: "/dashboard/profile/business-verification",
              },
              {
                id: "2",
                type: "performance",
                message: "Your conversion rate has improved by 15% this week",
                priority: "medium",
              },
            ],
          }),
        });
      } else if (url.includes("/analytics")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            timeSeriesData: [
              { date: "2024-01-08", views: 180, contacts: 9, conversions: 2 },
              { date: "2024-01-09", views: 220, contacts: 11, conversions: 3 },
              { date: "2024-01-10", views: 200, contacts: 10, conversions: 2 },
              { date: "2024-01-11", views: 250, contacts: 15, conversions: 4 },
              { date: "2024-01-12", views: 280, contacts: 18, conversions: 5 },
              { date: "2024-01-13", views: 300, contacts: 20, conversions: 6 },
              { date: "2024-01-14", views: 320, contacts: 22, conversions: 7 },
            ],
            topCities: [
              { city: "Karachi", views: 2000, contacts: 100, percentage: 40 },
              { city: "Lahore", views: 1500, contacts: 75, percentage: 30 },
              { city: "Islamabad", views: 1000, contacts: 50, percentage: 20 },
              { city: "Faisalabad", views: 500, contacts: 25, percentage: 10 },
            ],
            topDevices: [
              { device: "mobile", views: 3000, contacts: 150, percentage: 60 },
              { device: "desktop", views: 1500, contacts: 75, percentage: 30 },
              { device: "tablet", views: 500, contacts: 25, percentage: 10 },
            ],
            listingPerformance: [
              {
                listingId: "listing-1",
                title: "MacBook Pro 16-inch",
                views: 800,
                contacts: 40,
                whatsappClicks: 25,
                shares: 8,
                saves: 5,
                conversionRate: 5.0,
                avgTimeOnPage: 180,
              },
              {
                listingId: "listing-2",
                title: "BMW X5 2022",
                views: 600,
                contacts: 30,
                whatsappClicks: 20,
                shares: 6,
                saves: 4,
                conversionRate: 5.0,
                avgTimeOnPage: 200,
              },
            ],
          }),
        });
      } else if (url.includes("/performance")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            performanceScore: {
              overall: 82,
              breakdown: {
                responseRate: 88,
                conversionRate: 85,
                customerRating: 90,
                verification: 65,
              },
              grade: "B+",
              category: "Good",
            },
            benchmarkComparison: {
              overallRanking: "Top 25%",
              conversionVsBenchmark: 25.0,
              responseVsBenchmark: 10.0,
              ratingVsBenchmark: 15.0,
              recommendations: [
                "Complete business verification to unlock premium features",
                "Respond to inquiries within 1 hour to improve customer satisfaction",
              ],
            },
            insights: [
              {
                type: "positive",
                title: "Excellent Customer Rating",
                description:
                  "Your average rating of 4.5/5 is above platform average",
                priority: "medium",
              },
              {
                type: "negative",
                title: "Incomplete Verification",
                description:
                  "Complete business verification to improve trust score",
                priority: "high",
              },
            ],
            recommendations: [
              {
                id: "complete-verification",
                type: "improvement",
                priority: "high",
                title: "Complete Business Verification",
                description:
                  "Verify your business to unlock premium features and build customer trust",
                impact: "Could increase conversion rate by 20-30%",
                actionUrl: "/dashboard/profile/business-verification",
                estimatedImprovement: 25,
              },
            ],
          }),
        });
      }
    });
  });

  test("Complete seller dashboard journey - from overview to action", async ({
    page,
  }) => {
    // Step 1: Land on dashboard overview
    await page.goto("/dashboard");

    // Verify dashboard loads with key metrics
    await expect(
      page.locator('[data-testid="dashboard-overview"]')
    ).toBeVisible();
    await expect(page.locator("text=25")).toBeVisible(); // Total listings
    await expect(page.locator("text=5,000")).toBeVisible(); // Total views
    await expect(page.locator("text=250")).toBeVisible(); // Total contacts

    // Check recent activity
    await expect(page.locator("text=MacBook Pro 16-inch")).toBeVisible();
    await expect(page.locator("text=BMW X5 2022")).toBeVisible();

    // Step 2: Check notifications and act on high priority one
    await expect(
      page.locator('[data-testid="notifications-panel"]')
    ).toBeVisible();
    await expect(
      page.locator("text=Complete business verification")
    ).toBeVisible();

    // Click on high priority notification
    await page.click("text=Complete business verification");
    await expect(page).toHaveURL("/dashboard/profile/business-verification");

    // Step 3: Navigate to analytics for detailed insights
    await page.goto("/dashboard/analytics");
    await expect(
      page.locator('[data-testid="analytics-dashboard"]')
    ).toBeVisible();

    // Check time series chart
    await expect(
      page.locator('[data-testid="time-series-chart"]')
    ).toBeVisible();

    // Verify geographic data
    await expect(page.locator("text=Karachi")).toBeVisible();
    await expect(page.locator("text=40%")).toBeVisible(); // Karachi percentage

    // Check device breakdown
    await expect(page.locator("text=Mobile")).toBeVisible();
    await expect(page.locator("text=60%")).toBeVisible(); // Mobile percentage

    // Step 4: Filter analytics by time range
    await page.selectOption('[data-testid="time-range-selector"]', "month");
    await page.waitForResponse("**/api/dashboard/analytics?timeRange=month");

    // Verify chart updates
    await expect(
      page.locator('[data-testid="time-series-chart"]')
    ).toBeVisible();

    // Step 5: Examine individual listing performance
    await expect(
      page.locator('[data-testid="listing-performance-table"]')
    ).toBeVisible();
    await expect(page.locator("text=MacBook Pro 16-inch")).toBeVisible();
    await expect(page.locator("text=800")).toBeVisible(); // Views for MacBook

    // Click on a listing for detailed view
    await page.click('[data-testid="listing-row-0"]');
    await expect(
      page.locator('[data-testid="listing-details-modal"]')
    ).toBeVisible();

    // Close modal
    await page.click('[data-testid="close-modal"]');

    // Step 6: Export analytics data
    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="export-analytics-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/analytics.*\.(csv|pdf)$/);

    // Step 7: Navigate to performance insights
    await page.goto("/dashboard/performance");
    await expect(
      page.locator('[data-testid="performance-dashboard"]')
    ).toBeVisible();

    // Check performance score
    await expect(
      page.locator('[data-testid="performance-score"]')
    ).toContainText("82");
    await expect(
      page.locator('[data-testid="performance-grade"]')
    ).toContainText("B+");

    // Check performance breakdown
    await expect(
      page.locator('[data-testid="response-rate-score"]')
    ).toContainText("88");
    await expect(
      page.locator('[data-testid="conversion-rate-score"]')
    ).toContainText("85");

    // Step 8: Review insights and recommendations
    await expect(
      page.locator('[data-testid="insights-section"]')
    ).toBeVisible();
    await expect(page.locator("text=Excellent Customer Rating")).toBeVisible();
    await expect(page.locator("text=Incomplete Verification")).toBeVisible();

    // Check recommendations
    await expect(
      page.locator('[data-testid="recommendations-section"]')
    ).toBeVisible();
    await expect(
      page.locator("text=Complete Business Verification")
    ).toBeVisible();

    // Step 9: Act on recommendation
    await page.click('[data-testid="recommendation-action-0"]');
    await expect(page).toHaveURL("/dashboard/profile/business-verification");

    // Step 10: Return to dashboard and verify journey completion
    await page.goto("/dashboard");

    // Check that we're back at overview
    await expect(
      page.locator('[data-testid="dashboard-overview"]')
    ).toBeVisible();

    // Verify key metrics are still visible
    await expect(page.locator("text=5,000")).toBeVisible(); // Total views
    await expect(page.locator("text=5.0%")).toBeVisible(); // Conversion rate
  });

  test("Mobile responsive journey", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/dashboard");

    // Check mobile navigation
    await expect(
      page.locator('[data-testid="mobile-menu-button"]')
    ).toBeVisible();

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(
      page.locator('[data-testid="mobile-navigation"]')
    ).toBeVisible();

    // Navigate to analytics via mobile menu
    await page.click('[data-testid="mobile-nav-analytics"]');
    await expect(page).toHaveURL("/dashboard/analytics");

    // Check mobile chart layout
    await expect(
      page.locator('[data-testid="mobile-chart-container"]')
    ).toBeVisible();

    // Verify responsive table
    await expect(
      page.locator('[data-testid="responsive-table"]')
    ).toBeVisible();

    // Test swipe gestures on charts (if implemented)
    const chart = page.locator('[data-testid="mobile-chart"]');
    await chart.hover();

    // Navigate back via mobile breadcrumb
    await page.click('[data-testid="mobile-breadcrumb-dashboard"]');
    await expect(page).toHaveURL("/dashboard");
  });

  test("Error recovery journey", async ({ page }) => {
    // Start with normal dashboard
    await page.goto("/dashboard");
    await expect(
      page.locator('[data-testid="dashboard-overview"]')
    ).toBeVisible();

    // Simulate API failure
    await page.route("**/api/dashboard/analytics", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    // Navigate to analytics
    await page.goto("/dashboard/analytics");

    // Check error state
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(
      page.locator("text=Failed to load analytics data")
    ).toBeVisible();

    // Try retry
    await page.click('[data-testid="retry-button"]');

    // Should still show error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Fix API and retry
    await page.route("**/api/dashboard/analytics", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          timeSeriesData: [
            { date: "2024-01-14", views: 320, contacts: 22, conversions: 7 },
          ],
          topCities: [
            { city: "Karachi", views: 320, contacts: 22, percentage: 100 },
          ],
        }),
      });
    });

    await page.click('[data-testid="retry-button"]');

    // Should now load successfully
    await expect(
      page.locator('[data-testid="analytics-dashboard"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="error-message"]')
    ).not.toBeVisible();
  });

  test("Performance optimization journey", async ({ page }) => {
    await page.goto("/dashboard/performance");

    // Check initial performance score
    await expect(
      page.locator('[data-testid="performance-score"]')
    ).toContainText("82");

    // Review specific recommendations
    await expect(
      page.locator('[data-testid="recommendations-section"]')
    ).toBeVisible();

    // Click on first recommendation
    await page.click('[data-testid="recommendation-0"]');

    // Should navigate to business verification
    await expect(page).toHaveURL("/dashboard/profile/business-verification");

    // Simulate completing verification
    await page.click('[data-testid="start-verification-button"]');

    // Mock updated performance after verification
    await page.route("**/api/dashboard/performance", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          performanceScore: {
            overall: 92,
            breakdown: {
              responseRate: 88,
              conversionRate: 85,
              customerRating: 90,
              verification: 100, // Improved after verification
            },
            grade: "A-",
            category: "Excellent",
          },
        }),
      });
    });

    // Return to performance dashboard
    await page.goto("/dashboard/performance");

    // Check improved score
    await expect(
      page.locator('[data-testid="performance-score"]')
    ).toContainText("92");
    await expect(
      page.locator('[data-testid="performance-grade"]')
    ).toContainText("A-");
    await expect(
      page.locator('[data-testid="verification-score"]')
    ).toContainText("100");
  });
});
