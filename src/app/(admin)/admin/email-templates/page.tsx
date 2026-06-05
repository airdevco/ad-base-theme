"use client";

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Mail,
  MoreHorizontal,
  Plus,
  User,
} from "lucide-react";
import { ThinCheckbox } from "@/components/admin-sdc-ui/thin-checkbox";
import { cn } from "@/lib/utils";
import { mockEmailTemplates } from "@/mock";
import { AdminSdcPageHeader } from "@/components/layout/admin-sdc-page-header";
import { SdcHeaderLead } from "@/components/layout/admin-sdc-sidebar";
import { AdminSdcEmailTemplatesHeaderSearch } from "@/components/layout/admin-sdc-email-templates-header-search";
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
  useTableFilters,
  type FilterDefinition,
} from "@/components/admin-sdc-ui/table-filters";
import { EditColumnsMenu } from "@/components/admin-sdc-ui/edit-columns-menu";
import {
  EmailTemplatesFilterPills,
  USERS_FILTER_LABEL_CLASS,
} from "./email-templates-filter-pills";
import { EmailTemplateDialog } from "./email-template-dialog";
import { APP_NAME, ROUTES } from "@/lib/constants";

const templateStatusDotColors: Record<string, string> = {
  active: "bg-status-success-text",
  draft: "bg-muted-foreground",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function stripHtmlForSearch(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function templateMatchesSearch(
  t: (typeof mockEmailTemplates)[0] & { status?: string; createdBy?: string },
  q: string
): boolean {
  if (!q) return true;
  const blob = [
    t.name,
    t.subject,
    stripHtmlForSearch(t.body),
    stripHtmlForSearch(t.html),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes(q);
}

const EMAIL_TEMPLATE_FILTER_DEFINITIONS: FilterDefinition[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    icon: Activity,
    options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" },
    ],
  },
  {
    key: "updatedAt",
    label: "Last edited",
    type: "date",
    icon: Calendar,
  },
  {
    key: "createdBy",
    label: "Created by",
    type: "select",
    icon: User,
    options: [{ label: "Admin", value: "Admin" }],
  },
];

const EMAIL_TABLE_COLUMN_DEFS = [
  { key: "name", label: "Template Name" },
  { key: "subject", label: "Subject Line" },
  { key: "lastEdited", label: "Last Edited" },
  { key: "status", label: "Status" },
  { key: "createdBy", label: "Created By" },
] as const;

function EmailTemplatesPageInner() {
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();

  const [templates, setTemplates] = useState(mockEmailTemplates);
  const [templateDialog, setTemplateDialog] = useState<null | "new" | string>(null);
  const [deleteTarget, setDeleteTarget] = useState<typeof mockEmailTemplates[0] | null>(null);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const tableRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(["name", "subject", "lastEdited", "status", "createdBy"])
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    EMAIL_TABLE_COLUMN_DEFS.map((c) => c.key)
  );

  const orderedVisibleColumns = useMemo(
    () => columnOrder.filter((k) => visibleColumns.has(k)),
    [columnOrder, visibleColumns]
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
    upsertFilter,
    removeFilterByKey,
    clearAll,
    applyFilters,
  } = useTableFilters(EMAIL_TEMPLATE_FILTER_DEFINITIONS);

  useEffect(() => {
    document.title = `Email Templates | ${APP_NAME}`;
  }, []);

  const templatesWithMeta = useMemo(
    () =>
      templates.map((t, i) => ({
        ...t,
        status: (i % 3 === 0 ? "draft" : "active") as "active" | "draft",
        createdBy: "Admin",
      })),
    [templates]
  );

  const templatesAfterSearch = useMemo(() => {
    if (!searchQuery) return templatesWithMeta;
    return templatesWithMeta.filter((t) => templateMatchesSearch(t, searchQuery));
  }, [templatesWithMeta, searchQuery]);

  const filteredTemplates = useMemo(() => {
    let result = applyFilters(templatesAfterSearch);
    result = [...result].sort((a, b) => {
      let aVal: string, bVal: string;
      switch (sortField) {
        case "updatedAt":
          aVal = a.updatedAt;
          bVal = b.updatedAt;
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return result;
  }, [templatesAfterSearch, applyFilters, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredTemplates.length / perPage);
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredTemplates.slice(start, start + perPage);
  }, [filteredTemplates, currentPage, perPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortDirection, filters, searchQuery]);

  const handleSort = useCallback((field: string) => {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  const handleDuplicate = useCallback((template: typeof mockEmailTemplates[0]) => {
    const copy = {
      ...template,
      id: `tmpl_${Date.now()}`,
      name: `${template.name} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [copy, ...prev]);
    toast.success("Template duplicated");
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.name}" deleted`);
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
      if (prev.size === filteredTemplates.length) return new Set();
      return new Set(filteredTemplates.map((t) => t.id));
    });
  }, [filteredTemplates]);

  const handleBulkDelete = useCallback(() => {
    setTemplates((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    toast.success(`${selectedIds.size} templates deleted`);
    setSelectedIds(new Set());
  }, [selectedIds]);

  const dialogTemplate = useMemo(() => {
    if (templateDialog === null || templateDialog === "new") return null;
    return templates.find((t) => t.id === templateDialog) ?? null;
  }, [templateDialog, templates]);

  /** Matches row status dots in the table (draft every 3rd row). */
  const dialogTemplateStatus = useMemo((): "active" | "draft" => {
    if (templateDialog === null || templateDialog === "new") return "active";
    const i = templates.findIndex((t) => t.id === templateDialog);
    if (i < 0) return "active";
    return i % 3 === 0 ? "draft" : "active";
  }, [templateDialog, templates]);

  const closeTemplateDialog = useCallback(() => setTemplateDialog(null), []);

  const showDataTable = templates.length > 0 && filteredTemplates.length > 0;

  const emailToolbarRow = (
    <div className="flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <div className="min-w-0 w-full md:max-w-[min(100%,28rem)]">
        <AdminSdcEmailTemplatesHeaderSearch className="w-full" />
      </div>
      <div className="flex w-full min-w-0 flex-row items-center justify-between gap-2 sm:gap-3 md:flex-1 md:justify-end">
        <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] py-0.5 md:max-w-[min(100%,36rem)]">
          <div className="flex w-max max-w-none flex-nowrap items-center justify-start gap-2 md:ml-auto md:justify-end">
            <EmailTemplatesFilterPills
              definitions={EMAIL_TEMPLATE_FILTER_DEFINITIONS}
              filters={filters}
              upsertFilter={upsertFilter}
              removeFilterByKey={removeFilterByKey}
              clearAll={clearAll}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <EditColumnsMenu
            open={columnsMenuOpen}
            onOpenChange={setColumnsMenuOpen}
            columns={[...EMAIL_TABLE_COLUMN_DEFS]}
            columnOrder={columnOrder}
            onColumnOrderChange={setColumnOrder}
            visibleColumns={visibleColumns}
            onToggleColumn={toggleColumn}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <AdminSdcPageHeader
        title="Email Templates"
        sticky
        introBelowDivider={!showDataTable}
        breadcrumb={{ label: "Admin", href: ROUTES.admin.dashboard }}
        lead={<SdcHeaderLead />}
        actions={<AdminSdcPageHeaderActions />}
        introTitle="Email Templates"
        introDescription="Create and manage email templates for your product and campaigns"
        introBelow={emailToolbarRow}
        introTrailing={
          <button
            type="button"
            onClick={() => setTemplateDialog("new")}
            className="flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active"
          >
            <Plus className="size-3.5" />
            New Template
          </button>
        }
      />

      {templates.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<Mail />}
            title="No templates yet"
            description="Create your first email template to get started"
            action={
              <button
                type="button"
                onClick={() => setTemplateDialog("new")}
                className="flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active"
              >
                <Plus className="size-3.5" />
                New Template
              </button>
            }
          />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No templates match your search or filters.
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
                type="button"
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
          <Table className="border-separate border-spacing-0 [&_td]:text-foreground">
            <TableHeader
              className={cn(
                "border-b-0 [&_th]:sticky [&_th]:z-[15] [&_th]:bg-background [&_th]:border-b [&_th]:border-border",
                selectedIds.size === 0 && "[&_th]:border-t [&_th]:border-border [&_th]:top-0",
                selectedIds.size > 0 && "[&_th]:top-10"
              )}
            >
              <TableRow className="hover:bg-transparent">
                <TableHead className={cn(USERS_FILTER_LABEL_CLASS, "w-10 pl-2 pr-4")}>
                  <ThinCheckbox
                    checked={selectedIds.size === filteredTemplates.length && filteredTemplates.length > 0}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                {orderedVisibleColumns.map((colKey) => {
                  switch (colKey) {
                    case "name":
                      return (
                        <TableHead key={colKey} className={USERS_FILTER_LABEL_CLASS}>
                          <button
                            type="button"
                            className={cn(USERS_FILTER_LABEL_CLASS, "flex items-center gap-1 text-muted-foreground")}
                            onClick={() => handleSort("name")}
                          >
                            Template Name {sortField === "name" ? (sortDirection === "asc" ? <ArrowUp className="size-3 text-muted-foreground" /> : <ArrowDown className="size-3 text-muted-foreground" />) : <ArrowUpDown className="size-3 text-muted-foreground" />}
                          </button>
                        </TableHead>
                      );
                    case "subject":
                      return (
                        <TableHead key={colKey} className={USERS_FILTER_LABEL_CLASS}>
                          Subject Line
                        </TableHead>
                      );
                    case "lastEdited":
                      return (
                        <TableHead key={colKey} className={USERS_FILTER_LABEL_CLASS}>
                          <button
                            type="button"
                            className={cn(USERS_FILTER_LABEL_CLASS, "flex items-center gap-1 text-muted-foreground")}
                            onClick={() => handleSort("updatedAt")}
                          >
                            Last Edited {sortField === "updatedAt" ? (sortDirection === "asc" ? <ArrowUp className="size-3 text-muted-foreground" /> : <ArrowDown className="size-3 text-muted-foreground" />) : <ArrowUpDown className="size-3 text-muted-foreground" />}
                          </button>
                        </TableHead>
                      );
                    case "status":
                      return (
                        <TableHead key={colKey} className={USERS_FILTER_LABEL_CLASS}>
                          Status
                        </TableHead>
                      );
                    case "createdBy":
                      return (
                        <TableHead key={colKey} className={USERS_FILTER_LABEL_CLASS}>
                          Created By
                        </TableHead>
                      );
                    default:
                      return null;
                  }
                })}
                <TableHead className={cn(USERS_FILTER_LABEL_CLASS, "w-12")} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="pl-2 pr-4 text-foreground">
                    <ThinCheckbox
                      checked={selectedIds.has(template.id)}
                      onChange={() => toggleSelect(template.id)}
                    />
                  </TableCell>
                  {orderedVisibleColumns.map((colKey) => {
                    switch (colKey) {
                      case "name":
                        return (
                          <TableCell key={colKey} className="text-foreground">
                            <button
                              type="button"
                              onClick={() => setTemplateDialog(template.id)}
                              className="font-medium text-foreground hover:underline"
                            >
                              {template.name}
                            </button>
                          </TableCell>
                        );
                      case "subject":
                        return <TableCell key={colKey} className="text-foreground">{template.subject}</TableCell>;
                      case "lastEdited":
                        return (
                          <TableCell key={colKey} className="text-foreground">
                            {formatDate(template.updatedAt)}
                          </TableCell>
                        );
                      case "status":
                        return (
                          <TableCell key={colKey} className="text-foreground">
                            <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                              <span
                                className={`size-1.5 rounded-full ${templateStatusDotColors[template.status] ?? "bg-muted-foreground"}`}
                              />
                              {template.status === "draft" ? "Draft" : "Active"}
                            </span>
                          </TableCell>
                        );
                      case "createdBy":
                        return (
                          <TableCell key={colKey} className="text-sm text-foreground">
                            {template.createdBy}
                          </TableCell>
                        );
                      default:
                        return null;
                    }
                  })}
                  <TableCell className="text-foreground">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex size-7 items-center justify-center rounded-lg text-foreground hover:bg-sidebar-accent/60">
                        <MoreHorizontal className="size-4 text-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-max min-w-[7.7rem]" align="end">
                        <DropdownMenuItem onClick={() => setTemplateDialog(template.id)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(template)}
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

        {totalPages > 1 && (
          <div className="flex shrink-0 items-center justify-between border-t border-border py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {filteredTemplates.length} {filteredTemplates.length === 1 ? "result" : "results"}
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
          </div>
        )}
        </>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <Dialog
          open={true}
          onOpenChange={(v) => !v && setDeleteTarget(null)}
          contentClassName="max-w-xs"
        >
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="h-9 max-h-[40px] rounded-lg px-4 text-sm font-medium"
            >
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {templateDialog !== null && (
        <EmailTemplateDialog
          key={templateDialog}
          open
          templateId={templateDialog}
          initialTemplate={dialogTemplate}
          initialStatus={dialogTemplateStatus}
          onClose={closeTemplateDialog}
          onCreated={(created) => setTemplates((prev) => [created, ...prev])}
          onUpdated={(updated) =>
            setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
          }
          onDeleted={(id) => setTemplates((prev) => prev.filter((t) => t.id !== id))}
        />
      )}
    </div>
  );
}

export default function EmailTemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-1 animate-pulse rounded-lg bg-muted/20" />
      }
    >
      <EmailTemplatesPageInner />
    </Suspense>
  );
}
