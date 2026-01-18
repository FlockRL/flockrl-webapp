/**
 * TypeScript type definitions mirroring Python backend models
 * Extracted from backend/main.py
 */

// Environment bindings for Cloudflare Workers
export interface Env {
  // R2 bucket for storing submission files
  SUBMISSIONS_BUCKET: R2Bucket;
  // KV namespace for storing submission metadata
  SUBMISSIONS_KV: KVNamespace;
  // CORS origins (comma-separated)
  CORS_ORIGINS?: string;
}

// Mirrors Python SubmissionCreate (lines 38-43)
export interface SubmissionCreate {
  title: string;
  name?: string | null;
  tags?: string[];
  notes?: string | null;
  env_set?: string | null;
  renderer_preset?: string | null;
}

// Mirrors Python SubmissionResponse (lines 46-51)
export interface SubmissionResponse {
  id: string;
  title: string;
  status: string;
  created_at: string;
  message: string;
}

// Mirrors Python metadata structure (lines 117-129)
export interface SubmissionMetadata {
  id: string;
  title: string;
  name?: string | null;
  tags: string[];
  notes: string | null;
  env_set: string | null;
  renderer_preset: string | null;
  created_at: string;
  status: string;
  log_file_name: string;
  file_path: string;
  frame_count: number;
}

// Full submission object (frontend Submission type)
// Mirrors Python lines 202-218
export interface Submission {
  id: string;
  title: string;
  name?: string | null;
  createdAt: string;
  envSet: string | null;
  status: string;
  videoUrl: string | null;
  durationSec: number | null;
  notes: string | null;
  tags: string[];
  metrics: SubmissionMetrics | null;
  plots: any[];
  logFileName: string;
  rendererVersion: string | null;
}

// Submission metrics extracted from simulation metadata
// Mirrors Python lines 189-196
export interface SubmissionMetrics {
  score?: number;
  success?: boolean;
  timeSec?: number;
  collisions?: number;
  smoothness?: number;
  pathEfficiency?: number;
}

// Submission summary for list view
// Mirrors Python lines 250-258
export interface SubmissionSummary {
  id: string;
  title: string;
  name?: string | null;
  createdAt: string;
  status: string;
  tags: string[];
  logFileName: string;
}

// List submissions response
export interface ListSubmissionsResponse {
  submissions: SubmissionSummary[];
}

// Submission status response
export interface SubmissionStatusResponse {
  id: string;
  status: string;
  frame_count?: number;
  has_metadata?: boolean;
  file_path?: string;
  message?: string;
}

// Submission data response
export interface SubmissionDataResponse {
  id: string;
  frame_count: number;
  metadata: Record<string, any>;
  obstacles: any[];
  first_frame: any;
}

// Simulation data structure
export interface SimulationData {
  frames: any[];
  metadata?: {
    score?: number;
    success?: boolean;
    time_sec?: number;
    timeSec?: number;
    collisions?: number;
    smoothness?: number;
    path_efficiency?: number;
    pathEfficiency?: number;
    obstacles?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

// HTTP Exception for consistent error handling
export class HTTPException extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = 'HTTPException';
  }
}

// Helper type for multipart form data
export interface SubmissionFormData {
  file: File;
  title?: string;
  tags?: string[];
  notes?: string;
  env_set?: string;
  renderer_preset?: string;
}
