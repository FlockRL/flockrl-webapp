"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createSubmission, APIError, isBackendConfigured } from "@/lib/api"
import { BackendNotConfiguredBanner, BackendUnavailableBanner } from "@/components/backend-status-banner"
import { Upload, Sparkles, Loader2 } from "lucide-react"

export default function SubmitPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const backendConfigured = useMemo(() => isBackendConfigured(), [])
  const [apiError, setApiError] = useState<APIError | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !title) {
      toast({
        title: "Missing required fields",
        description: "Please provide a log file and title.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await createSubmission(file, {
        title,
        notes: notes || undefined,
      })

      toast({
        title: "Submission uploaded",
        description: response.message || "Your log file has been submitted successfully.",
      })

      // Navigate to submission detail with real ID from response
      router.push(`/submissions/${response.id}`)
    } catch (error) {
      if (error instanceof APIError) {
        setApiError(error)
        const message = error.detail || error.message
        toast({
          title: "Upload failed",
          description: message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload submission. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6">
      {/* Show backend status banner if not configured or error */}
      {!backendConfigured && <BackendNotConfiguredBanner />}
      {apiError?.isNetworkError && <BackendUnavailableBanner />}

      <div className="mx-auto max-w-2xl">
        {/* Hero Header */}
        <div className="mb-8 relative overflow-hidden rounded-2xl border border-border glass p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">New Submission</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text">Submit a Log</span>
            </h1>
            <p className="text-muted-foreground">Upload your flight log to generate a rendered video and analytics</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6 glass border-border hover-lift transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Log File
              </CardTitle>
              <CardDescription>Upload the log file from your drone flight</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileSelect={setFile} selectedFile={file} />
            </CardContent>
          </Card>

          <Card className="mb-6 glass border-border hover-lift transition-all">
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
              <CardDescription>Provide information about your flight</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your submission"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Let your thoughts take off here... (bonus points for puns ✈️)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full gap-2 glow-sm hover:glow-md transition-all" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            {isSubmitting ? "Uploading..." : "Submit Log"}
          </Button>
        </form>
      </div>
    </div>
  )
}
