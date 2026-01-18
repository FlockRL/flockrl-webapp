/**
 * List submissions endpoint
 */

import { Env, ListSubmissionsResponse } from '../types';
import { listAllMetadata } from '../storage/metadata';
import { buildSubmissionSummary } from '../utils/transform';

/**
 * Handle GET /api/submissions
 * List all submissions.
 * Scans KV for metadata entries and returns list.
 */
export async function handleListSubmissions(env: Env): Promise<Response> {
  try {
    const metadataList = await listAllMetadata(env.SUBMISSIONS_KV);
    
    const submissions = metadataList.map(metadata => 
      buildSubmissionSummary(metadata)
    );
    
    submissions.sort((a, b) => {
      const dateA = a.createdAt || '';
      const dateB = b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
    
    const response: ListSubmissionsResponse = {
      submissions,
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Handle unexpected errors
    return new Response(
      JSON.stringify({ 
        detail: error instanceof Error ? error.message : 'Internal server error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
