"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useCallback,
  useState,
} from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MentionItem {
  id: string;
  label: string;
  isCreate?: boolean;
}

export interface MentionSuggestionListProps {
  items: MentionItem[];
  command: (attrs: { id: string; label: string }) => void;
}

export interface MentionSuggestionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionSuggestionList = forwardRef<
  MentionSuggestionListRef,
  MentionSuggestionListProps
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        command({ id: item.id, label: item.label });
      }
    },
    [items, command]
  );

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) =>
          prev <= 0 ? items.length - 1 : prev - 1
        );
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) =>
          prev >= items.length - 1 ? 0 : prev + 1
        );
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) return null;

  return (
    <div className="z-50 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-sm">
      {items.map((item, index) => (
        <button
          key={item.id + (item.isCreate ? "-create" : "")}
          type="button"
          onClick={() => selectItem(index)}
          className={cn(
            "flex w-full items-center rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
            index === selectedIndex
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          {item.isCreate ? (
            <>
              <Plus className="mr-1.5 size-3 text-primary" />
              <span>
                Create{" "}
                <span className="font-medium text-primary">@{item.id}</span>
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-xs text-primary/70">@</span>
              <span className="ml-1">{item.label}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
});
MentionSuggestionList.displayName = "MentionSuggestionList";

/**
 * Build the items list for a mention query: matching known terms + optional "Create" entry.
 */
export function buildMentionItems(
  query: string,
  availableTerms: string[]
): MentionItem[] {
  const q = query.toLowerCase();
  const matches: MentionItem[] = availableTerms
    .filter((item) => item.toLowerCase().includes(q))
    .map((item) => ({ id: item, label: item }));

  if (q.length > 0) {
    const exactMatch = availableTerms.some(
      (item) => item.toLowerCase() === q
    );
    if (!exactMatch) {
      const termId = q.replace(/\s+/g, "_");
      matches.push({ id: termId, label: termId, isCreate: true });
    }
  }

  return matches;
}
