import { Skeleton } from "@/components/ui/skeleton"

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="space-y-4">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  )
}
