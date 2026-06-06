import { computeDarkVariant, hexToHsl } from "@/app/theme/_components/theme-state";

export interface ChartPalette {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

/** Derive chart-1…chart-5 from primary, matching globals.css / generate-prompt formulas. */
export function deriveChartPalette(
  primaryColor: string,
  isDark: boolean
): ChartPalette {
  const { h } = hexToHsl(primaryColor);
  const hue = Math.round(h);
  const chart1 = isDark ? computeDarkVariant(primaryColor) : primaryColor;

  return {
    chart1,
    chart2: `hsl(${hue} 70% ${isDark ? 67 : 62}%)`,
    chart3: `hsl(${hue} 55% ${isDark ? 78 : 74}%)`,
    chart4: `hsl(${hue} 90% ${isDark ? 43 : 38}%)`,
    chart5: `hsl(${hue} 45% ${isDark ? 88 : 85}%)`,
  };
}

/** Apply chart palette to a token map for preview inline styles. */
export function chartPaletteToTokens(
  palette: ChartPalette
): Record<string, string> {
  const entries: Record<string, string> = {};
  const keys = ["chart1", "chart2", "chart3", "chart4", "chart5"] as const;
  keys.forEach((key, i) => {
    const n = i + 1;
    entries[`--chart-${n}`] = palette[key];
    entries[`--color-chart-${n}`] = palette[key];
  });
  return entries;
}

/** Parse hex or hsl color to rgba string for Recharts fills. */
export function colorWithAlpha(color: string, alpha: number): string {
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith("hsl")) {
    const inner = color.replace(/^hsl[a]?\(/, "").replace(/\)$/, "").trim();
    return `hsla(${inner} / ${alpha})`;
  }
  return color;
}
