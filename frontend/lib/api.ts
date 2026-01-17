import type { Submission } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface CreateSubmissionData {
  title: string
  tags?: string[]
  notes?: string
  env_set?: string
  renderer_preset?: string
}

export interface SubmissionResponse {
  id: string
  title: string
  status: string
  created_at: string
  message: string
}

export interface ListSubmissionsResponse {
  submissions: Submission[]
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string,
    public isNetworkError: boolean = false,
    public isNotConfigured: boolean = false
  ) {
    super(message)
    this.name = "APIError"
  }
}

export function isBackendConfigured(): boolean {
  // Check if running in production (not localhost)
  const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
  // Check if API_URL is still pointing to localhost
  const isLocalhostAPI = API_URL.includes('localhost')

  return !(isProduction && isLocalhostAPI)
}

export function getBackendStatus(): { configured: boolean; url: string } {
  return {
    configured: isBackendConfigured(),
    url: API_URL
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new APIError(
      errorData.detail || `HTTP error ${response.status}`,
      response.status,
      errorData.detail,
      false,
      false
    )
  }
  return response.json()
}

async function fetchWithErrorHandling(url: string, options?: RequestInit): Promise<Response> {
  // Check if backend is configured
  if (!isBackendConfigured()) {
    throw new APIError(
      'Backend API is not configured. Please set NEXT_PUBLIC_API_URL environment variable.',
      0,
      'Backend not configured',
      false,
      true
    )
  }

  try {
    const response = await fetch(url, options)
    return response
  } catch (error) {
    // Network errors (CORS, connection refused, etc.)
    throw new APIError(
      'Unable to connect to backend API. Please check if the service is running.',
      0,
      error instanceof Error ? error.message : 'Network error',
      true,
      false
    )
  }
}

/**
 * Create a new submission by uploading a file and metadata
 */
export async function createSubmission(
  file: File,
  metadata: CreateSubmissionData
): Promise<SubmissionResponse> {
  const formData = new FormData()
  formData.append("file", file)

  // Append metadata as query params since backend expects them separately
  const params = new URLSearchParams()
  params.append("title", metadata.title)
  if (metadata.tags && metadata.tags.length > 0) {
    metadata.tags.forEach(tag => params.append("tags", tag))
  }
  if (metadata.notes) params.append("notes", metadata.notes)
  if (metadata.env_set) params.append("env_set", metadata.env_set)
  if (metadata.renderer_preset) params.append("renderer_preset", metadata.renderer_preset)

  const response = await fetchWithErrorHandling(`${API_URL}/api/submissions?${params.toString()}`, {
    method: "POST",
    body: formData,
  })

  return handleResponse<SubmissionResponse>(response)
}

/**
 * Get a single submission by ID
 */
export async function getSubmission(id: string): Promise<Submission> {
  const response = await fetchWithErrorHandling(`${API_URL}/api/submissions/${id}`)
  return handleResponse<Submission>(response)
}

/**
 * List all submissions
 */
export async function listSubmissions(): Promise<Submission[]> {
  const response = await fetchWithErrorHandling(`${API_URL}/api/submissions`)
  const data = await handleResponse<ListSubmissionsResponse>(response)
  return data.submissions || []
}

/**
 * Get submission status
 */
export async function getSubmissionStatus(id: string): Promise<{
  id: string
  status: string
  frame_count?: number
  has_metadata?: boolean
  message?: string
}> {
  const response = await fetchWithErrorHandling(`${API_URL}/api/submissions/${id}/status`)
  return handleResponse(response)
}

/**
 * Get raw submission data (for advanced use)
 */
export async function getSubmissionData(id: string): Promise<{
  id: string
  frame_count: number
  metadata: Record<string, unknown>
  obstacles: unknown[]
  first_frame: unknown
}> {
  const response = await fetchWithErrorHandling(`${API_URL}/api/submissions/${id}/data`)
  return handleResponse(response)
}

/**
 * Get the raw submission log file as JSON.
 */
export async function getSubmissionFile(id: string): Promise<string> {
  const response = await fetchWithErrorHandling(`${API_URL}/api/submissions/${id}/file`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new APIError(
      errorData.detail || `HTTP error ${response.status}`,
      response.status,
      errorData.detail,
      false,
      false
    )
  }
  return response.text()
}

/**
 * Get log file content for a submission
 */
export async function getSubmissionLog(id: string): Promise<string> {
  const response = await fetchWithErrorHandling(`${API_URL}/api/submissions/${id}/log`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new APIError(
      errorData.detail || `HTTP error ${response.status}`,
      response.status,
      errorData.detail,
      false,
      false
    )
  }
  return response.text()
}
