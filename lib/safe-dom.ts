// Utility functions for safe DOM operations
export const safeDOM = {
  // Safely get parent node
  getParentNode: (element: Element | null): Element | null => {
    try {
      return element?.parentNode as Element | null || null;
    } catch (error) {
      console.warn('Error getting parent node:', error);
      return null;
    }
  },

  // Safely remove child
  removeChild: (parent: Element | null, child: Element | null): boolean => {
    try {
      if (parent && child && parent.contains(child)) {
        parent.removeChild(child);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error removing child:', error);
      return false;
    }
  },

  // Safely append child
  appendChild: (parent: Element | null, child: Element | null): boolean => {
    try {
      if (parent && child) {
        parent.appendChild(child);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error appending child:', error);
      return false;
    }
  },

  // Safely query selector
  querySelector: (selector: string): Element | null => {
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.warn('Error querying selector:', error);
      return null;
    }
  },

  // Safely get element by ID
  getElementById: (id: string): HTMLElement | null => {
    try {
      return document.getElementById(id);
    } catch (error) {
      console.warn('Error getting element by ID:', error);
      return null;
    }
  }
};