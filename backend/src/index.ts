/**
 * Cloudflare Workers main entry point
 * Mirrors Python FastAPI routing structure from backend/main.py
 */

import { Env } from './types';
import { getAllowedOrigins, addCorsHeaders, handleOptionsRequest } from './utils/cors';
import { handleCreateSubmission } from './submissions/create';
import { handleGetSubmission } from './submissions/get';
import { handleListSubmissions } from './submissions/list';
import { handleGetSubmissionStatus } from './submissions/status';
import { handleGetSubmissionData } from './submissions/data';
import { handleGetSubmissionFile } from './submissions/file';
import { handleGetSubmissionLog } from './submissions/log';

/**
 * Main fetch handler
 * Routes requests to appropriate handlers, applies CORS middleware
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const method = request.method;
    const origin = request.headers.get('Origin');
    const allowedOrigins = getAllowedOrigins(env);
    
    // Handle OPTIONS preflight requests
    if (method === 'OPTIONS') {
      return handleOptionsRequest(origin, allowedOrigins);
    }
    
    let response: Response;
    
    try {
      // Route matching (mirrors FastAPI routing)
      
      // GET / - Root endpoint (mirrors Python line 54)
      if (pathname === '/' && method === 'GET') {
        response = new Response(
          JSON.stringify({
            message: 'FlockRL Backend API',
            version: '1.0.0',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      // GET /health - Health check (mirrors Python line 59)
      else if (pathname === '/health' && method === 'GET') {
        response = new Response(
          JSON.stringify({ status: 'healthy' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      // POST /api/submissions - Create submission (mirrors Python line 64)
      else if (pathname === '/api/submissions' && method === 'POST') {
        // Parse query params for metadata
        const modifiedRequest = await addQueryParamsToFormData(request, searchParams);
        response = await handleCreateSubmission(modifiedRequest, env);
      }
      // GET /api/submissions - List submissions (mirrors Python line 228)
      else if (pathname === '/api/submissions' && method === 'GET') {
        response = await handleListSubmissions(env);
      }
      // GET /api/submissions/{id} - Get submission (mirrors Python line 149)
      else if (pathname.match(/^\/api\/submissions\/[^\/]+$/) && method === 'GET') {
        const submissionId = pathname.split('/').pop()!;
        
        // Check if this is a specific sub-endpoint
        const subPath = pathname.split('/').slice(3);
        
        if (subPath.length === 1) {
          // Just /api/submissions/{id}
          response = await handleGetSubmission(submissionId, env);
        } else {
          response = new Response(
            JSON.stringify({ detail: 'Not found' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }
      // GET /api/submissions/{id}/status - Get submission status (mirrors Python line 270)
      else if (pathname.match(/^\/api\/submissions\/[^\/]+\/status$/) && method === 'GET') {
        const submissionId = pathname.split('/')[3];
        response = await handleGetSubmissionStatus(submissionId, env);
      }
      // GET /api/submissions/{id}/data - Get submission data (mirrors Python line 308)
      else if (pathname.match(/^\/api\/submissions\/[^\/]+\/data$/) && method === 'GET') {
        const submissionId = pathname.split('/')[3];
        response = await handleGetSubmissionData(submissionId, env);
      }
      // GET /api/submissions/{id}/file - Get submission file (mirrors Python line 341)
      else if (pathname.match(/^\/api\/submissions\/[^\/]+\/file$/) && method === 'GET') {
        const submissionId = pathname.split('/')[3];
        response = await handleGetSubmissionFile(submissionId, env);
      }
      // GET /api/submissions/{id}/log - Get submission log (mirrors Python line 371)
      else if (pathname.match(/^\/api\/submissions\/[^\/]+\/log$/) && method === 'GET') {
        const submissionId = pathname.split('/')[3];
        response = await handleGetSubmissionLog(submissionId, env);
      }
      // 404 Not Found
      else {
        response = new Response(
          JSON.stringify({ detail: 'Not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unhandled error:', error);
      response = new Response(
        JSON.stringify({
          detail: error instanceof Error ? error.message : 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Apply CORS headers to response
    return addCorsHeaders(response, origin, allowedOrigins);
  },
};

/**
 * Helper to add query params to request for form data processing
 * FastAPI accepts form fields via query params, we need to merge them
 */
async function addQueryParamsToFormData(
  request: Request,
  searchParams: URLSearchParams
): Promise<Request> {
  // If there are query params, we need to add them to the form data
  if (searchParams.toString()) {
    const formData = await request.formData();
    
    // Add query params to form data
    for (const [key, value] of searchParams.entries()) {
      if (!formData.has(key)) {
        formData.append(key, value);
      }
    }
    
    // Create new headers without Content-Type - let runtime set it with boundary
    const headers = new Headers(request.headers);
    headers.delete('Content-Type');
    
    // Remove query params from URL since we've merged them into FormData
    const url = new URL(request.url);
    url.search = '';
    
    // Create new request with modified form data
    // The runtime will automatically set Content-Type with boundary for FormData
    return new Request(url.toString(), {
      method: request.method,
      headers: headers,
      body: formData,
    });
  }
  
  return request;
}
