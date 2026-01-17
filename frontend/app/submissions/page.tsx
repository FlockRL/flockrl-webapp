"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { SubmissionClient } from "./submission-client"

function SubmissionDetailContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 p-4 md:p-6">
        <h1 className="mb-2 text-2xl font-bold">Missing Submission ID</h1>
        <p className="mb-4 text-muted-foreground">
          Please provide a submission ID in the query string.
        </p>
      </div>
    )
  }

  return <SubmissionClient id={id} />
}

export default function SubmissionDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-16 p-4 md:p-6">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    }>
      <SubmissionDetailContent />
    </Suspense>
  )
}
