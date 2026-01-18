/**
 * Cloudflare Workers main entry point
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
      else if (pathname === '/health' && method === 'GET') {
        response = new Response(
          JSON.stringify({ status: 'healthy' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      else if (pathname === '/api/submissions' && method === 'POST') {
        const modifiedRequest = await addQueryParamsToFormData(request, searchParams);
        response = await handleCreateSubmission(modifiedRequest, env);
      }
      else if (pathname === '/api/submissions' && method === 'GET') {
        response = await handleListSubmissions(env);
      }
      else if (pathname.match(/^\/api\/submissions\/[^\/]+$/) && method === 'GET') {
        const submissionId = pathname.split('/').pop()!;
        
        const subPath = pathname.split('/').slice(3);
        
        if (subPath.length === 1) {
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
      else if (pathname.match(/^\/api\/submissions\/[^\/]+\/status$/) && method === 'GET') {
        const submissionId = pathname.split('/')[3];
        response = await handleGetSubmissionStatus(submissionId, env);
      }
      else if (pathname.match(/^\/api\/submissions\/[^\/]+\/data$/) && method === 'GET') {
        const submissionId = pathname.split('/')[3];
        response = await handleGetSubmissionData(submissionId, env);
      }
      else if (pathname.match(/^\/api\/submissions\/[^\/]+\/file$/) && method === 'GET') {
        const submissionId = pathname.split('/')[3];
        response = await handleGetSubmissionFile(submissionId, env);
      }
      else if (pathname.match(/^\/api\/submissions\/[^\/]+\/log$/) && method === 'GET') {
        const submissionId = pathname.split('/')[3];
        response = await handleGetSubmissionLog(submissionId, env);
      }
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
    
    const url = new URL(request.url);
    url.search = '';
    
    return new Request(url.toString(), {
      method: request.method,
      headers: headers,
      body: formData,
    });
  }
  
  return request;
}
