export type SubmissionStatus = "UPLOADED" | "RENDERING" | "READY" | "FAILED"

export interface Submission {
  id: string
  title: string
  createdAt: string
  course: string
  envSet?: string
  status: SubmissionStatus
  videoUrl?: string
  thumbnailUrl?: string
  durationSec?: number
  notes?: string
  tags?: string[]
  metrics?: {
    score?: number
    success?: boolean
    timeSec?: number
    collisions?: number
    smoothness?: number
    pathEfficiency?: number
  }
  plots?: { name: string; url: string }[]
  logFileName: string
  rendererVersion?: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  coverSubmissionId?: string
  submissionIds: string[]
  tags?: string[]
}
