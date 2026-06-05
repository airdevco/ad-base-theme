"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Filter, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActiveFilter, FilterDefinition, FilterOperator } from "./types";
import {
  getOperatorsForType,
  OPERATOR_LABELS,
  NO_VALUE_OPERATORS,
} from "./types";
import { FilterDropdown } from "./filter-dropdown";

// ── Filter pill (active filter) ─────────────────────────────────────

interface FilterPillProps {
  filter: ActiveFilter;
  definition: FilterDefinition;
  onRemove: () => void;
  onOperatorChange: (op: FilterOperator) => void;
  onValueChange: (value: string | string[]) => void;
}

function FilterPill({
  filter,
  definition,
  onRemove,
  onOperatorChange,
  onValueChange,
}: FilterPillProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (popoverOpen && pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [popoverOpen]);

  useEffect(() => {
    if (!popoverOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        pillRef.current &&
        !pillRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopoverOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [popoverOpen]);

  const operators = getOperatorsForType(definition);
  const needsValue = !NO_VALUE_OPERATORS.includes(filter.operator);
  const displayValue = Array.isArray(filter.value)
    ? filter.value.join(", ")
    : filter.value;

  return (
    <>
      <div
        ref={pillRef}
        className="flex items-center gap-0 rounded-md border border-border bg-background text-xs"
      >
        {/* Attribute name */}
        <button
          type="button"
          onClick={() => setPopoverOpen(!popoverOpen)}
          className="flex h-6 items-center gap-1 rounded-l-md px-2 font-medium text-foreground transition-colors hover:bg-sidebar-accent/60"
        >
          {definition.label}
          <ChevronDown className="size-2.5 text-muted-foreground" />
        </button>

        {/* Operator */}
        <span className="flex h-6 items-center border-l border-border px-1.5 text-muted-foreground">
          {OPERATOR_LABELS[filter.operator]}
        </span>

        {/* Value */}
        {needsValue && (
          <span className="flex h-6 items-center border-l border-border px-1.5 font-medium text-primary">
            {displayValue || "..."}
          </span>
        )}

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          className="flex h-6 items-center rounded-r-md border-l border-border px-1 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500"
        >
          <X className="size-3" />
        </button>
      </div>

      {/* Popover for editing */}
      {popoverOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              zIndex: 50,
            }}
            className="w-64 overflow-hidden rounded-xl border border-border bg-background p-3 shadow-lg"
          >
            {/* Operator select */}
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Condition
            </label>
            <select
              value={filter.operator}
              onChange={(e) =>
                onOperatorChange(e.target.value as FilterOperator)
              }
              className="mb-3 h-7 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            >
              {operators.map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </option>
              ))}
            </select>

            {/* Value input */}
            {needsValue && (
              <>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Value
                </label>
                {(definition.type === "select" ||
                  definition.type === "multi-select") &&
                definition.options ? (
                  <SelectValueInput
                    options={definition.options}
                    value={filter.value}
                    multi={definition.type === "multi-select"}
                    onChange={onValueChange}
                  />
                ) : (
                  <input
                    type={definition.type === "number" ? "number" : definition.type === "date" ? "date" : "text"}
                    value={displayValue}
                    onChange={(e) => onValueChange(e.target.value)}
                    placeholder={`Enter ${definition.label.toLowerCase()}...`}
                    className="h-7 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                    autoFocus
                  />
                )}
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

function SelectValueInput({
  options,
  value,
  multi,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string | string[];
  multi: boolean;
  onChange: (value: string | string[]) => void;
}) {
  if (multi) {
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-sidebar-accent/60"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selected, opt.value]);
                } else {
                  onChange(selected.filter((v) => v !== opt.value));
                }
              }}
              className="size-3.5 rounded"
            />
            {opt.label}
          </label>
        ))}
      </div>
    );
  }

  return (
    <select
      value={Array.isArray(value) ? value[0] ?? "" : value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ── FilterBar (main export) ─────────────────────────────────────────

interface FilterBarProps {
  definitions: FilterDefinition[];
  filters: ActiveFilter[];
  onAddFilter: (key: string, operator?: FilterOperator, value?: string | string[]) => void;
  onRemoveFilter: (id: string) => void;
  onOperatorChange: (id: string, operator: FilterOperator) => void;
  onValueChange: (id: string, value: string | string[]) => void;
  onClearAll: () => void;
  getDefinition: (key: string) => FilterDefinition | undefined;
}

export function FilterBar({
  definitions,
  filters,
  onAddFilter,
  onRemoveFilter,
  onOperatorChange,
  onValueChange,
  onClearAll,
  getDefinition,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Active filter pills */}
      {filters.map((filter) => {
        const def = getDefinition(filter.key);
        if (!def) return null;
        return (
          <FilterPill
            key={filter.id}
            filter={filter}
            definition={def}
            onRemove={() => onRemoveFilter(filter.id)}
            onOperatorChange={(op) => onOperatorChange(filter.id, op)}
            onValueChange={(val) => onValueChange(filter.id, val)}
          />
        );
      })}

      {/* Add filter button */}
      <FilterDropdown
        definitions={definitions}
        onSelect={onAddFilter}
        trigger={
          <button
            type="button"
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors hover:bg-sidebar-accent/60",
              filters.length > 0
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Filter className="size-3" />
            Filter
          </button>
        }
      />

      {/* Clear all */}
      {filters.length > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex h-7 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          <X className="size-3" />
          Clear all
        </button>
      )}
    </div>
  );
}
