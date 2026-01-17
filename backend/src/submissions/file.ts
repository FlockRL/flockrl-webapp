/**
 * Get submission file endpoint
 * Mirrors Python get_submission_file() function (lines 341-368)
 */

import { Env, HTTPException } from '../types';
import { getFileObject } from '../storage/files';
import { getMetadata } from '../storage/metadata';

/**
 * Handle GET /api/submissions/{id}/file
 * Download the original simulation log file for a submission.
 * 
 * Mirrors Python lines 341-368
 */
export async function handleGetSubmissionFile(
  submissionId: string,
  env: Env
): Promise<Response> {
  try {
    // Load file from R2 (CORRECTED: only .json)
    // Mirrors Python lines 348-354
    const fileObject = await getFileObject(env.SUBMISSIONS_BUCKET, submissionId);
    
    if (!fileObject) {
      throw new HTTPException(404, 'Log file not found');
    }
    
    // Get original filename from metadata
    // Mirrors Python lines 358-366
    let downloadName = `${submissionId}.json`;
    const metadata = await getMetadata(env.SUBMISSIONS_KV, submissionId);
    
    if (metadata?.log_file_name) {
      downloadName = metadata.log_file_name;
    }
    
    // Return file with appropriate headers
    // CORRECTED: Always application/json (only .json files)
    return new Response(fileObject.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
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
      JSON.stringify({ detail: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
