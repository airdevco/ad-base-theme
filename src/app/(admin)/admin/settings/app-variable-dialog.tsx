"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { AppVariable, AppVariableValueKind } from "@/types/app-variable";
import { Button } from "@/components/admin-sdc-ui/button";
import { Input } from "@/components/admin-sdc-ui/input";
import { Label } from "@/components/admin-sdc-ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin-sdc-ui/dialog";
import { cn } from "@/lib/utils";

/** Softer than body text so placeholders read as hints, not values. */
const placeholderHintClass = "placeholder:text-muted-foreground/50";

type AppVariableDialogProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  variable: AppVariable | null;
  onSave: (v: AppVariable) => void;
  onDelete?: (id: string) => void;
};

const radioRowClass =
  "flex cursor-pointer items-center gap-2 text-sm text-foreground";

const radioInputClass =
  "size-4 shrink-0 border-input text-foreground accent-foreground outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0";

function slugKeyFromLabel(label: string): string {
  const s = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return s || "variable";
}

function normalizePicklistValue(s: string): string {
  return s
    .split(/[\n,]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .join(", ");
}

const emptyCreate = (): Omit<AppVariable, "id" | "key"> & { key?: string } => ({
  label: "",
  description: "",
  category: "",
  valueKind: "input",
  value: "",
});

export function AppVariableDialog({
  open,
  onClose,
  mode,
  variable,
  onSave,
  onDelete,
}: AppVariableDialogProps) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [valueKind, setValueKind] = useState<AppVariableValueKind>("input");
  const [value, setValue] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && variable) {
      setLabel(variable.label);
      setDescription(variable.description ?? "");
      setCategory(variable.category);
      setValueKind(variable.valueKind);
      setValue(variable.value);
    } else {
      const e = emptyCreate();
      setLabel(e.label);
      setDescription(e.description ?? "");
      setCategory(e.category);
      setValueKind(e.valueKind);
      setValue(e.value);
    }
    setShowDeleteConfirm(false);
  }, [open, mode, variable]);

  const handleSubmit = useCallback(() => {
    if (mode === "create") {
      const name = label.trim();
      if (!name) {
        toast.error("Please enter a name");
        return;
      }
      const key = slugKeyFromLabel(name);
      const nextValue =
        valueKind === "picklist" ? normalizePicklistValue(value) : value.trim();
      if (valueKind === "picklist" && !nextValue) {
        toast.error("Add at least one list value");
        return;
      }
      if (valueKind === "input" && nextValue === "") {
        toast.error("Enter a value");
        return;
      }

      const next: AppVariable = {
        id: `var_${Date.now()}`,
        key,
        label: name,
        description: description.trim() || undefined,
        category: category.trim() || "General",
        valueKind,
        value: nextValue,
      };
      onSave(next);
      toast.success("Variable created");
      onClose();
      return;
    }

    if (mode === "edit" && variable) {
      const nextValue =
        variable.valueKind === "picklist"
          ? normalizePicklistValue(value)
          : value.trim();
      if (variable.valueKind === "picklist" && !nextValue) {
        toast.error("Add at least one list value");
        return;
      }
      if (variable.valueKind === "input" && nextValue === "") {
        toast.error("Enter a value");
        return;
      }

      const next: AppVariable = {
        ...variable,
        value: nextValue,
      };
      onSave(next);
      toast.success("Saved");
      onClose();
    }
  }, [mode, variable, label, description, category, valueKind, value, onSave, onClose]);

  const handleDelete = useCallback(() => {
    if (!variable || !onDelete) return;
    onDelete(variable.id);
    toast.success("Variable deleted");
    setShowDeleteConfirm(false);
    onClose();
  }, [variable, onDelete, onClose]);

  const editTitle = mode === "edit" && variable ? `Edit ${variable.label}` : "Add app variable";

  const valueLabel =
    mode === "edit" && variable
      ? variable.valueKind === "picklist"
        ? "Values"
        : variable.key === "default_currency"
          ? "Currency code"
          : variable.key === "platform_fee_percent"
            ? "Percentage"
            : "Value"
      : valueKind === "picklist"
        ? "Values"
        : "Value";

  const valuePlaceholder =
    mode === "edit" && variable
      ? variable.valueKind === "picklist"
        ? "design, engineering, sales…"
        : variable.key === "default_currency"
          ? "USD"
          : "Enter value"
      : valueKind === "picklist"
        ? "Comma-separated or one per line"
        : "e.g. 5 or USD";

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()} contentClassName="max-w-md">
        <DialogHeader>
          <DialogTitle>{editTitle}</DialogTitle>
          {mode === "edit" && variable ? (
            <DialogDescription className="text-left">
              {variable.description?.trim() ? (
                variable.description
              ) : (
                <span className="text-muted-foreground">No description.</span>
              )}
            </DialogDescription>
          ) : (
            <DialogDescription className="text-left">
              Add a name, choose one value or a list, then set what to store.
            </DialogDescription>
          )}
        </DialogHeader>

        {mode === "create" ? (
          <div className="grid gap-4 px-6 pb-2 pt-0">
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-var-name">Name</Label>
              <Input
                id="app-var-name"
                placeholder="e.g. Platform fee"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={cn("h-9", placeholderHintClass)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-var-desc">Description</Label>
              <textarea
                id="app-var-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(
                  "min-h-[60px] w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-[border-color] focus-visible:border-primary",
                  placeholderHintClass
                )}
                placeholder="What this variable is for"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-var-category">Category</Label>
              <Input
                id="app-var-category"
                placeholder="e.g. Fee"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={cn("h-9", placeholderHintClass)}
              />
            </div>
            <div className="flex flex-row flex-wrap items-center gap-x-6 gap-y-2">
              <span className="text-sm font-medium text-foreground" id="app-var-value-type-label">
                Value type
              </span>
              <div
                className="flex flex-row flex-wrap items-center gap-6"
                role="radiogroup"
                aria-labelledby="app-var-value-type-label"
              >
                <label className={radioRowClass}>
                  <input
                    type="radio"
                    name="app-var-kind"
                    className={radioInputClass}
                    checked={valueKind === "input"}
                    onChange={() => setValueKind("input")}
                  />
                  <span>Single value (input)</span>
                </label>
                <label className={radioRowClass}>
                  <input
                    type="radio"
                    name="app-var-kind"
                    className={radioInputClass}
                    checked={valueKind === "picklist"}
                    onChange={() => setValueKind("picklist")}
                  />
                  <span>Picklist (value list)</span>
                </label>
              </div>
            </div>
            {valueKind === "input" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="app-var-value-single">Value</Label>
                <Input
                  id="app-var-value-single"
                  placeholder="e.g. 5"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={cn("h-9", placeholderHintClass)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="app-var-value-list">Value list</Label>
                <textarea
                  id="app-var-value-list"
                  rows={3}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={cn(
                    "min-h-[5rem] max-h-48 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm leading-snug text-foreground outline-none transition-[border-color] focus-visible:border-primary",
                    placeholderHintClass
                  )}
                  placeholder={"Comma-separated or one per line\ne.g. design, engineering, sales"}
                />
                <p className="text-xs text-muted-foreground">Separate with commas or new lines.</p>
              </div>
            )}
          </div>
        ) : (
          variable && (
            <div className="grid gap-4 px-6 pb-2 pt-0">
              {variable.valueKind === "input" ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="app-var-edit-value">{valueLabel}</Label>
                  <Input
                    id="app-var-edit-value"
                    placeholder={valuePlaceholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={cn(
                      "h-9 min-h-9 max-h-9 shrink-0 py-0 leading-normal",
                      placeholderHintClass
                    )}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="app-var-edit-list">{valueLabel}</Label>
                  <textarea
                    id="app-var-edit-list"
                    rows={3}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={cn(
                      "min-h-[4.5rem] max-h-48 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm leading-snug text-foreground outline-none transition-[border-color] focus-visible:border-primary",
                      placeholderHintClass
                    )}
                    placeholder={valuePlaceholder}
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated or one per line.</p>
                </div>
              )}
            </div>
          )
        )}

        <DialogFooter className="gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-9 items-center">
            {mode === "edit" && variable && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
                title="Delete variable"
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
              onClick={onClose}
              className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-background hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              className="h-9 max-h-[40px] rounded-lg px-4 hover:bg-primary"
            >
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>

      {showDeleteConfirm && variable && (
        <Dialog
          open
          onOpenChange={(v) => !v && setShowDeleteConfirm(false)}
          contentClassName="max-w-xs"
          stackClassName="z-[60]"
        >
          <DialogHeader>
            <DialogTitle>Delete variable</DialogTitle>
            <DialogDescription>
              Delete &ldquo;{variable.label}&rdquo;? Apps referencing this key may break.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-background hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="h-9 max-h-[40px] rounded-lg px-4 hover:bg-destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </>
  );
}
