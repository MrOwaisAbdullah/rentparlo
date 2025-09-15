import { test, expect } from "@playwright/test";

test.describe("Dashboard E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for testing
    await page.route("**/api/auth/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "test-user-id",
            email: "test@example.com",
            name: "Test User",
          },
        }),
      });
    });

    // Mock dashboard API responses
    await page.route("**/api/dashboard/summary", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          overview: {
            totalListings: 15,
            activeListings: 12,
            totalViews: 2500,
            totalContacts: 125,
            conversionRate: 5.0,
            uniqueVisitors: 2000,
            avgSessionDuration: 180,
            bounceRate: 35.5,
          },
          recentActivity: [
            {
              id: "1",
              type: "view",
              listing_title: "BMW 3 Series",
              timestamp: "2024-01-15T10:30:00Z",
              user_location: "Karachi",
            },
          ],
          notifications: [
            {
              id: "1",
              type: "verification",
              message: "Complete your profile verification",
              priority: "high",
            },
          ],
        }),
      });
    });

    await page.route("**/api/dashboard/analytics", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          timeSeriesData: [
            { date: "2024-01-01", views: 100, contacts: 5 },
            { date: "2024-01-02", views: 120, contacts: 8 },
            { date: "2024-01-03", views: 110, contacts: 6 },
          ],
          topCities: [
            { city: "Karachi", views: 800, contacts: 40 },
            { city: "Lahore", views: 700, contacts: 35 },
          ],
          listingPerformance: [
            {
              listingId: "listing-1",
              title: "BMW 3 Series",
              views: 500,
              contacts: 25,
              conversionRate: 5.0,
            },
          ],
        }),
      });
    });

    await page.route("**/api/dashboard/performance", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          performanceScore: {
            overall: 78,
            breakdown: {
              responseRate: 85,
              conversionRate: 75,
              customerRating: 80,
              verification: 70,
            },
            grade: "B+",
            category: "Good",
          },
          insights: [
            {
              type: "positive",
              title: "Good Conversion Rate",
              description: "Your conversion rate is above average",
            },
          ],
          recommendations: [
            {
              id: "improve-response",
              title: "Improve Response Time",
              description: "Respond to inquiries faster",
            },
          ],
        }),
      });
    });
  });

  test("should load dashboard and display key metrics", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for dashboard to load
    await expect(
      page.locator('[data-testid="dashboard-overview"]')
    ).toBeVisible();

    // Check key metrics are displayed
    await expect(page.locator("text=15")).toBeVisible(); // Total listings
    await expect(page.locator("text=2,500")).toBeVisible(); // Total views
    await expect(page.locator("text=125")).toBeVisible(); // Total contacts
    await expect(page.locator("text=5.0%")).toBeVisible(); // Conversion rate

    // Check performance score
    await expect(page.locator("text=78")).toBeVisible(); // Performance score
    await expect(page.locator("text=B+")).toBeVisible(); // Grade
  });

  test("should navigate between dashboard sections", async ({ page }) => {
    await page.goto("/dashboard");

    // Navigate to analytics
    await page.click("text=Analytics");
    await expect(page).toHaveURL("/dashboard/analytics");
    await expect(
      page.locator('[data-testid="analytics-charts"]')
    ).toBeVisible();

    // Navigate to performance insights
    await page.click("text=Performance");
    await expect(page).toHaveURL("/dashboard/performance");
    await expect(
      page.locator('[data-testid="performance-insights"]')
    ).toBeVisible();

    // Navigate back to overview
    await page.click("text=Overview");
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.locator('[data-testid="dashboard-overview"]')
    ).toBeVisible();
  });

  test("should handle time range filtering in analytics", async ({ page }) => {
    await page.goto("/dashboard/analytics");

    // Check default time range
    await expect(
      page.locator('[data-testid="time-range-selector"]')
    ).toHaveValue("week");

    // Change time range to month
    await page.selectOption('[data-testid="time-range-selector"]', "month");

    // Verify API call is made with new time range
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/dashboard/analytics") &&
        response.url().includes("timeRange=month")
    );

    // Check that charts update
    await expect(page.locator('[data-testid="analytics-chart"]')).toBeVisible();
  });

  test("should export dashboard data", async ({ page }) => {
    await page.goto("/dashboard");

    // Set up download handler
    const downloadPromise = page.waitForEvent("download");

    // Click export button
    await page.click('[data-testid="export-button"]');

    // Wait for download to start
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/dashboard.*\.(csv|pdf)$/);
  });

  test("should display and interact with notifications", async ({ page }) => {
    await page.goto("/dashboard");

    // Check notifications panel
    await expect(
      page.locator('[data-testid="notifications-panel"]')
    ).toBeVisible();

    // Check notification content
    await expect(
      page.locator("text=Complete your profile verification")
    ).toBeVisible();

    // Click on notification
    await page.click("text=Complete your profile verification");

    // Should navigate to verification page
    await expect(page).toHaveURL("/dashboard/profile/verification");
  });

  test("should handle real-time updates", async ({ page }) => {
    await page.goto("/dashboard");

    // Get initial view count
    const initialViews = await page
      .locator('[data-testid="total-views"]')
      .textContent();

    // Mock real-time update
    await page.route("**/api/dashboard/realtime", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalViews: 2550, // Updated value
          totalContacts: 130,
        }),
      });
    });

    // Trigger real-time update (simulate WebSocket or polling)
    await page.evaluate(() => {
      // Simulate real-time update event
      window.dispatchEvent(
        new CustomEvent("dashboard-update", {
          detail: { totalViews: 2550, totalContacts: 130 },
        })
      );
    });

    // Wait for update
    await page.waitForTimeout(1000);

    // Check that values have updated
    await expect(page.locator('[data-testid="total-views"]')).toContainText(
      "2,550"
    );
  });

  test("should be responsive on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    // Check mobile layout
    await expect(
      page.locator('[data-testid="mobile-menu-button"]')
    ).toBeVisible();

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(
      page.locator('[data-testid="mobile-navigation"]')
    ).toBeVisible();

    // Check that charts are responsive
    await expect(
      page.locator('[data-testid="responsive-chart"]')
    ).toBeVisible();

    // Verify chart adapts to mobile width
    const chartWidth = await page
      .locator('[data-testid="responsive-chart"]')
      .boundingBox();
    expect(chartWidth?.width).toBeLessThan(375);
  });

  test("should handle error states gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/api/dashboard/summary", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await page.goto("/dashboard");

    // Check error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(
      page.locator("text=Failed to load dashboard data")
    ).toBeVisible();

    // Check retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // Click retry
    await page.click('[data-testid="retry-button"]');

    // Should attempt to reload
    await page.waitForResponse("**/api/dashboard/summary");
  });

  test("should handle loading states", async ({ page }) => {
    // Add delay to API response
    await page.route("**/api/dashboard/summary", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          overview: { totalListings: 15, totalViews: 2500 },
        }),
      });
    });

    await page.goto("/dashboard");

    // Check loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    await expect(page.locator("text=Loading dashboard...")).toBeVisible();

    // Wait for data to load
    await expect(
      page.locator('[data-testid="dashboard-overview"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="loading-spinner"]')
    ).not.toBeVisible();
  });

  test("should search and filter listings", async ({ page }) => {
    await page.goto("/dashboard/listings");

    // Enter search term
    await page.fill('[data-testid="search-input"]', "BMW");

    // Wait for search results
    await page.waitForResponse("**/api/listings?search=BMW");

    // Check filtered results
    await expect(page.locator('[data-testid="listing-item"]')).toContainText(
      "BMW"
    );

    // Clear search
    await page.fill('[data-testid="search-input"]', "");

    // Check all listings are shown again
    await expect(page.locator('[data-testid="listing-item"]')).toHaveCount(15);
  });

  test("should handle pagination in data tables", async ({ page }) => {
    await page.goto("/dashboard/analytics");

    // Check pagination controls
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();

    // Check current page
    await expect(page.locator('[data-testid="current-page"]')).toContainText(
      "1"
    );

    // Go to next page
    await page.click('[data-testid="next-page"]');

    // Check page changed
    await expect(page.locator('[data-testid="current-page"]')).toContainText(
      "2"
    );

    // Check URL updated
    await expect(page).toHaveURL(/page=2/);
  });

  test("should complete full user journey", async ({ page }) => {
    // Start at dashboard
    await page.goto("/dashboard");
    await expect(
      page.locator('[data-testid="dashboard-overview"]')
    ).toBeVisible();

    // Check performance insights
    await page.click("text=Performance");
    await expect(
      page.locator('[data-testid="performance-score"]')
    ).toContainText("78");

    // View detailed analytics
    await page.click("text=Analytics");
    await expect(
      page.locator('[data-testid="analytics-charts"]')
    ).toBeVisible();

    // Change time range
    await page.selectOption('[data-testid="time-range-selector"]', "month");
    await page.waitForResponse("**/api/dashboard/analytics?timeRange=month");

    // Export data
    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="export-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/analytics.*\.csv$/);

    // Check notifications
    await page.goto("/dashboard");
    await page.click('[data-testid="notifications-panel"]');
    await expect(
      page.locator('[data-testid="notification-item"]')
    ).toBeVisible();

    // Complete verification (mock)
    await page.click("text=Complete your profile verification");
    await expect(page).toHaveURL("/dashboard/profile/verification");
  });
});
