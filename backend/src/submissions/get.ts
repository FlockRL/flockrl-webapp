/**
 * Get submission endpoint
 * Mirrors Python get_submission() function (lines 149-225)
 */

import { Env, HTTPException, Submission, SimulationData } from '../types';
import { getMetadata } from '../storage/metadata';
import { getFile } from '../storage/files';
import { buildSubmissionResponse } from '../utils/transform';

/**
 * Handle GET /api/submissions/{id}
 * Get submission details by ID.
 * Returns full Submission object matching frontend types.
 * 
 * Mirrors Python lines 149-225
 */
export async function handleGetSubmission(
  submissionId: string,
  env: Env
): Promise<Response> {
  try {
    // Load metadata from KV
    // Mirrors Python lines 158-160
    const metadata = await getMetadata(env.SUBMISSIONS_KV, submissionId);
    
    if (!metadata) {
      throw new HTTPException(404, 'Submission not found');
    }
    
    // Load simulation file from R2 (CORRECTED: only .json)
    // Mirrors Python lines 167-169 (with correction)
    const fileContent = await getFile(env.SUBMISSIONS_BUCKET, submissionId);
    
    let simData: SimulationData | undefined;
    
    if (fileContent) {
      try {
        simData = JSON.parse(fileContent) as SimulationData;
      } catch {
        // If file can't be parsed, continue without simulation data
        simData = undefined;
      }
    }
    
    // Build full submission response
    // Mirrors Python lines 202-220
    const submission = buildSubmissionResponse(metadata, simData);
    
    return new Response(JSON.stringify(submission), {
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
          ? `Failed to load submission: ${error.message}` 
          : 'Internal server error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
