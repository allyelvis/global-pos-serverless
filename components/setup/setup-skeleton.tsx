import { Skeleton } from "@/components/ui/skeleton"

export function SetupSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <Skeleton className="mb-4 h-12 w-12 rounded-full" />
        <Skeleton className="mb-2 h-6 w-1/2" />
        <Skeleton className="mb-6 h-4 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="mt-6 h-10 w-full" />
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <Skeleton className="mb-4 h-12 w-12 rounded-full" />
        <Skeleton className="mb-2 h-6 w-1/2" />
        <Skeleton className="mb-6 h-4 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="mt-6 h-10 w-full" />
      </div>
    </div>
  )
}

