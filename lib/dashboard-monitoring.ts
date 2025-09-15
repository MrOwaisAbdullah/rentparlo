/**
 * Dashboard Performance Monitoring System
 * Tracks performance metrics, user interactions, and system health
 */

import { performanceTracker } from "@/lib/performance-metrics";

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

interface UserInteraction {
  type: "click" | "scroll" | "input" | "navigation";
  target: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface SystemHealth {
  memoryUsage: number;
  connectionType: string;
  isOnline: boolean;
  batteryLevel?: number;
  devicePixelRatio: number;
  viewportSize: { width: number; height: number };
}

interface DashboardMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  totalBlockingTime: number;
}

interface AlertRule {
  metric: string;
  threshold: number;
  operator: "gt" | "lt" | "eq";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
}

export class DashboardMonitor {
  private interactions: UserInteraction[] = [];
  private performanceEntries: PerformanceEntry[] = [];
  private alertRules: AlertRule[] = [];
  private isMonitoring = false;
  private observer?: PerformanceObserver;
  private intersectionObserver?: IntersectionObserver;
  private mutationObserver?: MutationObserver;

  constructor() {
    this.setupDefaultAlertRules();
    this.initializeMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring() {
    if (typeof window === "undefined") return;

    this.isMonitoring = true;

    // Monitor performance entries
    this.setupPerformanceObserver();

    // Monitor user interactions
    this.setupInteractionTracking();

    // Monitor visibility changes
    this.setupVisibilityTracking();

    // Monitor network changes
    this.setupNetworkTracking();

    // Monitor memory usage
    this.setupMemoryTracking();

    // Monitor layout shifts
    this.setupLayoutShiftTracking();

    // Monitor long tasks
    this.setupLongTaskTracking();
  }

  /**
   * Setup performance observer for Web Vitals
   */
  private setupPerformanceObserver() {
    if (!("PerformanceObserver" in window)) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPerformanceEntry({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            entryType: entry.entryType,
          });

          // Check for performance issues
          this.checkPerformanceThresholds(entry);
        }
      });

      // Observe different types of performance entries
      const entryTypes = [
        "navigation",
        "measure",
        "paint",
        "largest-contentful-paint",
      ];

      entryTypes.forEach((type) => {
        try {
          this.observer?.observe({ entryTypes: [type] });
        } catch (error) {
          console.warn(`Cannot observe ${type} entries:`, error);
        }
      });
    } catch (error) {
      console.error("Failed to setup performance observer:", error);
    }
  }

  /**
   * Setup user interaction tracking
   */
  private setupInteractionTracking() {
    const trackInteraction =
      (type: UserInteraction["type"]) => (event: Event) => {
        const target = event.target as HTMLElement;
        const targetDescription = this.getElementDescription(target);

        this.recordInteraction({
          type,
          target: targetDescription,
          timestamp: Date.now(),
          metadata: {
            tagName: target.tagName,
            className: target.className,
            id: target.id,
          },
        });
      };

    // Track clicks
    document.addEventListener("click", trackInteraction("click"), {
      passive: true,
    });

    // Track scrolling
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener(
      "scroll",
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.recordInteraction({
            type: "scroll",
            target: "document",
            timestamp: Date.now(),
            metadata: {
              scrollY: window.scrollY,
              scrollX: window.scrollX,
            },
          });
        }, 100);
      },
      { passive: true }
    );

    // Track input interactions
    document.addEventListener("input", trackInteraction("input"), {
      passive: true,
    });
  }

  /**
   * Setup visibility change tracking
   */
  private setupVisibilityTracking() {
    document.addEventListener("visibilitychange", () => {
      const isVisible = !document.hidden;

      this.recordInteraction({
        type: "navigation",
        target: "page_visibility",
        timestamp: Date.now(),
        metadata: {
          visible: isVisible,
          visibilityState: document.visibilityState,
        },
      });

      // Pause/resume monitoring based on visibility
      if (isVisible) {
        this.resumeMonitoring();
      } else {
        this.pauseMonitoring();
      }
    });
  }

  /**
   * Setup network change tracking
   */
  private setupNetworkTracking() {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;

      const trackConnection = () => {
        this.recordInteraction({
          type: "navigation",
          target: "network_change",
          timestamp: Date.now(),
          metadata: {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
          },
        });
      };

      connection.addEventListener("change", trackConnection);
    }

    // Track online/offline status
    window.addEventListener("online", () => {
      this.recordInteraction({
        type: "navigation",
        target: "network_online",
        timestamp: Date.now(),
      });
    });

    window.addEventListener("offline", () => {
      this.recordInteraction({
        type: "navigation",
        target: "network_offline",
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Setup memory usage tracking
   */
  private setupMemoryTracking() {
    if ("memory" in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;

        this.recordInteraction({
          type: "navigation",
          target: "memory_usage",
          timestamp: Date.now(),
          metadata: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          },
        });

        // Check for memory leaks
        const memoryUsagePercent =
          (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (memoryUsagePercent > 80) {
          this.triggerAlert({
            metric: "memory_usage",
            threshold: 80,
            operator: "gt",
            severity: "high",
            message: `High memory usage detected: ${memoryUsagePercent.toFixed(1)}%`,
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Setup layout shift tracking
   */
  private setupLayoutShiftTracking() {
    if (!("PerformanceObserver" in window)) return;

    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (
            entry.entryType === "layout-shift" &&
            !(entry as any).hadRecentInput
          ) {
            const cls = (entry as any).value;

            this.recordPerformanceEntry({
              name: "cumulative-layout-shift",
              startTime: entry.startTime,
              duration: cls,
              entryType: "layout-shift",
            });

            // Alert on high CLS
            if (cls > 0.1) {
              this.triggerAlert({
                metric: "cumulative_layout_shift",
                threshold: 0.1,
                operator: "gt",
                severity: "medium",
                message: `High cumulative layout shift detected: ${cls.toFixed(3)}`,
              });
            }
          }
        }
      });

      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (error) {
      console.warn("Cannot observe layout shifts:", error);
    }
  }

  /**
   * Setup long task tracking
   */
  private setupLongTaskTracking() {
    if (!("PerformanceObserver" in window)) return;

    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPerformanceEntry({
            name: "long-task",
            startTime: entry.startTime,
            duration: entry.duration,
            entryType: "longtask",
          });

          // Alert on long tasks
          if (entry.duration > 50) {
            this.triggerAlert({
              metric: "long_task",
              threshold: 50,
              operator: "gt",
              severity: "medium",
              message: `Long task detected: ${entry.duration.toFixed(1)}ms`,
            });
          }
        }
      });

      longTaskObserver.observe({ entryTypes: ["longtask"] });
    } catch (error) {
      console.warn("Cannot observe long tasks:", error);
    }
  }

  /**
   * Record performance entry
   */
  private recordPerformanceEntry(entry: PerformanceEntry) {
    this.performanceEntries.push(entry);

    // Keep only recent entries (last 1000)
    if (this.performanceEntries.length > 1000) {
      this.performanceEntries = this.performanceEntries.slice(-1000);
    }

    // Record to performance tracker
    performanceTracker.recordResponseTime(entry.duration);
  }

  /**
   * Record user interaction
   */
  private recordInteraction(interaction: UserInteraction) {
    this.interactions.push(interaction);

    // Keep only recent interactions (last 500)
    if (this.interactions.length > 500) {
      this.interactions = this.interactions.slice(-500);
    }
  }

  /**
   * Get element description for tracking
   */
  private getElementDescription(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(" ")[0]}`;
    return element.tagName.toLowerCase();
  }

  /**
   * Check performance thresholds
   */
  private checkPerformanceThresholds(entry: PerformanceEntry) {
    // Check against alert rules
    this.alertRules.forEach((rule) => {
      const value = this.getMetricValue(rule.metric, entry);
      if (
        value !== null &&
        this.evaluateCondition(value, rule.threshold, rule.operator)
      ) {
        this.triggerAlert(rule);
      }
    });
  }

  /**
   * Get metric value from performance entry
   */
  private getMetricValue(
    metric: string,
    entry: PerformanceEntry
  ): number | null {
    switch (metric) {
      case "duration":
        return entry.duration;
      case "start_time":
        return entry.startTime;
      default:
        return null;
    }
  }

  /**
   * Evaluate alert condition
   */
  private evaluateCondition(
    value: number,
    threshold: number,
    operator: string
  ): boolean {
    switch (operator) {
      case "gt":
        return value > threshold;
      case "lt":
        return value < threshold;
      case "eq":
        return value === threshold;
      default:
        return false;
    }
  }

  /**
   * Trigger alert
   */
  private triggerAlert(rule: AlertRule) {
    console.warn(
      `Performance Alert [${rule.severity.toUpperCase()}]:`,
      rule.message
    );

    // Send to monitoring service
    this.sendAlert(rule);
  }

  /**
   * Send alert to monitoring service
   */
  private async sendAlert(rule: AlertRule) {
    try {
      await fetch("/api/monitoring/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...rule,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error("Failed to send alert:", error);
    }
  }

  /**
   * Setup default alert rules
   */
  private setupDefaultAlertRules() {
    this.alertRules = [
      {
        metric: "duration",
        threshold: 1000,
        operator: "gt",
        severity: "medium",
        message: "Slow operation detected",
      },
      {
        metric: "duration",
        threshold: 3000,
        operator: "gt",
        severity: "high",
        message: "Very slow operation detected",
      },
    ];
  }

  /**
   * Get dashboard metrics
   */
  getDashboardMetrics(): DashboardMetrics {
    const navigation = performance.getEntriesByType("navigation")[0] as any;
    const paint = performance.getEntriesByType("paint");
    const lcp = performance.getEntriesByType(
      "largest-contentful-paint"
    )[0] as any;

    return {
      pageLoadTime: navigation?.loadEventEnd - navigation?.navigationStart || 0,
      timeToInteractive:
        navigation?.domInteractive - navigation?.navigationStart || 0,
      firstContentfulPaint:
        paint.find((p) => p.name === "first-contentful-paint")?.startTime || 0,
      largestContentfulPaint: lcp?.startTime || 0,
      cumulativeLayoutShift: this.calculateCLS(),
      firstInputDelay: this.calculateFID(),
      totalBlockingTime: this.calculateTBT(),
    };
  }

  /**
   * Calculate Cumulative Layout Shift
   */
  private calculateCLS(): number {
    return this.performanceEntries
      .filter((entry) => entry.entryType === "layout-shift")
      .reduce((sum, entry) => sum + entry.duration, 0);
  }

  /**
   * Calculate First Input Delay
   */
  private calculateFID(): number {
    const firstInput = this.interactions.find(
      (i) => i.type === "click" || i.type === "input"
    );
    return firstInput?.duration || 0;
  }

  /**
   * Calculate Total Blocking Time
   */
  private calculateTBT(): number {
    return this.performanceEntries
      .filter((entry) => entry.entryType === "longtask" && entry.duration > 50)
      .reduce((sum, entry) => sum + (entry.duration - 50), 0);
  }

  /**
   * Get system health information
   */
  getSystemHealth(): SystemHealth {
    const connection = (navigator as any).connection;

    return {
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      connectionType: connection?.effectiveType || "unknown",
      isOnline: navigator.onLine,
      batteryLevel: (navigator as any).battery?.level,
      devicePixelRatio: window.devicePixelRatio,
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  /**
   * Get recent interactions
   */
  getRecentInteractions(limit: number = 50): UserInteraction[] {
    return this.interactions.slice(-limit);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const metrics = this.getDashboardMetrics();
    const health = this.getSystemHealth();
    const recentInteractions = this.getRecentInteractions(10);

    return {
      metrics,
      health,
      recentInteractions,
      alertCount: this.alertRules.length,
      isMonitoring: this.isMonitoring,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Pause monitoring
   */
  pauseMonitoring() {
    this.isMonitoring = false;
  }

  /**
   * Resume monitoring
   */
  resumeMonitoring() {
    this.isMonitoring = true;
  }

  /**
   * Stop monitoring and cleanup
   */
  stopMonitoring() {
    this.isMonitoring = false;

    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  /**
   * Export monitoring data
   */
  exportData() {
    return {
      interactions: this.interactions,
      performanceEntries: this.performanceEntries,
      metrics: this.getDashboardMetrics(),
      health: this.getSystemHealth(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Create singleton instance
export const dashboardMonitor = new DashboardMonitor();

// React hook for using dashboard monitoring
export function useDashboardMonitoring() {
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [health, setHealth] = React.useState<SystemHealth | null>(null);

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(dashboardMonitor.getDashboardMetrics());
      setHealth(dashboardMonitor.getSystemHealth());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    // Initial update
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    health,
    monitor: dashboardMonitor,
  };
}

// React import for hooks
import React from "react";

export default dashboardMonitor;
