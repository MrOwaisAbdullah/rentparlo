/**
 * Test Configuration for Dashboard System
 * Provides utilities and setup for integration and E2E tests
 */

export const TEST_CONFIG = {
  // API endpoints for testing
  API_ENDPOINTS: {
    DASHBOARD_SUMMARY: "/api/dashboard/summary",
    DASHBOARD_ANALYTICS: "/api/dashboard/analytics",
    DASHBOARD_PERFORMANCE: "/api/dashboard/performance",
    DASHBOARD_EXPORT: "/api/dashboard/export",
    DASHBOARD_REALTIME: "/api/dashboard/realtime",
  },

  // Test data
  MOCK_USER: {
    id: "test-seller-id",
    email: "seller@example.com",
    name: "Test Seller",
    tier: "Premium",
  },

  MOCK_DASHBOARD_DATA: {
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
    analytics: {
      timeSeriesData: [
        { date: "2024-01-08", views: 180, contacts: 9, conversions: 2 },
        { date: "2024-01-09", views: 220, contacts: 11, conversions: 3 },
        { date: "2024-01-10", views: 200, contacts: 10, conversions: 2 },
      ],
      topCities: [
        { city: "Karachi", views: 2000, contacts: 100, percentage: 40 },
        { city: "Lahore", views: 1500, contacts: 75, percentage: 30 },
      ],
      listingPerformance: [
        {
          listingId: "listing-1",
          title: "MacBook Pro 16-inch",
          views: 800,
          contacts: 40,
          conversionRate: 5.0,
        },
      ],
    },
    performance: {
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
  },

  // Test timeouts
  TIMEOUTS: {
    DEFAULT: 5000,
    LONG_RUNNING: 10000,
    REAL_TIME_UPDATE: 2000,
  },

  // Viewport sizes for responsive testing
  VIEWPORTS: {
    MOBILE: { width: 375, height: 667 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1920, height: 1080 },
  },
};

/**
 * Mock API response helper
 */
export function createMockResponse(data: any, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(data),
  };
}

/**
 * Mock authentication helper
 */
export function mockAuthentication() {
  return createMockResponse({
    user: TEST_CONFIG.MOCK_USER,
  });
}

/**
 * Mock dashboard APIs helper
 */
export function mockDashboardAPIs(page: any) {
  // Mock summary endpoint
  page.route("**/api/dashboard/summary", (route: any) => {
    route.fulfill(
      createMockResponse({
        overview: TEST_CONFIG.MOCK_DASHBOARD_DATA.overview,
        recentActivity: [],
        notifications: [],
      })
    );
  });

  // Mock analytics endpoint
  page.route("**/api/dashboard/analytics", (route: any) => {
    route.fulfill(
      createMockResponse(TEST_CONFIG.MOCK_DASHBOARD_DATA.analytics)
    );
  });

  // Mock performance endpoint
  page.route("**/api/dashboard/performance", (route: any) => {
    route.fulfill(
      createMockResponse({
        performanceScore: TEST_CONFIG.MOCK_DASHBOARD_DATA.performance,
        insights: [],
        recommendations: [],
      })
    );
  });
}

/**
 * Wait for dashboard to load helper
 */
export async function waitForDashboardLoad(page: any) {
  await page.waitForSelector('[data-testid="dashboard-overview"]', {
    timeout: TEST_CONFIG.TIMEOUTS.DEFAULT,
  });
}

/**
 * Test data generators
 */
export const TestDataGenerators = {
  generateTimeSeriesData: (days: number) => {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      views: Math.floor(Math.random() * 300) + 100,
      contacts: Math.floor(Math.random() * 20) + 5,
      conversions: Math.floor(Math.random() * 5) + 1,
    }));
  },

  generateListingData: (count: number) => {
    const titles = [
      "MacBook Pro 16-inch",
      "BMW X5 2022",
      "Canon EOS R5",
      "iPhone 15 Pro",
      "Samsung Galaxy S24",
    ];

    return Array.from({ length: count }, (_, i) => ({
      listingId: `listing-${i + 1}`,
      title: titles[i % titles.length],
      views: Math.floor(Math.random() * 1000) + 100,
      contacts: Math.floor(Math.random() * 50) + 5,
      conversionRate: Math.random() * 10 + 1,
      avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
    }));
  },

  generateCityData: () => {
    const cities = [
      "Karachi",
      "Lahore",
      "Islamabad",
      "Faisalabad",
      "Rawalpindi",
    ];
    return cities.map((city, i) => ({
      city,
      views: Math.floor(Math.random() * 2000) + 500,
      contacts: Math.floor(Math.random() * 100) + 20,
      percentage: Math.floor(Math.random() * 30) + 10,
    }));
  },
};

/**
 * Performance test helpers
 */
export const PerformanceHelpers = {
  measureLoadTime: async (page: any, url: string) => {
    const startTime = Date.now();
    await page.goto(url);
    await waitForDashboardLoad(page);
    return Date.now() - startTime;
  },

  measureChartRenderTime: async (page: any) => {
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="analytics-chart"]');
    return Date.now() - startTime;
  },

  checkMemoryUsage: async (page: any) => {
    return await page.evaluate(() => {
      if ("memory" in performance) {
        return (performance as any).memory;
      }
      return null;
    });
  },
};

/**
 * Accessibility test helpers
 */
export const AccessibilityHelpers = {
  checkKeyboardNavigation: async (page: any) => {
    // Test tab navigation
    await page.keyboard.press("Tab");
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    return focusedElement;
  },

  checkAriaLabels: async (page: any) => {
    const elementsWithoutAria = await page.evaluate(() => {
      const interactiveElements = document.querySelectorAll(
        "button, input, select, a"
      );
      const elementsWithoutLabels = [];

      interactiveElements.forEach((element) => {
        if (
          !element.getAttribute("aria-label") &&
          !element.getAttribute("aria-labelledby")
        ) {
          elementsWithoutLabels.push(
            element.tagName + (element.id ? `#${element.id}` : "")
          );
        }
      });

      return elementsWithoutLabels;
    });

    return elementsWithoutAria;
  },

  checkColorContrast: async (page: any) => {
    // This would integrate with axe-core or similar tool
    return await page.evaluate(() => {
      // Simplified contrast check
      const elements = document.querySelectorAll("*");
      const lowContrastElements = [];

      elements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        // Simple check - in real implementation, use proper contrast calculation
        if (color === backgroundColor) {
          lowContrastElements.push(element.tagName);
        }
      });

      return lowContrastElements;
    });
  },
};

/**
 * Error simulation helpers
 */
export const ErrorSimulation = {
  simulateNetworkError: (page: any, endpoint: string) => {
    page.route(`**${endpoint}`, (route: any) => {
      route.abort("failed");
    });
  },

  simulateSlowResponse: (page: any, endpoint: string, delay: number) => {
    page.route(`**${endpoint}`, async (route: any) => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      route.fulfill(createMockResponse({ error: "Timeout" }, 408));
    });
  },

  simulateServerError: (page: any, endpoint: string) => {
    page.route(`**${endpoint}`, (route: any) => {
      route.fulfill(
        createMockResponse({ error: "Internal server error" }, 500)
      );
    });
  },
};
