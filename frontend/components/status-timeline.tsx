import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"
import type { SubmissionStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StatusTimelineProps {
  status: SubmissionStatus
}

const steps = [
  { key: "UPLOADED", label: "Uploaded" },
  { key: "RENDERING", label: "Rendering" },
  { key: "READY", label: "Ready" },
]

export function StatusTimeline({ status }: StatusTimelineProps) {
  const getStepStatus = (stepKey: string) => {
    if (status === "FAILED") {
      if (stepKey === "UPLOADED") return "complete"
      if (stepKey === "RENDERING") return "failed"
      return "pending"
    }

    const statusOrder = ["UPLOADED", "RENDERING", "READY"]
    const currentIndex = statusOrder.indexOf(status)
    const stepIndex = statusOrder.indexOf(stepKey)

    if (stepIndex < currentIndex) return "complete"
    if (stepIndex === currentIndex) return status === "READY" ? "complete" : "current"
    return "pending"
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(step.key)

        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  stepStatus === "complete" && "bg-green-600",
                  stepStatus === "current" && "bg-blue-600",
                  stepStatus === "failed" && "bg-red-600",
                  stepStatus === "pending" && "bg-secondary",
                )}
              >
                {stepStatus === "complete" && <CheckCircle2 className="h-5 w-5 text-white" />}
                {stepStatus === "current" && <Loader2 className="h-5 w-5 animate-spin text-white" />}
                {stepStatus === "failed" && <XCircle className="h-5 w-5 text-white" />}
                {stepStatus === "pending" && <Circle className="h-5 w-5 text-muted-foreground" />}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm",
                  stepStatus === "complete" || stepStatus === "current" ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-1 flex-1 rounded",
                  getStepStatus(steps[index + 1].key) !== "pending" ? "bg-green-600" : "bg-secondary",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
