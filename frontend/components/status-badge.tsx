import { Badge } from "@/components/ui/badge"
import type { SubmissionStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusConfig: Record<SubmissionStatus, { label: string; className: string }> = {
  UPLOADED: { label: "Uploaded", className: "bg-zinc-600 text-zinc-100" },
  RENDERING: { label: "Rendering", className: "bg-blue-600 text-blue-100" },
  READY: { label: "Ready", className: "bg-green-600 text-green-100" },
  FAILED: { label: "Failed", className: "bg-red-600 text-red-100" },
}

interface StatusBadgeProps {
  status: SubmissionStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge className={cn(config.className, className)}>{config.label}</Badge>
}
