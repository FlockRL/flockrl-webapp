"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export interface SimulationState {
  t: number
  pos: number[][]
  ids: Array<number | string>
  goals: number[][]
}

export interface SimulationFrame {
  state: SimulationState
  info?: Record<string, unknown>
}

export interface SimulationLog {
  metadata?: Record<string, unknown>
  frames: SimulationFrame[]
}

interface Obstacle {
  id?: number | string
  type?: string
  position?: number[]
  length?: number
  width?: number
  height?: number
  thickness?: number
}

type PlotlyTrace = Record<string, unknown>

type PlotlyModule = {
  newPlot: (root: HTMLDivElement, data: PlotlyTrace[], layout: Record<string, unknown>, config: Record<string, unknown>) => Promise<void>
  react: (root: HTMLDivElement, data: PlotlyTrace[], layout: Record<string, unknown>, config: Record<string, unknown>) => Promise<void>
  purge: (root: HTMLDivElement) => void
}

const DEFAULT_PLAYBACK_SPEED = 250
const MIN_PLAYBACK_SPEED = 50
const MAX_PLAYBACK_SPEED = 1000
const PLAYBACK_STEP = 50

function extractObstacles(metadata?: Record<string, unknown> | null): Obstacle[] {
  if (!metadata || typeof metadata !== "object") return []

  const direct = (metadata as Record<string, unknown>).obstacles
  if (Array.isArray(direct)) return direct as Obstacle[]

  const environment = (metadata as Record<string, unknown>).environment
  if (environment && typeof environment === "object") {
    const envObstacles = (environment as Record<string, unknown>).obstacles
    if (Array.isArray(envObstacles)) return envObstacles as Obstacle[]
  }

  return []
}

function createGoalMesh(cx: number, cy: number, cz: number, radius: number, name: string): PlotlyTrace {
  const nTheta = 12
  const nPhi = 24
  const vertices: number[][] = []

  for (let t = 0; t < nTheta; t += 1) {
    const theta = (Math.PI * t) / (nTheta - 1)
    for (let p = 0; p < nPhi; p += 1) {
      const phi = (2 * Math.PI * p) / nPhi
      const x = cx + radius * Math.sin(theta) * Math.cos(phi)
      const y = cy + radius * Math.sin(theta) * Math.sin(phi)
      const z = cz + radius * Math.cos(theta)
      vertices.push([x, y, z])
    }
  }

  const i: number[] = []
  const j: number[] = []
  const k: number[] = []

  for (let t = 0; t < nTheta - 1; t += 1) {
    for (let p = 0; p < nPhi; p += 1) {
      const pNext = (p + 1) % nPhi
      const v00 = t * nPhi + p
      const v01 = t * nPhi + pNext
      const v10 = (t + 1) * nPhi + p
      const v11 = (t + 1) * nPhi + pNext

      i.push(v00, v00)
      j.push(v10, v11)
      k.push(v11, v01)
    }
  }

  return {
    type: "mesh3d",
    x: vertices.map((v) => v[0]),
    y: vertices.map((v) => v[1]),
    z: vertices.map((v) => v[2]),
    i,
    j,
    k,
    color: "green",
    opacity: 0.2,
    name,
    showlegend: false,
    hoverinfo: "name",
    flatshading: true,
  }
}

function createBoxMesh(cx: number, cy: number, cz: number, dx: number, dy: number, dz: number, name: string): PlotlyTrace[] {
  const vertices = [
    [cx - dx / 2, cy - dy / 2, cz - dz / 2],
    [cx + dx / 2, cy - dy / 2, cz - dz / 2],
    [cx + dx / 2, cy + dy / 2, cz - dz / 2],
    [cx - dx / 2, cy + dy / 2, cz - dz / 2],
    [cx - dx / 2, cy - dy / 2, cz + dz / 2],
    [cx + dx / 2, cy - dy / 2, cz + dz / 2],
    [cx + dx / 2, cy + dy / 2, cz + dz / 2],
    [cx - dx / 2, cy + dy / 2, cz + dz / 2],
  ]

  const i = [0, 0, 4, 4, 0, 0, 2, 2, 0, 0, 1, 1]
  const j = [1, 2, 5, 6, 1, 5, 3, 7, 3, 7, 2, 6]
  const k = [2, 3, 6, 7, 5, 4, 7, 6, 7, 4, 6, 5]

  return [
    {
      type: "mesh3d",
      x: vertices.map((v) => v[0]),
      y: vertices.map((v) => v[1]),
      z: vertices.map((v) => v[2]),
      i,
      j,
      k,
      color: "red",
      opacity: 0.15,
      name,
      showlegend: false,
      hoverinfo: "name",
      flatshading: true,
    },
  ]
}

