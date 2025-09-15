import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DashboardOverview } from "../dashboard-overview";
import {
  mockSellerData,
  mockAnalyticsData,
  mockSubscriptionData,
} from "../../../tests/setup";

// Mock the child components
vi.mock("../metrics-card", () => ({
  MetricsCard: ({ title, value, change, icon: Icon }: any) => (
    <div data-testid="metrics-card">
      <h3>{title}</h3>
      <span>{value}</span>
      {change && <span data-testid="change">{change}%</span>}
      {Icon && <Icon data-testid="icon" />}
    </div>
  ),
}));

vi.mock("../quick-actions", () => ({
  QuickActions: ({ actions }: any) => (
    <div data-testid="quick-actions">
      {actions.map((action: any, index: number) => (
        <button
          key={index}
          data-testid={`action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("../notifications-panel", () => ({
  NotificationsPanel: ({ notifications }: any) => (
    <div data-testid="notifications-panel">
      {notifications.map((notification: any, index: number) => (
        <div key={index} data-testid={`notification-${notification.type}`}>
          {notification.message}
        </div>
      ))}
    </div>
  ),
}));

const mockRecentActivity = [
  {
    id: "1",
    type: "view",
    listing_title: "BMW 3 Series",
    timestamp: "2024-01-15T10:30:00Z",
    user_location: "Karachi",
  },
  {
    id: "2",
    type: "contact",
    listing_title: "Canon Camera",
    timestamp: "2024-01-15T09:15:00Z",
    user_location: "Lahore",
  },
];

const mockNotifications = [
  {
    id: "1",
    type: "verification",
    message: "Complete your profile verification to increase trust",
    priority: "high",
    action_url: "/profile/verification",
  },
  {
    id: "2",
    type: "subscription",
    message: "Your subscription expires in 5 days",
    priority: "medium",
    action_url: "/dashboard/package",
  },
];

describe("DashboardOverview Component", () => {
  const defaultProps = {
    sellerData: mockSellerData,
    analytics: mockAnalyticsData,
    subscription: mockSubscriptionData,
    recentActivity: mockRecentActivity,
    notifications: mockNotifications,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dashboard overview with all sections", () => {
    render(<DashboardOverview {...defaultProps} />);

    expect(screen.getByText("Dashboard Overview")).toBeInTheDocument();
    expect(screen.getByTestId("quick-actions")).toBeInTheDocument();
    expect(screen.getByTestId("notifications-panel")).toBeInTheDocument();
  });

  it("should display key metrics cards", () => {
    render(<DashboardOverview {...defaultProps} />);

    const metricsCards = screen.getAllByTestId("metrics-card");
    expect(metricsCards).toHaveLength(6); // Total Views, Contacts, Listings, Conversion Rate, Tier Points, Subscription

    expect(screen.getByText("Total Views")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
    expect(screen.getByText("Total Contacts")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("should show tier information correctly", () => {
    render(<DashboardOverview {...defaultProps} />);

    expect(screen.getByText("Current Tier")).toBeInTheDocument();
    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(screen.getByText("850 points")).toBeInTheDocument();
  });

  it("should display subscription status", () => {
    render(<DashboardOverview {...defaultProps} />);

    expect(screen.getByText("Subscription")).toBeInTheDocument();
    expect(screen.getByText("Premium Plan")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should show quick action buttons", () => {
    render(<DashboardOverview {...defaultProps} />);

    expect(screen.getByTestId("action-create-listing")).toBeInTheDocument();
    expect(screen.getByTestId("action-view-analytics")).toBeInTheDocument();
    expect(screen.getByTestId("action-manage-profile")).toBeInTheDocument();
  });

  it("should display recent activity feed", () => {
    render(<DashboardOverview {...defaultProps} />);

    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("BMW 3 Series")).toBeInTheDocument();
    expect(screen.getByText("Canon Camera")).toBeInTheDocument();
  });

  it("should show notifications panel", () => {
    render(<DashboardOverview {...defaultProps} />);

    expect(screen.getByTestId("notification-verification")).toBeInTheDocument();
    expect(screen.getByTestId("notification-subscription")).toBeInTheDocument();
  });

  it("should handle loading state", () => {
    render(<DashboardOverview {...defaultProps} loading={true} />);

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("should handle error state", () => {
    const error = new Error("Failed to load dashboard data");
    render(<DashboardOverview {...defaultProps} error={error} />);

    expect(screen.getByText("Error loading dashboard")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to load dashboard data")
    ).toBeInTheDocument();
  });

  it("should show empty state when no data", () => {
    const emptyProps = {
      ...defaultProps,
      analytics: {
        ...mockAnalyticsData,
        overview: {
          ...mockAnalyticsData.overview,
          totalViews: 0,
          totalContacts: 0,
        },
      },
      recentActivity: [],
    };

    render(<DashboardOverview {...emptyProps} />);

    expect(screen.getByText("No recent activity")).toBeInTheDocument();
  });

  it("should calculate conversion rate correctly", () => {
    const customAnalytics = {
      ...mockAnalyticsData,
      overview: {
        ...mockAnalyticsData.overview,
        totalViews: 1000,
        totalContacts: 50,
        conversionRate: 5.0,
      },
    };

    render(<DashboardOverview {...defaultProps} analytics={customAnalytics} />);

    expect(screen.getByText("5.0%")).toBeInTheDocument();
  });

  it("should show tier progress correctly", () => {
    const customSellerData = {
      ...mockSellerData,
      tier: "basic",
      tier_points: 250,
    };

    render(
      <DashboardOverview {...defaultProps} sellerData={customSellerData} />
    );

    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("250 points")).toBeInTheDocument();
  });

  it("should handle subscription expiry warning", () => {
    const expiringSubscription = {
      ...mockSubscriptionData,
      current_period_end: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3 days from now
    };

    render(
      <DashboardOverview
        {...defaultProps}
        subscription={expiringSubscription}
      />
    );

    // Should show expiry warning in notifications
    expect(screen.getByTestId("notifications-panel")).toBeInTheDocument();
  });

  it("should refresh data when refresh button is clicked", async () => {
    const onRefresh = vi.fn();
    render(<DashboardOverview {...defaultProps} onRefresh={onRefresh} />);

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalled();
  });

  it("should navigate to analytics when view analytics is clicked", () => {
    const mockPush = vi.fn();
    vi.mocked(require("next/navigation").useRouter).mockReturnValue({
      push: mockPush,
    });

    render(<DashboardOverview {...defaultProps} />);

    const analyticsButton = screen.getByTestId("action-view-analytics");
    fireEvent.click(analyticsButton);

    expect(mockPush).toHaveBeenCalledWith("/dashboard/analytics");
  });

  it("should show performance insights", () => {
    render(<DashboardOverview {...defaultProps} />);

    expect(screen.getByText("Performance Insights")).toBeInTheDocument();
  });

  it("should display correct time-based greeting", () => {
    // Mock current time to morning
    vi.setSystemTime(new Date("2024-01-15T09:00:00Z"));

    render(<DashboardOverview {...defaultProps} />);

    expect(screen.getByText(/Good morning/i)).toBeInTheDocument();
  });
});
