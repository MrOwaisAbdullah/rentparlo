import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickActions } from "../quick-actions";
import { Plus, BarChart3, User, Settings } from "lucide-react";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("QuickActions Component", () => {
  const mockActions = [
    {
      label: "Create Listing",
      href: "/dashboard/listings/create",
      icon: Plus,
      description: "Add a new rental listing",
    },
    {
      label: "View Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      description: "Check your performance metrics",
    },
    {
      label: "Manage Profile",
      href: "/dashboard/profile",
      icon: User,
      description: "Update your seller profile",
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      description: "Configure your preferences",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all quick action buttons", () => {
    render(<QuickActions actions={mockActions} />);

    expect(screen.getByText("Create Listing")).toBeInTheDocument();
    expect(screen.getByText("View Analytics")).toBeInTheDocument();
    expect(screen.getByText("Manage Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should display action descriptions", () => {
    render(<QuickActions actions={mockActions} />);

    expect(screen.getByText("Add a new rental listing")).toBeInTheDocument();
    expect(
      screen.getByText("Check your performance metrics")
    ).toBeInTheDocument();
    expect(screen.getByText("Update your seller profile")).toBeInTheDocument();
    expect(screen.getByText("Configure your preferences")).toBeInTheDocument();
  });

  it("should render action icons", () => {
    render(<QuickActions actions={mockActions} />);

    // Check that icons are rendered (they should have data-testid attributes)
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("should navigate when action is clicked", () => {
    render(<QuickActions actions={mockActions} />);

    const createListingButton = screen.getByText("Create Listing");
    fireEvent.click(createListingButton);

    expect(mockPush).toHaveBeenCalledWith("/dashboard/listings/create");
  });

  it("should handle multiple navigation clicks", () => {
    render(<QuickActions actions={mockActions} />);

    fireEvent.click(screen.getByText("Create Listing"));
    fireEvent.click(screen.getByText("View Analytics"));
    fireEvent.click(screen.getByText("Manage Profile"));

    expect(mockPush).toHaveBeenCalledTimes(3);
    expect(mockPush).toHaveBeenNthCalledWith(1, "/dashboard/listings/create");
    expect(mockPush).toHaveBeenNthCalledWith(2, "/dashboard/analytics");
    expect(mockPush).toHaveBeenNthCalledWith(3, "/dashboard/profile");
  });

  it("should render with custom layout", () => {
    render(<QuickActions actions={mockActions} layout="grid" />);

    const container = screen.getByTestId("quick-actions-container");
    expect(container).toHaveClass("grid");
  });

  it("should render with list layout", () => {
    render(<QuickActions actions={mockActions} layout="list" />);

    const container = screen.getByTestId("quick-actions-container");
    expect(container).toHaveClass("flex-col");
  });

  it("should handle empty actions array", () => {
    render(<QuickActions actions={[]} />);

    expect(screen.getByText("No quick actions available")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    render(<QuickActions actions={mockActions} loading={true} />);

    expect(screen.getByText("Loading actions...")).toBeInTheDocument();
  });

  it("should handle actions without descriptions", () => {
    const actionsWithoutDescriptions = [
      {
        label: "Simple Action",
        href: "/simple",
        icon: Plus,
      },
    ];

    render(<QuickActions actions={actionsWithoutDescriptions} />);

    expect(screen.getByText("Simple Action")).toBeInTheDocument();
    expect(screen.queryByText("description")).not.toBeInTheDocument();
  });

  it("should handle keyboard navigation", () => {
    render(<QuickActions actions={mockActions} />);

    const firstButton = screen.getByText("Create Listing");
    firstButton.focus();

    fireEvent.keyDown(firstButton, { key: "Enter" });
    expect(mockPush).toHaveBeenCalledWith("/dashboard/listings/create");

    fireEvent.keyDown(firstButton, { key: " " });
    expect(mockPush).toHaveBeenCalledTimes(2);
  });

  it("should show action count when specified", () => {
    render(<QuickActions actions={mockActions} showCount={true} />);

    expect(screen.getByText("4 Quick Actions")).toBeInTheDocument();
  });

  it("should limit actions when maxActions is specified", () => {
    render(<QuickActions actions={mockActions} maxActions={2} />);

    expect(screen.getByText("Create Listing")).toBeInTheDocument();
    expect(screen.getByText("View Analytics")).toBeInTheDocument();
    expect(screen.queryByText("Manage Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("should handle disabled actions", () => {
    const actionsWithDisabled = [
      {
        label: "Disabled Action",
        href: "/disabled",
        icon: Plus,
        description: "This action is disabled",
        disabled: true,
      },
      ...mockActions,
    ];

    render(<QuickActions actions={actionsWithDisabled} />);

    const disabledButton = screen.getByText("Disabled Action");
    expect(disabledButton.closest("button")).toBeDisabled();
  });

  it("should show tooltips on hover", async () => {
    render(<QuickActions actions={mockActions} showTooltips={true} />);

    const createButton = screen.getByText("Create Listing");
    fireEvent.mouseEnter(createButton);

    // Tooltip should appear with description
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("should handle custom onClick handlers", () => {
    const customOnClick = vi.fn();
    const actionsWithCustomHandler = [
      {
        label: "Custom Action",
        href: "/custom",
        icon: Plus,
        description: "Custom action with handler",
        onClick: customOnClick,
      },
    ];

    render(<QuickActions actions={actionsWithCustomHandler} />);

    fireEvent.click(screen.getByText("Custom Action"));
    expect(customOnClick).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled(); // Should not navigate when custom handler is provided
  });

  it("should render with different sizes", () => {
    render(<QuickActions actions={mockActions} size="sm" />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveClass("text-sm");
    });
  });

  it("should handle responsive behavior", () => {
    render(<QuickActions actions={mockActions} responsive={true} />);

    const container = screen.getByTestId("quick-actions-container");
    expect(container).toHaveClass("responsive-grid");
  });

  it("should show action badges when specified", () => {
    const actionsWithBadges = [
      {
        label: "New Feature",
        href: "/new-feature",
        icon: Plus,
        description: "Try our new feature",
        badge: "New",
      },
    ];

    render(<QuickActions actions={actionsWithBadges} />);

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should handle external links", () => {
    const actionsWithExternalLink = [
      {
        label: "External Link",
        href: "https://example.com",
        icon: Plus,
        description: "External resource",
        external: true,
      },
    ];

    render(<QuickActions actions={actionsWithExternalLink} />);

    const link = screen.getByText("External Link").closest("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
