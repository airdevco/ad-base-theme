import type { CssVarMap } from "./theme-preset-bundle";
import type { ThemeState } from "./theme-state";
import {
  CURATED_FONTS,
  DEFAULTS,
  deriveBrandFromPrimary,
  hslToHex,
} from "./theme-state";

/** shadcn / TweakCN core tokens (Layer A). Excludes ad-base extensions. */
export const LAYER_A_TOKEN_NAMES = new Set([
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-background",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "font-sans",
  "font-serif",
  "font-mono",
  "font-heading",
  "radius",
  "shadow-2xs",
  "shadow-xs",
  "shadow-sm",
  "shadow",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
]);

/** Maps Layer A token names to Tailwind v4 `--color-*` preview keys. */
const LAYER_A_COLOR_TAILWIND: Record<string, string> = {
  background: "--color-background",
  foreground: "--color-foreground",
  card: "--color-card",
  "card-foreground": "--color-card-foreground",
  popover: "--color-popover",
  "popover-foreground": "--color-popover-foreground",
  primary: "--color-primary",
  "primary-foreground": "--color-primary-foreground",
  secondary: "--color-secondary",
  "secondary-foreground": "--color-secondary-foreground",
  muted: "--color-muted",
  "muted-foreground": "--color-muted-foreground",
  accent: "--color-accent",
  "accent-foreground": "--color-accent-foreground",
  destructive: "--color-destructive",
  "destructive-foreground": "--color-destructive-foreground",
  border: "--color-border",
  input: "--color-input",
  ring: "--color-ring",
  "chart-1": "--color-chart-1",
  "chart-2": "--color-chart-2",
  "chart-3": "--color-chart-3",
  "chart-4": "--color-chart-4",
  "chart-5": "--color-chart-5",
  sidebar: "--color-sidebar",
  "sidebar-background": "--color-sidebar",
  "sidebar-foreground": "--color-sidebar-foreground",
  "sidebar-primary": "--color-sidebar-primary",
  "sidebar-primary-foreground": "--color-sidebar-primary-foreground",
  "sidebar-accent": "--color-sidebar-accent",
  "sidebar-accent-foreground": "--color-sidebar-accent-foreground",
  "sidebar-border": "--color-sidebar-border",
  "sidebar-ring": "--color-sidebar-ring",
};

export type ParsedThemeCss = {
  light: CssVarMap;
  dark: CssVarMap;
};

export type ParseThemeCssResult =
  | { ok: true; parsed: ParsedThemeCss }
  | { ok: false; error: string };

/** Parse TweakCN / shadcn create `:root` + `.dark` CSS into Layer A var maps. */
export function parseThemeCss(css: string): ParseThemeCssResult {
  const trimmed = css.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste theme CSS (:root + .dark) first." };
  }

  const rootVars = extractSelectorBlock(trimmed, ":root");
  const darkVars = extractSelectorBlock(trimmed, ".dark");

  if (Object.keys(rootVars).length === 0) {
    return {
      ok: false,
      error: "Could not find a :root { ... } block with CSS variables.",
    };
  }

  const light = filterLayerA(rootVars);
  const dark = filterLayerA(darkVars);

  if (!light["--primary"] && !light["--background"]) {
    return {
      ok: false,
      error: "Layer A block needs at least --primary or --background in :root.",
    };
  }

  return { ok: true, parsed: { light, dark } };
}

function extractSelectorBlock(css: string, selector: ":root" | ".dark"): CssVarMap {
  const vars: CssVarMap = {};
  const selectorPattern =
    selector === ":root"
      ? /:root\s*\{([^}]*)\}/g
      : /\.dark\s*\{([^}]*)\}/g;

  let match: RegExpExecArray | null;
  while ((match = selectorPattern.exec(css)) !== null) {
    Object.assign(vars, parseDeclarations(match[1]));
  }

  return vars;
}

function parseDeclarations(block: string): CssVarMap {
  const vars: CssVarMap = {};
  const declPattern = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = declPattern.exec(block)) !== null) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

function filterLayerA(all: CssVarMap): CssVarMap {
  const out: CssVarMap = {};
  for (const [key, value] of Object.entries(all)) {
    const name = key.startsWith("--") ? key.slice(2) : key;
    if (LAYER_A_TOKEN_NAMES.has(name)) {
      out[`--${name}`] = value;
    }
  }
  return out;
}

