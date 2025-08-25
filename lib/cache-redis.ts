// lib/cache-redis.ts
// Only import and use Redis on the server side
const Redis = typeof window === 'undefined' ? require('ioredis').default : null;

interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

// Performance metrics tracking
interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  lastAccess: number;
}

// Global Redis client instance
let globalRedisClient: any | null = null;

// Function to get or create Redis client with proper connection management
function getRedisClient(): any | null {
  // Only initialize Redis on the server side
  if (typeof window !== 'undefined') {
    return null;
  }
  
  // If REDIS_URL is not provided, return null (use in-memory only)
  if (!process.env.REDIS_URL) {
    return null;
  }

  // Return existing client if already created
  if (globalRedisClient) {
    return globalRedisClient;
  }

  try {
    // Create new Redis client with connection options
    globalRedisClient = new Redis(process.env.REDIS_URL, {
      // Connection options
      connectionName: 'rentparlo-cache',
      maxRetriesPerRequest: 3,
      showFriendlyErrorStack: true,
      
      // Retry strategy to prevent "max number of clients reached"
      retryStrategy: (times: number) => {
        if (times > 10) {
          console.error("[CACHE_ERROR] Redis retry limit exceeded");
          return null; // Stop retrying
        }
        console.log(`[CACHE_INFO] Redis retry attempt ${times}`);
        return Math.min(times * 50, 2000); // Exponential backoff up to 2 seconds
      },
      
      // Reconnect on error
      reconnectOnError: (err: Error) => {
        const targetError = "READONLY";
        if (err.message.includes("max number of clients reached")) {
          console.error("[CACHE_ERROR] Redis client limit reached, will retry");
          return 2; // Retry indefinitely with backoff
        }
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    });

    // Add Redis error handling
    globalRedisClient.on('error', (err: Error) => {
      console.error('[CACHE_ERROR] Redis connection error:', err);
    });

    globalRedisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });

    globalRedisClient.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });

    return globalRedisClient;
  } catch (error) {
    console.error('[CACHE_ERROR] Failed to create Redis client:', error);
    return null;
  }
}

// Graceful shutdown function
export async function shutdownRedis(): Promise<void> {
  // Only run on server side
  if (typeof window !== 'undefined') {
    return;
  }
  
  if (globalRedisClient) {
    try {
      await globalRedisClient.quit();
      console.log('Redis connection closed gracefully');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    } finally {
      globalRedisClient = null;
    }
  }
}

export class CacheManager {
  private redis: any | null;
  private inMemory: Map<string, { data: any; expires: number; lastAccess: number }>;
  private metrics: Map<string, CacheMetrics>;
  private readonly MAX_IN_MEMORY_SIZE: number = 1000; // Maximum items in in-memory cache
  
  constructor() {
    // Only initialize Redis on the server side
    if (typeof window !== 'undefined') {
      this.redis = null;
    } else {
      // Initialize Redis client using singleton pattern
      this.redis = getRedisClient();
    }
    
    // In-memory cache as fallback with LRU eviction
    this.inMemory = new Map();
    
    // Metrics tracking
    this.metrics = new Map();
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      // Update metrics
      const metrics = this.metrics.get(key) || { hits: 0, misses: 0, errors: 0, lastAccess: 0 };
      
      // Check in-memory cache first
      const inMemoryResult = this.getInMemory<T>(key);
      if (inMemoryResult !== undefined) {
        metrics.hits++;
        metrics.lastAccess = Date.now();
        this.metrics.set(key, metrics);
        return inMemoryResult as T;
      }
      
      // Check Redis cache if available and on server side
      if (this.redis && typeof window === 'undefined') {
        const redisResult = await this.redis.get(key);
        if (redisResult) {
          metrics.hits++;
          metrics.lastAccess = Date.now();
          this.metrics.set(key, metrics);
          return JSON.parse(redisResult) as T;
        }
      }
      
      // Cache miss
      metrics.misses++;
      metrics.lastAccess = Date.now();
      this.metrics.set(key, metrics);
      
      return null;
    } catch (error) {
      // Update error metrics
      const metrics = this.metrics.get(key) || { hits: 0, misses: 0, errors: 0, lastAccess: 0 };
      metrics.errors++;
      this.metrics.set(key, metrics);
      
      // Log error with context
      this.logError('cache_get_error', `Key: ${key}, Error: ${error.message}`);
      
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = 300, tags = [] } = options;
      
      // Store in in-memory cache with LRU eviction
      this.setInMemory<T>(key, data, ttl);
      
      // Store in Redis with tags if available and on server side
      if (this.redis && typeof window === 'undefined') {
        const payload = JSON.stringify(data);
        await this.redis.setex(key, ttl, payload);
        
        // Store tags for selective invalidation
        if (tags.length > 0) {
          await this.setTags(key, tags);
        }
      }
      
