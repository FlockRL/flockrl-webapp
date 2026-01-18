/**
 * TypeScript type definitions
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

export interface SubmissionCreate {
  title: string;
  name?: string | null;
  tags?: string[];
  notes?: string | null;
  env_set?: string | null;
  renderer_preset?: string | null;
}

export interface SubmissionResponse {
  id: string;
  title: string;
  status: string;
  created_at: string;
  message: string;
}

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

export interface SubmissionMetrics {
  score?: number;
  success?: boolean;
  timeSec?: number;
  collisions?: number;
  smoothness?: number;
  pathEfficiency?: number;
}

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

// Obstacle types
export interface Obstacle {
  type: 'wall' | 'gate' | 'clutter' | string;
  id: string;
  position: [number, number, number];
  // Wall properties
  length?: number;
  thickness?: number;
  height?: number;
  // Gate properties
  width?: number;
  // Clutter properties
  // Additional properties
  [key: string]: any;
}

// Frame state structure
export interface FrameState {
  t: number;
  pos: [number, number, number][];
  ids: number[];
  goals: [number, number, number][];
}

// Frame structure
export interface Frame {
  state: FrameState;
  [key: string]: any;
}

// Simulation metadata structure
export interface SimulationMetadata {
  config?: {
    simulation?: {
      goal_threshold?: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
  environment?: {
    obstacles?: Obstacle[];
    bounds?: [number, number, number, number, number, number];
    [key: string]: any;
  };
  [key: string]: any;
}

// Simulation data structure
export interface SimulationData {
  frames: Frame[];
  metadata?: SimulationMetadata;
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
