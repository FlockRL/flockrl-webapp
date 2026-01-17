import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Cog, Play, Sparkles } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload a Log",
    description:
      "Upload your drone flight log file. Supports .json format from CoreSimulator._save_episode_run().",
    step: 1,
  },
  {
    icon: Play,
    title: "View Results",
    description:
      "Watch the video, review metrics, and compare your flight with others in the gallery.",
    step: 2,
  },
  {
    icon: Cog,
    title: "Interactive 3D Visualizer",
    description:
      "Flight trajectories are rendered using Three.js, with the visualizer ported from the simulator.",
    step: 3,
  },
]

export default function AboutPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Hero Header */}
        <div className="mb-10 relative overflow-hidden rounded-2xl border border-border glass p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">About FlockRL</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 md:text-5xl">
              <span className="gradient-text">How It Works</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              FlockRL Gallery lets you visualize and share AI-powered drone flight simulations.
              Upload your logs and watch them come to life.
            </p>
          </div>
        </div>

        {/* Steps */}
        <section className="mb-12">
          <div className="grid grid-cols-1 gap-4">
            {steps.map((step, index) => (
              <Card
                key={step.title}
                className="relative overflow-hidden glass border-border hover-lift transition-all group glow-border"
              >
                {/* Step connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-10 bottom-0 w-0.5 h-4 bg-gradient-to-b from-primary/50 to-transparent translate-y-full z-10" />
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="relative">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <step.icon className="h-7 w-7 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {step.title}
                      </CardTitle>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
