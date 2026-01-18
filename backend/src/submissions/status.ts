/**
 * Get submission status endpoint
 */

import { Env, HTTPException, SubmissionStatusResponse, SimulationData } from '../types';
import { fileExists, getFile } from '../storage/files';

/**
 * Handle GET /api/submissions/{id}/status
 * Get the current processing status of a submission.
 */
export async function handleGetSubmissionStatus(
  submissionId: string,
  env: Env
): Promise<Response> {
  try {
    const exists = await fileExists(env.SUBMISSIONS_BUCKET, submissionId);
    
    if (!exists) {
      throw new HTTPException(404, 'Submission not found');
    }
    
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
