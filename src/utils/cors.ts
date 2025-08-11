/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Provides secure cross-origin request handling for API endpoints
 */

export interface CORSConfig {
  origin: string[] | string | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge?: number;
}

// Default CORS configuration for production
const DEFAULT_CORS_CONFIG: CORSConfig = {
  origin: [
    'https://aktivcro.com',
    'https://www.aktivcro.com',
    'https://aktivcro.vercel.app',
    // Add any additional allowed domains here
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Development CORS configuration (more permissive)
const DEV_CORS_CONFIG: CORSConfig = {
  origin: [
    'http://localhost:4321',
    'http://localhost:3000',
    'http://127.0.0.1:4321',
    'https://aktivcro.com',
    'https://www.aktivcro.com',
    'https://aktivcro.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
  ],
  credentials: true,
  maxAge: 86400,
};

export function getCORSConfig(): CORSConfig {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? DEV_CORS_CONFIG : DEFAULT_CORS_CONFIG;
}

export function isOriginAllowed(origin: string | null, config: CORSConfig): boolean {
  if (!origin) return false;
  
  if (config.origin === true) return true;
  if (config.origin === false) return false;
  
  if (typeof config.origin === 'string') {
    return origin === config.origin;
  }
  
  if (Array.isArray(config.origin)) {
    return config.origin.includes(origin);
  }
  
  return false;
}

export function setCORSHeaders(
  response: Response,
  request: Request,
  config: CORSConfig = getCORSConfig()
): Response {
  const origin = request.headers.get('origin');
  
  // Set CORS headers
  if (origin && isOriginAllowed(origin, config)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set(
    'Access-Control-Allow-Methods',
    config.methods.join(', ')
  );
  
  response.headers.set(
    'Access-Control-Allow-Headers',
    config.allowedHeaders.join(', ')
  );
  
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  if (config.maxAge) {
    response.headers.set('Access-Control-Max-Age', config.maxAge.toString());
  }
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  return response;
}

export function handleCORSPreflight(request: Request): Response | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }
  
  const config = getCORSConfig();
  const origin = request.headers.get('origin');
  
  if (!origin || !isOriginAllowed(origin, config)) {
    return new Response('CORS not allowed', { status: 403 });
  }
  
  const response = new Response(null, { status: 200 });
  return setCORSHeaders(response, request, config);
}

/**
 * CORS middleware wrapper for API routes
 */
export function withCORS<T extends any[]>(
  handler: (request: Request, ...args: T) => Promise<Response>
) {
  return async (request: Request, ...args: T): Promise<Response> => {
    // Handle preflight requests
    const preflightResponse = handleCORSPreflight(request);
    if (preflightResponse) {
      return preflightResponse;
    }
    
    try {
      const response = await handler(request, ...args);
      return setCORSHeaders(response, request);
    } catch (error) {
      // Even error responses should have CORS headers
      const errorResponse = new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: 'An unexpected error occurred'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      return setCORSHeaders(errorResponse, request);
    }
  };
}

/**
 * Validate request origin for sensitive operations
 */
export function validateSecureOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  if (!origin && !referer) {
    return false; // No origin info, likely not a browser request
  }
  
  const config = getCORSConfig();
  
  // Check origin
  if (origin && !isOriginAllowed(origin, config)) {
    return false;
  }
  
  // Check referer as backup
  if (!origin && referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return isOriginAllowed(refererOrigin, config);
    } catch {
      return false;
    }
  }
  
  return true;
}