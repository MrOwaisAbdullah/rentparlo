/**
 * Color contrast utilities for accessibility compliance
 */

// WCAG 2.1 contrast ratio requirements
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3;
const WCAG_AAA_NORMAL = 7;
const WCAG_AAA_LARGE = 4.5;

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error("Invalid color format. Please use hex colors.");
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG standards
 */
export function meetsWCAGStandards(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  isLargeText: boolean = false
): {
  passes: boolean;
  ratio: number;
  required: number;
  level: string;
} {
  const ratio = getContrastRatio(foreground, background);

  let required: number;
  let levelDescription: string;

  if (level === "AAA") {
    required = isLargeText ? WCAG_AAA_LARGE : WCAG_AAA_NORMAL;
    levelDescription = `WCAG AAA ${isLargeText ? "(Large Text)" : "(Normal Text)"}`;
  } else {
    required = isLargeText ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
    levelDescription = `WCAG AA ${isLargeText ? "(Large Text)" : "(Normal Text)"}`;
  }

  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
    level: levelDescription,
  };
}

/**
 * Get accessible color palette for charts
 */
export const accessibleChartColors = {
  // High contrast colors that work well together
  primary: [
    "#1f77b4", // Blue
    "#ff7f0e", // Orange
    "#2ca02c", // Green
    "#d62728", // Red
    "#9467bd", // Purple
    "#8c564b", // Brown
    "#e377c2", // Pink
    "#7f7f7f", // Gray
    "#bcbd22", // Olive
    "#17becf", // Cyan
  ],

  // Colorblind-friendly palette
  colorblindFriendly: [
    "#1f77b4", // Blue
    "#ff7f0e", // Orange
    "#2ca02c", // Green
    "#d62728", // Red
    "#9467bd", // Purple
    "#8c564b", // Brown
  ],

  // High contrast for data visualization
  highContrast: [
    "#000000", // Black
    "#ffffff", // White
    "#ff0000", // Red
    "#00ff00", // Green
    "#0000ff", // Blue
    "#ffff00", // Yellow
    "#ff00ff", // Magenta
    "#00ffff", // Cyan
  ],
};

/**
 * Generate alternative text for charts
 */
export function generateChartAltText(
  chartType: string,
  data: any[],
  title?: string
): string {
  const dataCount = data.length;

  let altText = title ? `${title}. ` : "";
  altText += `${chartType} chart with ${dataCount} data points. `;

  if (chartType === "pie" || chartType === "doughnut") {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    altText += `Total value: ${total}. `;

    // Add top 3 segments
    const sortedData = [...data].sort(
      (a, b) => (b.value || 0) - (a.value || 0)
    );
    const top3 = sortedData.slice(0, 3);

    altText += "Largest segments: ";
    top3.forEach((item, index) => {
      const percentage =
        total > 0 ? Math.round(((item.value || 0) / total) * 100) : 0;
      altText += `${item.name}: ${percentage}%`;
      if (index < top3.length - 1) altText += ", ";
    });
  } else {
    // For line, bar, area charts
    const values = data
      .map((item) => Object.values(item).filter((v) => typeof v === "number"))
      .flat();
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      altText += `Data ranges from ${min} to ${max}. `;
    }
  }

  return altText.trim();
}

/**
 * Create accessible color scheme based on theme
 */
export function getAccessibleColorScheme(isDark: boolean = false) {
  if (isDark) {
    return {
      background: "#000000",
      foreground: "#ffffff",
      muted: "#404040",
      mutedForeground: "#a0a0a0",
      border: "#404040",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    };
  }

  return {
    background: "#ffffff",
    foreground: "#000000",
    muted: "#f5f5f5",
    mutedForeground: "#666666",
    border: "#e5e5e5",
    success: "#16a34a",
    warning: "#d97706",
    error: "#dc2626",
    info: "#2563eb",
  };
}

/**
 * Validate color accessibility for dashboard components
 */
export function validateDashboardColors(colors: Record<string, string>): {
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check common color combinations
  const combinations = [
    { fg: colors.foreground, bg: colors.background, name: "Main text" },
    { fg: colors.mutedForeground, bg: colors.background, name: "Muted text" },
    {
      fg: colors.foreground,
      bg: colors.muted,
      name: "Text on muted background",
    },
  ];

  combinations.forEach(({ fg, bg, name }) => {
    if (fg && bg) {
      const result = meetsWCAGStandards(fg, bg);
      if (!result.passes) {
        issues.push(
          `${name} contrast ratio (${result.ratio}) does not meet ${result.level} standards`
        );
        recommendations.push(
          `Increase contrast for ${name} to at least ${result.required}:1`
        );
      }
    }
  });

  return { issues, recommendations };
}

export default {
  getContrastRatio,
  meetsWCAGStandards,
  accessibleChartColors,
  generateChartAltText,
  getAccessibleColorScheme,
  validateDashboardColors,
};
