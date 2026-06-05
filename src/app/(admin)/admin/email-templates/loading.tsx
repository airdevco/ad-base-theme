import { Skeleton } from "@/components/admin-sdc-ui/skeleton";

export default function EmailTemplatesLoading() {
  return (
    <div className="space-y-6 pt-2.5 pr-2 sm:pr-0">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-9 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
