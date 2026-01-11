"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { StatusBadge } from "@/components/status-badge"
import { VideoPlayer } from "@/components/video-player"
import { MetricCard } from "@/components/metric-card"
import { ScoreChart } from "@/components/score-chart"
import { StatusTimeline } from "@/components/status-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getSubmissionById, mockCollections } from "@/lib/mock-data"
import { getSubmission, renderSubmission, APIError } from "@/lib/api"
import type { Submission } from "@/lib/types"
import {
  Trophy,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  Share2,
  FolderPlus,
  Download,
  RefreshCw,
  Calendar,
  Play,
  Loader2,
  ExternalLink,
} from "lucide-react"

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlot, setSelectedPlot] = useState<{ name: string; url: string } | null>(null)
  
  // API state
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Visualization state
  const [isRendering, setIsRendering] = useState(false)
  const [renderUrl, setRenderUrl] = useState<string | null>(null)

  // Fetch submission from API
  useEffect(() => {
    async function fetchSubmission() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getSubmission(id)
        setSubmission(data)
      } catch (err) {
        console.error("Failed to fetch submission:", err)
        // Try to fall back to mock data
        const mockData = getSubmissionById(id)
        if (mockData) {
          setSubmission(mockData)
          setError("Using cached data")
        } else {
          setError(err instanceof APIError ? err.message : "Submission not found")
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSubmission()
  }, [id])

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <Skeleton className="mb-8 aspect-video w-full rounded-lg" />
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="mb-2 text-2xl font-bold">Submission Not Found</h1>
        <p className="mb-4 text-muted-foreground">{error || "The submission you are looking for does not exist."}</p>
        <Button onClick={() => router.push("/")}>Back to Gallery</Button>
      </div>
    )
  }
  
  const handleStartVisualization = async () => {
    setIsRendering(true)
    try {
      const response = await renderSubmission(id)
      setRenderUrl(response.render_url)
      toast({
        title: "Visualization started",
        description: `Open ${response.render_url} to view the interactive visualization`,
      })
    } catch (err) {
      const message = err instanceof APIError ? err.message : "Failed to start visualization"
      toast({
        title: "Visualization failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsRendering(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({ title: "Link copied", description: "Share link copied to clipboard" })
  }

  const handleAddToCollection = (collectionName: string) => {
    toast({ title: "Added to collection", description: `Submission added to "${collectionName}"` })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const mockLogContent = `[2026-01-10 14:30:00] Flight initialized
[2026-01-10 14:30:01] GPS lock acquired
[2026-01-10 14:30:02] Motors armed
[2026-01-10 14:30:03] Takeoff sequence started
[2026-01-10 14:30:05] Altitude: 2m, Speed: 0 m/s
[2026-01-10 14:30:10] Entering obstacle zone 1
[2026-01-10 14:30:15] Obstacle avoided successfully
[2026-01-10 14:30:20] Speed: 12.5 m/s
[2026-01-10 14:30:25] Entering obstacle zone 2
[2026-01-10 14:30:30] Sharp turn executed
[2026-01-10 14:30:35] Speed: 15.2 m/s
[2026-01-10 14:30:40] Final approach
[2026-01-10 14:30:45] Landing sequence initiated
[2026-01-10 14:30:47] Flight complete`

  return (
    <div className="p-4 md:p-6">
      <Breadcrumbs items={[{ label: "Gallery", href: "/" }, { label: submission.title }]} />

      {/* Hero Section */}
      <div className="mb-8">
        <VideoPlayer
          thumbnailUrl={submission.thumbnailUrl}
          videoUrl={submission.videoUrl}
          isReady={submission.status === "READY"}
        />
      </div>

      {/* Title and Meta */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={submission.status} />
            <span className="text-sm text-muted-foreground">{submission.course}</span>
            <span className="text-sm text-muted-foreground">
              <Calendar className="mr-1 inline h-4 w-4" />
              {formatDate(submission.createdAt)}
            </span>
          </div>
          <h1 className="mb-3 text-2xl font-bold md:text-3xl">{submission.title}</h1>
          {submission.tags && submission.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {submission.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <FolderPlus className="h-4 w-4" />
                Add to Collection
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {mockCollections.map((collection) => (
                <DropdownMenuItem key={collection.id} onClick={() => handleAddToCollection(collection.name)}>
                  {collection.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleCopyLink}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Metric Chips */}
      {submission.metrics && submission.status === "READY" && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {submission.metrics.score !== undefined && (
            <MetricCard label="Score" value={submission.metrics.score.toLocaleString()} icon={Trophy} />
          )}
          {submission.metrics.timeSec !== undefined && (
            <MetricCard label="Time" value={`${submission.metrics.timeSec}s`} icon={Clock} />
          )}
          {submission.metrics.collisions !== undefined && (
            <MetricCard label="Collisions" value={submission.metrics.collisions} icon={AlertTriangle} />
          )}
          {submission.metrics.smoothness !== undefined && (
            <MetricCard label="Smoothness" value={`${submission.metrics.smoothness}%`} icon={Zap} />
          )}
          {submission.metrics.pathEfficiency !== undefined && (
            <MetricCard label="Efficiency" value={`${submission.metrics.pathEfficiency}%`} icon={Target} />
          )}
        </div>
      )}

      {/* Failed State */}
      {submission.status === "FAILED" && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Render Failed</p>
                <p className="text-sm text-muted-foreground">
                  {submission.notes || "An error occurred during rendering"}
                </p>
              </div>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Resubmit
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plots">Plots</TabsTrigger>
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="renderer">Renderer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {submission.metrics && (
            <div className="grid gap-4 lg:grid-cols-2">
              <ScoreChart metrics={submission.metrics} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {submission.notes ? (
                    <p className="leading-relaxed text-muted-foreground">{submission.notes}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No notes provided</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="plots">
          {submission.plots && submission.plots.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {submission.plots.map((plot) => (
                <Dialog key={plot.name}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer overflow-hidden transition-all hover:border-primary/50">
                      <div className="relative aspect-video">
                        <Image
                          src={plot.url || ""}
                          alt={plot.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <p className="font-medium">{plot.name}</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <div className="relative aspect-video">
                      <Image
                        src={plot.url || ""}
                        alt={plot.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-center font-medium">{plot.name}</p>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="mb-2 text-lg font-medium">No plots available</p>
                <p className="text-muted-foreground">Plots will appear here once rendering is complete</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="log">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Log File</CardTitle>
                <p className="text-sm text-muted-foreground">{submission.logFileName}</p>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto rounded-lg bg-secondary p-4 font-mono text-sm">
                <pre className="whitespace-pre-wrap text-muted-foreground">{mockLogContent}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renderer">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interactive Visualization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Start an interactive 3D visualization of this simulation run using the PlotlyRenderer.
                </p>
                
                {renderUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600">Visualization running at:</span>
                      <a
                        href={renderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        {renderUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-border">
                      <iframe
                        src={renderUrl}
                        className="h-[600px] w-full"
                        title="Simulation Visualization"
                      />
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={handleStartVisualization} 
                    disabled={isRendering}
                    className="gap-2"
                  >
                    {isRendering ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Visualization
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Renderer Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Renderer Version</span>
                  <span className="font-medium">{submission.rendererVersion || "Plotty v2.1.0"}</span>
                </div>
                <StatusTimeline status={submission.status} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
