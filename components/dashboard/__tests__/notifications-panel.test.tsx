import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationsPanel } from "../notifications-panel";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("NotificationsPanel Component", () => {
  const mockNotifications = [
    {
      id: "1",
      type: "verification",
      message: "Complete your profile verification to increase trust",
      priority: "high",
      action_url: "/profile/verification",
      created_at: "2024-01-15T10:00:00Z",
      read: false,
    },
    {
      id: "2",
      type: "subscription",
      message: "Your subscription expires in 5 days",
      priority: "medium",
      action_url: "/dashboard/package",
      created_at: "2024-01-14T15:30:00Z",
      read: false,
    },
    {
      id: "3",
      type: "performance",
      message: "Your conversion rate has improved by 15%",
      priority: "low",
      created_at: "2024-01-13T09:15:00Z",
      read: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render notifications panel with all notifications", () => {
    render(<NotificationsPanel notifications={mockNotifications} />);

    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(
      screen.getByText("Complete your profile verification to increase trust")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your subscription expires in 5 days")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your conversion rate has improved by 15%")
    ).toBeInTheDocument();
  });

  it("should show unread count", () => {
    render(<NotificationsPanel notifications={mockNotifications} />);

    expect(screen.getByText("2")).toBeInTheDocument(); // Unread count badge
  });

  it("should display notification priorities correctly", () => {
    render(<NotificationsPanel notifications={mockNotifications} />);

    const highPriorityNotification = screen
      .getByText("Complete your profile verification to increase trust")
      .closest("div");
    expect(highPriorityNotification).toHaveClass("border-red-200");

    const mediumPriorityNotification = screen
      .getByText("Your subscription expires in 5 days")
      .closest("div");
    expect(mediumPriorityNotification).toHaveClass("border-yellow-200");

    const lowPriorityNotification = screen
      .getByText("Your conversion rate has improved by 15%")
      .closest("div");
    expect(lowPriorityNotification).toHaveClass("border-green-200");
  });

  it("should show read/unread status", () => {
    render(<NotificationsPanel notifications={mockNotifications} />);

    const unreadNotifications = screen.getAllByTestId("unread-indicator");
    expect(unreadNotifications).toHaveLength(2);

    const readNotification = screen
      .getByText("Your conversion rate has improved by 15%")
      .closest("div");
    expect(readNotification).toHaveClass("opacity-60");
  });

  it("should handle notification click with action URL", () => {
    render(<NotificationsPanel notifications={mockNotifications} />);

    const verificationNotification = screen.getByText(
      "Complete your profile verification to increase trust"
    );
    fireEvent.click(verificationNotification);

    expect(mockPush).toHaveBeenCalledWith("/profile/verification");
  });

  it("should mark notification as read when clicked", async () => {
    const onMarkAsRead = vi.fn();
    render(
      <NotificationsPanel
        notifications={mockNotifications}
        onMarkAsRead={onMarkAsRead}
      />
    );

    const unreadNotification = screen.getByText(
      "Complete your profile verification to increase trust"
    );
    fireEvent.click(unreadNotification);

    expect(onMarkAsRead).toHaveBeenCalledWith("1");
  });

  it("should show empty state when no notifications", () => {
    render(<NotificationsPanel notifications={[]} />);

    expect(screen.getByText("No notifications")).toBeInTheDocument();
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
  });

  it("should filter notifications by type", () => {
    render(
      <NotificationsPanel
        notifications={mockNotifications}
        filterType="verification"
      />
    );

    expect(
      screen.getByText("Complete your profile verification to increase trust")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Your subscription expires in 5 days")
    ).not.toBeInTheDocument();
  });

  it("should show only unread notifications when filtered", () => {
    render(
      <NotificationsPanel
        notifications={mockNotifications}
        showOnlyUnread={true}
      />
    );

    expect(
      screen.getByText("Complete your profile verification to increase trust")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your subscription expires in 5 days")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Your conversion rate has improved by 15%")
    ).not.toBeInTheDocument();
  });

  it("should handle mark all as read", async () => {
    const onMarkAllAsRead = vi.fn();
    render(
      <NotificationsPanel
        notifications={mockNotifications}
        onMarkAllAsRead={onMarkAllAsRead}
      />
    );

    const markAllButton = screen.getByText("Mark all as read");
    fireEvent.click(markAllButton);

    expect(onMarkAllAsRead).toHaveBeenCalled();
  });

  it("should show loading state", () => {
    render(<NotificationsPanel notifications={[]} loading={true} />);

    expect(screen.getByText("Loading notifications...")).toBeInTheDocument();
  });

  it("should handle error state", () => {
    render(
      <NotificationsPanel
        notifications={[]}
        error="Failed to load notifications"
      />
    );

    expect(screen.getByText("Error loading notifications")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to load notifications")
    ).toBeInTheDocument();
  });

  it("should show relative timestamps", () => {
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));

    render(<NotificationsPanel notifications={mockNotifications} />);

    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    expect(screen.getByText("1 day ago")).toBeInTheDocument();
  });

  it("should handle notification dismissal", async () => {
    const onDismiss = vi.fn();
    render(
      <NotificationsPanel
        notifications={mockNotifications}
        onDismiss={onDismiss}
        allowDismiss={true}
      />
    );

    const dismissButtons = screen.getAllByLabelText("Dismiss notification");
    fireEvent.click(dismissButtons[0]);

    expect(onDismiss).toHaveBeenCalledWith("1");
  });

  it("should show notification icons based on type", () => {
    render(<NotificationsPanel notifications={mockNotifications} />);

    expect(screen.getByTestId("verification-icon")).toBeInTheDocument();
    expect(screen.getByTestId("subscription-icon")).toBeInTheDocument();
    expect(screen.getByTestId("performance-icon")).toBeInTheDocument();
  });

  it("should handle pagination for many notifications", () => {
    const manyNotifications = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      type: "info",
      message: `Notification ${i + 1}`,
      priority: "low",
      created_at: "2024-01-15T10:00:00Z",
      read: false,
    }));

    render(
      <NotificationsPanel notifications={manyNotifications} pageSize={10} />
    );

    expect(screen.getByText("Notification 1")).toBeInTheDocument();
    expect(screen.getByText("Notification 10")).toBeInTheDocument();
    expect(screen.queryByText("Notification 11")).not.toBeInTheDocument();

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(screen.getByText("Notification 11")).toBeInTheDocument();
  });

  it("should handle keyboard navigation", () => {
    render(<NotificationsPanel notifications={mockNotifications} />);

    const firstNotification = screen.getByText(
      "Complete your profile verification to increase trust"
    );
    firstNotification.focus();

    fireEvent.keyDown(firstNotification, { key: "Enter" });
    expect(mockPush).toHaveBeenCalledWith("/profile/verification");

    fireEvent.keyDown(firstNotification, { key: " " });
    expect(mockPush).toHaveBeenCalledTimes(2);
  });

  it("should show notification categories", () => {
    render(
      <NotificationsPanel
        notifications={mockNotifications}
        showCategories={true}
      />
    );

    expect(screen.getByText("Verification")).toBeInTheDocument();
    expect(screen.getByText("Subscription")).toBeInTheDocument();
    expect(screen.getByText("Performance")).toBeInTheDocument();
  });

  it("should handle refresh functionality", async () => {
    const onRefresh = vi.fn();
    render(
      <NotificationsPanel
        notifications={mockNotifications}
        onRefresh={onRefresh}
      />
    );

    const refreshButton = screen.getByLabelText("Refresh notifications");
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalled();
  });

  it("should show notification settings link", () => {
    render(
      <NotificationsPanel
        notifications={mockNotifications}
        showSettings={true}
      />
    );

    const settingsLink = screen.getByText("Notification Settings");
    fireEvent.click(settingsLink);

    expect(mockPush).toHaveBeenCalledWith("/dashboard/settings/notifications");
  });

  it("should handle bulk actions", () => {
    const onBulkAction = vi.fn();
    render(
      <NotificationsPanel
        notifications={mockNotifications}
        onBulkAction={onBulkAction}
        allowBulkActions={true}
      />
    );

    // Select notifications
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const bulkDeleteButton = screen.getByText("Delete Selected");
    fireEvent.click(bulkDeleteButton);

    expect(onBulkAction).toHaveBeenCalledWith("delete", ["1", "2"]);
  });
});
