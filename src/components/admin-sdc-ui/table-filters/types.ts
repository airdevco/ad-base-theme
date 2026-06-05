import type { LucideIcon } from "lucide-react";

// ── Filter definition (declared per-table) ──────────────────────────

export type FilterType = "text" | "select" | "multi-select" | "date" | "number";

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "is_empty"
  | "is_not_empty"
  | "in"
  | "not_in"
  | "before"
  | "after";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  /** The data key this filter applies to (e.g. "status", "name") */
  key: string;
  /** Display label */
  label: string;
  /** Filter input type */
  type: FilterType;
  /** Icon shown in the attribute picker */
  icon?: LucideIcon;
  /** Group heading in the attribute picker (e.g. "Person attributes") */
  group?: string;
  /** Available options for select/multi-select types */
  options?: FilterOption[];
  /** Available operators (auto-populated from type if not provided) */
  operators?: FilterOperator[];
}

// ── Active filter (runtime state) ───────────────────────────────────

export interface ActiveFilter {
  /** Unique id for this filter instance */
  id: string;
  /** The filter definition key */
  key: string;
  /** The operator being used */
  operator: FilterOperator;
  /** The value(s) being filtered on */
  value: string | string[];
}

// ── Helpers ─────────────────────────────────────────────────────────

export const OPERATORS_BY_TYPE: Record<FilterType, FilterOperator[]> = {
  text: ["contains", "not_contains", "equals", "not_equals", "starts_with", "ends_with", "is_empty", "is_not_empty"],
  select: ["equals", "not_equals", "is_empty", "is_not_empty"],
  "multi-select": ["in", "not_in", "is_empty", "is_not_empty"],
  date: ["equals", "before", "after", "is_empty", "is_not_empty"],
  number: ["equals", "not_equals", "gt", "gte", "lt", "lte", "is_empty", "is_not_empty"],
};

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: "is",
  not_equals: "is not",
  contains: "contains",
  not_contains: "does not contain",
  starts_with: "starts with",
  ends_with: "ends with",
  gt: "greater than",
  gte: "greater than or equal",
  lt: "less than",
  lte: "less than or equal",
  is_empty: "is empty",
  is_not_empty: "is not empty",
  in: "is any of",
  not_in: "is none of",
  before: "is before",
  after: "is after",
};

/** Operators that don't need a value input */
export const NO_VALUE_OPERATORS: FilterOperator[] = ["is_empty", "is_not_empty"];

export function getOperatorsForType(def: FilterDefinition): FilterOperator[] {
  return def.operators ?? OPERATORS_BY_TYPE[def.type];
}

export function getDefaultOperator(def: FilterDefinition): FilterOperator {
  const ops = getOperatorsForType(def);
  return ops[0];
}
