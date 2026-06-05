"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin-sdc-ui/dialog";
import { Button } from "@/components/admin-sdc-ui/button";
import { Label } from "@/components/admin-sdc-ui/label";
import type {
  ActiveFilter,
  FilterDefinition,
  FilterOperator,
} from "@/components/admin-sdc-ui/table-filters";
import {
  FILTER_PILL_BORDER_CLASS,
  USERS_FILTER_LABEL_CLASS,
} from "../users/users-filter-pills";

export { USERS_FILTER_LABEL_CLASS };

function daysAgoDateString(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function templateStatusSummary(f: ActiveFilter | undefined): string | null {
  if (!f || f.key !== "status") return null;
  const v = String(f.value);
  if (v === "active") return "Active";
  if (v === "draft") return "Draft";
  return v;
}

function lastEditedSummary(f: ActiveFilter | undefined): string | null {
  if (!f || f.key !== "updatedAt") return null;
  if (f.operator === "is_empty") return "Never edited";
  if (f.operator === "is_not_empty") return "Has been edited";
  if (f.operator === "after") {
    const d7 = daysAgoDateString(7);
    const d30 = daysAgoDateString(30);
    if (String(f.value) === d7) return "Last 7 days";
    if (String(f.value) === d30) return "Last 30 days";
    return `After ${f.value}`;
  }
  return "Last edited";
}

function createdBySummary(f: ActiveFilter | undefined): string | null {
  if (!f || f.key !== "createdBy") return null;
  return String(f.value);
}

const pillLabelClass = USERS_FILTER_LABEL_CLASS;

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none transition-colors focus:border-input focus:shadow-none focus:outline-none focus:ring-0 focus-visible:border-input focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0";

const radioRowClass =
  "flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 pl-0.5 text-sm text-foreground transition-colors hover:bg-muted/40";

const radioInputClass =
  "size-4 shrink-0 border-input text-foreground accent-foreground outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0";

function lastEditedSelectValue(
  f: ActiveFilter | undefined,
  d7: string,
  d30: string
): string {
  if (!f || f.key !== "updatedAt") return "";
  if (f.operator === "is_empty") return "never";
  if (f.operator === "is_not_empty") return "has_edited";
  if (f.operator === "after") {
    if (String(f.value) === d7) return "last_7_days";
    if (String(f.value) === d30) return "last_30_days";
  }
  return "";
}

interface EmailTemplatesFilterPillsProps {
  filters: ActiveFilter[];
  definitions: FilterDefinition[];
  upsertFilter: (
    key: string,
    operator?: FilterOperator,
    value?: string | string[]
  ) => void;
  removeFilterByKey: (key: string) => void;
  clearAll: () => void;
}

export function EmailTemplatesFilterPills({
  filters,
  definitions,
  upsertFilter,
  removeFilterByKey,
  clearAll,
}: EmailTemplatesFilterPillsProps) {
  const [open, setOpen] = useState(false);

  const statusDef = definitions.find(
    (d) => d.key === "status" && d.type === "select"
  );
  const createdByDef = definitions.find(
    (d) => d.key === "createdBy" && d.type === "select"
  );

  const statusFilter = filters.find((f) => f.key === "status");
  const updatedAtFilter = filters.find((f) => f.key === "updatedAt");
  const createdByFilter = filters.find((f) => f.key === "createdBy");

  const d7 = daysAgoDateString(7);
  const d30 = daysAgoDateString(30);

  const hasAnyFilter = filters.length > 0;

  const summaryParts = [
    templateStatusSummary(statusFilter),
    lastEditedSummary(updatedAtFilter),
    createdBySummary(createdByFilter),
  ].filter(Boolean) as string[];
  const summaryText = summaryParts.length > 0 ? summaryParts.join(" · ") : null;

  const statusSelection =
    statusFilter?.operator === "equals" && statusFilter.value
      ? String(statusFilter.value)
      : "";

  const createdBySelection =
    createdByFilter?.operator === "equals" && createdByFilter.value
      ? String(createdByFilter.value)
      : "";

  const lastEditedValue = lastEditedSelectValue(updatedAtFilter, d7, d30);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const el = document.activeElement;
      if (el instanceof HTMLElement) el.blur();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  function applyLastEdited(value: string) {
    if (value === "") {
      removeFilterByKey("updatedAt");
      return;
    }
    if (value === "last_7_days") {
      upsertFilter("updatedAt", "after", d7);
      return;
    }
    if (value === "last_30_days") {
      upsertFilter("updatedAt", "after", d30);
      return;
    }
    if (value === "never") {
      upsertFilter("updatedAt", "is_empty");
      return;
    }
    if (value === "has_edited") {
      upsertFilter("updatedAt", "is_not_empty");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className={cn(
          pillLabelClass,
          "inline-flex h-7 max-w-full items-stretch overflow-hidden rounded-full border text-foreground transition-colors",
          "bg-background hover:bg-sidebar-accent/60",
          hasAnyFilter
            ? cn("border", FILTER_PILL_BORDER_CLASS)
            : cn("border border-dashed", FILTER_PILL_BORDER_CLASS)
        )}
      >
        {hasAnyFilter ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            className={cn(
              "flex shrink-0 items-center justify-center border-r px-2 text-muted-foreground transition-colors hover:bg-muted/50",
              "outline-none ring-0 focus:outline-none focus-visible:ring-0",
              FILTER_PILL_BORDER_CLASS
            )}
            aria-label="Clear all filters"
          >
            <X className="size-2.5" strokeWidth={2.5} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex min-w-0 flex-1 items-center gap-2 px-3 text-left outline-none ring-0",
            "focus:outline-none focus-visible:outline-none focus-visible:ring-0",
            !hasAnyFilter && "gap-2"
          )}
          aria-label="Open filters"
        >
          {!hasAnyFilter ? (
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border text-muted-foreground",
                FILTER_PILL_BORDER_CLASS
              )}
            >
              <Plus className="size-2.5" strokeWidth={2.5} />
            </span>
          ) : null}
          <span className="min-w-0 truncate">
            Filters
            {summaryText ? (
              <>
                <span className="text-muted-foreground"> · </span>
                <span className="text-foreground">{summaryText}</span>
              </>
            ) : null}
          </span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen} contentClassName="max-w-md">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>

        <div className="max-h-[min(70vh,28rem)] overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <fieldset className="space-y-2 border-0 p-0 outline-none focus:outline-none">
              <legend className="mb-1 text-sm font-medium text-foreground">Status</legend>
              <div className="flex flex-col gap-0.5" role="radiogroup" aria-label="Template status">
                <label className={radioRowClass}>
                  <input
                    type="radio"
                    name="email-templates-filter-status"
                    className={radioInputClass}
                    checked={statusSelection === ""}
                    onChange={() => removeFilterByKey("status")}
                  />
                  <span>Any</span>
                </label>
                {statusDef?.options?.map((opt) => (
                  <label key={opt.value} className={radioRowClass}>
                    <input
                      type="radio"
                      name="email-templates-filter-status"
                      className={radioInputClass}
                      checked={statusSelection === opt.value}
                      onChange={() => upsertFilter("status", "equals", opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <Label htmlFor="email-templates-filter-last-edited" className="text-sm font-medium">
                Last edited
              </Label>
              <select
                id="email-templates-filter-last-edited"
                className={selectClass}
                value={lastEditedValue}
                onChange={(e) => applyLastEdited(e.target.value)}
              >
                <option value="">Any</option>
                <option value="last_7_days">Edited in the last 7 days</option>
                <option value="last_30_days">Edited in the last 30 days</option>
                <option value="never">Never edited</option>
                <option value="has_edited">Has been edited</option>
              </select>
            </div>

            <fieldset className="space-y-2 border-0 p-0 outline-none focus:outline-none">
              <legend className="mb-1 text-sm font-medium text-foreground">Created by</legend>
              <div className="flex flex-col gap-0.5" role="radiogroup" aria-label="Created by">
                <label className={radioRowClass}>
                  <input
                    type="radio"
                    name="email-templates-filter-created-by"
                    className={radioInputClass}
                    checked={createdBySelection === ""}
                    onChange={() => removeFilterByKey("createdBy")}
                  />
                  <span>Any</span>
                </label>
                {createdByDef?.options?.map((opt) => (
                  <label key={opt.value} className={radioRowClass}>
                    <input
                      type="radio"
                      name="email-templates-filter-created-by"
                      className={radioInputClass}
                      checked={createdBySelection === opt.value}
                      onChange={() => upsertFilter("createdBy", "equals", opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            size="sm"
            className="h-9 max-h-[40px] rounded-lg px-4 text-sm font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </Dialog>

      {hasAnyFilter && (
        <button
          type="button"
          onClick={clearAll}
          className="bg-transparent px-1 font-medium text-[14px] leading-none text-primary transition-colors hover:bg-transparent hover:text-[color-mix(in_srgb,var(--primary)_88%,black)]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
