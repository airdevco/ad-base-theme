import type { CssVarMap, ThemePresetBundleV1 } from "./theme-preset-bundle";

function layerMapToCssBlock(selector: string, vars: CssVarMap): string {
  const lines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** Paste-ready Layer A + Layer B blocks for ad-base globals.css. */
export function globalsCssFromBundle(bundle: ThemePresetBundleV1): string {
  const bodyFont = bundle.panel.light.bodyFont;
  const parts = [
    "/* ad-base globals.css — paste Layer A + Layer B only */",
    "/* Do NOT edit @theme (Layer C) or --status-* tokens */",
    "",
    "/* ── Layer A: TweakCN core ── */",
    layerMapToCssBlock(":root", bundle.layerA.light),
    "",
    layerMapToCssBlock(".dark", bundle.layerA.dark),
    "",
    "/* ── Layer B: ad-base extensions (light) ── */",
    layerMapToCssBlock(":root", bundle.layerB.light),
  ];

  const darkLayerBKeys = Object.keys(bundle.layerB.dark);
  const lightLayerBKeys = Object.keys(bundle.layerB.light);
  const darkDiffers =
    darkLayerBKeys.length !== lightLayerBKeys.length ||
    darkLayerBKeys.some((k) => bundle.layerB.dark[k] !== bundle.layerB.light[k]);

  if (darkDiffers) {
    parts.push("", "/* ── Layer B: ad-base extensions (dark) ── */");
    parts.push(layerMapToCssBlock(".dark", bundle.layerB.dark));
  }

  if (bodyFont && bodyFont !== "Inter") {
    parts.push(
      "",
      `/* Add ${bodyFont} via next/font/google in src/app/layout.tsx */`
    );
  }

  return parts.join("\n");
}