/** When --input matches the field fill, borders should use --border (TweakCN Playful). */
export function resolveInputBorderColor(layerA: CssVarMap): string | undefined {
  const input = layerA["--input"];
  const background = layerA["--background"];
  const border = layerA["--border"];
  if (!input || !background || !border) return undefined;

  const inputHex = cssColorToHex(input);
  const bgHex = cssColorToHex(background);
  if (inputHex && bgHex && inputHex === bgHex) {
    return border;
  }

  if (input.replace(/\s+/g, "") === background.replace(/\s+/g, "")) {
    return border;
  }

  return undefined;
}

/** Apply Layer A vars to preview inline style (raw + Tailwind `--color-*`). */
export function layerAToPreviewTokens(layerA: CssVarMap): Record<string, string> {
  const tokens: Record<string, string> = {};

  for (const [key, value] of Object.entries(layerA)) {
    const name = key.startsWith("--") ? key.slice(2) : key;
    const cssKey = `--${name}`;
    tokens[cssKey] = value;

    const colorKey = LAYER_A_COLOR_TAILWIND[name];
    if (colorKey) {
      tokens[colorKey] = value;
    }
    if (name === "sidebar-background") {
      tokens["--sidebar"] = value;
    }
  }

  const inputBorder = resolveInputBorderColor(layerA);
  if (inputBorder) {
    tokens["--color-input"] = inputBorder;
  }

  return tokens;
}

/** Sync panel pickers from parsed Layer A (best-effort for hex-based controls). */
export function themeStateFromLayerA(
  layerA: CssVarMap,
  base: ThemeState
): ThemeState {
  const primaryHex = cssColorToHex(layerA["--primary"]);
  const backgroundHex = cssColorToHex(layerA["--background"]);
  const primary = primaryHex ?? base.primaryColor;
  const background = backgroundHex ?? base.backgroundColor;
  const radius = parseRadiusRem(layerA["--radius"]) ?? base.radius;
  const sansFont = parseFontFromStack(layerA["--font-sans"]);
  const headingFont =
    parseFontFromStack(layerA["--font-heading"]) ?? sansFont ?? base.headingFont;
  const bodyFont = sansFont ?? base.bodyFont;

  return {
    ...base,
    primaryColor: primary,
    backgroundColor: background,
    brandColor: deriveBrandFromPrimary(primary),
    brandOverridden: false,
    radius,
    headingFont,
    bodyFont,
  };
}

function parseRadiusRem(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const remMatch = trimmed.match(/^([\d.]+)rem$/);
  if (remMatch) {
    const n = parseFloat(remMatch[1]);
    return Number.isFinite(n) ? n : undefined;
  }
  const pxMatch = trimmed.match(/^([\d.]+)px$/);
  if (pxMatch) {
    const n = parseFloat(pxMatch[1]);
    return Number.isFinite(n) ? n / 16 : undefined;
  }
  return undefined;
}

function parseFontFromStack(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const quoted = value.match(/['"]([^'"]+)['"]/);
  const candidate = quoted?.[1];
  if (candidate && CURATED_FONTS.some((f) => f.name === candidate)) {
    return candidate;
  }
  for (const font of CURATED_FONTS) {
    if (value.includes(font.name)) return font.name;
  }
  return undefined;
}

/** Best-effort CSS color → #RRGGBB for color pickers. */
export function cssColorToHex(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim();

  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) {
    if (v.length === 4) {
      return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toLowerCase();
    }
    return v.slice(0, 7).toLowerCase();
  }

  const rgbMatch = v.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/
  );
  if (rgbMatch) {
    const r = Math.round(Number(rgbMatch[1]));
    const g = Math.round(Number(rgbMatch[2]));
    const b = Math.round(Number(rgbMatch[3]));
    return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }

  const hslMatch = v.match(
    /^hsla?\(\s*([\d.]+)(?:deg)?(?:\s*,|\s+)\s*([\d.]+)%?(?:\s*,|\s+)\s*([\d.]+)%/
  );
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const s = parseFloat(hslMatch[2]) / 100;
    const l = parseFloat(hslMatch[3]) / 100;
    return hslToHex(h, s, l);
  }

  if (/^[\d.]+\s+[\d.]+%?\s+[\d.]+%?$/.test(v)) {
    const [h, sRaw, lRaw] = v.split(/\s+/);
    const s = parseFloat(sRaw) / 100;
    const l = parseFloat(lRaw) / 100;
    return hslToHex(parseFloat(h), s, l);
  }

  if (v.startsWith("hsl(") && v.includes("var(")) {
    return undefined;
  }

  return undefined;
}
