/**
 * Validation utilities mirroring Python backend validation logic
 * Extracted from backend/main.py lines 78-114
 */

import { HTTPException, SimulationData } from '../types';

/**
 * Validate file type - CORRECTED to only accept .json files
 * Python backend has bug (line 79) accepting both .log and .json
 * 
 * Mirrors Python lines 78-83 (with correction)
 */
export function validateFileType(filename: string): void {
  if (!filename.endsWith('.json')) {
    throw new HTTPException(
      400,
      'File must be a .json file (simulation output from CoreSimulator.save_run())'
    );
  }
}

/**
 * Validate simulation log JSON structure
 * Mirrors Python lines 102-114
 * 
 * @param content - Raw file content as string
 * @returns Parsed simulation data and frame count
 * @throws HTTPException if validation fails
 */
export function validateSimulationLog(content: string): {
  data: SimulationData;
  frameCount: number;
} {
  let data: any;

  // Check if content is empty or too short
  if (!content || content.trim().length === 0) {
    throw new HTTPException(
      400,
      'File is empty. Expected JSON output from CoreSimulator.save_run()'
    );
  }

  // Sanitize JSON: Replace Infinity, -Infinity, and NaN with null
  // These are valid JavaScript but not valid JSON
  // Replace them when they appear as JSON values (after : or , or [)
  // Using word boundaries and flexible whitespace matching
  let sanitizedContent = content
    // Replace Infinity when it appears as a value (after : or , or [)
    // Match any whitespace (including newlines) before and after
    .replace(/([:,\[])\s*Infinity\b/g, '$1 null')
    // Replace -Infinity when it appears as a value
    .replace(/([:,\[])\s*-Infinity\b/g, '$1 null')
    // Replace NaN when it appears as a value
    .replace(/([:,\[])\s*NaN\b/g, '$1 null');

  // Parse JSON (mirrors Python json.load)
  try {
    data = JSON.parse(sanitizedContent);
  } catch (error) {
    // Provide more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const contentPreview = content.substring(0, 200);
    const contentLength = content.length;
    
    // Mirrors Python JSONDecodeError handling (lines 108-112)
    throw new HTTPException(
      400,
      `File is not valid JSON. Expected output from CoreSimulator.save_run(). Error: ${errorMessage}. Content length: ${contentLength} bytes. Preview: ${contentPreview}...`
    );
  }

  // Check for required "frames" field (mirrors Python lines 105-106)
  if (!('frames' in data)) {
    // Mirrors Python ValueError handling (lines 113-114)
    throw new HTTPException(400, 'Invalid simulation log: missing \'frames\' field');
  }

  // Count frames (mirrors Python line 107)
  const frameCount = Array.isArray(data.frames) ? data.frames.length : 0;

  return { data, frameCount };
}

/**
 * Validate that content is valid JSON (generic)
 * Used for metadata validation
 */
export function isValidJSON(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}
