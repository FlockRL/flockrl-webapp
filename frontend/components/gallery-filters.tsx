"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface GalleryFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
}

export function GalleryFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: GalleryFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-2xl group">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="search"
          placeholder="Search submissions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px] bg-background/50 border-border/50 hover:border-primary/30 transition-colors">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="glass border-border">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="score">Top Score</SelectItem>
            <SelectItem value="duration">Shortest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
