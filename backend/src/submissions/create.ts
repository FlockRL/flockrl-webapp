/**
 * Create submission endpoint
 * Mirrors Python create_submission() function (lines 64-146)
 */

import { Env, HTTPException, SubmissionResponse } from '../types';
import { validateFileType, validateSimulationLog } from '../utils/validation';
import { generateSubmissionId, generateTimestamp } from '../utils/submission';
import { buildMetadata } from '../utils/transform';
import { storeFile } from '../storage/files';
import { storeMetadata } from '../storage/metadata';
import { parseMultipartFormData, parseTags } from '../utils/multipart';

/**
 * Handle POST /api/submissions
 * Upload a log file (JSON simulation output) and create a new submission.
 * 
 * Mirrors Python lines 64-146
 */
export async function handleCreateSubmission(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Parse multipart form data
    const { fields, files } = await parseMultipartFormData(request);
    
    // Get the uploaded file
    const uploadedFile = files.get('file');
    if (!uploadedFile) {
      throw new HTTPException(400, 'No file uploaded');
    }
    
    // Validate file type - CORRECTED: only accept .json files
    // Mirrors Python lines 78-83 (with correction)
    validateFileType(uploadedFile.filename);
    
    // Generate submission ID and timestamp
    // Mirrors Python lines 86-87
    const submissionId = generateSubmissionId();
    const createdAt = generateTimestamp();
    
    // Get form fields
    const title = fields.get('title') || '';
    const name = fields.get('name') || null;
    const tags = parseTags(fields.get('tags'));
    const notes = fields.get('notes') || null;
    const envSet = fields.get('env_set') || null;
    const rendererPreset = fields.get('renderer_preset') || null;
    
    // Check if file content is empty
    if (!uploadedFile.content || uploadedFile.content.byteLength === 0) {
      throw new HTTPException(400, 'Uploaded file is empty');
    }
    
    // Convert ArrayBuffer to string for validation
    const decoder = new TextDecoder('utf-8', { fatal: true });
    let content: string;
    try {
      content = decoder.decode(uploadedFile.content);
    } catch (error) {
      throw new HTTPException(
        400,
        `File encoding error: ${error instanceof Error ? error.message : 'Invalid UTF-8 encoding'}`
      );
    }
    
    // Validate that it's a valid JSON simulation log
    // Mirrors Python lines 102-114
    const { frameCount } = validateSimulationLog(content);
    
    // Store the file in R2
    // Mirrors Python lines 97-99
    await storeFile(env.SUBMISSIONS_BUCKET, submissionId, uploadedFile.content);
    
    // Build and store metadata
    // Mirrors Python lines 117-133
    const metadata = buildMetadata(
      submissionId,
      title,
      createdAt,
      uploadedFile.filename,
      frameCount,
      tags,
      notes,
      envSet,
      rendererPreset,
      name
    );
    
    await storeMetadata(env.SUBMISSIONS_KV, submissionId, metadata);
    
    // Return response
    // Mirrors Python lines 135-141
    const response: SubmissionResponse = {
      id: submissionId,
      title: metadata.title,
      status: 'READY',
      created_at: createdAt,
      message: 'Submission uploaded successfully. Ready for visualization.',
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
      JSON.stringify({ detail: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
