/**
 * Validation utilities
 */

import { HTTPException, SimulationData } from '../types';

/**
 * Validate file type - only accepts .json files
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

  try {
    data = JSON.parse(sanitizedContent);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const contentPreview = content.substring(0, 200);
    const contentLength = content.length;
    
    throw new HTTPException(
      400,
      `File is not valid JSON. Expected output from CoreSimulator.save_run(). Error: ${errorMessage}. Content length: ${contentLength} bytes. Preview: ${contentPreview}...`
    );
  }

  if (!('frames' in data)) {
    throw new HTTPException(400, 'Invalid simulation log: missing \'frames\' field');
  }

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
