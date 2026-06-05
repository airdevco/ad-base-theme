"use client";

import { useEffect, useLayoutEffect, useMemo, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { EmailTemplate } from "@/types";
import { Button } from "@/components/admin-sdc-ui/button";
import { Input } from "@/components/admin-sdc-ui/input";
import { Label } from "@/components/admin-sdc-ui/label";
import { Badge } from "@/components/admin-sdc-ui/badge";
import { Skeleton } from "@/components/admin-sdc-ui/skeleton";
import { MergeTermInput } from "@/components/admin-sdc-ui/merge-term-input";
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
    loading: () => <Skeleton className="h-[320px] w-full rounded-lg" />,
  }
);

const sampleValues: Record<string, string> = {
  first_name: "Jane",
  last_name: "Smith",
  email: "jane@example.com",
  company_name: "Acme Inc",
  reset_link: "https://example.com/reset/abc123",
  invoice_number: "INV-2026-001",
  amount: "$49.00",
  due_date: "April 15, 2026",
  month: "March",
  year: "2026",
};

function substituteVariables(html: string): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return sampleValues[key] ?? `{{${key}}}`;
  });
}

function extractTermsFromContent(subject: string, body: string): string[] {
  const terms = new Set<string>();

  const subjectMatches = subject.matchAll(/@(\w+(?:_\w+)*)/g);
  for (const match of subjectMatches) {
    terms.add(match[1]);
  }

  const bodyMatches = body.matchAll(/\{\{(\w+(?:_\w+)*)\}\}/g);
  for (const match of bodyMatches) {
    terms.add(match[1]);
  }

  const bodyText = body.replace(/<[^>]*>/g, "");
  const bodyTextMatches = bodyText.matchAll(/@(\w+(?:_\w+)*)/g);
  for (const match of bodyTextMatches) {
    terms.add(match[1]);
  }

  return Array.from(terms);
}

export type EmailTemplateDialogProps = {
  open: boolean;
  onClose: () => void;
  /** `"new"` or an existing template id */
  templateId: string;
  /** When editing, the template from parent state */
  initialTemplate?: EmailTemplate | null;
  /** Row status (matches table draft/active); defaults to active */
  initialStatus?: "active" | "draft";
  onCreated?: (template: EmailTemplate) => void;
  onUpdated?: (template: EmailTemplate) => void;
  onDeleted?: (templateId: string) => void;
};

