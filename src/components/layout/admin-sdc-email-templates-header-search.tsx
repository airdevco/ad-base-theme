"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

/** Matches inactive sidebar nav icons (`SidebarNav`). */
const SIDEBAR_ICON_CLASS = "text-muted-foreground";

/** Email Templates tab: filters the list via `?q=` (name, subject, body). Matches Users tab search styling. */
export function AdminSdcEmailTemplatesHeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qFromUrl = searchParams.get("q") ?? "";
  const [local, setLocal] = useState(qFromUrl);

  useEffect(() => {
    setLocal(qFromUrl);
  }, [qFromUrl]);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const flush = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      flush(v);
    }, DEBOUNCE_MS);
  };

  const clear = useCallback(() => {
    setLocal("");
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    flush("");
  }, [flush]);

  return (
    <div
      className={cn(
        "relative min-w-0 w-[min(21.6rem,60%)] max-w-full shrink-0",
        className
      )}
    >
      <div
        className={cn(
          "flex h-8 min-w-0 items-center gap-2 rounded-lg border border-border bg-background pl-2.5 pr-2 transition-[border-color]",
          "focus-within:border-primary"
        )}
      >
        <Search
          className={cn("size-4 shrink-0", SIDEBAR_ICON_CLASS)}
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="text"
          inputMode="search"
          autoComplete="off"
          role="searchbox"
          aria-label="Search email templates"
          placeholder="Search email templates"
          value={local}
          onChange={handleChange}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {local.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className={cn(
              "group flex size-7 shrink-0 items-center justify-center rounded-md outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="Clear search"
          >
            <X
              className={cn(
                "size-4 transition-colors",
                SIDEBAR_ICON_CLASS,
                "group-hover:text-black dark:group-hover:text-foreground"
              )}
              strokeWidth={2}
              aria-hidden
            />
          </button>
        )}
      </div>
    </div>
  );
}
