"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { AllCommunityModule, ModuleRegistry } from "ag-charts-community";

ModuleRegistry.registerModules([AllCommunityModule]);

function getCssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function useChartColors() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const colors = useMemo(() => {
    return {
      chart1: getCssVar("--chart-1"),
      chart2: getCssVar("--chart-2"),
      chart3: getCssVar("--chart-3"),
      chart4: getCssVar("--chart-4"),
      chart5: getCssVar("--chart-5"),
      foreground: getCssVar("--foreground"),
      mutedForeground: getCssVar("--muted-foreground"),
      border: getCssVar("--border"),
      background: getCssVar("--background"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  return { colors, isDark };
}
