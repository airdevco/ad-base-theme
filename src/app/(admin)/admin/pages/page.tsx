"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowDown, ArrowUp, ArrowUpDown, Activity, Calendar, Link as LinkIcon, MoreHorizontal } from "lucide-react";
import { ThinCheckbox } from "@/components/admin-sdc-ui/thin-checkbox";
import { cn } from "@/lib/utils";
import { mockLegalPages } from "@/mock/legal";
import { AdminSdcPageHeader } from "@/components/layout/admin-sdc-page-header";
import { SdcHeaderLead } from "@/components/layout/admin-sdc-sidebar";
import { AdminSdcPageHeaderActions } from "@/components/layout/admin-sdc-page-header-actions";
import { Button } from "@/components/admin-sdc-ui/button";
import { EmptyState } from "@/components/admin-sdc-ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin-sdc-ui/table";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin-sdc-ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin-sdc-ui/dropdown-menu";
import {
  FilterBar,
  useTableFilters,
  type FilterDefinition,
} from "@/components/admin-sdc-ui/table-filters";
import { APP_NAME, ROUTES } from "@/lib/constants";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const PAGE_FILTER_DEFINITIONS: FilterDefinition[] = [
  {
    key: "title",
    label: "Page Title",
    type: "text",
    icon: FileText,
    group: "Page attributes",
  },
  {
    key: "slug",
    label: "Slug",
    type: "text",
    icon: LinkIcon,
    group: "Page attributes",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    icon: Activity,
    group: "Page attributes",
    options: [
      { label: "Published", value: "published" },
      { label: "Draft", value: "draft" },
    ],
  },
  {
    key: "updatedAt",
    label: "Last Edited",
    type: "date",
    icon: Calendar,
    group: "Page attributes",
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    icon: Calendar,
    group: "Page attributes",
  },
];

