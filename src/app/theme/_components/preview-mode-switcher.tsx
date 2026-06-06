"use client";

import { cn } from "@/lib/utils";

export type PreviewMode = "home" | "admin" | "components";

const MODES: { value: PreviewMode; label: string; ariaLabel: string }[] = [
  { value: "components", label: "01", ariaLabel: "Components preview" },
  { value: "admin", label: "02", ariaLabel: "Admin preview" },
  { value: "home", label: "03", ariaLabel: "Homepage preview" },
];

interface PreviewModeSwitcherProps {
  value: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}

export function PreviewModeSwitcher({
  value,
  onChange,
}: PreviewModeSwitcherProps) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-border bg-background p-1 shadow-lg"
      role="tablist"
      aria-label="Preview mode"
    >
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            role="tab"
            aria-selected={value === mode.value}
            aria-label={mode.ariaLabel}
            onClick={() => onChange(mode.value)}
            className={cn(
              "pointer-events-auto flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
              value === mode.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode.label}
          </button>
        ))}
    </div>
  );
}
