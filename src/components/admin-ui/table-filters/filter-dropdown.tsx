"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterDefinition, FilterOperator } from "./types";
import {
  getOperatorsForType,
  getDefaultOperator,
  OPERATOR_LABELS,
  NO_VALUE_OPERATORS,
} from "./types";

interface FilterDropdownProps {
  definitions: FilterDefinition[];
  onSelect: (
    key: string,
    operator?: FilterOperator,
    value?: string | string[]
  ) => void;
  trigger: React.ReactNode;
}

/**
 * Attio-style attribute picker dropdown with search and grouped items.
 * For select/multi-select types, shows a second panel to pick condition + value
 * before adding the filter.
 */
export function FilterDropdown({
  definitions,
  onSelect,
  trigger,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDef, setSelectedDef] = useState<FilterDefinition | null>(null);
  const [configOperator, setConfigOperator] = useState<FilterOperator>("equals");
  const [configValue, setConfigValue] = useState<string | string[]>("");
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
      // Focus search input
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (!open) {
      setSearch("");
      setSelectedDef(null);
      setConfigValue("");
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedDef) {
          setSelectedDef(null);
        } else {
          setOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, selectedDef]);

  // Filter definitions by search
  const filtered = definitions.filter((d) =>
    d.label.toLowerCase().includes(search.toLowerCase())
  );

  // Group filtered items
  const groups = new Map<string, FilterDefinition[]>();
  const ungrouped: FilterDefinition[] = [];
  for (const def of filtered) {
    if (def.group) {
      const list = groups.get(def.group) ?? [];
      list.push(def);
      groups.set(def.group, list);
    } else {
      ungrouped.push(def);
    }
  }

  const handleAttributeClick = (def: FilterDefinition) => {
    const hasOptions =
      def.type === "select" || def.type === "multi-select";

    if (hasOptions && def.options?.length) {
      // Show config panel
      setSelectedDef(def);
      const defaultOp = getDefaultOperator(def);
      setConfigOperator(defaultOp);
      setConfigValue(def.type === "multi-select" ? [] : "");
    } else {
      // Add immediately for text/number/date
      onSelect(def.key);
      setOpen(false);
    }
  };

  const handleApply = () => {
    if (!selectedDef) return;
    onSelect(selectedDef.key, configOperator, configValue);
    setOpen(false);
  };

  const handleBack = () => {
    setSelectedDef(null);
    setConfigValue("");
  };

  return (
    <>
      <div ref={triggerRef} onClick={() => setOpen(!open)}>
        {trigger}
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              zIndex: 50,
            }}
            className="w-64 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
          >
            {selectedDef ? (
              // ── Config panel ───────────────────────────────
              <ConfigPanel
                definition={selectedDef}
                operator={configOperator}
                value={configValue}
                onOperatorChange={setConfigOperator}
                onValueChange={setConfigValue}
                onApply={handleApply}
                onBack={handleBack}
              />
            ) : (
              // ── Attribute list ──────────────────────────────
              <>
                {/* Search */}
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <Search className="size-3.5 shrink-0 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search attributes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-0 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>

                {/* Items */}
                <div className="max-h-72 overflow-y-auto p-1">
                  {ungrouped.map((def) => (
                    <FilterAttributeItem
                      key={def.key}
                      definition={def}
                      onSelect={() => handleAttributeClick(def)}
                    />
                  ))}

                  {Array.from(groups.entries()).map(([group, defs]) => (
                    <div key={group}>
                      <p className="px-3 pb-2 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {group}
                      </p>
                      {defs.map((def) => (
                        <FilterAttributeItem
                          key={def.key}
                          definition={def}
                          onSelect={() => handleAttributeClick(def)}
                        />
                      ))}
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      No attributes found
                    </p>
                  )}
                </div>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

// ── Config panel for select/multi-select filters ───────────────────

function ConfigPanel({
  definition,
  operator,
  value,
  onOperatorChange,
  onValueChange,
  onApply,
  onBack,
}: {
  definition: FilterDefinition;
  operator: FilterOperator;
  value: string | string[];
  onOperatorChange: (op: FilterOperator) => void;
  onValueChange: (val: string | string[]) => void;
  onApply: () => void;
  onBack: () => void;
}) {
  const operators = getOperatorsForType(definition);
  const needsValue = !NO_VALUE_OPERATORS.includes(operator);
  const isMulti = definition.type === "multi-select";
  const options = definition.options ?? [];

  const hasValue = needsValue
    ? Array.isArray(value)
      ? value.length > 0
      : value !== ""
    : true;

  return (
    <div className="flex flex-col">
      {/* Header with back button */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <button
          type="button"
          onClick={onBack}
          className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="text-xs font-medium text-foreground">
          {definition.label}
        </span>
      </div>

      <div className="p-3">
        {/* Condition select */}
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Condition
        </label>
        <select
          value={operator}
          onChange={(e) => {
            const newOp = e.target.value as FilterOperator;
            onOperatorChange(newOp);
            // Clear value if switching to no-value operator
            if (NO_VALUE_OPERATORS.includes(newOp)) {
              onValueChange("");
            }
          }}
          className="mb-3 h-7 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          {operators.map((op) => (
            <option key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </option>
          ))}
        </select>

        {/* Value selection */}
        {needsValue && (
          <>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Value
            </label>
            {isMulti ? (
              <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                {options.map((opt) => {
                  const selected = Array.isArray(value) ? value : [];
                  const checked = selected.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-sidebar-accent/60"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onValueChange([...selected, opt.value]);
                          } else {
                            onValueChange(
                              selected.filter((v) => v !== opt.value)
                            );
                          }
                        }}
                        className="size-3.5 rounded"
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onValueChange(opt.value)}
                    className={cn(
                      "flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition-colors",
                      value === opt.value
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground hover:bg-sidebar-accent/60"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Apply button */}
        <button
          type="button"
          onClick={onApply}
          disabled={!hasValue}
          className="mt-3 flex h-7 w-full items-center justify-center rounded-lg bg-primary text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Apply filter
        </button>
      </div>
    </div>
  );
}

// ── Attribute list item ────────────────────────────────────────────

function FilterAttributeItem({
  definition,
  onSelect,
}: {
  definition: FilterDefinition;
  onSelect: () => void;
}) {
  const Icon = definition.icon;
  const hasOptions =
    definition.type === "select" || definition.type === "multi-select";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-sidebar-accent/60"
      )}
    >
      {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
      <span className="flex-1 truncate">{definition.label}</span>
      {hasOptions && definition.options && (
        <span className="text-xs text-muted-foreground">
          {definition.options.length}
        </span>
      )}
      {hasOptions && (
        <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}
