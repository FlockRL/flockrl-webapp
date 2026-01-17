"use client"

import { useState, useMemo, useEffect } from "react"
import { listSubmissions, APIError } from "@/lib/api"
import { SubmissionCard } from "@/components/submission-card"
import { GalleryFilters } from "@/components/gallery-filters"
import { BackendNotConfiguredBanner, BackendUnavailableBanner } from "@/components/backend-status-banner"
import { AlertCircle, Loader2, Sparkles, Zap, Trophy } from "lucide-react"
import type { Submission } from "@/lib/types"

function GalleryContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  
  // API state
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNotConfigured, setIsNotConfigured] = useState(false)
  const [isNetworkError, setIsNetworkError] = useState(false)

  // Fetch submissions from API on mount
  useEffect(() => {
    async function fetchSubmissions() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await listSubmissions()
        if (data && data.length > 0) {
          setSubmissions(data)
        } else {
          setSubmissions([])
        }
      } catch (err) {
        console.error("Failed to fetch submissions from API:", err)
        if (err instanceof APIError) {
          setIsNotConfigured(err.isNotConfigured)
          setIsNetworkError(err.isNetworkError)
          setError(err.message)
        } else {
          setError("Failed to load submissions. Please try again later.")
        }
        setSubmissions([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSubmissions()
  }, [])

  const filteredSubmissions = useMemo(() => {
    let result = [...submissions]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.tags?.some((t) => t.toLowerCase().includes(query)),
      )
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return (b.metrics?.score || 0) - (a.metrics?.score || 0)
        case "duration":
          return (a.durationSec || Number.POSITIVE_INFINITY) - (b.durationSec || Number.POSITIVE_INFINITY)
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [searchQuery, sortBy, submissions])

  // Calculate stats
  const totalSubmissions = submissions.length
  const topScore = submissions.reduce((max, s) => Math.max(max, s.metrics?.score || 0), 0)
  const avgDuration = submissions.length > 0
    ? Math.round(submissions.reduce((sum, s) => sum + (s.durationSec || 0), 0) / submissions.length)
    : 0

  return (
    <>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl border border-border glass p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Drone Flight Gallery</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              <span className="gradient-text">FlockRL</span>{" "}
              <span className="text-foreground">Submissions</span>
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
              Explore AI-powered drone flight simulations. Watch how different models navigate complex environments.
            </p>

            {/* Stats Grid */}
            {!isLoading && !error && submissions.length > 0 && (
              <div className="grid grid-cols-3 gap-4 max-w-lg">
                <div className="rounded-xl border border-border/50 bg-background/50 p-4 text-center hover-lift">
                  <div className="mb-1 text-2xl font-bold text-primary">{totalSubmissions}</div>
                  <div className="text-xs text-muted-foreground">Total Flights</div>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4 text-center hover-lift">
                  <div className="mb-1 text-2xl font-bold text-accent flex items-center justify-center gap-1">
                    <Trophy className="h-5 w-5" />
                    {topScore.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Top Score</div>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4 text-center hover-lift">
                  <div className="mb-1 text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    {avgDuration}s
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Duration</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Show backend status banner if there's an error */}
        {error && isNotConfigured && <BackendNotConfiguredBanner />}
        {error && isNetworkError && <BackendUnavailableBanner />}

        <div className="glass border border-border rounded-xl shadow-lg p-4 md:p-6">
          <GalleryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 mt-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <Loader2 className="relative mb-4 h-12 w-12 animate-spin text-primary" />
              </div>
              <p className="text-lg font-medium gradient-text">Loading submissions...</p>
              <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/50 bg-destructive/10 py-16 mt-4">
              <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 mt-4">
              <Sparkles className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No submissions found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              {filteredSubmissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function GalleryPage() {
  return <GalleryContent />
}
