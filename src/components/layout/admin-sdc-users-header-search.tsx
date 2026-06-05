"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { FileText, Mail, Search, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { mockUsers, mockEmailTemplates } from "@/mock";
import { mockLegalPages } from "@/mock/legal";

interface RecordItem {
  id: string;
  label: string;
  sublabel?: string;
  type: "user" | "page" | "template";
  href: string;
}

function recordTypeIcon(type: string) {
  if (type === "user") return UserIcon;
  if (type === "page") return FileText;
  return Mail;
}

/** Inline Users tab search: header input + dropdown with global records list (palette-style, no quick actions). */
export function AdminSdcUsersHeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allRecords: RecordItem[] = useMemo(() => {
    const users: RecordItem[] = mockUsers.slice(0, 50).map((u) => ({
      id: `user-${u.id}`,
      label: `${u.firstName} ${u.lastName}`,
      sublabel: u.email,
      type: "user" as const,
      href: ROUTES.admin.users,
    }));
    const pages: RecordItem[] = mockLegalPages.map((p) => ({
      id: `page-${p.id}`,
      label: p.title,
      sublabel: p.status,
      type: "page" as const,
      href: `${ROUTES.admin.pages}/${p.id}`,
    }));
    const templates: RecordItem[] = mockEmailTemplates.map((t) => ({
      id: `tpl-${t.id}`,
      label: t.name,
      sublabel: t.subject,
      type: "template" as const,
      href: `${ROUTES.admin.emailTemplates}/${t.id}`,
    }));
    return [...users, ...pages, ...templates];
  }, []);

  const lowerQuery = query.toLowerCase().trim();

  const getFilteredRecordsByType = useCallback(() => {
    const filtered = lowerQuery
      ? allRecords.filter(
          (r) =>
            r.label.toLowerCase().includes(lowerQuery) ||
            r.sublabel?.toLowerCase().includes(lowerQuery)
        )
      : allRecords;

    return {
      users: filtered.filter((r) => r.type === "user"),
      pages: filtered.filter((r) => r.type === "page"),
      templates: filtered.filter((r) => r.type === "template"),
    };
  }, [lowerQuery, allRecords]);

  const groupedRecords = getFilteredRecordsByType();
  const flatRecords = [
    ...groupedRecords.users,
    ...groupedRecords.pages,
    ...groupedRecords.templates,
  ];

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) => Math.min(i + 1, Math.max(flatRecords.length - 1, 0)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        if (!open || !flatRecords[activeIndex]) return;
        e.preventDefault();
        setOpen(false);
        router.push(flatRecords[activeIndex].href);
      }
    },
    [open, flatRecords, activeIndex, router]
  );

  const renderRecordRow = (record: RecordItem, idx: number) => {
    const Icon = recordTypeIcon(record.type);
    return (
      <button
        key={record.id}
        type="button"
        data-index={idx}
        className={cn(
          "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-sidebar-foreground transition-colors",
          activeIndex === idx
            ? "bg-muted/80"
            : "hover:bg-muted/80"
        )}
        onMouseEnter={() => setActiveIndex(idx)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setOpen(false);
          router.push(record.href);
        }}
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate">{record.label}</span>
        {record.sublabel && (
          <span className="truncate text-xs text-muted-foreground">{record.sublabel}</span>
        )}
      </button>
    );
  };

  return (
    <div
      ref={rootRef}
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
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          autoComplete="off"
          role="searchbox"
          aria-label="Search all users"
          placeholder="Search all users"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          aria-expanded={open}
          aria-controls="admin-sdc-users-global-search-results"
          aria-autocomplete="list"
        />
      </div>

      {open && (
        <div
          id="admin-sdc-users-global-search-results"
          className="absolute left-0 top-full z-50 mt-1.5 w-full animate-in fade-in-0 zoom-in-95"
          role="listbox"
        >
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-lg">
            <div ref={listRef} className="max-h-[min(400px,50vh)] overflow-y-auto py-1">
                {groupedRecords.users.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Users ({groupedRecords.users.length})
                    </p>
                    {groupedRecords.users.map((record) => {
                      const idx = flatRecords.indexOf(record);
                      return renderRecordRow(record, idx);
                    })}
                  </div>
                )}
                {groupedRecords.pages.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Pages ({groupedRecords.pages.length})
                    </p>
                    {groupedRecords.pages.map((record) => {
                      const idx = flatRecords.indexOf(record);
                      return renderRecordRow(record, idx);
                    })}
                  </div>
                )}
                {groupedRecords.templates.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Email Templates ({groupedRecords.templates.length})
                    </p>
                    {groupedRecords.templates.map((record) => {
                      const idx = flatRecords.indexOf(record);
                      return renderRecordRow(record, idx);
                    })}
                  </div>
                )}
                {flatRecords.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No records found
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
