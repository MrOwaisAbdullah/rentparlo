/**
 * Simple rate limiter to prevent excessive API calls
 */

class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  private maxCalls: number;
  private windowMs: number;

  constructor(maxCalls: number = 10, windowMs: number = 1000) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
  }

  canMakeCall(key: string): boolean {
    const now = Date.now();
    const calls = this.calls.get(key) || [];

    // Remove old calls outside the window
    const validCalls = calls.filter((time) => now - time < this.windowMs);

    if (validCalls.length >= this.maxCalls) {
      return false;
    }

    // Add current call
    validCalls.push(now);
    this.calls.set(key, validCalls);

    return true;
  }

  reset(key?: string) {
    if (key) {
      this.calls.delete(key);
    } else {
      this.calls.clear();
    }
  }
}

// Global rate limiters
export const searchRateLimiter = new RateLimiter(5, 1000); // 5 calls per second
export const sellerFetchRateLimiter = new RateLimiter(10, 2000); // 10 calls per 2 seconds
export const analyticsRateLimiter = new RateLimiter(3, 1000); // 3 calls per second
