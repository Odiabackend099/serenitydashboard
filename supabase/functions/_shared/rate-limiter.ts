/**
 * Rate Limiting Utility for Edge Functions
 *
 * Prevents abuse by limiting requests per IP address or user ID
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
}

// In-memory store for rate limiting (resets on function cold start)
// For production, consider using Redis or Supabase for persistent storage
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a client has exceeded the rate limit
 *
 * @param clientId - Unique identifier (IP address or user ID)
 * @param config - Rate limit configuration
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  clientId: string,
  config: RateLimitConfig = { windowMs: 60000, max: 10 }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);

  // Clean up expired entries
  if (record && now > record.resetAt) {
    rateLimitStore.delete(clientId);
  }

  // Get or create record
  const current = rateLimitStore.get(clientId);

  if (!current) {
    // First request in this window
    rateLimitStore.set(clientId, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.max - 1,
      resetAt: now + config.windowMs,
    };
  }

  // Check if over limit
  if (current.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  // Increment count
  current.count++;

  return {
    allowed: true,
    remaining: config.max - current.count,
    resetAt: current.resetAt,
  };
}

/**
 * Middleware to add rate limiting to Edge Functions
 *
 * Usage:
 *   serve(async (req) => {
 *     const clientId = getClientId(req);
 *     const rateLimit = checkRateLimit(clientId);
 *
 *     if (!rateLimit.allowed) {
 *       return rateLimitResponse(rateLimit);
 *     }
 *
 *     // ... rest of handler
 *   });
 */
export function rateLimitResponse(rateLimit: { remaining: number; resetAt: number }): Response {
  const resetInSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${resetInSeconds} seconds.`,
      retryAfter: resetInSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': resetInSeconds.toString(),
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
      },
    }
  );
}

/**
 * Extract client identifier from request
 */
export function getClientId(req: Request): string {
  // Try to get IP from headers (Cloudflare, Vercel, etc.)
  const cfIP = req.headers.get('cf-connecting-ip');
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');

  const ip = cfIP || forwarded?.split(',')[0] || realIP || 'unknown';

  // If authenticated, use user ID instead of IP
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from JWT if available
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      return `user:${payload.sub || payload.user_id}`;
    } catch {
      // If JWT parsing fails, fall back to IP
    }
  }

  return `ip:${ip}`;
}

/**
 * Clean up old rate limit entries periodically
 * Call this in long-running services or use a scheduled function
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}
