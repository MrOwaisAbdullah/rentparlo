/**
 * Accessibility utilities for search and filter components
 */

import React from "react";

// Screen reader announcement utilities
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private announceElement: HTMLElement | null = null;

  private constructor() {
    if (typeof window !== "undefined") {
      this.createAnnounceElement();
    }
  }

  static getInstance(): ScreenReaderAnnouncer {
    if (!ScreenReaderAnnouncer.instance) {
      ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer();
    }
    return ScreenReaderAnnouncer.instance;
  }

  private createAnnounceElement() {
    if (this.announceElement) return;

    this.announceElement = document.createElement("div");
    this.announceElement.setAttribute("aria-live", "polite");
    this.announceElement.setAttribute("aria-atomic", "true");
    this.announceElement.setAttribute("aria-relevant", "additions text");
    this.announceElement.className = "sr-only";
    this.announceElement.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    document.body.appendChild(this.announceElement);
  }

  announce(message: string, priority: "polite" | "assertive" = "polite") {
    if (!this.announceElement) {
      this.createAnnounceElement();
    }

    if (this.announceElement) {
      this.announceElement.setAttribute("aria-live", priority);
      this.announceElement.textContent = message;

      // Clear after announcement to allow repeated messages
      setTimeout(() => {
        if (this.announceElement) {
          this.announceElement.textContent = "";
        }
      }, 1000);
    }
  }

  announceSearchResults(count: number, query?: string) {
    const message = query
      ? `Found ${count} results for "${query}"`
      : `Found ${count} results`;
    this.announce(message);
  }

  announceFilterChange(
    filterName: string,
    value: string | number,
    resultCount?: number
  ) {
    let message = `Filter ${filterName} changed to ${value}`;
    if (resultCount !== undefined) {
      message += `. ${resultCount} results found`;
    }
    this.announce(message);
  }

  announceFilterCleared(filterName: string, resultCount?: number) {
    let message = `${filterName} filter cleared`;
    if (resultCount !== undefined) {
      message += `. ${resultCount} results found`;
    }
    this.announce(message);
  }

  announceAllFiltersCleared(resultCount?: number) {
    let message = "All filters cleared";
    if (resultCount !== undefined) {
      message += `. ${resultCount} results found`;
    }
    this.announce(message);
  }

  announceLoading(message: string = "Loading") {
    this.announce(`${message}...`, "polite");
  }

  announceError(message: string) {
    this.announce(`Error: ${message}`, "assertive");
  }
}

// Keyboard navigation utilities
export const KeyboardNavigation = {
  // Handle arrow key navigation in lists
  handleArrowNavigation: (
    event: React.KeyboardEvent,
    currentIndex: number,
    itemCount: number,
    onIndexChange: (index: number) => void,
    circular: boolean = true
  ) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (circular) {
          onIndexChange(currentIndex < itemCount - 1 ? currentIndex + 1 : 0);
        } else {
          onIndexChange(Math.min(currentIndex + 1, itemCount - 1));
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (circular) {
          onIndexChange(currentIndex > 0 ? currentIndex - 1 : itemCount - 1);
        } else {
          onIndexChange(Math.max(currentIndex - 1, 0));
        }
        break;
      case "Home":
        event.preventDefault();
        onIndexChange(0);
        break;
      case "End":
        event.preventDefault();
        onIndexChange(itemCount - 1);
        break;
    }
  },

  // Handle tab navigation
  handleTabNavigation: (
    event: React.KeyboardEvent,
    onEscape?: () => void,
    onEnter?: () => void
  ) => {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        onEscape?.();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        onEnter?.();
        break;
    }
  },

  // Focus management utilities
  focusElement: (selector: string, container?: HTMLElement) => {
    const element = container
      ? (container.querySelector(selector) as HTMLElement)
      : (document.querySelector(selector) as HTMLElement);

    if (element) {
      element.focus();
      return true;
    }
    return false;
  },

  // Trap focus within a container
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === "Tab") {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  },
};

// ARIA utilities
export const AriaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = "aria"): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Create ARIA label for filter controls
  createFilterLabel: (filterName: string, value?: string | number): string => {
    if (value) {
      return `${filterName} filter, current value: ${value}`;
    }
    return `${filterName} filter`;
  },

  // Create ARIA description for search results
  createSearchResultsDescription: (count: number, query?: string): string => {
    if (query) {
      return `${count} search results found for "${query}"`;
    }
    return `${count} search results found`;
  },

  // Create ARIA label for clear filter buttons
  createClearFilterLabel: (filterName: string): string => {
    return `Clear ${filterName} filter`;
  },

  // Create ARIA label for suggestion items
  createSuggestionLabel: (
    text: string,
    type: string,
    index: number,
    total: number
  ): string => {
    return `${text}, ${type} suggestion, ${index + 1} of ${total}`;
  },
};

// Focus management hook
export const useFocusManagement = () => {
  const focusedElementRef = React.useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    focusedElementRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (focusedElementRef.current) {
      focusedElementRef.current.focus();
    }
  };

  const focusFirst = (container: HTMLElement) => {
    const firstFocusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    if (firstFocusable) {
      firstFocusable.focus();
    }
  };

  return {
    saveFocus,
    restoreFocus,
    focusFirst,
  };
};

// Accessibility validation utilities
export const AccessibilityValidator = {
  // Check if element has proper ARIA labels
  validateAriaLabels: (element: HTMLElement): string[] => {
    const issues: string[] = [];

    if (
      element.tagName === "BUTTON" &&
      !element.getAttribute("aria-label") &&
      !element.textContent?.trim()
    ) {
      issues.push("Button missing accessible name");
    }

    if (
      element.getAttribute("role") === "combobox" &&
      !element.getAttribute("aria-expanded")
    ) {
      issues.push("Combobox missing aria-expanded attribute");
    }

    if (element.getAttribute("aria-describedby")) {
      const describedById = element.getAttribute("aria-describedby");
      if (describedById && !document.getElementById(describedById)) {
        issues.push(
          `Element references non-existent aria-describedby ID: ${describedById}`
        );
      }
    }

    return issues;
  },

  // Check keyboard navigation
  validateKeyboardNavigation: (container: HTMLElement): string[] => {
    const issues: string[] = [];
    const interactiveElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (interactiveElements.length === 0) {
      issues.push("No keyboard-accessible elements found");
    }

    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute("tabindex");
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push("Positive tabindex found, which can disrupt tab order");
      }
    });

    return issues;
  },
};

export default {
  ScreenReaderAnnouncer,
  KeyboardNavigation,
  AriaUtils,
  useFocusManagement,
  AccessibilityValidator,
};
