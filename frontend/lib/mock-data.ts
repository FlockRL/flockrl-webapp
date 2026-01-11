import type { Submission, Collection } from "./types"

export const COURSES = [
  "Forest Maze",
  "Urban Circuit",
  "Mountain Pass",
  "Industrial Zone",
  "Canyon Run",
  "Coastal Sprint",
]

export const mockSubmissions: Submission[] = [
  {
    id: "sub-001",
    title: "Lightning Fast Forest Run",
    createdAt: "2026-01-10T14:30:00Z",
    course: "Forest Maze",
    status: "READY",
    videoUrl: "/videos/forest-run.mp4",
    thumbnailUrl: "/drone-image.jpg",
    durationSec: 45,
    notes:
      "Achieved personal best on this course. The tight turns in section 3 were tricky but managed to maintain speed throughout.",
    tags: ["fast", "clean-run", "personal-best"],
    metrics: {
      score: 9850,
      success: true,
      timeSec: 45.2,
      collisions: 0,
      smoothness: 94,
      pathEfficiency: 97,
    },
    plots: [
      { name: "Velocity Profile", url: "/drone-image.jpg" },
      { name: "Path Deviation", url: "/drone-image.jpg" },
      { name: "Altitude Map", url: "/drone-image.jpg" },
    ],
    logFileName: "forest_run_001.log",
    rendererVersion: "Plotty v2.1.0",
  },
  {
    id: "sub-002",
    title: "Urban Circuit Speedrun",
    createdAt: "2026-01-09T10:15:00Z",
    course: "Urban Circuit",
    status: "READY",
    videoUrl: "/videos/urban-speedrun.mp4",
    thumbnailUrl: "/drone-image.jpg",
    durationSec: 62,
    notes: "First successful completion of the new urban circuit layout.",
    tags: ["urban", "speedrun", "new-layout"],
    metrics: {
      score: 8720,
      success: true,
      timeSec: 62.8,
      collisions: 2,
      smoothness: 87,
      pathEfficiency: 91,
    },
    plots: [
      { name: "Velocity Profile", url: "/drone-image.jpg" },
      { name: "Collision Map", url: "/drone-image.jpg" },
    ],
    logFileName: "urban_circuit_002.log",
    rendererVersion: "Plotty v2.1.0",
  },
  {
    id: "sub-003",
    title: "Mountain Pass Challenge",
    createdAt: "2026-01-08T16:45:00Z",
    course: "Mountain Pass",
    status: "READY",
    videoUrl: "/videos/mountain-pass.mp4",
    thumbnailUrl: "/drone-image.jpg",
    durationSec: 78,
    tags: ["mountain", "challenging"],
    metrics: {
      score: 7650,
      success: true,
      timeSec: 78.4,
      collisions: 1,
      smoothness: 82,
      pathEfficiency: 88,
    },
    plots: [{ name: "Altitude Profile", url: "/drone-image.jpg" }],
    logFileName: "mountain_pass_003.log",
    rendererVersion: "Plotty v2.0.5",
  },
  {
    id: "sub-004",
    title: "Industrial Zone Test",
    createdAt: "2026-01-07T09:00:00Z",
    course: "Industrial Zone",
    status: "RENDERING",
    thumbnailUrl: "/drone-image.jpg",
    tags: ["industrial", "test"],
    logFileName: "industrial_test_004.log",
    rendererVersion: "Plotty v2.1.0",
  },
  {
    id: "sub-005",
    title: "Canyon Run Attempt",
    createdAt: "2026-01-06T11:30:00Z",
    course: "Canyon Run",
    status: "FAILED",
    thumbnailUrl: "/drone-image.jpg",
    notes: "Render failed due to corrupted log section.",
    tags: ["canyon", "failed"],
    logFileName: "canyon_run_005.log",
    rendererVersion: "Plotty v2.1.0",
  },
  {
    id: "sub-006",
    title: "Coastal Sprint Record",
    createdAt: "2026-01-05T15:20:00Z",
    course: "Coastal Sprint",
    status: "READY",
    videoUrl: "/videos/coastal-sprint.mp4",
    thumbnailUrl: "/drone-image.jpg",
    durationSec: 38,
    notes: "New course record! Perfect line through the lighthouse section.",
    tags: ["coastal", "record", "featured"],
    metrics: {
      score: 10200,
      success: true,
      timeSec: 38.1,
      collisions: 0,
      smoothness: 98,
      pathEfficiency: 99,
    },
    plots: [
      { name: "Velocity Profile", url: "/drone-image.jpg" },
      { name: "Path Overlay", url: "/drone-image.jpg" },
      { name: "Wind Analysis", url: "/drone-image.jpg" },
    ],
    logFileName: "coastal_sprint_006.log",
    rendererVersion: "Plotty v2.1.0",
  },
  {
    id: "sub-007",
    title: "Forest Maze Practice",
    createdAt: "2026-01-04T13:00:00Z",
    course: "Forest Maze",
    status: "READY",
    videoUrl: "/videos/forest-practice.mp4",
    thumbnailUrl: "/drone-image.jpg",
    durationSec: 52,
    tags: ["practice", "forest"],
    metrics: {
      score: 7200,
      success: true,
      timeSec: 52.3,
      collisions: 3,
      smoothness: 76,
      pathEfficiency: 84,
    },
    plots: [{ name: "Velocity Profile", url: "/drone-image.jpg" }],
    logFileName: "forest_practice_007.log",
    rendererVersion: "Plotty v2.0.5",
  },
  {
    id: "sub-008",
    title: "Queued Submission",
    createdAt: "2026-01-11T08:00:00Z",
    course: "Urban Circuit",
    status: "UPLOADED",
    thumbnailUrl: "/drone-image.jpg",
    tags: ["queued"],
    logFileName: "queued_submission_008.log",
  },
]

export const mockCollections: Collection[] = [
  {
    id: "col-001",
    name: "Best Runs 2026",
    description: "Top performing submissions from this year",
    coverSubmissionId: "sub-006",
    submissionIds: ["sub-001", "sub-006", "sub-002"],
    tags: ["featured", "best"],
  },
  {
    id: "col-002",
    name: "Forest Course Masters",
    description: "All successful forest maze completions",
    coverSubmissionId: "sub-001",
    submissionIds: ["sub-001", "sub-007"],
    tags: ["forest"],
  },
  {
    id: "col-003",
    name: "Speed Records",
    description: "Fastest times across all courses",
    coverSubmissionId: "sub-006",
    submissionIds: ["sub-006", "sub-001"],
    tags: ["records", "speed"],
  },
]

export function getSubmissionById(id: string): Submission | undefined {
  return mockSubmissions.find((s) => s.id === id)
}

export function getCollectionById(id: string): Collection | undefined {
  return mockCollections.find((c) => c.id === id)
}

export function getSubmissionsByIds(ids: string[]): Submission[] {
  return ids.map((id) => getSubmissionById(id)).filter(Boolean) as Submission[]
}

export function getFeaturedSubmissions(): Submission[] {
  return mockSubmissions.filter((s) => s.tags?.includes("featured") || s.tags?.includes("record"))
}
