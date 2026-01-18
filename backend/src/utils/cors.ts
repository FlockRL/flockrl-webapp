/**
 * CORS utilities for Cloudflare Workers
 */

import { Env } from '../types';

/**
 * Get allowed origins from environment
 * Normalizes origins by removing trailing slashes (CORS origins should not have trailing slashes)
 */
export function getAllowedOrigins(env: Env): string[] {
  const origins = env.CORS_ORIGINS || 'http://localhost:3000';
  return origins.split(',').map(o => o.trim().replace(/\/+$/, '')); // Remove trailing slashes
}

/**
 * Check if origin is allowed
 * Normalizes the origin by removing trailing slashes before checking
 */
export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  // Normalize origin by removing trailing slashes
  const normalizedOrigin = origin.replace(/\/+$/, '');
  return allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*');
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: Response,
  origin: string | null,
  allowedOrigins: string[]
): Response {
  const headers = new Headers(response.headers);
  
  // Set Access-Control-Allow-Origin
  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*')) {
    headers.set('Access-Control-Allow-Origin', '*');
  }
  
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', '*');
  headers.set('Access-Control-Allow-Headers', '*');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Handle OPTIONS preflight request
 */
export function handleOptionsRequest(
  origin: string | null,
  allowedOrigins: string[]
): Response {
  const headers = new Headers();
  
  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*')) {
    headers.set('Access-Control-Allow-Origin', '*');
  }
  
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', '*');
  headers.set('Access-Control-Allow-Headers', '*');
  headers.set('Access-Control-Max-Age', '86400');
  
  return new Response(null, {
    status: 204,
    headers,
  });
}
