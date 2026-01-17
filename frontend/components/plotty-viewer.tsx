"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
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
type PlotlyCamera = Record<string, unknown>
type PlotlyRelayoutEvent = Record<string, unknown>

type PlotlyModule = {
  newPlot: (root: HTMLDivElement, data: PlotlyTrace[], layout: Record<string, unknown>, config: Record<string, unknown>) => Promise<void>
  react: (root: HTMLDivElement, data: PlotlyTrace[], layout: Record<string, unknown>, config: Record<string, unknown>) => Promise<void>
  purge: (root: HTMLDivElement) => void
}
type PlotlyHTMLElement = HTMLDivElement & {
  on?: (eventName: string, handler: (event: PlotlyRelayoutEvent) => void) => void
  removeListener?: (eventName: string, handler: (event: PlotlyRelayoutEvent) => void) => void
}
type SphereOptions = {
  color: string
  opacity?: number
  name?: string
  showlegend?: boolean
  hoverinfo?: string
  text?: string
}

const DEFAULT_PLAYBACK_SPEED = 50
const MIN_PLAYBACK_SPEED = 5
const MAX_PLAYBACK_SPEED = 200
const PLAYBACK_STEP = 5
const TRAIL_WINDOW = 100
const DEFAULT_DRONE_RADIUS = 0.2

type AxisBounds = [number, number]
type SceneBounds = { x: AxisBounds; y: AxisBounds; z: AxisBounds }

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

function createSphereMesh(
  cx: number,
  cy: number,
  cz: number,
  radius: number,
  options: SphereOptions
): PlotlyTrace {
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
    color: options.color,
    opacity: options.opacity ?? 1,
    name: options.name,
    showlegend: options.showlegend ?? false,
    hoverinfo: options.hoverinfo ?? "skip",
    text: options.text,
    flatshading: true,
  }
}

function createGoalMesh(cx: number, cy: number, cz: number, radius: number, name: string): PlotlyTrace {
  return createSphereMesh(cx, cy, cz, radius, {
    color: "green",
    opacity: 0.2,
    name,
    showlegend: false,
    hoverinfo: "name",
  })
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

function getDroneRadius(metadata?: Record<string, unknown> | null): number {
  const config = metadata?.config
  if (!config || typeof config !== "object") return DEFAULT_DRONE_RADIUS
  const simulation = (config as Record<string, unknown>).simulation
  if (!simulation || typeof simulation !== "object") return DEFAULT_DRONE_RADIUS
  const radius =
    (simulation as Record<string, unknown>).drone_radius ??
    (simulation as Record<string, unknown>).droneRadius
  return typeof radius === "number" ? radius : DEFAULT_DRONE_RADIUS
}

function updateBounds(
  minValues: [number, number, number],
  maxValues: [number, number, number],
  x: number,
  y: number,
  z: number
) {
  minValues[0] = Math.min(minValues[0], x)
  minValues[1] = Math.min(minValues[1], y)
  minValues[2] = Math.min(minValues[2], z)
  maxValues[0] = Math.max(maxValues[0], x)
  maxValues[1] = Math.max(maxValues[1], y)
  maxValues[2] = Math.max(maxValues[2], z)
}

function expandBoxBounds(
  minValues: [number, number, number],
  maxValues: [number, number, number],
  center: number[],
  size: [number, number, number]
) {
  if (center.length < 3) return
  const [cx, cy, cz] = center
  const [sx, sy, sz] = size
  updateBounds(minValues, maxValues, cx - sx / 2, cy - sy / 2, cz - sz / 2)
  updateBounds(minValues, maxValues, cx + sx / 2, cy + sy / 2, cz + sz / 2)
}

function extractObstacleBounds(
  obstacle: Obstacle
): { center: number[]; size: [number, number, number] } | null {
  const position = Array.isArray(obstacle.position) ? obstacle.position : []
  if (position.length < 3) return null

  const obsType = typeof obstacle.type === "string" ? obstacle.type.toLowerCase() : ""

  if (obsType === "wall") {
    if (
      typeof obstacle.length !== "number" ||
      typeof obstacle.thickness !== "number" ||
      typeof obstacle.height !== "number"
    ) {
      return null
    }
    return { center: position, size: [obstacle.length, obstacle.thickness, obstacle.height] }
  }

  if (obsType === "gate") {
    if (
      typeof obstacle.width !== "number" ||
      typeof obstacle.thickness !== "number" ||
      typeof obstacle.height !== "number"
    ) {
      return null
    }
    return { center: position, size: [obstacle.width, obstacle.thickness, obstacle.height] }
  }

  if (obsType === "clutter" || obsType === "rectangularprism" || obsType === "rectangular_prism") {
    if (typeof obstacle.length !== "number" || typeof obstacle.width !== "number" || typeof obstacle.height !== "number") {
      return null
    }
    return { center: position, size: [obstacle.length, obstacle.width, obstacle.height] }
  }

  if (
    typeof obstacle.length === "number" &&
    typeof obstacle.width === "number" &&
    typeof obstacle.height === "number"
  ) {
    return { center: position, size: [obstacle.length, obstacle.width, obstacle.height] }
  }

  return { center: position, size: [0, 0, 0] }
}

function buildSceneBounds(
  logData: SimulationLog,
  obstacles: Obstacle[],
  goalThreshold: number,
  droneRadius: number
): SceneBounds {
  const minValues: [number, number, number] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
  const maxValues: [number, number, number] = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]

  logData.frames.forEach((frame) => {
    const state = frame?.state
    if (!state) return

    const positions = Array.isArray(state.pos) ? state.pos : []
    positions.forEach((pos) => {
      if (!Array.isArray(pos) || pos.length < 3) return
      updateBounds(minValues, maxValues, pos[0] - droneRadius, pos[1] - droneRadius, pos[2] - droneRadius)
      updateBounds(minValues, maxValues, pos[0] + droneRadius, pos[1] + droneRadius, pos[2] + droneRadius)
    })

    const goals = Array.isArray(state.goals) ? state.goals : []
    goals.forEach((goal) => {
      if (!Array.isArray(goal) || goal.length < 3) return
      updateBounds(minValues, maxValues, goal[0] - goalThreshold, goal[1] - goalThreshold, goal[2] - goalThreshold)
      updateBounds(minValues, maxValues, goal[0] + goalThreshold, goal[1] + goalThreshold, goal[2] + goalThreshold)
    })
  })

  obstacles.forEach((obstacle) => {
    const bounds = extractObstacleBounds(obstacle)
    if (!bounds) return
    expandBoxBounds(minValues, maxValues, bounds.center, bounds.size)
  })

  if (!Number.isFinite(minValues[0]) || !Number.isFinite(maxValues[0])) {
    return { x: [-1, 1], y: [-1, 1], z: [-1, 1] }
  }

  const pad = (min: number, max: number) => {
    const span = Math.max(max - min, 1)
    const padding = span * 0.05
    return [min - padding, max + padding] as AxisBounds
  }

  return {
    x: pad(minValues[0], maxValues[0]),
    y: pad(minValues[1], maxValues[1]),
    z: pad(minValues[2], maxValues[2]),
  }
}