export default function PagesListPage() {
  const [pages, setPages] = useState(mockLegalPages);
  const [deleteTarget, setDeleteTarget] = useState<typeof mockLegalPages[0] | null>(null);
  const [sortField, setSortField] = useState<string>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const tableRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(["title", "slug", "lastEdited", "status", "created"])
  );

  const toggleColumn = useCallback((col: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) {
        if (next.size > 1) next.delete(col);
      } else {
        next.add(col);
      }
      return next;
    });
  }, []);

  const {
    filters,
    addFilter,
    removeFilter,
    setOperator,
    setValue,
    clearAll,
    applyFilters,
    getDefinition,
  } = useTableFilters(PAGE_FILTER_DEFINITIONS);

  const presetLabel = useMemo(() => {
    if (filters.length === 0) return "All Pages";
    if (filters.length === 1) {
      const f = filters[0];
      if (f.operator === "equals" && f.key === "status" && String(f.value) === "published") {
        return "Published";
      }
      if (f.operator === "equals" && f.key === "status" && String(f.value) === "draft") {
        return "Drafts";
      }
    }
    return "Filtered";
  }, [filters]);

  useEffect(() => {
    document.title = `Pages | ${APP_NAME}`;
  }, []);

  const filteredPages = useMemo(() => {
    let result = applyFilters(pages as unknown as Record<string, unknown>[]) as unknown as typeof pages;
    result = [...result].sort((a, b) => {
      let aVal: string, bVal: string;
      switch (sortField) {
        case "updatedAt":
          aVal = a.updatedAt;
          bVal = b.updatedAt;
          break;
        default:
          aVal = a.title;
          bVal = b.title;
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return result;
  }, [pages, applyFilters, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredPages.length / perPage);
  const paginatedPages = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredPages.slice(start, start + perPage);
  }, [filteredPages, currentPage, perPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortDirection, filters]);

  const handleSort = useCallback((field: string) => {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  const handleDuplicate = useCallback((page: typeof mockLegalPages[0]) => {
    const copy = {
      ...page,
      id: `page_${Date.now()}`,
      title: `${page.title} (Copy)`,
      slug: `${page.slug}-copy`,
      status: "draft" as const,
      updatedAt: new Date().toISOString(),
    };
    setPages((prev) => [copy, ...prev]);
    toast.success("Page duplicated");
  }, []);

  const handleToggleStatus = useCallback((page: typeof mockLegalPages[0]) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === page.id
          ? { ...p, status: (p.status === "published" ? "draft" : "published") as "published" | "draft", updatedAt: new Date().toISOString() }
          : p
      )
    );
    toast.success(`Page ${page.status === "published" ? "unpublished" : "published"}`);
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filteredPages.length) return new Set();
      return new Set(filteredPages.map((p) => p.id));
    });
  }, [filteredPages]);

  const handleBulkDelete = useCallback(() => {
    setPages((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    toast.success(`${selectedIds.size} pages deleted`);
    setSelectedIds(new Set());
  }, [selectedIds]);

  return (
    <div className="flex h-full flex-col">
      <AdminSdcPageHeader
        title="Pages"
        breadcrumb={{ label: "Admin", href: ROUTES.admin.dashboard }}
        lead={<SdcHeaderLead />}
        actions={<AdminSdcPageHeaderActions />}
        introTitle="Pages"
        introDescription="Manage legal pages, policies, and public site content"
        introTrailing={
          <Link
            href={`${ROUTES.admin.pages}/new`}
            className="flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active"
          >
            <Plus className="size-3.5" />
            New Page
          </Link>
        }
        toolbar={
          <div className="flex items-center gap-2">
            <DropdownMenu open={presetMenuOpen} onOpenChange={setPresetMenuOpen}>
              <DropdownMenuTrigger className="flex h-7 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent/60">
                {presetLabel}
                {presetMenuOpen ? (
                  <ChevronUp className="size-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-3 text-muted-foreground" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={() => clearAll()}>
                  All Pages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { clearAll(); addFilter("status", "equals", "published"); }}>
                  Published
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { clearAll(); addFilter("status", "equals", "draft"); }}>
                  Drafts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
        filterBar={
          <div className="flex w-full items-center justify-between gap-3">
            <FilterBar
              definitions={PAGE_FILTER_DEFINITIONS}
              filters={filters}
              onAddFilter={addFilter}
              onRemoveFilter={removeFilter}
              onOperatorChange={setOperator}
              onValueChange={setValue}
              onClearAll={clearAll}
              getDefinition={getDefinition}
            />
            <div className="flex shrink-0 items-center gap-2">
              <DropdownMenu open={columnsMenuOpen} onOpenChange={setColumnsMenuOpen}>
                <DropdownMenuTrigger className="flex h-7 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent/60">
                  Edit columns
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-52">
                  {[
                    { key: "title", label: "Page Title" },
                    { key: "slug", label: "Slug" },
                    { key: "lastEdited", label: "Last Edited" },
                    { key: "status", label: "Status" },
                    { key: "created", label: "Created" },
                  ].map((col) => (
                    <DropdownMenuItem key={col.key} closeOnSelect={false} onClick={() => toggleColumn(col.key)}>
                      <ThinCheckbox
                        readOnly
                        tabIndex={-1}
                        checked={visibleColumns.has(col.key)}
                        className="pointer-events-none"
                        aria-hidden
                      />
                      {col.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-7 items-center gap-1.5 rounded-lg px-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60">
                  Sorted by <span className="text-foreground">{sortField === "title" ? "Title" : "Last Edited"}</span>
                  {sortDirection === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  <DropdownMenuItem onClick={() => { setSortField("title"); setSortDirection("asc"); }}>Title (A–Z)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("title"); setSortDirection("desc"); }}>Title (Z–A)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("updatedAt"); setSortDirection("asc"); }}>Last Edited (Oldest)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("updatedAt"); setSortDirection("desc"); }}>Last Edited (Newest)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        }
      />

      {filteredPages.length === 0 && filters.length === 0 && pages.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<FileText />}
            title="No pages yet"
            description="Create your first page to get started"
            action={
              <Link
                href={`${ROUTES.admin.pages}/new`}
                className="flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active"
              >
                <Plus className="size-3.5" />
                New Page
              </Link>
            }
          />
        </div>
      ) : (
        <>
        <div ref={tableRef} className="min-h-0 min-w-0 flex-1 overflow-auto">
          {selectedIds.size > 0 && (
            <div className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b border-border bg-surface py-2 pl-4 pr-5">
              <span className="text-sm font-medium text-foreground">
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="text-sm font-medium text-destructive hover:underline"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-sm font-medium text-muted-foreground hover:underline"
              >
                Clear selection
              </button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 pl-6 pr-4">
                  <ThinCheckbox
                    checked={selectedIds.size === filteredPages.length && filteredPages.length > 0}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                {visibleColumns.has("title") && (
                  <TableHead>
                    <button className="flex items-center gap-1" onClick={() => handleSort("title")}>
                      Page Title {sortField === "title" ? (sortDirection === "asc" ? <ArrowUp className="size-3 text-foreground" /> : <ArrowDown className="size-3 text-foreground" />) : <ArrowUpDown className="size-3 text-muted-foreground" />}
                    </button>
                  </TableHead>
                )}
                {visibleColumns.has("slug") && <TableHead>Slug</TableHead>}
                {visibleColumns.has("lastEdited") && (
                  <TableHead>
                    <button className="flex items-center gap-1" onClick={() => handleSort("updatedAt")}>
                      Last Edited {sortField === "updatedAt" ? (sortDirection === "asc" ? <ArrowUp className="size-3 text-foreground" /> : <ArrowDown className="size-3 text-foreground" />) : <ArrowUpDown className="size-3 text-muted-foreground" />}
                    </button>
                  </TableHead>
                )}
                {visibleColumns.has("status") && <TableHead>Status</TableHead>}
                {visibleColumns.has("created") && <TableHead>Created</TableHead>}
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="pl-6 pr-4">
                    <ThinCheckbox
                      checked={selectedIds.has(page.id)}
                      onChange={() => toggleSelect(page.id)}
                    />
                  </TableCell>
                  {visibleColumns.has("title") && (
                    <TableCell>
                      <Link
                        href={`${ROUTES.admin.pages}/${page.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {page.title}
                      </Link>
                    </TableCell>
                  )}
                  {visibleColumns.has("slug") && (
                    <TableCell className="text-muted-foreground">
                      /{page.slug}
                    </TableCell>
                  )}
                  {visibleColumns.has("lastEdited") && (
                    <TableCell className="text-muted-foreground">
                      {formatDate(page.updatedAt)}
                    </TableCell>
                  )}
                  {visibleColumns.has("status") && (
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <span className={`size-1.5 rounded-full ${page.status === "published" ? "bg-status-success-text" : "bg-status-warning-text"}`} />
                        {page.status === "published" ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.has("created") && (
                    <TableCell className="text-muted-foreground">
                      {formatDate(page.createdAt)}
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex size-7 items-center justify-center rounded-lg hover:bg-sidebar-accent/60">
                        <MoreHorizontal className="size-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48" align="end">
                        <DropdownMenuItem onClick={() => window.location.href = `${ROUTES.admin.pages}/${page.id}`}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(page)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(page)}>
                          {page.status === "published" ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(page)}
                          className="text-destructive hover:!text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filteredPages.length} {filteredPages.length === 1 ? "result" : "results"}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">Show</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="h-6 rounded-md border border-border bg-background px-1.5 text-sm text-foreground outline-none"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); tableRef.current?.scrollTo(0, 0); }}
                disabled={currentPage === 1}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent/60 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => { setCurrentPage(p as number); tableRef.current?.scrollTo(0, 0); }}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                        currentPage === p
                          ? "bg-foreground text-white"
                          : "text-muted-foreground hover:bg-sidebar-accent/60"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); tableRef.current?.scrollTo(0, 0); }}
                disabled={currentPage === totalPages}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent/60 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}
        </div>
        </>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <Dialog open={true} onOpenChange={(v) => !v && setDeleteTarget(null)}>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
