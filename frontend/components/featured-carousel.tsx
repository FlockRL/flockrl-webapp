"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import type { Submission } from "@/lib/types"
import { ChevronLeft, ChevronRight, Play, Trophy } from "lucide-react"

interface FeaturedCarouselProps {
  submissions: Submission[]
}

export function FeaturedCarousel({ submissions }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (submissions.length === 0) return null

  const current = submissions[currentIndex]

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % submissions.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + submissions.length) % submissions.length)
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-xl">
      <div className="relative aspect-[21/9] w-full">
        <Image
          src={current.thumbnailUrl || ""}
          alt={current.title}
          fill
          className="object-cover"
          priority
        />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-end justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-3">
                <StatusBadge status={current.status} />
                <span className="text-sm text-white/80">{current.course}</span>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white md:text-4xl">{current.title}</h2>
              {current.metrics?.score && (
                <div className="mb-4 flex items-center gap-2 text-primary">
                  <Trophy className="h-5 w-5" />
                  <span className="text-xl font-semibold">{current.metrics.score.toLocaleString()} pts</span>
                </div>
              )}
              <Button asChild size="lg" className="gap-2">
                <Link href={`/submissions/${current.id}`}>
                  <Play className="h-5 w-5" />
                  Watch Now
                </Link>
              </Button>
            </div>

            {submissions.length > 1 && (
              <div className="hidden items-center gap-2 md:flex">
                <Button variant="secondary" size="icon" onClick={prev} className="bg-white/10 hover:bg-white/20">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" onClick={next} className="bg-white/10 hover:bg-white/20">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {submissions.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:hidden">
            {submissions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 w-2 rounded-full transition-colors ${idx === currentIndex ? "bg-primary" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
