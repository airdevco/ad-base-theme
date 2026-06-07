import type { CssVarMap } from "./theme-preset-bundle";
import type { ThemeState } from "./theme-state";
import {
  deriveChartPalette,
  deriveNeutralChartPalette,
} from "@/lib/chart-tokens";

export type LayerAPatchOptions = {
  /** Re-derive chart-1…5 from panel primary instead of keeping TweakCN chart colors. */
  chartsFromPrimary?: "hue" | "neutral";
  /** When false, preserve TweakCN --ring (e.g. minimalist gray focus ring). */
  patchRingFromPrimary?: boolean;
  /** When false, preserve TweakCN sidebar-primary / sidebar-ring. */
  patchSidebarPrimaryFromPrimary?: boolean;
};

export function cloneLayerMaps(maps: {
  light: CssVarMap;
  dark: CssVarMap;
}): { light: CssVarMap; dark: CssVarMap } {
  return {
    light: { ...maps.light },
    dark: { ...maps.dark },
  };
}

function fontSansStack(fontName: string): string {
  return `${fontName}, ui-sans-serif, sans-serif, system-ui`;
}

function chartsForPrimary(
  primary: string,
  isDark: boolean,
  chartsFromPrimary?: "hue" | "neutral"
) {
  if (chartsFromPrimary === "neutral") {
    return deriveNeutralChartPalette(primary, isDark);
  }
  return deriveChartPalette(primary, isDark);
}

/** Patch panel-editable keys onto a Layer A map; preserve all other TweakCN tokens. */
export function applyPanelToLayerA(
  layerA: CssVarMap,
  panel: ThemeState,
  mode: "light" | "dark",
  options?: LayerAPatchOptions
): CssVarMap {
  const primary = panel.primaryColor;
  const isDark = mode === "dark";
  const patchRing = options?.patchRingFromPrimary !== false;
  const patchSidebar = options?.patchSidebarPrimaryFromPrimary !== false;

  const result: CssVarMap = {
    ...layerA,
    "--primary": primary,
    "--background": panel.backgroundColor,
    "--card": panel.backgroundColor,
    "--popover": panel.backgroundColor,
    "--font-sans": fontSansStack(panel.bodyFont),
    "--radius": `${panel.radius}rem`,
  };

  if (options?.chartsFromPrimary) {
    const charts = chartsForPrimary(primary, isDark, options.chartsFromPrimary);
    result["--chart-1"] = charts.chart1;
    result["--chart-2"] = charts.chart2;
    result["--chart-3"] = charts.chart3;
    result["--chart-4"] = charts.chart4;
    result["--chart-5"] = charts.chart5;
  } else {
    result["--chart-1"] = primary;
  }

  if (patchRing) {
    result["--ring"] = primary;
  }
  if (patchSidebar) {
    result["--sidebar-primary"] = primary;
    result["--sidebar-ring"] = primary;
  }

  return result;
}

/** Sync working Layer A from preset + panel (fonts, bg, charts) without wiping TweakCN accents. */
export function syncLayerAFromPreset(
  layerA: { light: CssVarMap; dark: CssVarMap },
  light: ThemeState,
  dark: ThemeState | null,
  options?: LayerAPatchOptions
): { light: CssVarMap; dark: CssVarMap } {
  const darkPanel = dark ?? light;
  return {
    light: applyPanelToLayerA(layerA.light, light, "light", options),
    dark: applyPanelToLayerA(layerA.dark, darkPanel, "dark", options),
  };
}