function extractCameraUpdate(event: PlotlyRelayoutEvent): PlotlyCamera | null {
  const fullCamera = event["scene.camera"]
  if (fullCamera && typeof fullCamera === "object") {
    return fullCamera as PlotlyCamera
  }

  const camera: PlotlyCamera = {}
  const eye = event["scene.camera.eye"]
  const center = event["scene.camera.center"]
  const up = event["scene.camera.up"]
  const projection = event["scene.camera.projection"]

  if (eye && typeof eye === "object") camera.eye = eye
  if (center && typeof center === "object") camera.center = center
  if (up && typeof up === "object") camera.up = up
  if (projection && typeof projection === "object") camera.projection = projection

  const nestedKeys = Object.keys(event).filter((key) => key.startsWith("scene.camera."))
  nestedKeys.forEach((key) => {
    const path = key.replace("scene.camera.", "")
    const [section, prop] = path.split(".")
    if (!section || !prop) return
    const sectionValue = (camera[section] as Record<string, unknown> | undefined) ?? {}
    sectionValue[prop] = event[key]
    camera[section] = sectionValue
  })

  return Object.keys(camera).length > 0 ? camera : null
}

function mergeCamera(prev: PlotlyCamera | null, next: PlotlyCamera): PlotlyCamera {
  const merged: PlotlyCamera = { ...(prev ?? {}) }
  Object.entries(next).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const prevValue = (prev?.[key] as Record<string, unknown> | undefined) ?? {}
      merged[key] = { ...prevValue, ...(value as Record<string, unknown>) }
    } else {
      merged[key] = value
    }
  })
  return merged
}

