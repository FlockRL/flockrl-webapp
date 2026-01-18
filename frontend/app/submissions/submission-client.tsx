"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MetricCard } from "@/components/metric-card"
import { ScoreChart } from "@/components/score-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getSubmission, getSubmissionFile, APIError } from "@/lib/api"
import { BackendNotConfiguredBanner, BackendUnavailableBanner } from "@/components/backend-status-banner"
import { PlottyViewer, type SimulationLog } from "@/components/plotty-viewer"
import type { Submission } from "@/lib/types"
import {
  Trophy,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  Download,
  Calendar,
  Loader2,
  FileText,
  Tag,
} from "lucide-react"

export function SubmissionClient({ id }: { id: string }) {
  const router = useRouter()
  const { toast } = useToast()
  
  // API state
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNotConfigured, setIsNotConfigured] = useState(false)
  const [isNetworkError, setIsNetworkError] = useState(false)
  
  // Visualization state
  const [logData, setLogData] = useState<SimulationLog | null>(null)

  // Log file state
  const [logContent, setLogContent] = useState<string | null>(null)
  const [isLoadingLog, setIsLoadingLog] = useState(false)
  const [logError, setLogError] = useState<string | null>(null)

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
        if (err instanceof APIError) {
          setIsNotConfigured(err.isNotConfigured)
          setIsNetworkError(err.isNetworkError)
          setError(err.message)
        } else {
          setError("Failed to load submission")
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSubmission()
  }, [id])

  // Fetch log content when submission is loaded
  useEffect(() => {
    if (submission && submission.logFileName) {
      setIsLoadingLog(true)
      setLogError(null)
      setLogData(null)
      setLogContent(null)
      getSubmissionFile(id)
        .then((content) => {
          const sanitizedContent = content
            .replace(/:\s*Infinity\b/g, ': null')
            .replace(/:\s*-Infinity\b/g, ': null')
            .replace(/:\s*NaN\b/g, ': null')
          const parsed = JSON.parse(sanitizedContent) as SimulationLog
          if (!parsed || !Array.isArray(parsed.frames)) {
            throw new Error("Log data is missing frames")
          }
          setLogData(parsed)
          setLogContent(content)
        })
        .catch((err) => {
          console.error("Failed to fetch log content:", err)
          if (err instanceof APIError) {
            setLogError(err.message)
          } else if (err instanceof Error) {
            setLogError(err.message)
          } else {
            setLogError("Failed to load log file")
          }
        })
        .finally(() => {
          setIsLoadingLog(false)
        })
    }
  }, [submission?.logFileName, id])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 p-4 md:p-6">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Loading submission...</p>
        <p className="text-sm text-muted-foreground">Please wait while we fetch the data</p>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="p-4 md:p-6">
        {error && isNotConfigured && <BackendNotConfiguredBanner />}
        {error && isNetworkError && <BackendUnavailableBanner />}

        <div className="flex flex-col items-center justify-center p-8">
          <h1 className="mb-2 text-2xl font-bold">Submission Not Found</h1>
          <p className="mb-4 text-muted-foreground">
            {!isNotConfigured && !isNetworkError && (error || "The submission you are looking for does not exist.")}
          </p>
          <Button onClick={() => router.push("/")}>Back to Gallery</Button>
        </div>
      </div>
    )
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

  return (
    <div className="p-4 md:p-6">
      {/* Title and Meta */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
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
      </div>

      {/* Metric Chips */}
      {submission.metrics && (
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

      {/* Tabs */}
      <Tabs defaultValue="renderer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="renderer">Renderer</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="log">Log</TabsTrigger>
        </TabsList>

        <TabsContent value="renderer">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interactive Visualization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingLog ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-medium">Loading simulation log...</p>
                    <p className="text-sm text-muted-foreground">Preparing interactive visualization</p>
                  </div>
                ) : logError ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <p className="mb-2 text-lg font-medium text-destructive">Visualization unavailable</p>
                    <p className="text-sm text-muted-foreground">{logError}</p>
                  </div>
                ) : logData ? (
                  <PlottyViewer logData={logData} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <p className="mb-2 text-lg font-medium">No log data available</p>
                    <p className="text-sm text-muted-foreground">
                      Upload a simulation log to view the interactive visualization.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Title</p>
                  <p className="text-base">{submission.title}</p>
                </div>
                
                {submission.name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                    <p className="text-base">{submission.name}</p>
                  </div>
                )}
                
                {submission.tags && submission.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {submission.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {submission.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{submission.notes}</p>
                  </div>
                )}

                {submission.envSet && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Environment Set</p>
                    <p className="text-sm">{submission.envSet}</p>
                  </div>
                )}

                {submission.rendererVersion && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Renderer Preset</p>
                    <p className="text-sm">{submission.rendererVersion}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Created At</p>
                  <p className="text-sm">{formatDate(submission.createdAt)}</p>
                </div>

                {submission.logFileName && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Log File</p>
                    <p className="text-sm font-mono">{submission.logFileName}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {submission.metrics && (
              <div className="space-y-4">
                <ScoreChart metrics={submission.metrics} />
                {submission.metrics && Object.keys(submission.metrics).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {submission.metrics.score !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Score</p>
                            <p className="text-lg font-semibold">{submission.metrics.score.toLocaleString()}</p>
                          </div>
                        )}
                        {submission.metrics.timeSec !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Time</p>
                            <p className="text-lg font-semibold">{submission.metrics.timeSec}s</p>
                          </div>
                        )}
                        {submission.metrics.collisions !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Collisions</p>
                            <p className="text-lg font-semibold">{submission.metrics.collisions}</p>
                          </div>
                        )}
                        {submission.metrics.smoothness !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Smoothness</p>
                            <p className="text-lg font-semibold">{submission.metrics.smoothness}%</p>
                          </div>
                        )}
                        {submission.metrics.pathEfficiency !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Path Efficiency</p>
                            <p className="text-lg font-semibold">{submission.metrics.pathEfficiency}%</p>
                          </div>
                        )}
                        {submission.metrics.success !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Success</p>
                            <p className="text-lg font-semibold">{submission.metrics.success ? "Yes" : "No"}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!submission.metrics && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground">No metrics available yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="log">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Log File</CardTitle>
                <p className="text-sm text-muted-foreground">{submission.logFileName}</p>
              </div>
              <Button 
                variant="outline" 
                className="gap-2 bg-transparent"
                onClick={() => {
                  if (logContent) {
                    const blob = new Blob([logContent], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = submission.logFileName || 'log.txt'
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    toast({ title: "Download started", description: "Log file download initiated" })
                  }
                }}
                disabled={!logContent}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto rounded-lg bg-secondary p-4 font-mono text-sm">
                {isLoadingLog ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading log file...</span>
                  </div>
                ) : logError ? (
                  <p className="text-destructive">{logError}</p>
                ) : logContent ? (
                  <pre className="whitespace-pre-wrap break-words">{logContent}</pre>
                ) : (
                  <p className="text-muted-foreground">No log file available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
