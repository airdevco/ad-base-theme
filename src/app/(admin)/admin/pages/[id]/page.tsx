"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { mockLegalPages } from "@/mock/legal";
import { AdminSdcPageHeader } from "@/components/layout/admin-sdc-page-header";
import { SdcHeaderLead } from "@/components/layout/admin-sdc-sidebar";
import { Button } from "@/components/admin-sdc-ui/button";
import { Input } from "@/components/admin-sdc-ui/input";
import { Label } from "@/components/admin-sdc-ui/label";
import { EmptyState } from "@/components/admin-sdc-ui/empty-state";
import { Skeleton } from "@/components/admin-sdc-ui/skeleton";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin-sdc-ui/dialog";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FileX, Eye, Pencil, Trash2 } from "lucide-react";

const RichTextEditor = dynamic(
  () =>
    import("@/components/admin-sdc-ui/rich-text-editor").then((m) => ({
      default: m.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[500px] w-full rounded-2xl" />,
  }
);

export default function PageEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";

  const page = isNew
    ? null
    : mockLegalPages.find((p) => p.id === params.id);

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [content, setContent] = useState(page?.content ?? "");
  const [status, setStatus] = useState<"published" | "draft">(page?.status ?? "draft");
  const [isPreview, setIsPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const pendingNavigation = useRef<string | null>(null);

  // Track initial values for dirty checking
  const initialValues = useRef({
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    content: page?.content ?? "",
    status: page?.status ?? "draft",
  });

  const isDirty = useMemo(() => {
    return (
      title !== initialValues.current.title ||
      slug !== initialValues.current.slug ||
      content !== initialValues.current.content ||
      status !== initialValues.current.status
    );
  }, [title, slug, content, status]);

  // Warn on browser close/refresh with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const navigateAway = useCallback(
    (href: string) => {
      if (isDirty) {
        pendingNavigation.current = href;
        setShowDiscardDialog(true);
      } else {
        router.push(href);
      }
    },
    [isDirty, router]
  );

  const handleDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    if (pendingNavigation.current) {
      router.push(pendingNavigation.current);
      pendingNavigation.current = null;
    }
  }, [router]);

  useEffect(() => {
    document.title = isNew
      ? `New Page | ${APP_NAME}`
      : `${page?.title ?? "Page"} | ${APP_NAME}`;
  }, [isNew, page?.title]);

  // Auto-generate slug from title for new pages
  useEffect(() => {
    if (isNew && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [isNew, title]);

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      toast.error("Please enter a page title");
      return;
    }

    // Reset dirty state after save
    initialValues.current = { title, slug, content, status };

    if (isNew) {
      toast.success("Page created");
      router.push(ROUTES.admin.pages);
    } else {
      toast.success("Page saved");
    }
  }, [title, slug, content, status, isNew, router]);

  const handleDelete = useCallback(() => {
    toast.success(`"${title || page?.title}" deleted`);
    router.push(ROUTES.admin.pages);
  }, [title, page?.title, router]);

  // Not found (only for edit mode)
  if (!isNew && !page) {
    return (
      <div className="flex flex-col">
        <AdminSdcPageHeader title="Page Not Found" lead={<SdcHeaderLead />} />
        <div className="py-12">
          <EmptyState
            icon={<FileX />}
            title="Page not found"
            description="The page you're looking for doesn't exist."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Top bar with title + Save/Cancel in actions */}
      <AdminSdcPageHeader
        title={isNew ? "New Page" : title || page!.title}
        breadcrumb={{ label: "Pages", href: ROUTES.admin.pages }}
        lead={<SdcHeaderLead />}
        sticky
        actions={
          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex size-[26px] items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-red-50 hover:border-red-200 hover:text-destructive"
                title="Delete page"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
            <button
              onClick={() => navigateAway(ROUTES.admin.pages)}
              className="flex h-[26px] items-center rounded-md border border-border px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex h-[26px] items-center rounded-md bg-primary px-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active"
            >
              {isNew ? "Create Page" : "Save Changes"}
            </button>
          </div>
        }
      />

      <div
        className={cn(
          "py-5",
          isNew &&
            "w-full lg:max-w-4xl lg:pr-10 xl:pr-14 2xl:pr-20"
        )}
      >
        {/* Form fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-title" className="text-xs font-medium text-muted-foreground">
              Page title
            </Label>
            <Input
              id="page-title"
              placeholder="e.g. Terms of Use"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 rounded-lg border-border text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-slug" className="text-xs font-medium text-muted-foreground">
              URL slug
            </Label>
            <Input
              id="page-slug"
              placeholder="e.g. terms-of-use"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-9 rounded-lg border-border text-sm"
            />
          </div>
        </div>

        {/* Status + Edit/Preview toggle */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Status
            </Label>
            <div className="flex items-center rounded-lg border border-border p-0.5">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  status === "draft"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="size-1.5 rounded-full bg-status-warning-text" />
                Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus("published")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  status === "published"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
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
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                !isPreview
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pencil className="size-3" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                isPreview
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="size-3" />
              Preview
            </button>
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="mt-3">
          {isPreview ? (
            <div className="rounded-xl border border-border">
              <div
                className="prose prose-sm max-w-none px-4 py-4"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          ) : (
            <RichTextEditor
              content={content}
              onChange={setContent}
            />
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <Dialog open={true} onOpenChange={(v) => !v && setShowDeleteDialog(false)}>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{title || page?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Discard changes dialog */}
      {showDiscardDialog && (
        <Dialog open={true} onOpenChange={(v) => !v && setShowDiscardDialog(false)}>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDiscardDialog(false)}>
              Keep Editing
            </Button>
            <Button variant="destructive" onClick={handleDiscard}>
              Discard Changes
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
