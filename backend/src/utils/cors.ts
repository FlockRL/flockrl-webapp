/**
 * CORS utilities for Cloudflare Workers
 * Mirrors Python CORS middleware configuration (lines 23-34)
 */

import { Env } from '../types';

/**
 * Get allowed origins from environment
 * Mirrors Python lines 23-26
 */
export function getAllowedOrigins(env: Env): string[] {
  const origins = env.CORS_ORIGINS || 'http://localhost:3000';
  return origins.split(',').map(o => o.trim());
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}

/**
 * Add CORS headers to response
 * Mirrors Python CORSMiddleware configuration (lines 28-34)
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
  
  // Set other CORS headers (mirrors Python allow_credentials, allow_methods, allow_headers)
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
