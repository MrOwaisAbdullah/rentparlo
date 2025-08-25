/**
 * =====================================================
 * Performance Testing & Optimization System
 * =====================================================
 * Comprehensive performance monitoring and optimization
 * for Sanity and Supabase queries in production
 */

import { createClient } from '@/utils/supabase/server';
import { createClient as createBrowserClient } from '@/utils/supabase/client';
import { sanityClient } from '@/lib/sanity-client';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  recordCount?: number;
  cacheHit?: boolean;
  queryComplexity?: number;
  timestamp: string;
}

export interface PerformanceTestResult {
  testName: string;
  passed: boolean;
  averageResponseTime: number;
  p95ResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  totalRequests: number;
  successRate: number;
  recommendations: string[];
}

export interface OptimizationResult {
  category: 'DATABASE' | 'QUERY' | 'CACHING' | 'INDEXING' | 'API';
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  implementation: string;
  estimatedImprovement: string;
}

export class PerformanceOptimizer {
  private supabase;
  private sanity;
  private isServer: boolean;
  private metrics: PerformanceMetrics[] = [];

  constructor(isServer = true) {
    this.isServer = isServer;
    this.supabase = isServer ? null : createBrowserClient();
    this.sanity = sanityClient;
  }

  private async getSupabaseClient() {
    if (this.isServer) {
      return await createClient();
    }
    return this.supabase!;
  }

  /**
   * Measure query performance
   */
  async measureQueryPerformance<T>(
    operation: string,
    queryFunction: () => Promise<T>,
    options: {
      expectedRecordCount?: number;
      complexityScore?: number;
      cacheEnabled?: boolean;
    } = {}
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = Date.now();
    let success = false;
    let result: T;
    let recordCount = 0;

    try {
      result = await queryFunction();
      success = true;
      
      // Try to determine record count
      if (Array.isArray(result)) {
        recordCount = result.length;
      } else if (result && typeof result === 'object' && 'length' in result) {
        recordCount = (result as any).length;
      }

    } catch (error) {
      console.error(`Performance test failed for ${operation}:`, error);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      
      const metrics: PerformanceMetrics = {
        operation,
        duration,
        success,
        recordCount,
        cacheHit: options.cacheEnabled,
        queryComplexity: options.complexityScore,
        timestamp: new Date().toISOString()
      };

      this.metrics.push(metrics);
    }

    return { result: result!, metrics: this.metrics[this.metrics.length - 1] };
  }

  /**
   * Run comprehensive performance tests
   */
  async runPerformanceTests(): Promise<PerformanceTestResult[]> {
    const tests: PerformanceTestResult[] = [];

    // Test 1: Homepage data loading
    tests.push(await this.testHomepagePerformance());

    // Test 2: Search functionality
    tests.push(await this.testSearchPerformance());

    // Test 3: Listing detail loading
    tests.push(await this.testListingDetailPerformance());

    // Test 4: Dashboard data loading
    tests.push(await this.testDashboardPerformance());

    // Test 5: User authentication
    tests.push(await this.testAuthenticationPerformance());

    // Test 6: Analytics queries
    tests.push(await this.testAnalyticsPerformance());

    return tests;
  }

  /**
   * Test homepage data loading performance
   */
  private async testHomepagePerformance(): Promise<PerformanceTestResult> {
    const testMetrics: PerformanceMetrics[] = [];
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
      try {
        // Test categories loading
        const { metrics: categoryMetrics } = await this.measureQueryPerformance(
          'homepage_categories',
          () => this.sanity.fetch(`*[_type == "category"][0...8] { _id, title, slug }`),
          { expectedRecordCount: 8, complexityScore: 2 }
        );
        testMetrics.push(categoryMetrics);

        // Test featured listings
        const { metrics: listingsMetrics } = await this.measureQueryPerformance(
          'homepage_featured_listings',
          () => this.sanity.fetch(`*[_type == "listing" && status == "active"][0...12] {
            _id, title, price, images, location, category->{ title, slug }
          }`),
          { expectedRecordCount: 12, complexityScore: 4 }
        );
        testMetrics.push(listingsMetrics);

        // Test banners
        const { metrics: bannersMetrics } = await this.measureQueryPerformance(
          'homepage_banners',
          () => this.sanity.fetch(`*[_type == "banner"] { _id, title, image, link }`),
          { expectedRecordCount: 3, complexityScore: 1 }
        );
        testMetrics.push(bannersMetrics);

      } catch (error) {
        console.error(`Homepage test iteration ${i} failed:`, error);
      }
    }

