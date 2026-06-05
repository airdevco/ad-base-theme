import { Skeleton } from "@/components/admin-sdc-ui/skeleton";

export default function PagesLoading() {
  return (
    <div className="space-y-6 pt-2.5 pr-2 sm:pr-0">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border">
        {/* Header row */}
        <div className="flex gap-4 border-b bg-muted p-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Data rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b p-3 last:border-b-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