function createObstacleMeshes(obstacle: Obstacle): PlotlyTrace[] {
  const obsType = typeof obstacle.type === "string" ? obstacle.type.toLowerCase() : ""
  const position = Array.isArray(obstacle.position) ? obstacle.position : []
  if (position.length < 3) return []

  const [posX, posY, posZ] = position

  if (obsType === "wall") {
    if (
      typeof obstacle.length !== "number" ||
      typeof obstacle.thickness !== "number" ||
      typeof obstacle.height !== "number"
    ) {
      return []
    }
    return createBoxMesh(posX, posY, posZ, obstacle.length, obstacle.thickness, obstacle.height, "Wall")
  }

  if (obsType === "gate") {
    if (
      typeof obstacle.width !== "number" ||
      typeof obstacle.thickness !== "number" ||
      typeof obstacle.height !== "number"
    ) {
      return []
    }
    return createBoxMesh(posX, posY, posZ, obstacle.width, obstacle.thickness, obstacle.height, "Gate")
  }

  if (obsType === "clutter" || obsType === "rectangularprism" || obsType === "rectangular_prism") {
    if (typeof obstacle.length !== "number" || typeof obstacle.width !== "number" || typeof obstacle.height !== "number") {
      return []
    }
    return createBoxMesh(posX, posY, posZ, obstacle.length, obstacle.width, obstacle.height, "Clutter")
  }

  if (obsType) {
    console.warn(
      `Unknown obstacle type '${obstacle.type ?? "unknown"}' (id: ${obstacle.id ?? "unknown"}), skipping visualization`
    )
  }

  return []
}

function getGoalThreshold(metadata?: Record<string, unknown> | null): number {
  const config = metadata?.config
  if (!config || typeof config !== "object") return 1
  const simulation = (config as Record<string, unknown>).simulation
  if (!simulation || typeof simulation !== "object") return 1
  const threshold = (simulation as Record<string, unknown>).goal_threshold
  return typeof threshold === "number" ? threshold : 1
}

function buildTraces(
  data: SimulationLog,
  frameIdx: number,
  obstacles: Obstacle[],
  goalThreshold: number
): PlotlyTrace[] {
  const traces: PlotlyTrace[] = []

  obstacles.forEach((obstacle) => {
    traces.push(...createObstacleMeshes(obstacle))
  })

  if (frameIdx > 0) {
    const maxStep = Math.min(frameIdx, data.frames.length - 1)
    for (let step = 1; step <= maxStep; step += 1) {
      const prevState = data.frames[step - 1]?.state
      const currState = data.frames[step]?.state
      if (!prevState || !currState) continue

      const prevPositions = Array.isArray(prevState.pos) ? prevState.pos : []
      const currPositions = Array.isArray(currState.pos) ? currState.pos : []
      const prevIds = Array.isArray(prevState.ids) ? prevState.ids : []
      const currIds = Array.isArray(currState.ids) ? currState.ids : []

      const prevIdToIndex = new Map(prevIds.map((id, idx) => [id, idx]))

      currIds.forEach((droneId, index) => {
        if (index >= currPositions.length) return
        const prevIndex = prevIdToIndex.get(droneId)
        if (prevIndex === undefined || prevIndex >= prevPositions.length) return

        const prevPos = prevPositions[prevIndex]
        const currPos = currPositions[index]
        if (!prevPos || !currPos) return

        traces.push({
          type: "scatter3d",
          x: [prevPos[0], currPos[0]],
          y: [prevPos[1], currPos[1]],
          z: [prevPos[2], currPos[2]],
          mode: "lines",
          line: { color: "blue", width: 4 },
          showlegend: false,
          hoverinfo: "skip",
        })
      })
    }
  }

  const currentState = data.frames[frameIdx]?.state
  const goals = Array.isArray(currentState?.goals) ? currentState.goals : []
  const droneIds = Array.isArray(currentState?.ids) ? currentState.ids : []

  if (goals.length > 0) {
    goals.forEach((goal, index) => {
      if (!Array.isArray(goal) || goal.length < 3) return
      const trace = createGoalMesh(goal[0], goal[1], goal[2], goalThreshold, `Goal (Drone ${droneIds[index] ?? index})`)
      if (index === 0) {
        trace.showlegend = true
        trace.name = "Goals"
      }
      traces.push(trace)
    })
  }

  const positions = Array.isArray(currentState?.pos) ? currentState.pos : []
  if (positions.length > 0) {
    const ids = droneIds.length === positions.length ? droneIds : positions.map((_, idx) => idx)
    traces.push({
      type: "scatter3d",
      x: positions.map((pos) => pos[0]),
      y: positions.map((pos) => pos[1]),
      z: positions.map((pos) => pos[2]),
      mode: "markers",
      marker: { size: 10, color: "orange", line: { color: "black", width: 2 } },
      text: ids.map((id) => `Drone ${id}`),
      hoverinfo: "text",
      name: "Drones",
    })
  }

  return traces
}

