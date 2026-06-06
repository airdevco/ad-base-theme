"use client";

import { useLayoutEffect, useState } from "react";
import { useTheme } from "next-themes";

export interface ChartThemeColors {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  background: string;
}

const EMPTY_CHART_COLORS: ChartThemeColors = {
  chart1: "",
  chart2: "",
  chart3: "",
  chart4: "",
  chart5: "",
  foreground: "",
  mutedForeground: "",
  border: "",
  background: "",
};

function readToken(el: Element, token: string): string {
  const colorVar = `--color-${token}`;
  const rawVar = `--${token}`;
  const style = getComputedStyle(el);
  return style.getPropertyValue(colorVar).trim() || style.getPropertyValue(rawVar).trim();
}

function readChartColors(el: Element | null): ChartThemeColors {
  if (!el) {
    return EMPTY_CHART_COLORS;
  }

  return {
    chart1: readToken(el, "chart-1"),
    chart2: readToken(el, "chart-2"),
    chart3: readToken(el, "chart-3"),
    chart4: readToken(el, "chart-4"),
    chart5: readToken(el, "chart-5"),
    foreground: readToken(el, "foreground"),
    mutedForeground: readToken(el, "muted-foreground"),
    border: readToken(el, "border"),
    background: readToken(el, "background"),
  };
}

/**
 * Read chart colors from CSS variables on a scope element (e.g. #theme-preview)
 * or document root. Pass `revision` to re-read when theme preview tokens change.
 */
export function useChartTheme(scope?: HTMLElement | null, revision?: string) {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<ChartThemeColors>(EMPTY_CHART_COLORS);

  useLayoutEffect(() => {
    const el =
      scope ??
      (typeof document !== "undefined" ? document.documentElement : null);
    setColors(readChartColors(el));
  }, [scope, revision, resolvedTheme]);

  return { colors };
}

/** Resolve the theme preview container when charts render inside /theme. */
export function getThemePreviewElement(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById("theme-preview");
}
