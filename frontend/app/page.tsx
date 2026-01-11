"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import { mockSubmissions, mockCollections } from "@/lib/mock-data"
import { listSubmissions } from "@/lib/api"
import { SubmissionCard } from "@/components/submission-card"
import { CollectionCard } from "@/components/collection-card"
import { GalleryFilters } from "@/components/gallery-filters"
import { CreateCollectionDialog } from "@/components/create-collection-dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, AlertCircle } from "lucide-react"
import type { Submission } from "@/lib/types"

function GalleryContent() {
  const [tab, setTab] = useState<"submissions" | "collections">("submissions")
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  
  // API state
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch submissions from API on mount
  useEffect(() => {
    async function fetchSubmissions() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await listSubmissions()
        // If API returns data, use it; otherwise fall back to mock data
        if (data && data.length > 0) {
          setSubmissions(data)
        } else {
          // Fall back to mock data if no submissions in database
          setSubmissions(mockSubmissions)
        }
      } catch (err) {
        console.error("Failed to fetch submissions:", err)
        setError("Failed to load submissions from server")
        // Fall back to mock data on error
        setSubmissions(mockSubmissions)
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
          s.course.toLowerCase().includes(query) ||
          s.tags?.some((t) => t.toLowerCase().includes(query)),
      )
    }

    if (courseFilter !== "all") {
      result = result.filter((s) => s.course === courseFilter)
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
  }, [searchQuery, courseFilter, statusFilter, sortBy])

  const filteredCollections = useMemo(() => {
    if (!searchQuery) return mockCollections

    const query = searchQuery.toLowerCase()
    return mockCollections.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.tags?.some((t) => t.toLowerCase().includes(query)),
    )
  }, [searchQuery])

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-4">
            <button
              onClick={() => setTab("submissions")}
              className={`pb-3 text-sm font-medium transition-colors ${
                tab === "submissions"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Submissions
            </button>
            <button
              onClick={() => setTab("collections")}
              className={`pb-3 text-sm font-medium transition-colors ${
                tab === "collections"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Collections
            </button>
          </div>
        </div>

        {tab === "submissions" ? (
          <>
            {/* Submissions Tab */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Submissions</h1>
                <p className="text-muted-foreground">Latest drone flight videos</p>
              </div>
            </div>

            <GalleryFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              courseFilter={courseFilter}
              onCourseChange={setCourseFilter}
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
                <p className="text-sm text-muted-foreground">Showing cached data</p>
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
          </>
        ) : (
          <>
            {/* Collections Tab */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Collections</h1>
                <p className="text-muted-foreground">Curated groups of submissions</p>
              </div>
              <CreateCollectionDialog />
            </div>

            <div className="mb-6">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {filteredCollections.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
                <p className="text-muted-foreground">No collections found</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            )}
          </>
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
