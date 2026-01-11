"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScoreChartProps {
  metrics: {
    smoothness?: number
    pathEfficiency?: number
    score?: number
  }
}

export function ScoreChart({ metrics }: ScoreChartProps) {
  const data = [
    { name: "Smoothness", value: metrics.smoothness || 0, fill: "var(--chart-1)" },
    { name: "Path Efficiency", value: metrics.pathEfficiency || 0, fill: "var(--chart-2)" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
