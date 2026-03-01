"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Sparkles, Target, Rocket, Users, Cpu, BarChart2 } from "lucide-react"

export default function HomePage() {
  const [imageError, setImageError] = useState(false)

  const team = [
    { name: "Aadesh", title: "ML Engineer · Hardware", image: "/aadesh.jpeg", linkedin: "https://www.linkedin.com/in/aakum/" },
    { name: "Lucas", title: "ML Engineer", image: "/lucas.jpeg", linkedin: "https://www.linkedin.com/in/lucas--jin" },
    { name: "Lovera", title: "ML Engineer", image: "/lovera.jpeg", linkedin: "https://www.linkedin.com/in/lovera-lokeswara/" },
    { name: "Raiya", title: "ML Engineer · Hardware", image: "/raiya.jpeg", linkedin: "https://www.linkedin.com/in/raiya-minhas/" },
    { name: "Cindy", title: "Software Engineer", image: "/cindy.jpeg", linkedin: "https://www.linkedin.com/in/cindehaa/" },
    { name: "Katie", title: "TPM", image: "/katherine.jpeg", linkedin: "https://www.linkedin.com/in/katie-zhong/" },
    { name: "Joshua", title: "TPM", image: "/joshua.jpeg", linkedin: "https://www.linkedin.com/in/joshualeezhang/" },
  ]

  const techStack = [
    {
      category: "RL Training",
      icon: BarChart2,
      items: ["Gymnasium — environments", "Stable-Baselines3 — RL algorithms", "TensorBoard — training monitoring", "Plotly — visualization"],
    },
    {
      category: "Hardware",
      icon: Cpu,
      items: ["ESP32-based WiFi flight controller"],
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            <span className="gradient-text">FlockRL</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            Autonomous drone path planning via sim-to-real transfer of reinforcement learning policies.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="glow-sm">
              <Link href="#demo">Watch Demo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border hover:glow-sm">
              <Link href="/detail">View Gallery</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Project overview */}
      <section className="px-4 py-16 md:px-6">
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
                Investigate sim-to-real transfer of learned drone trajectories under open-loop deployment.
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
      <section className="px-4 py-16 md:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold">
            <span className="gradient-text">Tech stack</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {techStack.map(({ category, icon: Icon, items }) => (
              <Card key={category} className="glass border-border transition-all hover:glow-border">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section
        id="demo"
        className="flex flex-col items-center justify-center px-4 py-16 text-center"
      >
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-3xl font-bold md:text-4xl">
            <span className="gradient-text">Demo</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Trained policy navigating a structured environment in simulation.
          </p>
          <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/30">
            {imageError ? (
              <div className="flex aspect-video w-full items-center justify-center text-sm text-muted-foreground">
                Demo unavailable
              </div>
            ) : (
              <Image
                src="/demo.gif"
                alt="FlockRL simulation demo"
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
      <section className="px-4 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-bold">
            <span className="gradient-text">Meet the team</span>
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            The team behind FlockRL across product, machine learning, software, and hardware.
          </p>
          <div className="mt-10 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <Card
                key={member.name}
                className="glass border-border flex flex-col items-center px-4 py-6 text-center transition-all hover:glow-border"
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full border border-border object-cover"
                />
                <CardTitle className="mt-4 text-lg capitalize">{member.name}</CardTitle>
                <CardContent className="flex flex-1 flex-col items-center gap-3 pt-2 text-sm text-muted-foreground">
                  <p>{member.title}</p>
                  <Link
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80 hover:border-primary/50"
                  >
                    <Image src="/linkedin.png" alt="LinkedIn" width={16} height={16} className="shrink-0" />
                    LinkedIn
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
