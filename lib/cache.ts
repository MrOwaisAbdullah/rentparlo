// lib/cache.ts
import { createClient } from '@supabase/supabase-js';

// In-memory cache store (resets on server restart)
const cache = new Map<string, { data: any; expires: number }>();

// Cache configuration
const CACHE_TTL = 60 * 1000; // 60 seconds in milliseconds

/**
 * Get cached seller info if available and not expired
 */
export async function getCachedSellerInfo(userId: string) {
  const key = `seller:${userId}`;
  const cached = cache.get(key);
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  return null;
}

/**
 * Cache seller info with TTL
 */
export async function cacheSellerInfo(userId: string, data: any, ttlSeconds: number) {
  const key = `seller:${userId}`;
  const ttl = ttlSeconds * 1000;
  
  cache.set(key, {
    data,
    expires: Date.now() + ttl
  });
}

/**
 * Advanced: Redis cache implementation (for production)
 * Only use this if you have Redis set up
 */
export async function getCachedSellerInfoRedis(userId: string) {
  // This would require Redis setup
  // const redis = new Redis(process.env.REDIS_URL!);
  // const cached = await redis.get(`seller:${userId}`);
  // return cached ? JSON.parse(cached) : null;
  return null;
}

export async function cacheSellerInfoRedis(userId: string, data: any, ttlSeconds: number) {
  // const redis = new Redis(process.env.REDIS_URL!);
  // await redis.setex(`seller:${userId}`, ttlSeconds, JSON.stringify(data));
}