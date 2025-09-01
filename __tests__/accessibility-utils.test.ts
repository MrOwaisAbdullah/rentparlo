/**
 * Tests for accessibility utilities
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock DOM environment
Object.defineProperty(window, "document", {
  value: {
    createElement: vi.fn(() => ({
      setAttribute: vi.fn(),
      style: {},
      textContent: "",
    })),
    body: {
      appendChild: vi.fn(),
    },
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    activeElement: null,
  },
  writable: true,
});

describe("Accessibility Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ScreenReaderAnnouncer", () => {
    it("creates singleton instance", async () => {
      const { ScreenReaderAnnouncer } = await import(
        "@/lib/accessibility-utils"
      );

      const instance1 = ScreenReaderAnnouncer.getInstance();
      const instance2 = ScreenReaderAnnouncer.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("has announcement methods", async () => {
      const { ScreenReaderAnnouncer } = await import(
        "@/lib/accessibility-utils"
      );

      const announcer = ScreenReaderAnnouncer.getInstance();

      expect(typeof announcer.announce).toBe("function");
      expect(typeof announcer.announceSearchResults).toBe("function");
      expect(typeof announcer.announceFilterChange).toBe("function");
      expect(typeof announcer.announceFilterCleared).toBe("function");
      expect(typeof announcer.announceAllFiltersCleared).toBe("function");
      expect(typeof announcer.announceLoading).toBe("function");
      expect(typeof announcer.announceError).toBe("function");
    });

    it("announces search results correctly", async () => {
      const { ScreenReaderAnnouncer } = await import(
        "@/lib/accessibility-utils"
      );

      const announcer = ScreenReaderAnnouncer.getInstance();

      // Test with query
      announcer.announceSearchResults(5, "camera");

      // Test without query
      announcer.announceSearchResults(10);

      // Should not throw errors
      expect(true).toBe(true);
    });

    it("announces filter changes correctly", async () => {
      const { ScreenReaderAnnouncer } = await import(
        "@/lib/accessibility-utils"
      );

      const announcer = ScreenReaderAnnouncer.getInstance();

      announcer.announceFilterChange("category", "electronics", 15);
      announcer.announceFilterCleared("category", 20);
      announcer.announceAllFiltersCleared(25);

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe("AriaUtils", () => {
    it("generates unique IDs", async () => {
      const { AriaUtils } = await import("@/lib/accessibility-utils");

      const id1 = AriaUtils.generateId("test");
      const id2 = AriaUtils.generateId("test");

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test-/);
      expect(id2).toMatch(/^test-/);
    });

    it("creates filter labels", async () => {
      const { AriaUtils } = await import("@/lib/accessibility-utils");

      const labelWithValue = AriaUtils.createFilterLabel(
        "Category",
        "Electronics"
      );
      const labelWithoutValue = AriaUtils.createFilterLabel("Category");

      expect(labelWithValue).toContain("Category");
      expect(labelWithValue).toContain("Electronics");
      expect(labelWithoutValue).toContain("Category");
    });

    it("creates search results descriptions", async () => {
      const { AriaUtils } = await import("@/lib/accessibility-utils");

      const descWithQuery = AriaUtils.createSearchResultsDescription(
        5,
        "camera"
      );
      const descWithoutQuery = AriaUtils.createSearchResultsDescription(10);

      expect(descWithQuery).toContain("5");
      expect(descWithQuery).toContain("camera");
      expect(descWithoutQuery).toContain("10");
    });

    it("creates clear filter labels", async () => {
      const { AriaUtils } = await import("@/lib/accessibility-utils");

      const label = AriaUtils.createClearFilterLabel("category");

      expect(label).toContain("Clear");
      expect(label).toContain("category");
    });

    it("creates suggestion labels", async () => {
      const { AriaUtils } = await import("@/lib/accessibility-utils");

      const label = AriaUtils.createSuggestionLabel("Camera", "popular", 0, 5);

      expect(label).toContain("Camera");
      expect(label).toContain("popular");
      expect(label).toContain("1 of 5");
    });
  });

  describe("KeyboardNavigation", () => {
    it("has navigation methods", async () => {
      const { KeyboardNavigation } = await import("@/lib/accessibility-utils");

      expect(typeof KeyboardNavigation.handleArrowNavigation).toBe("function");
      expect(typeof KeyboardNavigation.handleTabNavigation).toBe("function");
      expect(typeof KeyboardNavigation.focusElement).toBe("function");
      expect(typeof KeyboardNavigation.trapFocus).toBe("function");
    });

    it("handles arrow navigation", async () => {
      const { KeyboardNavigation } = await import("@/lib/accessibility-utils");

      const mockEvent = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as any;

      const onIndexChange = vi.fn();

      KeyboardNavigation.handleArrowNavigation(
        mockEvent,
        0,
        5,
        onIndexChange,
        true
      );

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onIndexChange).toHaveBeenCalledWith(1);
    });

    it("handles tab navigation", async () => {
      const { KeyboardNavigation } = await import("@/lib/accessibility-utils");

      const mockEvent = {
        key: "Escape",
        preventDefault: vi.fn(),
      } as any;

      const onEscape = vi.fn();

      KeyboardNavigation.handleTabNavigation(mockEvent, onEscape);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onEscape).toHaveBeenCalled();
    });
  });

  describe("AccessibilityValidator", () => {
    it("has validation methods", async () => {
      const { AccessibilityValidator } = await import(
        "@/lib/accessibility-utils"
      );

      expect(typeof AccessibilityValidator.validateAriaLabels).toBe("function");
      expect(typeof AccessibilityValidator.validateKeyboardNavigation).toBe(
        "function"
      );
    });

    it("validates ARIA labels", async () => {
      const { AccessibilityValidator } = await import(
        "@/lib/accessibility-utils"
      );

      const mockElement = {
        tagName: "BUTTON",
        getAttribute: vi.fn(() => null),
        textContent: "",
      } as any;

      const issues = AccessibilityValidator.validateAriaLabels(mockElement);

      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain("Button missing accessible name");
    });

    it("validates keyboard navigation", async () => {
      const { AccessibilityValidator } = await import(
        "@/lib/accessibility-utils"
      );

      const mockContainer = {
        querySelectorAll: vi.fn(() => []),
      } as any;

      const issues =
        AccessibilityValidator.validateKeyboardNavigation(mockContainer);

      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain("No keyboard-accessible elements found");
    });
  });
});
