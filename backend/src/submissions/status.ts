/**
 * Get submission status endpoint
 * Mirrors Python get_submission_status() function (lines 270-305)
 */

import { Env, HTTPException, SubmissionStatusResponse, SimulationData } from '../types';
import { fileExists, getFile } from '../storage/files';

/**
 * Handle GET /api/submissions/{id}/status
 * Get the current processing status of a submission.
 * 
 * Mirrors Python lines 270-305
 */
export async function handleGetSubmissionStatus(
  submissionId: string,
  env: Env
): Promise<Response> {
  try {
    // Check if file exists (CORRECTED: only .json)
    // Mirrors Python lines 278-284
    const exists = await fileExists(env.SUBMISSIONS_BUCKET, submissionId);
    
    if (!exists) {
      throw new HTTPException(404, 'Submission not found');
    }
    
    // Try to load and validate the file
    // Mirrors Python lines 287-305
    try {
      const content = await getFile(env.SUBMISSIONS_BUCKET, submissionId);
      
      if (!content) {
        throw new HTTPException(404, 'Submission not found');
      }
      
      const data = JSON.parse(content) as SimulationData;
      const frameCount = data.frames?.length || 0;
      const hasMetadata = 'metadata' in data;
      
      const response: SubmissionStatusResponse = {
        id: submissionId,
        status: 'READY',
        frame_count: frameCount,
        has_metadata: hasMetadata,
        file_path: `${submissionId}.json`,
      };
      
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Return error status
      const response: SubmissionStatusResponse = {
        id: submissionId,
        status: 'ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
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
      JSON.stringify({ detail: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
