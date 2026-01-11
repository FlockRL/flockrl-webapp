import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import type { Submission } from "@/lib/types"
import { Clock, Trophy } from "lucide-react"

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

  return (
    <Link href={`/submissions/${submission.id}`}>
      <Card className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={submission.thumbnailUrl || ""}
            alt={submission.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute right-2 top-2">
            <StatusBadge status={submission.status} />
          </div>
          {submission.durationSec && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
              <Clock className="h-3 w-3" />
              {formatDuration(submission.durationSec)}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-1 font-semibold text-foreground group-hover:text-primary">
            {submission.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{submission.course}</span>
            {submission.metrics?.score && (
              <div className="flex items-center gap-1 text-primary">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">{submission.metrics.score.toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