function buildTraces(
  data: SimulationLog,
  frameIdx: number,
  obstacles: Obstacle[],
  goalThreshold: number,
  droneRadius: number
): PlotlyTrace[] {
  const traces: PlotlyTrace[] = []

  obstacles.forEach((obstacle) => {
    traces.push(...createObstacleMeshes(obstacle))
  })

  if (frameIdx > 0) {
    const maxStep = Math.min(frameIdx, data.frames.length - 1)
    const startStep = Math.max(1, frameIdx - TRAIL_WINDOW + 1)
    for (let step = startStep; step <= maxStep; step += 1) {
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
    positions.forEach((pos, index) => {
      if (!Array.isArray(pos) || pos.length < 3) return
      const id = ids[index] ?? index
      const showLegend = index === 0
      traces.push(
        createSphereMesh(pos[0], pos[1], pos[2], droneRadius, {
          color: "orange",
          opacity: 1,
          name: showLegend ? "Drones" : undefined,
          showlegend: showLegend,
          hoverinfo: "text",
          text: `Drone ${id}`,
        })
      )
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
  const [plotReady, setPlotReady] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const plotRef = useRef<HTMLDivElement | null>(null)
  const hasPlot = useRef(false)
  const cameraRef = useRef<PlotlyCamera | null>(null)
  const isInteractingRef = useRef(false)
  const controlsRef = useRef<HTMLDivElement | null>(null)
  const [controlsVisible, setControlsVisible] = useState(true)

  const obstacles = useMemo(() => extractObstacles(logData.metadata), [logData.metadata])
  const goalThreshold = useMemo(() => getGoalThreshold(logData.metadata), [logData.metadata])
  const droneRadius = useMemo(() => getDroneRadius(logData.metadata), [logData.metadata])
  const sceneBounds = useMemo(
    () => buildSceneBounds(logData, obstacles, goalThreshold, droneRadius),
    [logData, obstacles, goalThreshold, droneRadius]
  )

  useEffect(() => {
    let active = true

    import("plotly.js-dist-min")
      .then((mod: unknown) => {
        if (active) {
          const plotlyMod = mod as { default?: PlotlyModule }
          setPlotly(plotlyMod.default ?? (mod as PlotlyModule))
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
    cameraRef.current = null
    isInteractingRef.current = false
    setIsInteracting(false)
    setPlotReady(false)
  }, [logData])

  useEffect(() => {
    if (!isPlaying || frameCount === 0 || isInteracting) return undefined

    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1 > maxFrame ? 0 : prev + 1))
    }, playbackSpeed)

    return () => clearInterval(timer)
  }, [isPlaying, playbackSpeed, frameCount, maxFrame, isInteracting])

  useEffect(() => {
    if (!plotly || !plotRef.current || frameCount === 0 || isInteracting) return undefined

    const traces = buildTraces(logData, currentFrame, obstacles, goalThreshold, droneRadius)
    const axisStyle = {
      gridcolor: "#888",
      gridwidth: 1,
      showline: true,
      linecolor: "#444",
      linewidth: 2,
      zeroline: true,
      zerolinecolor: "#222",
      zerolinewidth: 3,
      showspikes: true,
      spikethickness: 1,
      spikecolor: "#666",
      showbackground: true,
      backgroundcolor: "rgba(240, 240, 240, 0.9)",
    }
    const layout = {
      scene: {
        xaxis: { title: "X", ...axisStyle, range: sceneBounds.x, autorange: false },
        yaxis: { title: "Y", ...axisStyle, range: sceneBounds.y, autorange: false },
        zaxis: { title: "Z", ...axisStyle, range: sceneBounds.z, autorange: false },
        aspectmode: "data",
        camera: cameraRef.current ?? undefined,
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
      hasPlot.current = true
      plotly.newPlot(plotRef.current, traces, layout, config)
        .then(() => setPlotReady(true))
        .catch(() => setPlotlyError("Failed to render plot"))
    } else if (plotReady) {
      plotly.react(plotRef.current, traces, layout, config)
        .catch(() => setPlotlyError("Failed to update plot"))
    }

    return () => undefined
  }, [plotly, logData, currentFrame, frameCount, obstacles, goalThreshold, droneRadius, sceneBounds, plotReady, isInteracting])

  useEffect(() => {
    if (!plotReady || !plotRef.current) return undefined

    const plotElement = plotRef.current as PlotlyHTMLElement
    const handleRelayouting = (event: PlotlyRelayoutEvent) => {
      const update = extractCameraUpdate(event)
      if (update) {
        cameraRef.current = mergeCamera(cameraRef.current, update)
      }

      if (!isInteractingRef.current) {
        isInteractingRef.current = true
        setIsInteracting(true)
      }
    }

    const handleRelayout = (event: PlotlyRelayoutEvent) => {
      const update = extractCameraUpdate(event)
      if (update) {
        cameraRef.current = mergeCamera(cameraRef.current, update)
      }

      if (isInteractingRef.current) {
        isInteractingRef.current = false
        setIsInteracting(false)
      }
    }

    plotElement.on?.("plotly_relayout", handleRelayout)
    plotElement.on?.("plotly_relayouting", handleRelayouting)

    return () => {
      plotElement.removeListener?.("plotly_relayout", handleRelayout)
      plotElement.removeListener?.("plotly_relayouting", handleRelayouting)
    }
  }, [plotReady])

  useEffect(() => {
    return () => {
      if (plotly && plotRef.current) {
        plotly.purge(plotRef.current)
      }
    }
  }, [plotly])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setControlsVisible(entry?.isIntersecting ?? true)
      },
      { threshold: 0.1 }
    )

    observer.observe(controls)
    return () => observer.disconnect()
  }, [])

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setCurrentFrame(0)
  }, [])

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
      <div ref={controlsRef} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlayPause}
              disabled={frameCount === 0}
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
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

      {/* Floating controls when original is scrolled out of view */}
      {!controlsVisible && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-md border border-border bg-background/95 backdrop-blur-sm px-4 py-2 shadow-lg">
          <Button
            size="sm"
            onClick={handlePlayPause}
            disabled={frameCount === 0}
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={frameCount === 0}
          >
            Reset
          </Button>
          <span className="text-xs text-muted-foreground ml-2">
            {currentFrame} / {maxFrame}
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div ref={plotRef} className="h-[800px] w-full" />
      </div>
    </div>
  )
}
