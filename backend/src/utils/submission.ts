/**
 * Submission utility functions mirroring Python backend logic
 * Extracted from backend/main.py
 */

import { SubmissionMetrics, SimulationData } from '../types';

/**
 * Generate submission ID with timestamp
 * Mirrors Python line 86: submission_id = f"sub-{datetime.now().strftime('%Y%m%d%H%M%S')}"
 * 
 * @returns Submission ID in format "sub-YYYYMMDDHHmmss"
 */
export function generateSubmissionId(): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 14); // YYYYMMDDHHmmss
  
  return `sub-${timestamp}`;
}

/**
 * Generate ISO timestamp
 * Mirrors Python line 87: created_at = datetime.now().isoformat()
 * 
 * @returns ISO 8601 timestamp
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get file key for R2 storage - CORRECTED to only return .json
 * Python backend checks both .json and .log (lines 167-169, 278-281, etc.)
 * 
 * @param submissionId - Submission ID
 * @returns File key for R2 (always .json)
 */
export function getFileKey(submissionId: string): string {
  return `${submissionId}.json`;
}

/**
 * Get metadata key for KV storage
 * 
 * @param submissionId - Submission ID
 * @returns Metadata key for KV
 */
export function getMetadataKey(submissionId: string): string {
  return `${submissionId}_metadata`;
}

/**
 * Calculate duration from frame count
 * Mirrors Python line 184: duration_sec = frame_count * 0.1 if frame_count > 0 else None
 * 
 * @param frameCount - Number of frames
 * @returns Duration in seconds or null
 */
export function calculateDuration(frameCount: number): number | null {
  return frameCount > 0 ? frameCount * 0.1 : null;
}

/**
 * Extract metrics from simulation metadata
 * Mirrors Python lines 186-200
 * 
 * @param simMetadata - Simulation metadata object
 * @returns Extracted metrics or null
 */
export function extractMetrics(simMetadata: any): SubmissionMetrics | null {
  if (!simMetadata || typeof simMetadata !== 'object') {
    return null;
  }

  // Map fields (handle both snake_case and camelCase)
  // Mirrors Python lines 189-196
  const metrics: SubmissionMetrics = {
    score: simMetadata.score,
    success: simMetadata.success,
    // Handle both time_sec and timeSec
    timeSec: simMetadata.time_sec ?? simMetadata.timeSec,
    collisions: simMetadata.collisions,
    smoothness: simMetadata.smoothness,
    // Handle both path_efficiency and pathEfficiency
    pathEfficiency: simMetadata.path_efficiency ?? simMetadata.pathEfficiency,
  };

  // Filter out undefined values (mirrors Python lines 197-198)
  const filteredMetrics = Object.fromEntries(
    Object.entries(metrics).filter(([_, v]) => v !== undefined)
  ) as SubmissionMetrics;

  // Return null if all values are undefined (mirrors Python lines 199-200)
  return Object.keys(filteredMetrics).length > 0 ? filteredMetrics : null;
}

/**
 * Extract file extension from filename
 * 
 * @param filename - Original filename
 * @returns File extension (e.g., ".json")
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.slice(lastDot) : '';
}
