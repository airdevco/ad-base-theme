"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Eye, Pencil } from "lucide-react";
import type { LegalPage } from "@/types";
import { Button } from "@/components/admin-sdc-ui/button";
import { Input } from "@/components/admin-sdc-ui/input";
import { Label } from "@/components/admin-sdc-ui/label";
import { Skeleton } from "@/components/admin-sdc-ui/skeleton";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin-sdc-ui/dialog";
import { cn } from "@/lib/utils";

const RichTextEditor = dynamic(
  () =>
    import("@/components/admin-sdc-ui/rich-text-editor").then((m) => ({
      default: m.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[min(70vh,560px)] w-full rounded-lg" />,
  }
);

const LOCKED_LEGAL_IDS = new Set(["page_01", "page_02"]);

export function isLockedLegalPage(page: LegalPage) {
  return LOCKED_LEGAL_IDS.has(page.id);
}

type LegalPageEditDialogProps = {
  open: boolean;
  onClose: () => void;
  page: LegalPage | null;
  onSave: (updated: LegalPage) => void;
};

export function LegalPageEditDialog({ open, onClose, page, onSave }: LegalPageEditDialogProps) {
  const [title, setTitle] = useState(() => page?.title ?? "");
  const [slug, setSlug] = useState(() => page?.slug ?? "");
  const [content, setContent] = useState(() => page?.content ?? "");
  const [status, setStatus] = useState<"published" | "draft">(
    () => page?.status ?? "draft"
  );
  const [isPreview, setIsPreview] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const initialValues = useRef({
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    content: page?.content ?? "",
    status: (page?.status ?? "draft") as "published" | "draft",
  });

  const locked = page ? isLockedLegalPage(page) : false;

  const resetFromPage = useCallback(() => {
    if (!page) return;
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setStatus(page.status);
    initialValues.current = {
      title: page.title,
      slug: page.slug,
      content: page.content,
      status: page.status,
    };
    setIsPreview(false);
  }, [page]);

  useLayoutEffect(() => {
    if (!open || !page) return;
    resetFromPage();
  }, [open, page?.id, page?.updatedAt, resetFromPage]);

  const isDirty = useMemo(() => {
    return (
      title !== initialValues.current.title ||
      slug !== initialValues.current.slug ||
      content !== initialValues.current.content ||
      status !== initialValues.current.status
    );
  }, [title, slug, content, status]);

  useEffect(() => {
    if (!open || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [open, isDirty]);

  const requestClose = useCallback(() => {
    if (isDirty) setShowDiscardDialog(true);
    else onClose();
  }, [isDirty, onClose]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) requestClose();
    },
    [requestClose]
  );

  const handleDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (!page) return;
    if (!title.trim()) {
      toast.error("Please enter a page title");
      return;
    }
    if (!slug.trim()) {
      toast.error("Please enter a URL slug");
      return;
    }

    const now = new Date().toISOString();
    const updated: LegalPage = {
      ...page,
      title: title.trim(),
      slug: locked ? page.slug : slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      content,
      status,
      updatedAt: now,
    };
    initialValues.current = {
      title: updated.title,
      slug: updated.slug,
      content: updated.content,
      status: updated.status,
    };
    onSave(updated);
    toast.success("Page saved");
    onClose();
  }, [page, title, slug, content, status, locked, onSave, onClose]);

  if (!page) return null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        contentClassName="flex min-h-0 max-h-[min(96vh,1200px)] max-w-5xl flex-col"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title || page.title}</DialogTitle>
          <DialogDescription>
            {locked
              ? "This legal page cannot be deleted. Edit the title and body below."
              : "Edit page content and publishing status."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="grid shrink-0 gap-5 px-6 pb-4 pt-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="legal-page-title">Page title</Label>
                <Input
                  id="legal-page-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="legal-page-slug">URL slug</Label>
                <Input
                  id="legal-page-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={locked}
                  className="h-9 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Label>Status</Label>
                <div className="flex items-center rounded-lg border border-border p-0.5">
                  <button
                    type="button"
                    onClick={() => setStatus("draft")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[14px] font-medium leading-none transition-colors",
                      status === "draft"
                        ? "bg-sidebar-accent/60 text-foreground"
                        : "text-muted-foreground hover:bg-transparent hover:text-black dark:hover:text-foreground"
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("published")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[14px] font-medium leading-none transition-colors",
                      status === "published"
                        ? "bg-sidebar-accent/60 text-foreground"
                        : "text-muted-foreground hover:bg-transparent hover:text-black dark:hover:text-foreground"
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-status-success-text" />
                    Published
                  </button>
                </div>
              </div>
              <div className="flex items-center rounded-lg border border-border p-0.5">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[14px] font-medium leading-none transition-colors",
                    !isPreview
                      ? "bg-sidebar-accent/60 text-foreground"
                      : "text-muted-foreground hover:bg-transparent hover:text-black dark:hover:text-foreground"
                  )}
                >
                  <Pencil className="size-3" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[14px] font-medium leading-none transition-colors",
                    isPreview
                      ? "bg-sidebar-accent/60 text-foreground"
                      : "text-muted-foreground hover:bg-transparent hover:text-black dark:hover:text-foreground"
                  )}
                >
                  <Eye className="size-3" />
                  Preview
                </button>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-4">
            {isPreview ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none px-4 py-4"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              </div>
            ) : (
              <RichTextEditor
                key={`${page.id}-${page.updatedAt}`}
                content={content}
                onChange={setContent}
                fillContainer
              />
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-9 items-center" />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={requestClose}
              className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSubmit} className="h-9 max-h-[40px] rounded-lg px-4">
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </Dialog>

      {showDiscardDialog && (
        <Dialog
          open
          onOpenChange={(v) => !v && setShowDiscardDialog(false)}
          stackClassName="z-[60]"
        >
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDiscardDialog(false)}
              className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            >
              Keep Editing
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={handleDiscard} className="h-9 max-h-[40px] rounded-lg px-4">
              Discard Changes
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </>
  );
}
