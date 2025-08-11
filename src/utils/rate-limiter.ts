/**
 * Rate Limiter Utility for API Security
 * Implements in-memory rate limiting with configurable windows and limits
 */

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  message?: string;
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { requests: number; resetTime: number }>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  // Get or create rate limit data for this identifier
  let limitData = rateLimitStore.get(key);
  
  // If no data exists or window has expired, create new window
  if (!limitData || limitData.resetTime < now) {
    limitData = {
      requests: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, limitData);
    
    return {
      allowed: true,
      remainingRequests: config.maxRequests - 1,
      resetTime: limitData.resetTime,
    };
  }
  
  // Check if limit is exceeded
  if (limitData.requests >= config.maxRequests) {
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: limitData.resetTime,
      message: config.message || `Rate limit exceeded. Try again after ${new Date(limitData.resetTime).toISOString()}`
    };
  }
  
  // Increment request count
  limitData.requests++;
  rateLimitStore.set(key, limitData);
  
  return {
    allowed: true,
    remainingRequests: config.maxRequests - limitData.requests,
    resetTime: limitData.resetTime,
  };
}

// Extract client identifier from request
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxy/CDN scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  // Extract first IP if forwarded contains multiple
  const clientIp = forwarded?.split(',')[0]?.trim() || realIp || remoteAddr || 'unknown';
  
  return clientIp;
}

// Common rate limit configurations
export const RATE_LIMITS = {
  // Strict limits for sensitive endpoints
  LEAD_CAPTURE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute per IP
    message: 'Too many form submissions. Please wait a minute before trying again.'
  },
  
  // Moderate limits for demo generation
  DEMO_GENERATION: {
    windowMs: 5 * 60 * 1000, // 5 minutes  
    maxRequests: 3, // 3 demo requests per 5 minutes per IP
    message: 'Demo generation limit reached. Please wait 5 minutes before requesting another demo.'
  },
  
  // Newsletter signup limits
  NEWSLETTER_SIGNUP: {
    windowMs: 2 * 60 * 1000, // 2 minutes
    maxRequests: 3, // 3 signups per 2 minutes per IP
    message: 'Newsletter signup limit reached. Please wait 2 minutes before trying again.'
  },
  
  
  // Webhook rate limits (should be less restrictive for legitimate webhooks)
  WEBHOOK: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 webhook calls per minute per IP
    message: 'Webhook rate limit exceeded.'
  },
  
  // General API limits
  GENERAL_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute per IP
    message: 'API rate limit exceeded. Please slow down your requests.'
  },
  
  // Newsletter signup (less restrictive)
  NEWSLETTER: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 2, // 2 newsletter signups per minute per IP
    message: 'Too many newsletter signups. Please wait a minute.'
  }
} as const;

/**
 * Middleware wrapper for rate limiting
 */
export function withRateLimit(config: RateLimitConfig) {
  return (handler: (request: Request) => Promise<Response>) => {
    return async (request: Request): Promise<Response> => {
      const clientId = getClientIdentifier(request);
      const rateLimitResult = checkRateLimit(clientId, config);
      
      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: rateLimitResult.message,
            resetTime: rateLimitResult.resetTime
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
            }
          }
        );
      }
      
      // Add rate limit headers to response
      const response = await handler(request);
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
      
      return response;
    };
  };
}