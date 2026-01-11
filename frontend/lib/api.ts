import type { Submission } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface CreateSubmissionData {
  title: string
  course: string
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

export interface RenderResponse {
  id: string
  message: string
  frame_count: number
  obstacle_count: number
  render_url: string
  note?: string
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message)
    this.name = "APIError"
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new APIError(
      errorData.detail || `HTTP error ${response.status}`,
      response.status,
      errorData.detail
    )
  }
  return response.json()
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
  params.append("course", metadata.course)
  if (metadata.tags && metadata.tags.length > 0) {
    metadata.tags.forEach(tag => params.append("tags", tag))
  }
  if (metadata.notes) params.append("notes", metadata.notes)
  if (metadata.env_set) params.append("env_set", metadata.env_set)
  if (metadata.renderer_preset) params.append("renderer_preset", metadata.renderer_preset)

  const response = await fetch(`${API_URL}/api/submissions?${params.toString()}`, {
    method: "POST",
    body: formData,
  })

  return handleResponse<SubmissionResponse>(response)
}

/**
 * Get a single submission by ID
 */
export async function getSubmission(id: string): Promise<Submission> {
  const response = await fetch(`${API_URL}/api/submissions/${id}`)
  return handleResponse<Submission>(response)
}

/**
 * List all submissions
 */
export async function listSubmissions(): Promise<Submission[]> {
  const response = await fetch(`${API_URL}/api/submissions`)
  const data = await handleResponse<ListSubmissionsResponse>(response)
  return data.submissions
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
  const response = await fetch(`${API_URL}/api/submissions/${id}/status`)
  return handleResponse(response)
}

/**
 * Start rendering/visualization for a submission
 */
export async function renderSubmission(
  id: string,
  host: string = "127.0.0.1",
  port: number = 8050
): Promise<RenderResponse> {
  const params = new URLSearchParams()
  params.append("host", host)
  params.append("port", port.toString())

  const response = await fetch(
    `${API_URL}/api/submissions/${id}/render?${params.toString()}`,
    { method: "POST" }
  )
  return handleResponse<RenderResponse>(response)
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
  const response = await fetch(`${API_URL}/api/submissions/${id}/data`)
  return handleResponse(response)
}
