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

function daysAgoDateString(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function roleSummary(f: ActiveFilter | undefined): string | null {
  if (!f || f.key !== "role") return null;
  const v = String(f.value);
  if (v === "admin") return "Admin";
  if (v === "member") return "Member";
  return v;
}

function statusSummary(f: ActiveFilter | undefined): string | null {
  if (!f || f.key !== "status") return null;
  const v = String(f.value);
  if (v === "active") return "Active";
  if (v === "inactive") return "Inactive";
  if (v === "pending") return "Pending";
  return v;
}

function lastLoginSummary(f: ActiveFilter | undefined): string | null {
  if (!f || f.key !== "lastLoginAt") return null;
  if (f.operator === "is_empty") return "Never logged in";
  if (f.operator === "is_not_empty") return "Has logged in";
  if (f.operator === "after") {
    const d7 = daysAgoDateString(7);
    const d30 = daysAgoDateString(30);
    if (String(f.value) === d7) return "Last 7 days";
    if (String(f.value) === d30) return "Last 30 days";
    return `After ${f.value}`;
  }
  return "Last login";
}

/** Matches table column header typography on the users page. */
export const USERS_FILTER_LABEL_CLASS =
  "text-[12px] font-semibold leading-none tracking-normal";

/** Slightly darker than `--border` so filter pills read clearly on admin-sdc. */
export const FILTER_PILL_BORDER_CLASS = "border-border";

const pillLabelClass = USERS_FILTER_LABEL_CLASS;

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none transition-colors focus:border-input focus:shadow-none focus:outline-none focus:ring-0 focus-visible:border-input focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0";

const radioRowClass =
  "flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 pl-0.5 text-sm text-foreground transition-colors hover:bg-muted/40";

const radioInputClass =
  "size-4 shrink-0 border-input text-foreground accent-foreground outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0";

function lastActiveSelectValue(
  f: ActiveFilter | undefined,
  d7: string,
  d30: string
): string {
  if (!f || f.key !== "lastLoginAt") return "";
  if (f.operator === "is_empty") return "never";
  if (f.operator === "is_not_empty") return "has_logged_in";
  if (f.operator === "after") {
    if (String(f.value) === d7) return "last_7_days";
    if (String(f.value) === d30) return "last_30_days";
  }
  return "";
}

interface UsersFilterPillsProps {
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

export function UsersFilterPills({
  filters,
  definitions,
  upsertFilter,
  removeFilterByKey,
  clearAll,
}: UsersFilterPillsProps) {
  const [open, setOpen] = useState(false);

  const roleDef = definitions.find((d) => d.key === "role");
  const statusDef = definitions.find(
    (d) => d.key === "status" && d.type === "select"
  );

  const roleFilter = filters.find((f) => f.key === "role");
  const statusFilter = filters.find((f) => f.key === "status");
  const lastLoginFilter = filters.find((f) => f.key === "lastLoginAt");

  const d7 = daysAgoDateString(7);
  const d30 = daysAgoDateString(30);

  const hasAnyFilter = filters.length > 0;

  const summaryParts = [
    roleSummary(roleFilter),
    statusSummary(statusFilter),
    lastLoginSummary(lastLoginFilter),
  ].filter(Boolean) as string[];
  const summaryText = summaryParts.length > 0 ? summaryParts.join(" · ") : null;

  const roleSelection =
    roleFilter?.operator === "equals" && roleFilter.value
      ? String(roleFilter.value)
      : "";

  const statusSelection =
    statusFilter?.operator === "equals" && statusFilter.value
      ? String(statusFilter.value)
      : "";

  const lastActiveValue = lastActiveSelectValue(lastLoginFilter, d7, d30);

  /** Opening the dialog leaves the trigger focused; blur so the pill’s focus ring doesn’t stay visible. */
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const el = document.activeElement;
      if (el instanceof HTMLElement) el.blur();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  function applyLastActive(value: string) {
    if (value === "") {
      removeFilterByKey("lastLoginAt");
      return;
    }
    if (value === "last_7_days") {
      upsertFilter("lastLoginAt", "after", d7);
      return;
    }
    if (value === "last_30_days") {
      upsertFilter("lastLoginAt", "after", d30);
      return;
    }
    if (value === "never") {
      upsertFilter("lastLoginAt", "is_empty");
      return;
    }
    if (value === "has_logged_in") {
      upsertFilter("lastLoginAt", "is_not_empty");
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
            {/* Role — radio (small fixed set) */}
            <fieldset className="space-y-2 border-0 p-0 outline-none focus:outline-none">
              <legend className="mb-1 text-sm font-medium text-foreground">Role</legend>
              <div className="flex flex-col gap-0.5" role="radiogroup" aria-label="Role">
                <label className={radioRowClass}>
                  <input
                    type="radio"
                    name="users-filter-role"
                    className={radioInputClass}
                    checked={roleSelection === ""}
                    onChange={() => removeFilterByKey("role")}
                  />
                  <span>Any</span>
                </label>
                {roleDef?.options?.map((opt) => (
                  <label key={opt.value} className={radioRowClass}>
                    <input
                      type="radio"
                      name="users-filter-role"
                      className={radioInputClass}
                      checked={roleSelection === opt.value}
                      onChange={() => upsertFilter("role", "equals", opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Status — radio */}
            <fieldset className="space-y-2 border-0 p-0 outline-none focus:outline-none">
              <legend className="mb-1 text-sm font-medium text-foreground">Status</legend>
              <div className="flex flex-col gap-0.5" role="radiogroup" aria-label="Status">
                <label className={radioRowClass}>
                  <input
                    type="radio"
                    name="users-filter-status"
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
                      name="users-filter-status"
                      className={radioInputClass}
                      checked={statusSelection === opt.value}
                      onChange={() => upsertFilter("status", "equals", opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Last active — dropdown (more options, saves vertical space) */}
            <div className="space-y-1.5">
              <Label htmlFor="users-filter-last-active" className="text-sm font-medium">
                Last active
              </Label>
              <select
                id="users-filter-last-active"
                className={selectClass}
                value={lastActiveValue}
                onChange={(e) => applyLastActive(e.target.value)}
              >
                <option value="">Any</option>
                <option value="last_7_days">Active in the last 7 days</option>
                <option value="last_30_days">Active in the last 30 days</option>
                <option value="never">Never logged in</option>
                <option value="has_logged_in">Has logged in</option>
              </select>
            </div>
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
