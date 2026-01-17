"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
}

export function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true)
    } else if (e.type === "dragleave") {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        onFileSelect(files[0])
      }
    },
    [onFileSelect],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFileSelect(files[0])
      }
    },
    [onFileSelect],
  )

  const removeFile = useCallback(() => {
    onFileSelect(null)
  }, [onFileSelect])

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <File className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={removeFile}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
      )}
    >
      <input
        type="file"
        accept=".json"
        onChange={handleFileInput}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Upload className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="mb-1 text-center font-medium">Drop your log file here</p>
      <p className="text-center text-sm text-muted-foreground">or click to browse (.json)</p>
    </div>
  )
}
