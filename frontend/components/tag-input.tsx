"use client"

import { useState, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onTagsChange, placeholder = "Add tag..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tag = inputValue.trim().toLowerCase()
      if (tag && !tags.includes(tag)) {
        onTagsChange([...tags, tag])
      }
      setInputValue("")
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-secondary p-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 bg-primary/20 text-primary">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 border-0 bg-transparent p-0 focus-visible:ring-0"
      />
    </div>
  )
}
