/**
 * Data transformation utilities mirroring Python backend logic
 * Extracted from backend/main.py
 */

import {
  Submission,
  SubmissionSummary,
  SubmissionMetadata,
  SimulationData,
} from '../types';
import { calculateDuration, extractMetrics, generateTimestamp } from './submission';

/**
 * Build full submission response object
 * Mirrors Python lines 202-218
 * 
 * @param metadata - Submission metadata
 * @param simData - Optional simulation data for extracting metrics
 * @returns Full Submission object
 */
export function buildSubmissionResponse(
  metadata: SubmissionMetadata,
  simData?: SimulationData
): Submission {
  // Extract metrics from simulation data if available
  let metrics = null;
  let durationSec = null;

  if (simData) {
    const frameCount = simData.frames?.length || 0;
    
    // Calculate duration (mirrors Python line 184)
    durationSec = calculateDuration(frameCount);

    // Extract metrics from simulation metadata (mirrors Python lines 186-200)
    if (simData.metadata) {
      metrics = extractMetrics(simData.metadata);
    }
  }

  // Build full submission response matching frontend Submission type
  // Mirrors Python lines 202-218
  return {
    id: metadata.id,
    title: metadata.title || 'Untitled',
    createdAt: metadata.created_at || generateTimestamp(),
    envSet: metadata.env_set,
    status: metadata.status || 'READY',
    videoUrl: null, // Not yet implemented
    thumbnailUrl: '/drone-image.jpg', // Default thumbnail
    durationSec,
    notes: metadata.notes,
    tags: metadata.tags || [],
    metrics,
    plots: [], // Not yet implemented
    logFileName: metadata.log_file_name || `${metadata.id}.json`,
    rendererVersion: metadata.renderer_preset,
  };
}

/**
 * Build submission summary for list view
 * Mirrors Python lines 250-258
 * 
 * @param metadata - Submission metadata
 * @returns Submission summary object
 */
export function buildSubmissionSummary(
  metadata: SubmissionMetadata
): SubmissionSummary {
  return {
    id: metadata.id,
    title: metadata.title || 'Untitled',
    createdAt: metadata.created_at || '',
    status: metadata.status || 'READY',
    thumbnailUrl: '/drone-image.jpg',
    tags: metadata.tags || [],
    logFileName: metadata.log_file_name || `${metadata.id}.json`,
  };
}

/**
 * Build metadata object from submission data
 * Mirrors Python lines 117-129
 * 
 * @param id - Submission ID
 * @param title - Submission title
 * @param createdAt - Creation timestamp
 * @param logFileName - Original log filename
 * @param frameCount - Number of frames
 * @param tags - Tags array
 * @param notes - Notes string
 * @param envSet - Environment set
 * @param rendererPreset - Renderer preset
 * @returns Submission metadata object
 */
export function buildMetadata(
  id: string,
  title: string,
  createdAt: string,
  logFileName: string,
  frameCount: number,
  tags: string[] = [],
  notes: string | null = null,
  envSet: string | null = null,
  rendererPreset: string | null = null
): SubmissionMetadata {
  return {
    id,
    title: title || `Submission ${id}`,
    tags: tags || [],
    notes,
    env_set: envSet,
    renderer_preset: rendererPreset,
    created_at: createdAt,
    status: 'READY', // Always READY after validation
    log_file_name: logFileName,
    file_path: `${id}.json`, // Path in R2
    frame_count: frameCount,
  };
}
