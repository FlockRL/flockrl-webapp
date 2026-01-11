import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Cog, Play, BarChart3, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "1. Upload a Log",
    description:
      "Submit your drone flight log file from the Submit page. Supported formats include .log, .txt, and .json files.",
  },
  {
    icon: Cog,
    title: "2. Plotty Renders",
    description:
      "Our rendering engine, Plotty, processes your log file and generates a video visualization along with performance metrics and plots.",
  },
  {
    icon: Play,
    title: "3. Explore the Gallery",
    description:
      "Once rendered, your submission appears in the Gallery. Watch the video, analyze metrics, and compare with other flights.",
  },
]

const features = [
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "View comprehensive metrics including score, time, collisions, smoothness, and path efficiency.",
  },
]

export default function AboutPage() {
  return (
    <div className="p-4 md:p-6">
      <Breadcrumbs items={[{ label: "About" }]} />

      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">Welcome to FlockRL Gallery</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A visual gallery showcasing drone flight videos. Upload your flight logs and
            watch them transform into rendered visualizations with detailed analytics.
          </p>
        </div>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-bold">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.title} className="relative overflow-hidden">
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10" />
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-bold">Features</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* About Plotty */}
        <section className="mb-12">
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle>About Plotty</CardTitle>
              <CardDescription>The rendering engine powering FlockRL Gallery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Plotty is our custom rendering engine that transforms raw flight logs into rich visualizations. It
                processes telemetry data to generate:
              </p>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                <li>High-quality video renderings of flight paths</li>
                <li>Velocity and altitude profile charts</li>
                <li>Path deviation and efficiency analysis</li>
                <li>Collision detection and smoothness metrics</li>
              </ul>
              <p className="text-muted-foreground">
                Current version: <span className="font-mono text-foreground">Plotty v2.1.0</span>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="border-primary/50 bg-primary/10">
            <CardContent className="py-8">
              <h2 className="mb-2 text-2xl font-bold">Ready to Get Started?</h2>
              <p className="mb-6 text-muted-foreground">
                Upload your first flight log and see it come to life in the gallery.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link href="/submit">
                  Submit Your First Log
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