export function EmailTemplateDialog({
  open,
  onClose,
  templateId,
  initialTemplate,
  initialStatus: initialStatusProp = "active",
  onCreated,
  onUpdated,
  onDeleted,
}: EmailTemplateDialogProps) {
  const isNew = templateId === "new";
  const template = isNew ? null : initialTemplate ?? null;

  /** Match pre-dialog full page: `useState(template?.name ?? "")` so TipTap gets real HTML on first paint. */
  const [name, setName] = useState(() => (isNew || !initialTemplate ? "" : initialTemplate.name));
  const [subject, setSubject] = useState(() =>
    isNew || !initialTemplate ? "" : initialTemplate.subject
  );
  const [body, setBody] = useState(() => (isNew || !initialTemplate ? "" : initialTemplate.body));
  const [status, setStatus] = useState<"active" | "draft">(() =>
    isNew ? "active" : initialStatusProp
  );
  const [isPreview, setIsPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [customTerms, setCustomTerms] = useState<string[]>([]);

  const initialValues = useRef({
    name: isNew || !initialTemplate ? "" : initialTemplate.name,
    subject: isNew || !initialTemplate ? "" : initialTemplate.subject,
    body: isNew || !initialTemplate ? "" : initialTemplate.body,
    status: (isNew ? "active" : initialStatusProp) as "active" | "draft",
  });

  const resetFromTemplate = useCallback(() => {
    if (isNew || !initialTemplate) {
      setName("");
      setSubject("");
      setBody("");
      setStatus("active");
      initialValues.current = { name: "", subject: "", body: "", status: "active" };
    } else {
      const s = initialStatusProp;
      setName(initialTemplate.name);
      setSubject(initialTemplate.subject);
      setBody(initialTemplate.body);
      setStatus(s);
      initialValues.current = {
        name: initialTemplate.name,
        subject: initialTemplate.subject,
        body: initialTemplate.body,
        status: s,
      };
    }
    setIsPreview(false);
    setCustomTerms([]);
  }, [isNew, initialTemplate, initialStatusProp]);

  useLayoutEffect(() => {
    if (!open) return;
    resetFromTemplate();
  }, [open, templateId, initialTemplate?.id, initialTemplate?.updatedAt, initialStatusProp, resetFromTemplate]);

  const isDirty = useMemo(() => {
    return (
      name !== initialValues.current.name ||
      subject !== initialValues.current.subject ||
      body !== initialValues.current.body ||
      status !== initialValues.current.status
    );
  }, [name, subject, body, status]);

  useEffect(() => {
    if (!open || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [open, isDirty]);

  const defaultTerms = useMemo(
    () => template?.mergeTerms ?? ["first_name", "last_name", "email", "company_name"],
    [template?.mergeTerms]
  );

  const handleNewVariable = useCallback((term: string) => {
    setCustomTerms((prev) => (prev.includes(term) ? prev : [...prev, term]));
  }, []);

  const mergeTerms = useMemo(() => {
    const extracted = extractTermsFromContent(subject, body);
    const all = new Set([...defaultTerms, ...customTerms, ...extracted]);
    return Array.from(all);
  }, [defaultTerms, customTerms, subject, body]);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
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
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const now = new Date().toISOString();

    if (isNew) {
      const created: EmailTemplate = {
        id: `tmpl_${Date.now()}`,
        name: name.trim(),
        subject,
        body,
        mergeTerms,
        html: "",
        updatedAt: now,
        createdAt: now,
      };
      initialValues.current = { name, subject, body, status };
      onCreated?.(created);
      toast.success("Template created");
      onClose();
      return;
    }

    if (!template) return;

    const updated: EmailTemplate = {
      ...template,
      name: name.trim(),
      subject,
      body,
      mergeTerms,
      updatedAt: now,
    };
    initialValues.current = { name, subject, body, status };
    onUpdated?.(updated);
    toast.success("Template saved");
    onClose();
  }, [name, subject, body, status, isNew, template, mergeTerms, onCreated, onUpdated, onClose]);

  const handleDelete = useCallback(() => {
    if (!template) return;
    toast.success(`"${name || template.name}" deleted`);
    setShowDeleteDialog(false);
    onDeleted?.(template.id);
    onClose();
  }, [name, template, onDeleted, onClose]);

  const title = isNew ? "New Template" : name || template?.name || "Edit Template";

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        contentClassName="flex min-h-0 max-h-[min(90vh,900px)] max-w-4xl flex-col"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isNew
              ? "Create a reusable email template with merge terms for personalization."
              : `Edit the "${template?.name}" template and its variables.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="grid shrink-0 gap-5 px-6 pb-4 pt-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="template-name">Template name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g. Welcome Email"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="template-subject">Subject line</Label>
                <MergeTermInput
                  id="template-subject"
                  placeholder="e.g. Welcome to @company_name"
                  value={subject}
                  onChange={setSubject}
                  knownTerms={mergeTerms}
                  onNewTerm={handleNewVariable}
                  className="h-9"
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
                  onClick={() => setStatus("active")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[14px] font-medium leading-none transition-colors",
                    status === "active"
                      ? "bg-sidebar-accent/60 text-foreground"
                      : "text-muted-foreground hover:bg-transparent hover:text-black dark:hover:text-foreground"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-status-success-text" />
                  Active
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

          {!isPreview && (
            <div className="flex shrink-0 flex-wrap items-center gap-1.5 px-6 pb-3">
              <span className="text-sm font-medium text-foreground">Available merge terms:</span>
              {mergeTerms.map((term) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  @{term}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-4">
            {isPreview ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border">
                <div className="shrink-0 border-b border-border px-4 py-2.5">
                  <p className="text-sm text-muted-foreground">
                    Subject:{" "}
                    <span className="font-medium text-foreground">
                      {substituteVariables(subject)}
                    </span>
                  </p>
                </div>
                <div
                  className="prose prose-sm max-w-none min-h-0 flex-1 overflow-y-auto px-4 py-4"
                  dangerouslySetInnerHTML={{
                    __html: substituteVariables(body),
                  }}
                />
              </div>
            ) : (
              <RichTextEditor
                key={`${templateId}-${initialTemplate?.id ?? "new"}-${initialTemplate?.updatedAt ?? ""}`}
                content={body}
                onChange={setBody}
                availableVariables={mergeTerms}
                onNewVariable={handleNewVariable}
                fillContainer
              />
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-9 items-center">
            {!isNew && template && (
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-red-50 hover:border-red-200 hover:text-destructive"
                title="Delete template"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
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
              {isNew ? "Create Template" : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>

      {showDeleteDialog && (
        <Dialog
          open
          onOpenChange={(v) => !v && setShowDeleteDialog(false)}
          stackClassName="z-[60]"
        >
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{name || template?.name}&rdquo;? This action cannot be undone.
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
    </>
  );
}
