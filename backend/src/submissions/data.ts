/**
 * Get submission data endpoint
 * Mirrors Python get_submission_data() function (lines 308-338)
 */

import { Env, HTTPException, SubmissionDataResponse, SimulationData } from '../types';
import { getFile } from '../storage/files';

/**
 * Handle GET /api/submissions/{id}/data
 * Get the raw simulation data for a submission.
 * Returns the JSON structure with frames, metadata, and obstacles.
 * 
 * Mirrors Python lines 308-338
 */
export async function handleGetSubmissionData(
  submissionId: string,
  env: Env
): Promise<Response> {
  try {
    // Load file from R2 (CORRECTED: only .json)
    // Mirrors Python lines 317-323
    const content = await getFile(env.SUBMISSIONS_BUCKET, submissionId);
    
    if (!content) {
      throw new HTTPException(404, 'Submission not found');
    }
    
    // Parse and return data summary
    // Mirrors Python lines 326-336
    const data = JSON.parse(content) as SimulationData;
    
    const response: SubmissionDataResponse = {
      id: submissionId,
      frame_count: data.frames?.length || 0,
      metadata: data.metadata || {},
      obstacles: data.metadata?.obstacles || [],
      first_frame: data.frames?.[0] || null,
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
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
          ? `Failed to load data: ${error.message}` 
          : 'Internal server error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