      // Update metrics
      const metrics = this.metrics.get(key) || { hits: 0, misses: 0, errors: 0, lastAccess: 0 };
      metrics.lastAccess = Date.now();
      this.metrics.set(key, metrics);
    } catch (error) {
      // Update error metrics
      const metrics = this.metrics.get(key) || { hits: 0, misses: 0, errors: 0, lastAccess: 0 };
      metrics.errors++;
      this.metrics.set(key, metrics);
      
      // Log error with context
      this.logError('cache_set_error', `Key: ${key}, Error: ${error.message}`);
      
      console.error('Cache set error:', error);
    }
  }
  
  async invalidateTags(tags: string[]): Promise<void> {
    try {
      // Only run on server side
      if (typeof window !== 'undefined') {
        // For in-memory cache without Redis, we can't do selective invalidation
        // so we clear the entire cache
        this.inMemory.clear();
        return;
      }
      
      // If Redis is not available, just clear in-memory cache
      if (!this.redis) {
        // For in-memory cache without Redis, we can't do selective invalidation
        // so we clear the entire cache
        this.inMemory.clear();
        return;
      }
      
      // Get all keys associated with tags
      const keysToDelete: string[] = [];
      for (const tag of tags) {
        const tagKeys = await this.redis.smembers(`tag:${tag}`);
        keysToDelete.push(...tagKeys);
      }
      
      // Delete all associated keys
      if (keysToDelete.length > 0) {
        await this.redis.del(...keysToDelete);
        
        // Remove from in-memory cache
        for (const key of keysToDelete) {
          this.inMemory.delete(key);
          // Remove metrics for deleted keys
          this.metrics.delete(key);
        }
      }
      
      // Remove tag associations
      const tagKeys = tags.map(tag => `tag:${tag}`);
      await this.redis.del(...tagKeys);
    } catch (error) {
      // Log error with context
      this.logError('cache_invalidate_error', `Tags: ${tags.join(',')}, Error: ${error.message}`);
      
      console.error('Cache invalidation error:', error);
    }
  }
  
  private getInMemory<T>(key: string): T | undefined | null {
    const cached = this.inMemory.get(key);
    if (!cached) return null;
    
    // Update last access time for LRU
    cached.lastAccess = Date.now();
    this.inMemory.set(key, cached);
    
    if (cached.expires > Date.now()) {
      return cached.data as T;
    } else {
      this.inMemory.delete(key);
      return undefined; // Expired, force refresh
    }
  }
  
  private setInMemory<T>(key: string, data: T, ttl: number): void {
    // Check if we need to evict items due to size limit
    if (this.inMemory.size >= this.MAX_IN_MEMORY_SIZE) {
      this.evictLRU();
    }
    
    this.inMemory.set(key, {
      data,
      expires: Date.now() + (ttl * 1000),
      lastAccess: Date.now()
    });
  }
  
  private evictLRU(): void {
    // Find the least recently used item
    let lruKey: string | null = null;
    let oldestAccess = Infinity;
    
    // Convert to array for iteration (to avoid TypeScript errors)
    const entries = Array.from(this.inMemory.entries());
    for (const [key, value] of entries) {
      if (value.lastAccess < oldestAccess) {
        oldestAccess = value.lastAccess;
        lruKey = key;
      }
    }
    
    // Remove the LRU item
    if (lruKey) {
      this.inMemory.delete(lruKey);
      this.metrics.delete(lruKey);
    }
  }
  
  private async setTags(key: string, tags: string[]): Promise<void> {
    // Only run on server side
    if (typeof window !== 'undefined' || !this.redis) return;
    
    const promises = tags.map(tag => 
      this.redis!.sadd(`tag:${tag}`, key)
    );
    await Promise.all(promises);
  }
  
  // Proper error logging function
  private logError(type: string, message: string): void {
    // In a production environment, you would send this to a logging service
    console.error(`[CACHE_ERROR] ${type}: ${message}`);
    
    // You could also send to an external logging service like Sentry, Loggly, etc.
    // Example:
    // if (process.env.LOGGING_SERVICE_URL) {
    //   fetch(process.env.LOGGING_SERVICE_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ type, message, timestamp: new Date().toISOString() })
    //   }).catch(err => console.error('Failed to send log to service:', err));
    // }
  }
  
  // Get cache metrics for a specific key
  getMetrics(key: string): CacheMetrics | null {
    return this.metrics.get(key) || null;
  }
  
  // Get cache hit rate for a specific key
  getHitRate(key: string): number {
    const metrics = this.metrics.get(key);
    if (!metrics) return 0;
    
    const total = metrics.hits + metrics.misses;
    return total > 0 ? metrics.hits / total : 0;
  }
  
  // Get overall cache hit rate
  getOverallHitRate(): number {
    let totalHits = 0;
    let totalMisses = 0;
    
    // Convert to array for iteration (to avoid TypeScript errors)
    const values = Array.from(this.metrics.values());
    for (const metrics of values) {
      totalHits += metrics.hits;
      totalMisses += metrics.misses;
    }
    
    const total = totalHits + totalMisses;
    return total > 0 ? totalHits / total : 0;
  }
  
  // Get cache statistics
  getCacheStats(): { 
    totalKeys: number; 
    hitRate: number; 
    totalHits: number; 
    totalMisses: number; 
    totalErrors: number;
    memoryUsage: number;
  } {
    let totalHits = 0;
    let totalMisses = 0;
    let totalErrors = 0;
    
    // Convert to array for iteration (to avoid TypeScript errors)
    const values = Array.from(this.metrics.values());
    for (const metrics of values) {
      totalHits += metrics.hits;
      totalMisses += metrics.misses;
      totalErrors += metrics.errors;
    }
    
    const total = totalHits + totalMisses;
    const hitRate = total > 0 ? totalHits / total : 0;
    
    return {
      totalKeys: this.metrics.size,
      hitRate,
      totalHits,
      totalMisses,
      totalErrors,
      memoryUsage: this.inMemory.size
    };
  }
  
  // Get all metrics
  getAllMetrics(): Map<string, CacheMetrics> {
    return new Map(this.metrics);
  }
  
  // Close Redis connection when needed
  async close(): Promise<void> {
    // Only run on server side
    if (typeof window !== 'undefined') {
      return;
    }
    
    if (this.redis) {
      await this.redis.quit();
      globalRedisClient = null;
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();