"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FileUpload } from "@/components/file-upload"
import { TagInput } from "@/components/tag-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createSubmission, APIError, isBackendConfigured } from "@/lib/api"
import { BackendNotConfiguredBanner, BackendUnavailableBanner } from "@/components/backend-status-banner"
import { Upload } from "lucide-react"

export default function SubmitPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [envSet, setEnvSet] = useState("")
  const [rendererPreset, setRendererPreset] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [backendConfigured] = useState(isBackendConfigured())
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
        tags: tags.length > 0 ? tags : undefined,
        notes: notes || undefined,
        env_set: envSet || undefined,
        renderer_preset: rendererPreset || undefined,
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
      <Breadcrumbs items={[{ label: "Submit" }]} />

      {/* Show backend status banner if not configured or error */}
      {!backendConfigured && <BackendNotConfiguredBanner />}
      {apiError?.isNetworkError && <BackendUnavailableBanner />}

      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Submit a Log</h1>
          <p className="text-muted-foreground">Upload your flight log to generate a rendered video and analytics</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Log File</CardTitle>
              <CardDescription>Upload the log file from your drone flight</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileSelect={setFile} selectedFile={file} />
            </CardContent>
          </Card>

          <Card className="mb-6">
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
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <TagInput tags={tags} onTagsChange={setTags} placeholder="Add tags (press Enter)" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this flight..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
              <CardDescription>Optional rendering configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="envSet">Environment Set</Label>
                <Input
                  id="envSet"
                  placeholder="e.g., production, staging"
                  value={envSet}
                  onChange={(e) => setEnvSet(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rendererPreset">Renderer Preset</Label>
                <Select value={rendererPreset} onValueChange={setRendererPreset}>
                  <SelectTrigger id="rendererPreset">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="high-quality">High Quality</SelectItem>
                    <SelectItem value="fast">Fast Render</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
            <Upload className="h-5 w-5" />
            {isSubmitting ? "Uploading..." : "Submit Log"}
          </Button>
        </form>
      </div>
    </div>
  )
}
