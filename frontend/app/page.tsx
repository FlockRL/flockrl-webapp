"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Sparkles, Target, Rocket, Play, Users } from "lucide-react"

export default function HomePage() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            <span className="gradient-text">FlockRL</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Reinforcement Learning for Autonomous Drone Path Planning in Structured Environments
          </p>
          <Button asChild size="lg" className="mt-8 glow-sm">
            <Link href="#demo">View demo</Link>
          </Button>
        </div>
      </section>

      {/* Project overview */}
      <section className="min-h-[90vh] px-4 py-16 md:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold">
            <span className="gradient-text">Project overview</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="glass border-border transition-all hover:glow-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Problem</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Optimizing and automating flight paths in relatively static environments like factory floors.
              </CardContent>
            </Card>
            <Card className="glass border-border transition-all hover:glow-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Solution</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Training optimal navigation policies in simulation for deployment on resource-constrained drones.
              </CardContent>
            </Card>
            <Card className="glass border-border transition-all hover:glow-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Objective</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Our goal is to investigate sim-to-real transfer of learned drone trajectories under open-loop deployment.
              </CardContent>
            </Card>
            <Card className="glass border-border transition-all hover:glow-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Future objectives</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Expand to dynamic obstacle environments and real-time path adjustment. Scale to multi-drone swarm navigation.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="px-4 py-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold">
            <span className="gradient-text">Tech stack</span>
          </h2>
          <div className="flex justify-center">
            <Card className="glass border-border w-full max-w-xl text-center">
              <CardContent>
                <div className="space-y-4 text-sm text-foreground">
                  <div>
                    <p className="font-semibold">RL Training</p>
                    <ul className="mt-2 space-y-1">
                      <li>Gymnasium (environments)</li>
                      <li>Stable-Baselines3 (RL algorithms)</li>
                      <li>TensorBoard (training monitoring)</li>
                      <li>Plotly (visualization)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Hardware</p>
                    <ul className="mt-2 space-y-1">
                      <li>ESP32-based WiFi flight controller quadcopter</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section
        id="demo"
        className="min-h-[120vh] flex flex-col items-center justify-center px-4 py-16 text-center"
      >
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-3xl font-bold md:text-4xl">
            <span className="gradient-text">Demo</span>
          </h2>
          <div className="relative mt-12 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/30">
            {imageError ? (
              <div className="flex aspect-video w-full items-center justify-center text-sm text-muted-foreground">
              </div>
            ) : (
              <Image
                src="/demo.gif"
                alt="FlockRL demo"
                fill
                className="object-cover"
                unoptimized
                onError={() => setImageError(true)}
              />
            )}
          </div>
        </div>
      </section>

      {/* Meet the team */}
      <section className="min-h-[30vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold">
          <span className="gradient-text">Meet the team</span>
        </h2>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="h-8 w-8" />
        </div>
        <p className="mt-6 max-w-md text-muted-foreground">
          Our team building tools for the drone simulation community.
        </p>
        <p className="mt-2 text-sm text-muted-foreground/80">
          Coming soon.
        </p>
      </section>
    </div>
  )
}
