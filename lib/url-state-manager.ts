import { SearchState } from "@/types/search";

export class URLStateManager {
  private static instance: URLStateManager;

  private constructor() {}

  static getInstance(): URLStateManager {
    if (!URLStateManager.instance) {
      URLStateManager.instance = new URLStateManager();
    }
    return URLStateManager.instance;
  }

  /**
   * Sync search state to URL parameters
   */
  syncToURL(state: SearchState): void {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    // Add query parameter
    if (state.query.trim()) {
      params.set("q", state.query);
    }

    // Add filter parameters
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(","));
          }
        } else if (typeof value === "object") {
          // Handle date ranges and complex objects
          params.set(key, JSON.stringify(value));
        } else {
          params.set(key, String(value));
        }
      }
    });

    // Add pagination
    if (state.pagination.page > 1) {
      params.set("page", String(state.pagination.page));
    }

    // Add view preferences
    if (state.viewMode !== "grid") {
      params.set("view", state.viewMode);
    }

    if (state.sortBy) {
      params.set("sort", state.sortBy);
    }

    // Update URL without page reload
    const newUrl = `${url.pathname}?${params.toString()}`;
    window.history.replaceState({ searchState: state }, "", newUrl);
  }

  /**
   * Restore search state from URL parameters
   */
  restoreFromURL(): Partial<SearchState> {
    if (typeof window === "undefined") {
      return {};
    }

    const params = new URLSearchParams(window.location.search);
    const state: Partial<SearchState> = {
      query: params.get("q") || "",
      filters: {},
      pagination: {
        page: parseInt(params.get("page") || "1", 10),
        limit: 20,
        total: 0,
        hasMore: false,
      },
      viewMode:
        (params.get("view") as "grid" | "list" | "horizontal") || "grid",
      sortBy: params.get("sort") || "",
    };

    // Parse filter parameters
    const filterKeys = [
      "category",
      "city",
      "area",
      "condition",
      "minPrice",
      "maxPrice",
      "availability",
      "priceType",
      "tag",
      "language",
      "featured",
      "dateRange",
      "seller", // Add seller parameter to be parsed from URL
    ];

    filterKeys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        try {
          // Try to parse as JSON first (for complex objects)
          if (value.startsWith("{") || value.startsWith("[")) {
            state.filters![key] = JSON.parse(value);
          } else if (value.includes(",")) {
            // Handle comma-separated arrays
            state.filters![key] = value.split(",");
          } else if (key.includes("Price") || key === "page") {
            // Handle numeric values
            state.filters![key] = parseInt(value, 10);
          } else if (key === "featured") {
            // Handle boolean values
            state.filters![key] = value === "true";
          } else {
            state.filters![key] = value;
          }
        } catch (error) {
          // Fallback to string value if parsing fails
          state.filters![key] = value;
        }
      }
    });

    return state;
  }

  /**
   * Handle browser navigation (back/forward buttons)
   */
  handlePopState(event: PopStateEvent): void {
    if (event.state?.searchState) {
      // Restore from history state
      return event.state.searchState;
    } else {
      // Restore from URL
      return this.restoreFromURL();
    }
  }

  /**
   * Validate URL parameters
   */
  validateURLParams(params: URLSearchParams): boolean {
    try {
      // Validate page number
      const page = params.get("page");
      if (page && (isNaN(parseInt(page, 10)) || parseInt(page, 10) < 1)) {
        return false;
      }

      // Validate price ranges
      const minPrice = params.get("minPrice");
      const maxPrice = params.get("maxPrice");
      if (minPrice && isNaN(parseInt(minPrice, 10))) return false;
      if (maxPrice && isNaN(parseInt(maxPrice, 10))) return false;
      if (
        minPrice &&
        maxPrice &&
        parseInt(minPrice, 10) > parseInt(maxPrice, 10)
      ) {
        return false;
      }

      // Validate view mode
      const view = params.get("view");
      if (view && !["grid", "list", "horizontal"].includes(view)) {
        return false;
      }

      // Validate language
      const language = params.get("language");
      if (language && !["en", "ur"].includes(language)) {
        return false;
      }

      // Validate featured boolean
      const featured = params.get("featured");
      if (featured && !["true", "false"].includes(featured)) {
        return false;
      }

      // Validate seller parameter (should be a valid UUID)
      const seller = params.get("seller");
      if (seller) {
        // Basic UUID validation pattern
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(seller)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("URL parameter validation error:", error);
      return false;
    }
  }

  /**
   * Get current URL parameters
   */
  getCurrentParams(): URLSearchParams {
    if (typeof window === "undefined") {
      return new URLSearchParams();
    }
    return new URLSearchParams(window.location.search);
  }

  /**
   * Update specific parameter
   */
  updateParam(key: string, value: string | null): void {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const newUrl = `${url.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }

  /**
   * Clear all parameters
   */
  clearAllParams(): void {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    window.history.replaceState(null, "", url.pathname);
  }

  /**
   * Get clean URL without parameters
   */
  getCleanURL(): string {
    if (typeof window === "undefined") return "";

    const url = new URL(window.location.href);
    return url.pathname;
  }
}
