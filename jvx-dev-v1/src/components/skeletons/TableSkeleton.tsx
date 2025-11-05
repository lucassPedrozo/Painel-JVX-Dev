import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="grid grid-cols-9 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-9 gap-4 items-center">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
