import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatNumber,
  calculatePercentageChange,
  formatPercentage,
  calculateConversionRate,
  getTimeRangeOptions,
  createTimeRange,
  formatDate,
  formatDateTime,
  getRelativeTime,
  calculatePerformanceScore,
  getPerformanceScoreColor,
  getTierColor,
  generateChartColors,
  isValidTimeRange,
  getDaysBetween,
  truncateText,
  calculateDaysRemaining,
  debounce,
} from "../dashboard-utils";
import { SellerAnalytics } from "@/types/dashboard";

describe("Dashboard Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatNumber", () => {
    it("should format numbers correctly", () => {
      expect(formatNumber(500)).toBe("500");
      expect(formatNumber(1000)).toBe("1.0K");
      expect(formatNumber(1500)).toBe("1.5K");
      expect(formatNumber(1000000)).toBe("1.0M");
      expect(formatNumber(2500000)).toBe("2.5M");
    });

    it("should handle zero and negative numbers", () => {
      expect(formatNumber(0)).toBe("0");
      expect(formatNumber(-1000)).toBe("-1,000"); // Negative numbers use toLocaleString
    });

    it("should use locale formatting for numbers under 1000", () => {
      expect(formatNumber(999)).toBe("999");
      expect(formatNumber(100)).toBe("100");
    });
  });

  describe("calculatePercentageChange", () => {
    it("should calculate positive percentage change", () => {
      expect(calculatePercentageChange(120, 100)).toBe(20);
      expect(calculatePercentageChange(150, 100)).toBe(50);
    });

    it("should calculate negative percentage change", () => {
      expect(calculatePercentageChange(80, 100)).toBe(-20);
      expect(calculatePercentageChange(50, 100)).toBe(-50);
    });

    it("should handle zero previous value", () => {
      expect(calculatePercentageChange(100, 0)).toBe(100);
      expect(calculatePercentageChange(0, 0)).toBe(0);
    });

    it("should handle zero current value", () => {
      expect(calculatePercentageChange(0, 100)).toBe(-100);
    });
  });

  describe("formatPercentage", () => {
    it("should format percentage with default decimals", () => {
      expect(formatPercentage(15.678)).toBe("15.7%");
      expect(formatPercentage(0)).toBe("0.0%");
      expect(formatPercentage(100)).toBe("100.0%");
    });

    it("should format percentage with custom decimals", () => {
      expect(formatPercentage(15.678, 2)).toBe("15.68%");
      expect(formatPercentage(15.678, 0)).toBe("16%");
    });
  });

  describe("calculateConversionRate", () => {
    it("should calculate conversion rate correctly", () => {
      expect(calculateConversionRate(50, 1000)).toBe(5);
      expect(calculateConversionRate(25, 500)).toBe(5);
      expect(calculateConversionRate(1, 100)).toBe(1);
    });

    it("should handle zero total", () => {
      expect(calculateConversionRate(10, 0)).toBe(0);
    });

    it("should handle zero conversions", () => {
      expect(calculateConversionRate(0, 1000)).toBe(0);
    });
  });

  describe("getTimeRangeOptions", () => {
    it("should return correct time range options", () => {
      const options = getTimeRangeOptions();
      expect(options).toHaveLength(5);
      expect(options[0]).toEqual({ label: "Today", value: "today" });
      expect(options[1]).toEqual({ label: "Last 7 days", value: "week" });
      expect(options[2]).toEqual({ label: "Last 30 days", value: "month" });
      expect(options[3]).toEqual({ label: "Last 3 months", value: "quarter" });
      expect(options[4]).toEqual({ label: "Last year", value: "year" });
    });
  });

  describe("createTimeRange", () => {
    beforeEach(() => {
      // Mock current date to 2024-01-15
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    });

    it("should create today time range", () => {
      const range = createTimeRange("today");
      expect(range.preset).toBe("today");
      expect(new Date(range.start).getHours()).toBe(0);
      expect(new Date(range.start).getMinutes()).toBe(0);
    });

    it("should create week time range", () => {
      const range = createTimeRange("week");
      expect(range.preset).toBe("week");
      const daysDiff = getDaysBetween(range.start, range.end);
      expect(daysDiff).toBe(7);
    });

    it("should create month time range", () => {
      const range = createTimeRange("month");
      expect(range.preset).toBe("month");
      const daysDiff = getDaysBetween(range.start, range.end);
      expect(daysDiff).toBe(30);
    });

    it("should create quarter time range", () => {
      const range = createTimeRange("quarter");
      expect(range.preset).toBe("quarter");
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      // Handle month wrapping (e.g., Jan - 3 = Oct of previous year)
      const expectedMonth = (endDate.getMonth() - 3 + 12) % 12;
      expect(startDate.getMonth()).toBe(expectedMonth);
    });

    it("should create year time range", () => {
      const range = createTimeRange("year");
      expect(range.preset).toBe("year");
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      expect(startDate.getFullYear()).toBe(endDate.getFullYear() - 1);
    });
  });

  describe("formatDate", () => {
    it("should format date with default options", () => {
      const formatted = formatDate("2024-01-15T12:00:00Z");
      expect(formatted).toBe("Jan 15, 2024");
    });

    it("should format date with custom options", () => {
      const formatted = formatDate("2024-01-15T12:00:00Z", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      expect(formatted).toBe("Monday, January 15, 2024");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time", () => {
      const formatted = formatDateTime("2024-01-15T14:30:00Z");
      expect(formatted).toMatch(/Jan 15, 2024/);
      expect(formatted).toMatch(/PM|AM/); // Just check for time format
    });
  });

  describe("getRelativeTime", () => {
    beforeEach(() => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    });

    it("should return 'Just now' for recent times", () => {
      const result = getRelativeTime("2024-01-15T11:59:30Z");
      expect(result).toBe("Just now");
    });

    it("should return minutes ago", () => {
      const result = getRelativeTime("2024-01-15T11:55:00Z");
      expect(result).toBe("5 minutes ago");
    });

    it("should return hours ago", () => {
      const result = getRelativeTime("2024-01-15T10:00:00Z");
      expect(result).toBe("2 hours ago");
    });

    it("should return days ago", () => {
      const result = getRelativeTime("2024-01-13T12:00:00Z");
      expect(result).toBe("2 days ago");
    });

    it("should return formatted date for older dates", () => {
      const result = getRelativeTime("2024-01-01T12:00:00Z");
      expect(result).toBe("Jan 1, 2024");
    });
  });

  describe("calculatePerformanceScore", () => {
    const mockAnalytics: SellerAnalytics = {
      sellerId: "test-seller",
      totalViews: 1000,
      totalContacts: 50,
      totalWhatsAppClicks: 30,
      totalShares: 10,
      totalSaves: 5,
      uniqueVisitors: 800,
      conversionRate: 5.0,
      avgSessionDuration: 120,
      bounceRate: 35,
      topCities: [],
      topDevices: [],
      timeSeriesData: [],
      listingPerformance: [],
    };

    it("should calculate performance score", () => {
      const score = calculatePerformanceScore(mockAnalytics);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should handle zero conversion rate", () => {
      const zeroConversionAnalytics = { ...mockAnalytics, conversionRate: 0 };
      const score = calculatePerformanceScore(zeroConversionAnalytics);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getPerformanceScoreColor", () => {
    it("should return green for high scores", () => {
      expect(getPerformanceScoreColor(85)).toBe("text-green-600");
      expect(getPerformanceScoreColor(100)).toBe("text-green-600");
    });

    it("should return yellow for medium scores", () => {
      expect(getPerformanceScoreColor(70)).toBe("text-yellow-600");
      expect(getPerformanceScoreColor(65)).toBe("text-yellow-600");
    });

    it("should return red for low scores", () => {
      expect(getPerformanceScoreColor(50)).toBe("text-red-600");
      expect(getPerformanceScoreColor(30)).toBe("text-red-600");
    });
  });

  describe("getTierColor", () => {
    it("should return correct colors for tiers", () => {
      expect(getTierColor("platinum")).toBe(
        "text-purple-600 bg-purple-50 border-purple-200"
      );
      expect(getTierColor("gold")).toBe(
        "text-yellow-600 bg-yellow-50 border-yellow-200"
      );
      expect(getTierColor("silver")).toBe(
        "text-gray-600 bg-gray-50 border-gray-200"
      );
      expect(getTierColor("bronze")).toBe(
        "text-orange-600 bg-orange-50 border-orange-200"
      );
      expect(getTierColor("unknown")).toBe(
        "text-gray-600 bg-gray-50 border-gray-200"
      );
    });

    it("should be case insensitive", () => {
      expect(getTierColor("PLATINUM")).toBe(
        "text-purple-600 bg-purple-50 border-purple-200"
      );
      expect(getTierColor("Gold")).toBe(
        "text-yellow-600 bg-yellow-50 border-yellow-200"
      );
    });
  });

  describe("generateChartColors", () => {
    it("should generate correct number of colors", () => {
      expect(generateChartColors(3)).toHaveLength(3);
      expect(generateChartColors(10)).toHaveLength(10);
    });

    it("should cycle through base colors", () => {
      const colors = generateChartColors(10);
      expect(colors[0]).toBe("#3b82f6");
      expect(colors[8]).toBe("#3b82f6"); // Should cycle back
    });
  });

  describe("isValidTimeRange", () => {
    it("should validate correct time ranges", () => {
      const validRange = {
        start: "2024-01-01T00:00:00Z",
        end: "2024-01-15T00:00:00Z",
        preset: "month" as const,
      };
      expect(isValidTimeRange(validRange)).toBe(true);
    });

    it("should reject invalid time ranges", () => {
      const invalidRange = {
        start: "2024-01-15T00:00:00Z",
        end: "2024-01-01T00:00:00Z", // End before start
        preset: "month" as const,
      };
      expect(isValidTimeRange(invalidRange)).toBe(false);
    });

    it("should reject future start dates", () => {
      const futureRange = {
        start: "2025-01-01T00:00:00Z",
        end: "2025-01-15T00:00:00Z",
        preset: "month" as const,
      };
      expect(isValidTimeRange(futureRange)).toBe(false);
    });
  });

  describe("getDaysBetween", () => {
    it("should calculate days between dates", () => {
      expect(getDaysBetween("2024-01-01", "2024-01-08")).toBe(7);
      expect(getDaysBetween("2024-01-01", "2024-01-31")).toBe(30);
    });

    it("should handle same dates", () => {
      expect(getDaysBetween("2024-01-01", "2024-01-01")).toBe(0);
    });
  });

  describe("truncateText", () => {
    it("should truncate long text", () => {
      expect(truncateText("This is a very long text", 10)).toBe(
        "This is a ..."
      );
    });

    it("should not truncate short text", () => {
      expect(truncateText("Short", 10)).toBe("Short");
    });

    it("should handle exact length", () => {
      expect(truncateText("Exactly10!", 10)).toBe("Exactly10!");
    });
  });

  describe("calculateDaysRemaining", () => {
    beforeEach(() => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    });

    it("should calculate days remaining", () => {
      expect(calculateDaysRemaining("2024-01-20T12:00:00Z")).toBe(5);
      expect(calculateDaysRemaining("2024-01-16T12:00:00Z")).toBe(1);
    });

    it("should handle past dates", () => {
      expect(calculateDaysRemaining("2024-01-10T12:00:00Z")).toBe(-5);
    });
  });

  describe("debounce", () => {
    it("should debounce function calls", async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("test1");
      debouncedFn("test2");
      debouncedFn("test3");

      expect(mockFn).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test3");
    });

    it("should reset timer on subsequent calls", async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("test1");

      await new Promise((resolve) => setTimeout(resolve, 50));
      debouncedFn("test2");

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockFn).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test2");
    });
  });
});
