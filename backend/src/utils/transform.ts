/**
 * Data transformation utilities
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
    
    durationSec = calculateDuration(frameCount);

    if (simData.metadata) {
      metrics = extractMetrics(simData.metadata);
    }
  }

  return {
    id: metadata.id,
    title: metadata.title || 'Untitled',
    name: metadata.name || null,
    createdAt: metadata.created_at || generateTimestamp(),
    envSet: metadata.env_set,
    status: metadata.status || 'READY',
    videoUrl: null,
    durationSec,
    notes: metadata.notes,
    tags: metadata.tags || [],
    metrics,
    plots: [],
    logFileName: metadata.log_file_name || `${metadata.id}.json`,
    rendererVersion: metadata.renderer_preset,
  };
}

/**
 * Build submission summary for list view
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
    name: metadata.name || null,
    createdAt: metadata.created_at || '',
    status: metadata.status || 'READY',
    tags: metadata.tags || [],
    logFileName: metadata.log_file_name || `${metadata.id}.json`,
  };
}

/**
 * Build metadata object from submission data
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
 * @param name - Submitter name
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
  rendererPreset: string | null = null,
  name: string | null = null
): SubmissionMetadata {
  return {
    id,
    title: title || `Submission ${id}`,
    name: name || null,
    tags: tags || [],
    notes,
    env_set: envSet,
    renderer_preset: rendererPreset,
    created_at: createdAt,
    status: 'READY',
    log_file_name: logFileName,
    file_path: `${id}.json`, // Path in R2
    frame_count: frameCount,
  };
}
