import Link from "next/link"
import type { Submission } from "@/lib/types"
import { Clock, Trophy, Calendar, ChevronRight, Play } from "lucide-react"

interface SubmissionCardProps {
  submission: Submission
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Link
      href={`/submissions?id=${submission.id}`}
      className="group relative block rounded-xl glass border border-border p-4 hover:border-primary/50 transition-all duration-300 hover-lift glow-border overflow-hidden"
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center justify-between gap-4">
        {/* Play icon indicator */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Play className="h-4 w-4 ml-0.5" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {submission.title}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="truncate">{submission.name || "Unknown Goose"}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(submission.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
          {submission.durationSec && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2.5 py-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDuration(submission.durationSec)}</span>
            </div>
          )}
          {submission.metrics?.score && (
            <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-primary">
              <Trophy className="h-3.5 w-3.5" />
              <span className="font-semibold">{submission.metrics.score.toLocaleString()}</span>
            </div>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>
    </Link>
  )
}
