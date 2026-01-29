/**
 * CSRF Protection Utilities
 * Prevents Cross-Site Request Forgery attacks on state-changing endpoints
 */

import { NextRequest } from 'next/server';

/**
 * Validates Origin header matches expected domain
 * Prevents CSRF attacks where attacker's site makes POST requests to your API
 *
 * @param request - Next.js request object
 * @returns true if origin is valid, false if CSRF attempt detected
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // Allow requests without origin (same-site, non-browser clients)
  if (!origin) {
    return true;
  }

  // Extract hostname from origin (remove protocol)
  const originHost = new URL(origin).host;

  // Validate origin matches host
  if (originHost !== host) {
    console.warn(`CSRF attempt detected: origin=${originHost}, host=${host}`);
    return false;
  }

  return true;
}

/**
 * Validates request is from allowed origins
 * Use for POST/PUT/DELETE endpoints that modify state
 *
 * @param request - Next.js request object
 * @param allowedOrigins - Optional list of allowed origins (for CORS)
 * @returns true if request is allowed, false if should be blocked
 */
export function validateCSRF(
  request: NextRequest,
  allowedOrigins?: string[]
): boolean {
  // Check HTTP method
  const method = request.method;

  // Only validate POST, PUT, DELETE, PATCH (state-changing methods)
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }

  // Validate origin
  if (!validateOrigin(request)) {
    return false;
  }

  // If allowedOrigins provided, validate against whitelist
  if (allowedOrigins && allowedOrigins.length > 0) {
    const origin = request.headers.get('origin');
    if (origin && !allowedOrigins.includes(origin)) {
      console.warn(`Origin not in whitelist: ${origin}`);
      return false;
    }
  }

  return true;
}