export function PlottyViewer({
  logData,
  defaultPlaybackSpeed = DEFAULT_PLAYBACK_SPEED,
}: {
  logData: SimulationLog
  defaultPlaybackSpeed?: number
}) {
  const frameCount = Array.isArray(logData.frames) ? logData.frames.length : 0
  const maxFrame = Math.max(frameCount - 1, 0)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(defaultPlaybackSpeed)
  const [plotly, setPlotly] = useState<PlotlyModule | null>(null)
  const [plotlyError, setPlotlyError] = useState<string | null>(null)
  const plotRef = useRef<HTMLDivElement | null>(null)
  const hasPlot = useRef(false)

  const obstacles = useMemo(() => extractObstacles(logData.metadata), [logData.metadata])
  const goalThreshold = useMemo(() => getGoalThreshold(logData.metadata), [logData.metadata])

  useEffect(() => {
    let active = true

    import("plotly.js-dist-min")
      .then((mod) => {
        if (active) {
          setPlotly((mod as { default?: PlotlyModule }).default ?? (mod as PlotlyModule))
        }
      })
      .catch(() => {
        if (active) {
          setPlotlyError("Failed to load Plotly renderer")
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setCurrentFrame(0)
    setIsPlaying(false)
    hasPlot.current = false
  }, [logData])

  useEffect(() => {
    if (!isPlaying || frameCount === 0) return undefined

    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1 > maxFrame ? 0 : prev + 1))
    }, playbackSpeed)

    return () => clearInterval(timer)
  }, [isPlaying, playbackSpeed, frameCount, maxFrame])

  useEffect(() => {
    if (!plotly || !plotRef.current || frameCount === 0) return undefined

    const traces = buildTraces(logData, currentFrame, obstacles, goalThreshold)
    const layout = {
      scene: {
        xaxis: { title: "X", gridcolor: "lightgray" },
        yaxis: { title: "Y", gridcolor: "lightgray" },
        zaxis: { title: "Z", gridcolor: "lightgray" },
        aspectmode: "data",
      },
      showlegend: true,
      hovermode: "closest",
      margin: { l: 0, r: 0, b: 0, t: 0 },
      uirevision: "keep",
    }

    const config = {
      responsive: true,
      displaylogo: false,
    }

    if (!hasPlot.current) {
      void plotly.newPlot(plotRef.current, traces, layout, config)
      hasPlot.current = true
    } else {
      void plotly.react(plotRef.current, traces, layout, config)
    }

    return () => undefined
  }, [plotly, logData, currentFrame, frameCount, obstacles, goalThreshold])

  useEffect(() => {
    return () => {
      if (plotly && plotRef.current) {
        plotly.purge(plotRef.current)
      }
    }
  }, [plotly])

  const currentState = logData.frames[currentFrame]?.state
  const droneCount = Array.isArray(currentState?.pos) ? currentState.pos.length : 0
  const frameTime = typeof currentState?.t === "number" ? currentState.t : 0
  const infoText = frameCount
    ? `Frame: ${currentFrame} / ${maxFrame} | Time: ${frameTime.toFixed(3)}s | Drones: ${droneCount}`
    : "No frames available to render"

  if (plotlyError) {
    return <div className="py-8 text-center text-sm text-destructive">{plotlyError}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsPlaying((prev) => !prev)}
              disabled={frameCount === 0}
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentFrame(0)}
              disabled={frameCount === 0}
            >
              Reset
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">{infoText}</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Frame</Label>
              <span className="text-xs text-muted-foreground">
                {currentFrame} / {maxFrame}
              </span>
            </div>
            <Slider
              min={0}
              max={maxFrame}
              step={1}
              value={[currentFrame]}
              onValueChange={(value) => setCurrentFrame(value[0] ?? 0)}
              disabled={frameCount === 0}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Playback Speed (ms)</Label>
              <span className="text-xs text-muted-foreground">{playbackSpeed} ms</span>
            </div>
            <Slider
              min={MIN_PLAYBACK_SPEED}
              max={MAX_PLAYBACK_SPEED}
              step={PLAYBACK_STEP}
              value={[playbackSpeed]}
              onValueChange={(value) => setPlaybackSpeed(value[0] ?? DEFAULT_PLAYBACK_SPEED)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div ref={plotRef} className="h-[800px] w-full" />
      </div>
    </div>
  )
}
