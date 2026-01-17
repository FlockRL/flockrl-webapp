/**
 * Get submission log endpoint
 * Mirrors Python get_submission_log() function (lines 371-401)
 */

import { Env, HTTPException } from '../types';
import { getFile } from '../storage/files';

/**
 * Handle GET /api/submissions/{id}/log
 * Get the log file content for a submission.
 * Returns the file content as formatted JSON text.
 * 
 * Mirrors Python lines 371-401
 */
export async function handleGetSubmissionLog(
  submissionId: string,
  env: Env
): Promise<Response> {
  try {
    // Load file from R2 (CORRECTED: only .json)
    // Mirrors Python lines 380-386
    const content = await getFile(env.SUBMISSIONS_BUCKET, submissionId);
    
    if (!content) {
      throw new HTTPException(404, 'Log file not found');
    }
    
    // Try to format as JSON (mirrors Python lines 392-398)
    let formattedContent: string;
    try {
      const data = JSON.parse(content);
      formattedContent = JSON.stringify(data, null, 2);
    } catch {
      // If it's not valid JSON, return as-is
      formattedContent = content;
    }
    
    return new Response(formattedContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    // Handle HTTP exceptions
    if (error instanceof HTTPException) {
      return new Response(
        JSON.stringify({ detail: error.detail }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Handle unexpected errors
    return new Response(
      JSON.stringify({ 
        detail: error instanceof Error 
          ? `Failed to read log file: ${error.message}` 
          : 'Internal server error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
