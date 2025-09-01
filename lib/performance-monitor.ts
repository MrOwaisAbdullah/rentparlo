"use client";

/**
 * Performance monitoring utilities for search functionality
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface SearchMetrics {
  searchDuration: number;
  resultCount: number;
  cacheHit: boolean;
  filterCount: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private searchMetrics: SearchMetrics[] = [];
  private maxMetricsHistory = 100;

  /**
   * Start measuring performance for a given operation
   */
  startMeasure(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * End measuring performance for a given operation
   */
  endMeasure(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`No performance metric found for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log slow operations
    if (duration > 1000) {
      console.warn(
        `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`
      );
    }

    return duration;
  }

  /**
   * Measure a function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startMeasure(name, metadata);
    try {
      const result = await fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measureSync<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.startMeasure(name, metadata);
    try {
      const result = fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Record search-specific metrics
   */
  recordSearchMetrics(metrics: Omit<SearchMetrics, "timestamp">): void {
    const searchMetric: SearchMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };

    this.searchMetrics.push(searchMetric);

    // Keep only recent metrics
    if (this.searchMetrics.length > this.maxMetricsHistory) {
      this.searchMetrics = this.searchMetrics.slice(-this.maxMetricsHistory);
    }

    // Log performance insights
    this.logPerformanceInsights(searchMetric);
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    averageSearchTime: number;
    cacheHitRate: number;
    totalSearches: number;
    slowSearches: number;
  } {
    if (this.searchMetrics.length === 0) {
      return {
        averageSearchTime: 0,
        cacheHitRate: 0,
        totalSearches: 0,
        slowSearches: 0,
      };
    }

    const totalSearchTime = this.searchMetrics.reduce(
      (sum, metric) => sum + metric.searchDuration,
      0
    );
    const cacheHits = this.searchMetrics.filter(
      (metric) => metric.cacheHit
    ).length;
    const slowSearches = this.searchMetrics.filter(
      (metric) => metric.searchDuration > 1000
    ).length;

    return {
      averageSearchTime: totalSearchTime / this.searchMetrics.length,
      cacheHitRate: (cacheHits / this.searchMetrics.length) * 100,
      totalSearches: this.searchMetrics.length,
      slowSearches,
    };
  }

  /**
   * Get recent search metrics
   */
  getRecentMetrics(count: number = 10): SearchMetrics[] {
    return this.searchMetrics.slice(-count);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.searchMetrics = [];
  }

  /**
   * Log performance insights
   */
  private logPerformanceInsights(metric: SearchMetrics): void {
    // Log slow searches
    if (metric.searchDuration > 2000) {
      console.warn(
        `Very slow search: ${metric.searchDuration.toFixed(2)}ms for ${metric.resultCount} results`
      );
    }

    // Log cache performance
    if (!metric.cacheHit && metric.searchDuration < 100) {
      console.info("Fast search without cache - consider caching strategy");
    }

    // Log filter complexity
    if (metric.filterCount > 5) {
      console.info(`Complex search with ${metric.filterCount} filters`);
    }
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    currentMetrics: PerformanceMetric[];
    searchHistory: SearchMetrics[];
    stats: ReturnType<typeof this.getStats>;
  } {
    return {
      currentMetrics: Array.from(this.metrics.values()),
      searchHistory: [...this.searchMetrics],
      stats: this.getStats(),
    };
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStart = performance.now();

  React.useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;

    if (renderTime > 16) {
      // Longer than one frame at 60fps
      console.warn(
        `Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
    }
  });
}

/**
 * Decorator for measuring function performance
 */
export function measurePerformance(name: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measureSync(`${name}.${propertyKey}`, () =>
        originalMethod?.apply(this, args)
      );
    } as T;

    return descriptor;
  };
}

/**
 * Performance monitoring utilities
 */
export const performance = {
  monitor: performanceMonitor,

  /**
   * Start measuring an operation
   */
  start: (name: string, metadata?: Record<string, any>) => {
    performanceMonitor.startMeasure(name, metadata);
  },

  /**
   * End measuring an operation
   */
  end: (name: string) => {
    return performanceMonitor.endMeasure(name);
  },

  /**
   * Measure async operation
   */
  measureAsync: <T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ) => {
    return performanceMonitor.measureAsync(name, fn, metadata);
  },

  /**
   * Measure sync operation
   */
  measureSync: <T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ) => {
    return performanceMonitor.measureSync(name, fn, metadata);
  },

  /**
   * Record search metrics
   */
  recordSearch: (metrics: Omit<SearchMetrics, "timestamp">) => {
    performanceMonitor.recordSearchMetrics(metrics);
  },

  /**
   * Get performance statistics
   */
  getStats: () => {
    return performanceMonitor.getStats();
  },

  /**
   * Clear all metrics
   */
  clear: () => {
    performanceMonitor.clearMetrics();
  },

  /**
   * Export metrics for analysis
   */
  export: () => {
    return performanceMonitor.exportMetrics();
  },
};

// React import for useRenderPerformance
import React from "react";

export default performance;
