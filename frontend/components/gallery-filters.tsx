"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COURSES } from "@/lib/mock-data"
import { Search } from "lucide-react"

interface GalleryFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  courseFilter: string
  onCourseChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
}

export function GalleryFilters({
  searchQuery,
  onSearchChange,
  courseFilter,
  onCourseChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: GalleryFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search submissions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={courseFilter} onValueChange={onCourseChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Course" />
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

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="RENDERING">Rendering</SelectItem>
            <SelectItem value="UPLOADED">Uploaded</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="score">Score</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
