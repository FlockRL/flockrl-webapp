/**
 * Get submission endpoint
 */

import { Env, HTTPException, Submission, SimulationData } from '../types';
import { getMetadata } from '../storage/metadata';
import { getFile } from '../storage/files';
import { buildSubmissionResponse } from '../utils/transform';

/**
 * Handle GET /api/submissions/{id}
 * Get submission details by ID.
 * Returns full Submission object matching frontend types.
 */
export async function handleGetSubmission(
  submissionId: string,
  env: Env
): Promise<Response> {
  try {
    const metadata = await getMetadata(env.SUBMISSIONS_KV, submissionId);
    
    if (!metadata) {
      throw new HTTPException(404, 'Submission not found');
    }
    
    const fileContent = await getFile(env.SUBMISSIONS_BUCKET, submissionId);
    
    let simData: SimulationData | undefined;
    
    if (fileContent) {
      try {
        simData = JSON.parse(fileContent) as SimulationData;
      } catch {
        simData = undefined;
      }
    }
    
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
