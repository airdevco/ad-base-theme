"use client";

import { Check } from "lucide-react";
import type { GalleryThemePreset } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface ThemePreviewCardProps {
  theme: GalleryThemePreset;
  selected: boolean;
  onSelect: () => void;
}

export function ThemePreviewCard({
  theme,
  selected,
  onSelect,
}: ThemePreviewCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300",
        selected
          ? "border-foreground ring-2 ring-foreground"
          : "border-border hover:border-border"
      )}
    >
      {/* Selected checkmark */}
      {selected && (
        <div className="absolute right-3 top-3 z-10 flex size-6 items-center justify-center rounded-full bg-foreground text-background">
          <Check className="size-3.5" strokeWidth={3} />
        </div>
      )}

      {/* Live preview area with scoped theme colors */}
      <div
        className="p-5"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.foreground,
        }}
      >
        {/* Mini card preview */}
        <div
          className="rounded-xl border p-4"
          style={{
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.cardForeground,
          }}
        >
          <div className="flex flex-col gap-3">
            {/* Heading + badge row */}
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-semibold"
                style={{ color: theme.colors.cardForeground }}
              >
                Dashboard
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: theme.colors.secondary,
                  color: theme.colors.secondaryForeground,
                }}
              >
                Active
              </span>
            </div>

            {/* Stat row */}
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-2xl font-black tracking-tight"
                style={{ color: theme.colors.foreground }}
              >
                2,847
              </span>
              <span
                className="text-[10px]"
                style={{ color: theme.colors.mutedForeground }}
              >
                visitors
              </span>
            </div>

            {/* Mock input */}
            <div
              className="rounded-lg border px-3 py-1.5 text-xs"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.muted,
                color: theme.colors.mutedForeground,
              }}
            >
              Search...
            </div>

            {/* Button */}
            <div
              className="rounded-lg px-3 py-1.5 text-center text-xs font-medium"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.primaryForeground,
              }}
            >
              Get Started
            </div>
          </div>
        </div>
      </div>

      {/* Theme info footer */}
      <div className="flex flex-col gap-3 border-t border-border bg-background px-5 py-4">
        {/* Swatches */}
        <div className="flex items-center gap-1.5">
          {theme.swatches.map((color) => (
            <div
              key={color}
              className="size-4 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Name + description */}
        <div>
          <p className="text-sm font-semibold text-foreground">{theme.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{theme.description}</p>
        </div>

        {/* Font info */}
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {theme.font}
        </p>
      </div>
    </button>
  );
}
