// lib/performance-metrics.ts
import { cacheManager } from '@/lib/cache-redis';

// Performance metrics interface
export interface PerformanceMetrics {
  timestamp: number;
  cacheStats: {
    totalKeys: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
    totalErrors: number;
    memoryUsage: number;
  };
  responseTimes: {
    avgResponseTime: number;
    p95ResponseTime: number;
    maxResponseTime: number;
  };
  systemStats: {
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
  };
}

// Performance tracker class
export class PerformanceTracker {
  private metricsHistory: PerformanceMetrics[] = [];
  private responseTimes: number[] = [];
  private readonly MAX_HISTORY_SIZE = 1000;

  // Record response time
  recordResponseTime(time: number): void {
    this.responseTimes.push(time);
    
    // Keep only the last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  // Calculate response time statistics
  private calculateResponseStats(): { 
    avgResponseTime: number; 
    p95ResponseTime: number; 
    maxResponseTime: number; 
  } {
    if (this.responseTimes.length === 0) {
      return { avgResponseTime: 0, p95ResponseTime: 0, maxResponseTime: 0 };
    }

    // Sort response times
    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
    
    // Calculate average
    const avgResponseTime = sortedTimes.reduce((sum, time) => sum + time, 0) / sortedTimes.length;
    
    // Calculate 95th percentile
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p95ResponseTime = sortedTimes[p95Index];
    
    // Calculate max
    const maxResponseTime = Math.max(...sortedTimes);
    
    return { avgResponseTime, p95ResponseTime, maxResponseTime };
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics {
    const cacheStats = cacheManager.getCacheStats();
    const responseStats = this.calculateResponseStats();
    
    return {
      timestamp: Date.now(),
      cacheStats,
      responseTimes: responseStats,
      systemStats: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
  }

  // Get historical metrics
  getHistoricalMetrics(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  // Collect and store metrics
  collectMetrics(): void {
    const metrics = this.getMetrics();
    this.metricsHistory.push(metrics);
    
    // Keep only the last MAX_HISTORY_SIZE metrics
    if (this.metricsHistory.length > this.MAX_HISTORY_SIZE) {
      this.metricsHistory = this.metricsHistory.slice(-this.MAX_HISTORY_SIZE);
    }
  }

  // Get cache performance report
  getCachePerformanceReport(): string {
    const metrics = this.getMetrics();
    
    return `
Cache Performance Report
========================
Timestamp: ${new Date(metrics.timestamp).toISOString()}
Total Keys: ${metrics.cacheStats.totalKeys}
Hit Rate: ${(metrics.cacheStats.hitRate * 100).toFixed(2)}%
Total Hits: ${metrics.cacheStats.totalHits}
Total Misses: ${metrics.cacheStats.totalMisses}
Total Errors: ${metrics.cacheStats.totalErrors}
Memory Usage: ${metrics.cacheStats.memoryUsage} items

Response Times
==============
Average: ${metrics.responseTimes.avgResponseTime.toFixed(2)}ms
95th Percentile: ${metrics.responseTimes.p95ResponseTime.toFixed(2)}ms
Maximum: ${metrics.responseTimes.maxResponseTime.toFixed(2)}ms

System Stats
============
Uptime: ${metrics.systemStats.uptime.toFixed(2)} seconds
Heap Used: ${(metrics.systemStats.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
Heap Total: ${(metrics.systemStats.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
RSS: ${(metrics.systemStats.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
`;
  }

  // Check if performance is degraded
  isPerformanceDegraded(): { degraded: boolean; reason?: string } {
    const metrics = this.getMetrics();
    
    // Check cache hit rate
    if (metrics.cacheStats.hitRate < 0.4) { // Less than 40% hit rate
      return { 
        degraded: true, 
        reason: `Low cache hit rate: ${(metrics.cacheStats.hitRate * 100).toFixed(2)}%` 
      };
    }
    
    // Check response times
    if (metrics.responseTimes.p95ResponseTime > 5000) { // More than 5 seconds
      return { 
        degraded: true, 
        reason: `High response times: ${metrics.responseTimes.p95ResponseTime.toFixed(2)}ms` 
      };
    }
    
    // Check error rate
    const totalOperations = metrics.cacheStats.totalHits + metrics.cacheStats.totalMisses;
    if (totalOperations > 0 && (metrics.cacheStats.totalErrors / totalOperations) > 0.05) { // More than 5% error rate
      return { 
        degraded: true, 
        reason: `High error rate: ${((metrics.cacheStats.totalErrors / totalOperations) * 100).toFixed(2)}%` 
      };
    }
    
    return { degraded: false };
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();

// Periodic metrics collection
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    performanceTracker.collectMetrics();
  }, 60000); // Collect metrics every minute
}