"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { TopScoresChart } from "@/components/top-scores-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { mockSubmissions, COURSES } from "@/lib/mock-data"
import { Trophy, Medal } from "lucide-react"

export default function LeaderboardPage() {
  const router = useRouter()
  const [courseFilter, setCourseFilter] = useState("all")
  const [minScore, setMinScore] = useState("")

  const rankedSubmissions = useMemo(() => {
    let filtered = mockSubmissions
      .filter((s) => s.status === "READY" && s.metrics?.score)
      .sort((a, b) => (b.metrics?.score || 0) - (a.metrics?.score || 0))

    if (courseFilter !== "all") {
      filtered = filtered.filter((s) => s.course === courseFilter)
    }

    if (minScore) {
      const min = Number.parseInt(minScore, 10)
      if (!isNaN(min)) {
        filtered = filtered.filter((s) => (s.metrics?.score || 0) >= min)
      }
    }

    return filtered.map((s, index) => ({ ...s, rank: index + 1 }))
  }, [courseFilter, minScore])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-muted-foreground">{rank}</span>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="p-4 md:p-6">
      <Breadcrumbs items={[{ label: "Leaderboard" }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">Rankings based on submission scores</p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopScoresChart />
        </div>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by Course</label>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {COURSES.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Score</label>
            <Input
              type="number"
              placeholder="e.g., 8000"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead>Course</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Time</TableHead>
              <TableHead className="text-right">Collisions</TableHead>
              <TableHead className="text-right">Smoothness</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankedSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <p className="text-muted-foreground">No submissions match your filters</p>
                </TableCell>
              </TableRow>
            ) : (
              rankedSubmissions.map((submission) => (
                <TableRow
                  key={submission.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/submissions/${submission.id}`)}
                >
                  <TableCell>
                    <div className="flex h-8 w-8 items-center justify-center">{getRankIcon(submission.rank)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium hover:text-primary">{submission.title}</span>
                      {submission.tags && submission.tags.length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {submission.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{submission.course}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-primary">{submission.metrics?.score?.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-right">{submission.metrics?.timeSec}s</TableCell>
                  <TableCell className="text-right">{submission.metrics?.collisions}</TableCell>
                  <TableCell className="text-right">{submission.metrics?.smoothness}%</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatDate(submission.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
