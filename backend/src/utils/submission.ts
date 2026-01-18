/**
 * Submission utility functions
 */

import { SubmissionMetrics, SimulationData } from '../types';

/**
 * Generate submission ID with timestamp
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
 * 
 * @returns ISO 8601 timestamp
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get file key for R2 storage
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
 * 
 * @param frameCount - Number of frames
 * @returns Duration in seconds or null
 */
export function calculateDuration(frameCount: number): number | null {
  return frameCount > 0 ? frameCount * 0.1 : null;
}

/**
 * Extract metrics from simulation metadata
 * 
 * @param simMetadata - Simulation metadata object
 * @returns Extracted metrics or null
 */
export function extractMetrics(simMetadata: any): SubmissionMetrics | null {
  if (!simMetadata || typeof simMetadata !== 'object') {
    return null;
  }

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

  const filteredMetrics = Object.fromEntries(
    Object.entries(metrics).filter(([_, v]) => v !== undefined)
  ) as SubmissionMetrics;

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