    return this.analyzeTestResults('Homepage Performance', testMetrics);
  }

  /**
   * Test search functionality performance
   */
  private async testSearchPerformance(): Promise<PerformanceTestResult> {
    const testMetrics: PerformanceMetrics[] = [];
    const searchQueries = [
      { query: '', category: '', complexity: 2 },
      { query: 'camera', category: '', complexity: 3 },
      { query: '', category: 'electronics', complexity: 3 },
      { query: 'laptop', category: 'electronics', complexity: 4 },
      { query: 'rent', category: '', complexity: 2 }
    ];

    for (const searchQuery of searchQueries) {
      try {
        const { metrics } = await this.measureQueryPerformance(
          'search_listings',
          () => this.sanity.fetch(`
            *[_type == "listing" && status == "active" 
              ${searchQuery.query ? `&& (title match "${searchQuery.query}*" || description match "${searchQuery.query}*")` : ''}
              ${searchQuery.category ? `&& category->slug == "${searchQuery.category}"` : ''}
            ][0...20] {
              _id, title, price, priceType, images, condition, location,
              category->{ title, slug }, supabaseId
            }
          `),
          { expectedRecordCount: 20, complexityScore: searchQuery.complexity }
        );
        testMetrics.push(metrics);

      } catch (error) {
        console.error(`Search test failed:`, error);
      }
    }

    return this.analyzeTestResults('Search Performance', testMetrics);
  }

  /**
   * Test listing detail performance
   */
  private async testListingDetailPerformance(): Promise<PerformanceTestResult> {
    const testMetrics: PerformanceMetrics[] = [];
    
    // Get sample listing IDs
    const sampleListings = await this.sanity.fetch(`
      *[_type == "listing"][0...5] { _id }
    `);

    for (const listing of sampleListings) {
      try {
        // Test listing detail query
        const { metrics: listingMetrics } = await this.measureQueryPerformance(
          'listing_detail',
          () => this.sanity.fetch(`
            *[_type == "listing" && _id == "${listing._id}"][0] {
              _id, title, description, price, priceType, images, condition,
              availability, location, specifications, tags, supabaseId,
              category->{ _id, title, slug },
              "relatedListings": *[_type == "listing" && category._ref == ^.category._ref && _id != ^._id][0...4] {
                _id, title, price, images[0]
              }
            }
          `),
          { expectedRecordCount: 1, complexityScore: 5 }
        );
        testMetrics.push(listingMetrics);

        // Test seller profile query (if exists)
        if (listing.supabaseId) {
          const supabase = await this.getSupabaseClient();
          const { metrics: sellerMetrics } = await this.measureQueryPerformance(
            'seller_profile',
            () => supabase
              .from('seller_profiles')
              .select('*, users!inner(*)')
              .eq('id', listing.supabaseId)
              .single(),
            { expectedRecordCount: 1, complexityScore: 3 }
          );
          testMetrics.push(sellerMetrics);
        }

      } catch (error) {
        console.error(`Listing detail test failed:`, error);
      }
    }

    return this.analyzeTestResults('Listing Detail Performance', testMetrics);
  }

  /**
   * Test dashboard performance
   */
  private async testDashboardPerformance(): Promise<PerformanceTestResult> {
    const testMetrics: PerformanceMetrics[] = [];
    const supabase = await this.getSupabaseClient();

    try {
      // Get sample seller ID
      const { data: sampleSeller } = await supabase
        .from('seller_profiles')
        .select('id')
        .limit(1)
        .single();

      if (sampleSeller) {
        // Test seller analytics
        const { metrics: analyticsMetrics } = await this.measureQueryPerformance(
          'seller_analytics',
          () => supabase
            .from('analytics_events')
            .select('*')
            .eq('user_id', sampleSeller.id)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          { complexityScore: 4 }
        );
        testMetrics.push(analyticsMetrics);

        // Test seller listings
        const { metrics: listingsMetrics } = await this.measureQueryPerformance(
          'seller_listings',
          () => this.sanity.fetch(`
            *[_type == "listing" && supabaseId == "${sampleSeller.id}"] {
              _id, title, price, status, images, views, contactClicks
            }
          `),
          { complexityScore: 3 }
        );
        testMetrics.push(listingsMetrics);
      }

    } catch (error) {
      console.error('Dashboard test failed:', error);
    }

    return this.analyzeTestResults('Dashboard Performance', testMetrics);
  }

  /**
   * Test authentication performance
   */
  private async testAuthenticationPerformance(): Promise<PerformanceTestResult> {
    const testMetrics: PerformanceMetrics[] = [];
    const supabase = await this.getSupabaseClient();

    try {
      // Test session validation
      const { metrics: sessionMetrics } = await this.measureQueryPerformance(
        'session_validation',
        () => supabase.auth.getSession(),
        { complexityScore: 1 }
      );
      testMetrics.push(sessionMetrics);

      // Test user profile fetch
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user) {
        const { metrics: profileMetrics } = await this.measureQueryPerformance(
          'user_profile_fetch',
          () => supabase
            .from('users')
            .select('*, seller_profiles(*)')
            .eq('id', currentUser.user.id)
            .single(),
          { expectedRecordCount: 1, complexityScore: 2 }
        );
        testMetrics.push(profileMetrics);
      }

    } catch (error) {
      console.error('Authentication test failed:', error);
    }

    return this.analyzeTestResults('Authentication Performance', testMetrics);
  }

  /**
   * Test analytics queries performance
   */
  private async testAnalyticsPerformance(): Promise<PerformanceTestResult> {
    const testMetrics: PerformanceMetrics[] = [];
    const supabase = await this.getSupabaseClient();

    try {
      // Test analytics aggregation
      const { metrics: aggregateMetrics } = await this.measureQueryPerformance(
        'analytics_aggregation',
        () => supabase.rpc('get_analytics_summary', {
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        }),
        { complexityScore: 5 }
      );
      testMetrics.push(aggregateMetrics);

      // Test top listings query
      const { metrics: topListingsMetrics } = await this.measureQueryPerformance(
        'top_listings_analytics',
        () => supabase
          .from('analytics_events')
          .select('listing_id, COUNT(*) as views')
          .not('listing_id', 'is', null)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .group('listing_id')
          .order('views', { ascending: false })
          .limit(10),
        { expectedRecordCount: 10, complexityScore: 4 }
      );
      testMetrics.push(topListingsMetrics);

    } catch (error) {
      console.error('Analytics test failed:', error);
    }

    return this.analyzeTestResults('Analytics Performance', testMetrics);
  }

  /**
   * Analyze test results and generate recommendations
   */
  private analyzeTestResults(testName: string, metrics: PerformanceMetrics[]): PerformanceTestResult {
    if (metrics.length === 0) {
      return {
        testName,
        passed: false,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        totalRequests: 0,
        successRate: 0,
        recommendations: ['No test data available']
      };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const successfulRequests = metrics.filter(m => m.success).length;
    
    const avgResponseTime = durations.reduce((a, b) => a + b, 0) / durations.length;
    const p95Index = Math.floor(durations.length * 0.95);
    const p95ResponseTime = durations[p95Index] || durations[durations.length - 1];
    const maxResponseTime = Math.max(...durations);
    const minResponseTime = Math.min(...durations);
    const successRate = (successfulRequests / metrics.length) * 100;

    // Performance thresholds
    const ACCEPTABLE_RESPONSE_TIME = 1000; // 1 second
    const GOOD_RESPONSE_TIME = 500; // 500ms
    const ACCEPTABLE_SUCCESS_RATE = 99; // 99%

    const passed = avgResponseTime <= ACCEPTABLE_RESPONSE_TIME && successRate >= ACCEPTABLE_SUCCESS_RATE;

    const recommendations: string[] = [];

    if (avgResponseTime > ACCEPTABLE_RESPONSE_TIME) {
      recommendations.push(`Average response time (${avgResponseTime.toFixed(0)}ms) exceeds acceptable threshold (${ACCEPTABLE_RESPONSE_TIME}ms)`);
    }

    if (p95ResponseTime > ACCEPTABLE_RESPONSE_TIME * 2) {
      recommendations.push(`95th percentile response time (${p95ResponseTime.toFixed(0)}ms) is too high - investigate slow queries`);
    }

    if (successRate < ACCEPTABLE_SUCCESS_RATE) {
      recommendations.push(`Success rate (${successRate.toFixed(1)}%) is below acceptable threshold (${ACCEPTABLE_SUCCESS_RATE}%)`);
    }

    if (avgResponseTime > GOOD_RESPONSE_TIME && avgResponseTime <= ACCEPTABLE_RESPONSE_TIME) {
      recommendations.push('Consider optimizing queries to achieve better response times');
    }

    // Specific recommendations based on test type
    if (testName.includes('Search') && avgResponseTime > 800) {
      recommendations.push('Consider implementing search result caching or full-text search optimization');
    }

    if (testName.includes('Dashboard') && avgResponseTime > 1500) {
      recommendations.push('Dashboard queries should be optimized with proper indexing and data aggregation');
    }

    if (testName.includes('Analytics') && avgResponseTime > 2000) {
      recommendations.push('Analytics queries should use pre-computed aggregations for better performance');
    }

    return {
      testName,
      passed,
      averageResponseTime: Math.round(avgResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      maxResponseTime: Math.round(maxResponseTime),
      minResponseTime: Math.round(minResponseTime),
      totalRequests: metrics.length,
      successRate: Math.round(successRate * 100) / 100,
      recommendations
    };
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizationRecommendations(): Promise<OptimizationResult[]> {
    const recommendations: OptimizationResult[] = [];
    const supabase = await this.getSupabaseClient();

    try {
      // Check for missing indexes
      const { data: slowQueries } = await supabase.rpc('get_slow_queries');
      
      if (slowQueries && slowQueries.length > 0) {
        recommendations.push({
          category: 'INDEXING',
          description: 'Slow queries detected that could benefit from indexing',
          impact: 'HIGH',
          implementation: 'Create appropriate database indexes for frequently queried columns',
          estimatedImprovement: '50-80% faster query performance'
        });
      }

      // Check analytics table size
      const { data: analyticsCount } = await supabase
        .from('analytics_events')
        .select('id', { count: 'exact' });

      if (analyticsCount && analyticsCount.length > 100000) {
        recommendations.push({
          category: 'DATABASE',
          description: 'Analytics table is growing large and may impact performance',
          impact: 'MEDIUM',
          implementation: 'Implement data archiving strategy and partitioning',
          estimatedImprovement: '30-50% improvement in analytics queries'
        });
      }

      // Check for N+1 query patterns in Sanity
      recommendations.push({
        category: 'QUERY',
        description: 'Optimize Sanity queries to reduce round trips',
        impact: 'MEDIUM',
        implementation: 'Use GROQ joins and projections to fetch related data in single queries',
        estimatedImprovement: '40-60% reduction in API calls'
      });

      // Caching recommendations
      recommendations.push({
        category: 'CACHING',
        description: 'Implement strategic caching for frequently accessed data',
        impact: 'HIGH',
        implementation: 'Add Redis caching for categories, homepage data, and search results',
        estimatedImprovement: '70-90% faster response times for cached data'
      });

      // API optimization
      recommendations.push({
        category: 'API',
        description: 'Optimize API routes with proper error handling and response compression',
        impact: 'MEDIUM',
        implementation: 'Add response compression, implement proper HTTP caching headers',
        estimatedImprovement: '20-30% improvement in API response times'
      });

    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
    }

    return recommendations;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalOperations: number;
    averageResponseTime: number;
    successRate: number;
    slowestOperations: Array<{ operation: string; duration: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageResponseTime: 0,
        successRate: 0,
        slowestOperations: []
      };
    }

    const totalOperations = this.metrics.length;
    const successfulOperations = this.metrics.filter(m => m.success).length;
    const averageResponseTime = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations;
    const successRate = (successfulOperations / totalOperations) * 100;

    const slowestOperations = this.metrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(m => ({ operation: m.operation, duration: m.duration }));

    return {
      totalOperations,
      averageResponseTime: Math.round(averageResponseTime),
      successRate: Math.round(successRate * 100) / 100,
      slowestOperations
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = [];
  }
}

// Utility functions for production monitoring
export async function runProductionPerformanceCheck(): Promise<{
  testResults: PerformanceTestResult[];
  optimizations: OptimizationResult[];
  summary: any;
}> {
  const optimizer = new PerformanceOptimizer(true);
  
  const [testResults, optimizations] = await Promise.all([
    optimizer.runPerformanceTests(),
    optimizer.generateOptimizationRecommendations()
  ]);
  
  const summary = optimizer.getPerformanceSummary();
  
  return {
    testResults,
    optimizations,
    summary
  };
}

export default PerformanceOptimizer;