"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import { listSubmissions, APIError } from "@/lib/api"
import { SubmissionCard } from "@/components/submission-card"
import { GalleryFilters } from "@/components/gallery-filters"
import { Skeleton } from "@/components/ui/skeleton"
import { BackendNotConfiguredBanner, BackendUnavailableBanner } from "@/components/backend-status-banner"
import { AlertCircle } from "lucide-react"
import type { Submission } from "@/lib/types"

function GalleryContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
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

    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter)
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
  }, [searchQuery, statusFilter, sortBy, submissions])

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Submissions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Submissions</h1>
            <p className="text-muted-foreground">Latest drone flight videos</p>
          </div>
        </div>

        {/* Show backend status banner if there's an error */}
        {error && isNotConfigured && <BackendNotConfiguredBanner />}
        {error && isNetworkError && <BackendUnavailableBanner />}

        <GalleryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <Skeleton className="mb-4 aspect-video w-full rounded-lg" />
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive/50 bg-destructive/10 py-16">
            <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <p className="text-muted-foreground">No submissions found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={null}>
      <GalleryContent />
    </Suspense>
  )
}
