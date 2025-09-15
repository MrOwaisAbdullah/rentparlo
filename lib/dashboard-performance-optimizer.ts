/**
 * Dashboard Performance Optimizer
 * Implements code splitting, lazy loading, and memoization for dashboard components
 */

import { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { performanceTracker } from '@/lib/performance-metrics';

// Performance monitoring decorator
export function withPerformanceMonitoring<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return memo((props: T) => {
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      performanceTracker.recordResponseTime(renderTime);
      
      if (renderTime > 16) { // Longer than one frame at 60fps
        console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    });

    return <Component {...props} />;
  });
}

// Lazy loaded dashboard components with loading fallbacks
export const LazyDashboardComponents = {
  // Main dashboard pages
  DashboardOverview: dynamic(() => import('@/components/dashboard/dashboard-overview'), {
    loading: () => <DashboardSkeleton />,
    ssr: false
  }),
  
  AnalyticsDashboard: dynamic(() => import('@/components/dashboard/analytics-dashboard'), {
    loading: () => <AnalyticsSkeleton />,
    ssr: false
  }),
  
  PackageDashboard: dynamic(() => import('@/components/dashboard/package-dashboard'), {
    loading: () => <PackageSkeleton />,
    ssr: false
  }),
  
  PerformanceInsights: dynamic(() => import('@/components/dashboard/performance-insights'), {
    loading: () => <InsightsSkeleton />,
    ssr: false
  }),

  // Chart components
  InteractiveChart: dynamic(() => import('@/components/dashboard/interactive-chart'), {
    loading: () => <ChartSkeleton />,
    ssr: false
  }),
  
  AdvancedCharts: dynamic(() => import('@/components/dashboard/advanced-charts'), {
    loading: () => <ChartSkeleton />,
    ssr: false
  }),

  // Data tables
  DataTable: dynamic(() => import('@/components/dashboard/data-table'), {
    loading: () => <TableSkeleton />,
    ssr: false
  }),

  // Export components
  ExportButton: dynamic(() => import('@/components/dashboard/export-button'), {
    loading: () => <div className="w-24 h-8 bg-gray-200 animate-pulse rounded" />,
    ssr: false
  }),

  PDFReportGenerator: dynamic(() => import('@/components/dashboard/pdf-report-generator'), {
    loading: () => <div className="w-full h-32 bg-gray-200 animate-pulse rounded" />,
    ssr: false
  })
};

// Skeleton loading components
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 h-64 rounded-lg" />
        <div className="bg-gray-200 h-64 rounded-lg" />
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gray-200 h-12 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-200 h-80 rounded-lg" />
        <div className="bg-gray-200 h-80 rounded-lg" />
      </div>
      <div className="bg-gray-200 h-64 rounded-lg" />
    </div>
  );
}

function PackageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gray-200 h-32 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-200 h-48 rounded-lg" />
        <div className="bg-gray-200 h-48 rounded-lg" />
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gray-200 h-16 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="bg-gray-200 h-64 rounded-lg animate-pulse" />;
}

function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-gray-200 h-8 rounded" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-12 rounded" />
      ))}
    </div>
  );
}

// Memoized calculation hooks
export function useMemoizedCalculations() {
  // Memoized analytics calculations
  const calculateMetrics = useCallback((data: any[]) => {
    return useMemo(() => {
      if (!data || data.length === 0) return null;
      
      const totalViews = data.reduce((sum, item) => sum + (item.views || 0), 0);
      const totalContacts = data.reduce((sum, item) => sum + (item.contacts || 0), 0);
      const conversionRate = totalViews > 0 ? (totalContacts / totalViews) * 100 : 0;
      
      return {
        totalViews,
        totalContacts,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageViews: Math.round(totalViews / data.length),
        topPerforming: data
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
      };
    }, [data]);
  }, []);

  // Memoized chart data processing
  const processChartData = useCallback((rawData: any[], chartType: string) => {
    return useMemo(() => {
      if (!rawData || rawData.length === 0) return { labels: [], datasets: [] };
      
      switch (chartType) {
        case 'line':
          return {
            labels: rawData.map(item => item.date),
            datasets: [{
              label: 'Views',
              data: rawData.map(item => item.views),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            }]
          };
        
        case 'bar':
          return {
            labels: rawData.map(item => item.category),
            datasets: [{
              label: 'Performance',
              data: rawData.map(item => item.value),
              backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }]
          };
        
        case 'pie':
          return {
            labels: rawData.map(item => item.label),
            datasets: [{
              data: rawData.map(item => item.value),
              backgroundColor: [
                '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
              ]
            }]
          };
        
        default:
          return { labels: [], datasets: [] };
      }
    }, [rawData, chartType]);
  }, []);

  // Memoized filter processing
  const processFilters = useCallback((filters: Record<string, any>) => {
    return useMemo(() => {
      const activeFilters = Object.entries(filters)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      return {
        activeFilters,
        filterCount: Object.keys(activeFilters).length,
        hasFilters: Object.keys(activeFilters).length > 0
      };
    }, [filters]);
  }, []);

  return {
    calculateMetrics,
    processChartData,
    processFilters
  };
}

// Performance-optimized data fetching hook
export function useOptimizedDataFetching() {
  const cache = useMemo(() => new Map(), []);
  const pendingRequests = useMemo(() => new Map(), []);

  const fetchWithCache = useCallback(async (
    key: string,
    fetchFn: () => Promise<any>,
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ) => {
    // Check cache first
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    // Check if request is already pending
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }

    // Create new request
    const request = fetchFn()
      .then(data => {
        cache.set(key, { data, timestamp: Date.now() });
        return data;
      })
      .finally(() => {
        pendingRequests.delete(key);
      });

    pendingRequests.set(key, request);
    return request;
  }, [cache, pendingRequests]);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      cache.delete(key);
      pendingRequests.delete(key);
    } else {
      cache.clear();
      pendingRequests.clear();
    }
  }, [cache, pendingRequests]);

  return { fetchWithCache, clearCache };
}

// Chart performance optimizer
export function useChartPerformanceOptimizer() {
  // Debounced chart updates
  const debouncedChartUpdate = useCallback(
    debounce((updateFn: () => void) => updateFn(), 100),
    []
  );

  // Optimized chart options
  const getOptimizedChartOptions = useCallback((baseOptions: any) => {
    return {
      ...baseOptions,
      animation: {
        duration: 0 // Disable animations for better performance
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins?.legend,
          labels: {
            usePointStyle: true,
            boxWidth: 6
          }
        }
      },
      scales: {
        ...baseOptions.scales,
        x: {
          ...baseOptions.scales?.x,
          ticks: {
            maxTicksLimit: 10 // Limit number of ticks for performance
          }
        },
        y: {
          ...baseOptions.scales?.y,
          ticks: {
            maxTicksLimit: 8
          }
        }
      }
    };
  }, []);

  // Data sampling for large datasets
  const sampleDataForChart = useCallback((data: any[], maxPoints: number = 100) => {
    if (data.length <= maxPoints) return data;
    
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  }, []);

  return {
    debouncedChartUpdate,
    getOptimizedChartOptions,
    sampleDataForChart
  };
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// React import for hooks
import React from 'react';

export default {
  LazyDashboardComponents,
  withPerformanceMonitoring,
  useMemoizedCalculations,
  useOptimizedDataFetching,
  useChartPerformanceOptimizer
};