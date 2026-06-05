import { useCallback, useMemo, useState } from "react";
import type {
  ActiveFilter,
  FilterDefinition,
  FilterOperator,
} from "./types";
import { getDefaultOperator, NO_VALUE_OPERATORS } from "./types";

let nextId = 0;
function uid() {
  return `f_${++nextId}`;
}

export interface UseTableFiltersReturn {
  /** Currently active filters */
  filters: ActiveFilter[];
  /** Add a new filter by definition key, with optional pre-set operator and value */
  addFilter: (key: string, operator?: FilterOperator, value?: string | string[]) => void;
  /** Replace any existing filter on the same key (at most one per key); omit value to clear that key */
  upsertFilter: (
    key: string,
    operator?: FilterOperator,
    value?: string | string[]
  ) => void;
  /** Remove all filters matching a definition key */
  removeFilterByKey: (key: string) => void;
  /** Remove a filter by its instance id */
  removeFilter: (id: string) => void;
  /** Update a filter's operator */
  setOperator: (id: string, operator: FilterOperator) => void;
  /** Update a filter's value */
  setValue: (id: string, value: string | string[]) => void;
  /** Clear all filters */
  clearAll: () => void;
  /** Apply all active filters to a dataset */
  applyFilters: <T extends Record<string, unknown>>(data: T[]) => T[];
  /** Get the FilterDefinition for a given key */
  getDefinition: (key: string) => FilterDefinition | undefined;
}

export function useTableFilters(
  definitions: FilterDefinition[]
): UseTableFiltersReturn {
  const [filters, setFilters] = useState<ActiveFilter[]>([]);

  const defMap = useMemo(
    () => new Map(definitions.map((d) => [d.key, d])),
    [definitions]
  );

  const getDefinition = useCallback(
    (key: string) => defMap.get(key),
    [defMap]
  );

  const addFilter = useCallback(
    (key: string, operator?: FilterOperator, value?: string | string[]) => {
      const def = defMap.get(key);
      if (!def) return;
      setFilters((prev) => [
        ...prev,
        {
          id: uid(),
          key,
          operator: operator ?? getDefaultOperator(def),
          value: value ?? "",
        },
      ]);
    },
    [defMap]
  );

  const removeFilterByKey = useCallback((key: string) => {
    setFilters((prev) => prev.filter((f) => f.key !== key));
  }, []);

  const upsertFilter = useCallback(
    (key: string, operator?: FilterOperator, value?: string | string[]) => {
      const def = defMap.get(key);
      if (!def) return;
      setFilters((prev) => {
        const without = prev.filter((f) => f.key !== key);
        const op = operator ?? getDefaultOperator(def);

        if (NO_VALUE_OPERATORS.includes(op)) {
          return [
            ...without,
            { id: uid(), key, operator: op, value: "" },
          ];
        }

        const val = value ?? "";
        if (val === "" || (Array.isArray(val) && val.length === 0)) {
          return without;
        }

        return [
          ...without,
          {
            id: uid(),
            key,
            operator: op,
            value: val,
          },
        ];
      });
    },
    [defMap]
  );

  const removeFilter = useCallback((id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const setOperator = useCallback((id: string, operator: FilterOperator) => {
    setFilters((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, operator, value: NO_VALUE_OPERATORS.includes(operator) ? "" : f.value }
          : f
      )
    );
  }, []);

  const setValue = useCallback((id: string, value: string | string[]) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value } : f))
    );
  }, []);

  const clearAll = useCallback(() => setFilters([]), []);

  const applyFilters = useCallback(
    <T extends Record<string, unknown>>(data: T[]): T[] => {
      return data.filter((row) => {
        return filters.every((filter) => {
          // Filters with no value and non-empty-check operators are skipped
          if (
            !NO_VALUE_OPERATORS.includes(filter.operator) &&
            (filter.value === "" || (Array.isArray(filter.value) && filter.value.length === 0))
          ) {
            return true;
          }

          const rawVal = row[filter.key];
          const cellStr = String(rawVal ?? "").toLowerCase();
          const filterStr = Array.isArray(filter.value)
            ? filter.value.map((v) => v.toLowerCase())
            : String(filter.value).toLowerCase();

          switch (filter.operator) {
            case "equals":
              return cellStr === filterStr;
            case "not_equals":
              return cellStr !== filterStr;
            case "contains":
              return cellStr.includes(filterStr as string);
            case "not_contains":
              return !cellStr.includes(filterStr as string);
            case "starts_with":
              return cellStr.startsWith(filterStr as string);
            case "ends_with":
              return cellStr.endsWith(filterStr as string);
            case "gt":
              return Number(rawVal) > Number(filter.value);
            case "gte":
              return Number(rawVal) >= Number(filter.value);
            case "lt":
              return Number(rawVal) < Number(filter.value);
            case "lte":
              return Number(rawVal) <= Number(filter.value);
            case "is_empty":
              return rawVal == null || rawVal === "";
            case "is_not_empty":
              return rawVal != null && rawVal !== "";
            case "in":
              return (filterStr as string[]).includes(cellStr);
            case "not_in":
              return !(filterStr as string[]).includes(cellStr);
            case "before":
              return new Date(String(rawVal)) < new Date(filter.value as string);
            case "after":
              return new Date(String(rawVal)) > new Date(filter.value as string);
            default:
              return true;
          }
        });
      });
    },
    [filters]
  );

  return {
    filters,
    addFilter,
    upsertFilter,
    removeFilterByKey,
    removeFilter,
    setOperator,
    setValue,
    clearAll,
    applyFilters,
    getDefinition,
  };
}
