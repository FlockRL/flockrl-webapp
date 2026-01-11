"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface VideoPlayerProps {
  thumbnailUrl?: string
  videoUrl?: string
  isReady: boolean
}

export function VideoPlayer({ thumbnailUrl, isReady }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  if (!isReady) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-secondary">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Rendering in progress...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <Image
        src={thumbnailUrl || ""}
        alt="Video thumbnail"
        fill
        className="object-cover"
      />

      {/* Play overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button size="lg" className="h-16 w-16 rounded-full" onClick={() => setIsPlaying(true)}>
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
