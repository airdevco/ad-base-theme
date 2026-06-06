"use client";

import { createContext, useContext } from "react";

const ThemePreviewContext = createContext<{ chartRevision: string } | null>(
  null
);

export function ThemePreviewProvider({
  chartRevision,
  children,
}: {
  chartRevision: string;
  children: React.ReactNode;
}) {
  return (
    <ThemePreviewContext.Provider value={{ chartRevision }}>
      {children}
    </ThemePreviewContext.Provider>
  );
}

/** Prefer React state from /theme; fall back to DOM for legacy reads. */
export function useThemePreviewChartRevision(): string {
  const ctx = useContext(ThemePreviewContext);
  if (ctx) return ctx.chartRevision;
  if (typeof document === "undefined") return "";
  return (
    document.getElementById("theme-preview")?.getAttribute("data-chart-revision") ??
    ""
  );
}
