import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/dashboard",
}));

// Mock Next.js image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement("img", { src, alt, ...props });
  },
}));

// Mock Supabase client
vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id", email: "test@example.com" } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}));

// Mock React Query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  })),
  QueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: any) => children,
}));

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Line: ({ data, options }: any) =>
    React.createElement("div", {
      "data-testid": "line-chart",
      "data-chart-data": JSON.stringify(data),
    }),
  Bar: ({ data, options }: any) =>
    React.createElement("div", {
      "data-testid": "bar-chart",
      "data-chart-data": JSON.stringify(data),
    }),
  Pie: ({ data, options }: any) =>
    React.createElement("div", {
      "data-testid": "pie-chart",
      "data-chart-data": JSON.stringify(data),
    }),
  Doughnut: ({ data, options }: any) =>
    React.createElement("div", {
      "data-testid": "doughnut-chart",
      "data-chart-data": JSON.stringify(data),
    }),
}));

// Mock Recharts
vi.mock("recharts", () => ({
  LineChart: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "recharts-line", ...props },
      children
    ),
  BarChart: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "recharts-bar", ...props },
      children
    ),
  PieChart: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "recharts-pie", ...props },
      children
    ),
  Line: (props: any) =>
    React.createElement("div", {
      "data-testid": "recharts-line-component",
      ...props,
    }),
  Bar: (props: any) =>
    React.createElement("div", {
      "data-testid": "recharts-bar-component",
      ...props,
    }),
  Cell: (props: any) =>
    React.createElement("div", { "data-testid": "recharts-cell", ...props }),
  XAxis: (props: any) =>
    React.createElement("div", { "data-testid": "recharts-xaxis", ...props }),
  YAxis: (props: any) =>
    React.createElement("div", { "data-testid": "recharts-yaxis", ...props }),
  CartesianGrid: (props: any) =>
    React.createElement("div", { "data-testid": "recharts-grid", ...props }),
  Tooltip: (props: any) =>
    React.createElement("div", { "data-testid": "recharts-tooltip", ...props }),
  Legend: (props: any) =>
    React.createElement("div", { "data-testid": "recharts-legend", ...props }),
  ResponsiveContainer: ({ children }: any) =>
    React.createElement(
      "div",
      { "data-testid": "recharts-responsive-container" },
      children
    ),
}));

// Mock DOM methods for file downloads
Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: vi.fn(() => "mock-url"),
});

Object.defineProperty(URL, "revokeObjectURL", {
  writable: true,
  value: vi.fn(),
});

// Mock document methods
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

Object.defineProperty(document, "createElement", {
  writable: true,
  value: vi.fn((tagName: string) => {
    if (tagName === "a") {
      return {
        setAttribute: vi.fn(),
        click: mockClick,
        style: {},
        href: "",
        download: "",
      };
    }
    return {
      setAttribute: vi.fn(),
      style: {},
    };
  }),
});

Object.defineProperty(document.body, "appendChild", {
  writable: true,
  value: mockAppendChild,
});

Object.defineProperty(document.body, "removeChild", {
  writable: true,
  value: mockRemoveChild,
});

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Global test utilities
export const mockSellerData = {
  id: "test-seller-id",
  email: "seller@example.com",
  full_name: "Test Seller",
  tier: "premium",
  tier_points: 850,
  verification_status: "verified",
  created_at: "2024-01-01T00:00:00Z",
};

export const mockAnalyticsData = {
  overview: {
    totalViews: 1500,
    totalContacts: 75,
    conversionRate: 5.0,
    uniqueVisitors: 1200,
    avgSessionDuration: 180,
    bounceRate: 35.5,
  },
  trends: [
    { date: "2024-01-01", views: 100, contacts: 5, conversions: 2 },
    { date: "2024-01-02", views: 120, contacts: 8, conversions: 3 },
  ],
  listings: [
    {
      listingId: "listing-1",
      title: "Test Listing 1",
      views: 500,
      contacts: 25,
      whatsappClicks: 15,
      shares: 5,
      saves: 3,
      conversionRate: 5.0,
      avgTimeOnPage: 120,
      createdAt: "2024-01-01",
      lastActivity: "2024-01-30",
    },
  ],
  geographic: [
    { city: "Karachi", views: 800, contacts: 40, percentage: 53.3 },
    { city: "Lahore", views: 700, contacts: 35, percentage: 46.7 },
  ],
  devices: [
    { device: "mobile", views: 900, contacts: 45, percentage: 60.0 },
    { device: "desktop", views: 600, contacts: 30, percentage: 40.0 },
  ],
  conversions: {
    totalViews: 1500,
    totalContacts: 75,
    conversionRate: 5.0,
    conversionsBySource: [],
  },
};

export const mockSubscriptionData = {
  id: "sub-1",
  user_id: "test-seller-id",
  package_id: "premium",
  status: "active",
  current_period_start: "2024-01-01T00:00:00Z",
  current_period_end: "2024-02-01T00:00:00Z",
  auto_renew: true,
  package: {
    id: "premium",
    name: "Premium",
    price: 2999,
    features: {
      max_listings: 50,
      featured_listings: 10,
      analytics_days: 90,
      priority_support: true,
    },
  },
};
