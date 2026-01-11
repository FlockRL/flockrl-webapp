import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Collection } from "@/lib/types"
import { getSubmissionById } from "@/lib/mock-data"
import { Layers } from "lucide-react"

interface CollectionCardProps {
  collection: Collection
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const coverSubmission = collection.coverSubmissionId ? getSubmissionById(collection.coverSubmissionId) : null

  return (
    <Link href={`/collections/${collection.id}`}>
      <Card className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={coverSubmission?.thumbnailUrl || ""}
            alt={collection.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
            <Layers className="h-3 w-3" />
            {collection.submissionIds.length} submissions
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary">{collection.name}</h3>
          {collection.description && (
            <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{collection.description}</p>
          )}
          {collection.tags && collection.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {collection.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
