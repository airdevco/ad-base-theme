import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar skeleton */}
      <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-sidebar px-3 py-3">
        <Skeleton className="mb-4 h-6 w-24" />
        <Skeleton className="mb-4 h-7 w-full rounded-[9px]" />
        <div className="mx-0 my-2 border-t border-border" />
        <Skeleton className="mb-1 h-3 w-16" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-full rounded-[9px]" />
          <Skeleton className="h-7 w-full rounded-[9px]" />
          <Skeleton className="h-7 w-full rounded-[9px]" />
          <Skeleton className="h-7 w-full rounded-[9px]" />
        </div>
        <Skeleton className="mb-1 mt-3 h-3 w-20" />
        <Skeleton className="h-7 w-full rounded-[9px]" />
      </aside>

      {/* Content skeleton */}
      <main className="flex-1">
        <div className="flex h-[45px] items-center border-b border-border px-6">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="mx-auto max-w-2xl px-8 py-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
          <Skeleton className="mt-6 h-16 w-16 rounded-full" />
          <div className="mt-6 border-t border-border" />
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-9 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-9 w-full rounded-lg" />
            </div>
          </div>
          <div className="mt-6 border-t border-border" />
          <Skeleton className="mt-6 h-3 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
      </main>
    </div>
  );
}
