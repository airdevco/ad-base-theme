"use client";

import { Fragment, useCallback, useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThinCheckbox } from "@/components/admin-sdc-ui/thin-checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/admin-sdc-ui/dropdown-menu";

export type EditColumnDef = { key: string; label: string };

/** Move `draggedKey` so it sits just before index `insertBeforeIndex` in the full `order` list (0 = first). */
export function applyInsertAt(
  order: string[],
  draggedKey: string,
  insertBeforeIndex: number
): string[] {
  const from = order.indexOf(draggedKey);
  if (from < 0) return order;
  let insertAt = insertBeforeIndex;
  if (from < insertBeforeIndex) {
    insertAt -= 1;
  }
  const next = order.filter((k) => k !== draggedKey);
  insertAt = Math.max(0, Math.min(insertAt, next.length));
  next.splice(insertAt, 0, draggedKey);
  return next;
}

/** Move `draggedKey` to `targetKey`'s index (legacy swap-to-target behavior). */
export function reorderColumnKeys(
  order: string[],
  draggedKey: string,
  targetKey: string
): string[] {
  const from = order.indexOf(draggedKey);
  const to = order.indexOf(targetKey);
  if (from < 0 || to < 0 || from === to) return order;
  const next = [...order];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

type EditColumnsMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: EditColumnDef[];
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;
  visibleColumns: Set<string>;
  onToggleColumn: (key: string) => void;
  triggerLabel?: string;
};

function insertBeforeIndexFromEvent(
  e: React.DragEvent,
  orderedKeys: string[],
  colKey: string
): number {
  const rect = e.currentTarget.getBoundingClientRect();
  const mid = rect.top + rect.height / 2;
  const idx = orderedKeys.indexOf(colKey);
  if (idx < 0) return 0;
  return e.clientY < mid ? idx : idx + 1;
}

export function EditColumnsMenu({
  open,
  onOpenChange,
  columns,
  columnOrder,
  onColumnOrderChange,
  visibleColumns,
  onToggleColumn,
  triggerLabel = "Edit columns",
}: EditColumnsMenuProps) {
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [insertBeforeIndex, setInsertBeforeIndex] = useState<number | null>(null);

  const byKey = new Map(columns.map((c) => [c.key, c] as const));
  const ordered = columnOrder
    .map((k) => byKey.get(k))
    .filter((c): c is EditColumnDef => c != null);

  const orderedKeys = ordered.map((c) => c.key);

  const clearDrag = useCallback(() => {
    setDraggingKey(null);
    setInsertBeforeIndex(null);
  }, []);

  const updateIndicator = useCallback(
    (e: React.DragEvent, colKey: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (!draggingKey) return;
      setInsertBeforeIndex(insertBeforeIndexFromEvent(e, orderedKeys, colKey));
    },
    [draggingKey, orderedKeys]
  );

  const handleDropOnRow = useCallback(
    (e: React.DragEvent, colKey: string) => {
      e.preventDefault();
      const fromKey = e.dataTransfer.getData("text/plain");
      if (!fromKey) {
        clearDrag();
        return;
      }
      const insertAt = insertBeforeIndexFromEvent(e, orderedKeys, colKey);
      onColumnOrderChange(applyInsertAt(columnOrder, fromKey, insertAt));
      clearDrag();
    },
    [columnOrder, onColumnOrderChange, orderedKeys, clearDrag]
  );

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger className="flex h-7 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent/60">
        {triggerLabel}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="!min-w-0 w-fit max-w-[11rem] p-1"
        onDragLeave={(e) => {
          if (!draggingKey) return;
          const related = e.relatedTarget as Node | null;
          if (related && e.currentTarget.contains(related)) return;
          setInsertBeforeIndex(null);
        }}
      >
        {ordered.map((col, index) => (
          <Fragment key={col.key}>
            {draggingKey && insertBeforeIndex === index && (
              <div
                className="mx-1 my-0.5 h-0.5 rounded-full bg-primary"
                aria-hidden
              />
            )}
            <DropdownMenuItem
              closeOnSelect={false}
              className={cn(
                "min-w-0 max-w-[11rem] cursor-default gap-1.5 px-1.5 py-1.5",
                draggingKey === col.key && "opacity-50"
              )}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("[data-drag-handle]")) return;
                onToggleColumn(col.key);
              }}
              onDragOver={(e) => updateIndicator(e, col.key)}
              onDrop={(e) => handleDropOnRow(e, col.key)}
            >
              <span
                data-drag-handle
                draggable
                tabIndex={-1}
                aria-label={`Reorder ${col.label}`}
                className="flex shrink-0 cursor-grab touch-none text-muted-foreground/40 active:cursor-grabbing dark:text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDraggingKey(col.key);
                  setInsertBeforeIndex(null);
                  e.dataTransfer.setData("text/plain", col.key);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  clearDrag();
                }}
              >
                <GripVertical className="size-3.5" strokeWidth={2} />
              </span>
              <ThinCheckbox
                readOnly
                tabIndex={-1}
                checked={visibleColumns.has(col.key)}
                className="pointer-events-none shrink-0"
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-left">{col.label}</span>
            </DropdownMenuItem>
          </Fragment>
        ))}
        {draggingKey && insertBeforeIndex === ordered.length && (
          <div className="mx-1 my-0.5 h-0.5 rounded-full bg-primary" aria-hidden />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
