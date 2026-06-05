import { Skeleton } from "@/components/admin-sdc-ui/skeleton";

export default function PageEditorLoading() {
  return (
    <div className="flex flex-col pt-2.5 pr-2 sm:pr-0">
      {/* Page Header skeleton */}
      <div className="flex items-center justify-between gap-3 border-b border-border py-2.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-[26px] w-16" />
          <Skeleton className="h-[26px] w-24" />
        </div>
      </div>

      <div className="py-5">
        {/* Form fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>

        {/* Status toggle */}
        <div className="mt-4 flex items-center gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-7 w-40 rounded-lg" />
        </div>

        {/* Edit/Preview toggle */}
        <div className="mt-4 flex items-center justify-end">
          <Skeleton className="h-7 w-32 rounded-lg" />
        </div>

        {/* Editor */}
        <div className="mt-3">
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
