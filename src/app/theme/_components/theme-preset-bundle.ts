import type { ThemeState } from "./theme-state";
import {
  computeDarkBackground,
  computeDarkNavy,
  computeDarkVariant,
  deriveExtensionTokens,
  type ExtensionTokens,
} from "./theme-state";
import { resolveInputBorderColor } from "./parse-theme-css";

/** CSS custom properties keyed as `--token-name` (Layer A or B). */
export type CssVarMap = Record<string, string>;

export const PRESET_BUNDLE_VERSION = 1 as const;

export type ThemePresetBundleV1 = {
  version: typeof PRESET_BUNDLE_VERSION;
  id?: string;
  name?: string;
  meta: {
    editor?: "tweakcn" | "shadcn-create" | "manual";
    defaultDarkMode?: boolean;
    brandOverridden: boolean;
  };
  /** Source of truth for restoring the theme panel (moves to ad-base-theme in fork). */
  panel: {
    light: ThemeState;
    dark?: ThemeState;
  };
  /** Sparse Layer A — expanded by theme CSS paste in slice 4b. */
  layerA: {
    light: CssVarMap;
    dark: CssVarMap;
  };
  /** ad-base extensions (status colors excluded — fixed in globals.css). */
  layerB: {
    light: CssVarMap;
    dark: CssVarMap;
  };
};

export type BundleExportInput = {
  light: ThemeState;
  dark?: ThemeState;
  defaultDarkMode?: boolean;
  id?: string;
  name?: string;
  editor?: "tweakcn" | "shadcn-create" | "manual";
  /** Full Layer A from TweakCN / shadcn create paste (4b). */
  layerA?: { light: CssVarMap; dark: CssVarMap };
};

export type BundleImportResult = {
  light: ThemeState;
  dark?: ThemeState;
  defaultDarkMode: boolean;
  id?: string;
  name?: string;
};

export type BundleValidationResult =
  | { ok: true; bundle: ThemePresetBundleV1 }
  | { ok: false; error: string };

function extensionToLayerB(ext: ExtensionTokens, surface?: string): CssVarMap {
  return {
    "--brand": ext.brand,
    "--brand-foreground": ext.brandForeground,
    "--brand-hover": ext.brandHover,
    "--brand-active": ext.brandActive,
    "--gradient-brand-from": ext.gradientBrandFrom,
    "--gradient-brand-via": ext.gradientBrandVia,
    "--gradient-brand-to": ext.gradientBrandTo,
    "--primary-hover": ext.primaryHover,
    "--primary-active": ext.primaryActive,
    ...(surface ? { "--surface": surface } : {}),
  };
}

function buildLayerAForState(state: ThemeState, mode: "light" | "dark"): CssVarMap {
  const primary =
    mode === "dark"
      ? computeDarkVariant(state.primaryColor)
      : state.primaryColor;

  return {
    "--primary": primary,
    "--primary-foreground": mode === "dark" ? "hsl(0 0% 98%)" : "#ffffff",
    "--background": state.backgroundColor,
    "--ring": primary,
    "--chart-1": primary,
    "--sidebar-primary": primary,
    "--sidebar-ring": primary,
  };
}

function buildLayerBForState(state: ThemeState, layerA?: CssVarMap): CssVarMap {
  const brandOverride = state.brandOverridden ? state.brandColor : undefined;
  const surface = layerA?.["--sidebar"] ?? "#fafafa";
  const layerB = extensionToLayerB(
    deriveExtensionTokens(state.primaryColor, brandOverride),
    surface
  );

  if (layerA) {
    const inputBorder = resolveInputBorderColor(layerA);
    const shadowXs = layerA["--shadow-xs"];
    const ring = layerA["--ring"];
    if (inputBorder && shadowXs) {
      layerB["--input-shadow"] = `${shadowXs}, 0 0 0 1px ${inputBorder} inset`;
      layerB["--input-shadow-focus"] = `${shadowXs}, 0 0 0 1px ${ring ?? inputBorder} inset`;
    }
  }

  return layerB;
}

function cloneThemeState(state: ThemeState): ThemeState {
  return { ...state };
}

/** Infer dark panel colors when no dedicated dark state was saved. */
export function inferDarkPanel(light: ThemeState): ThemeState {
  return {
    ...light,
    brandColor: computeDarkNavy(light.primaryColor),
    backgroundColor: computeDarkBackground(light.primaryColor),
    brandOverridden: false,
  };
}

/** Serialize current panel state into a v1 preset bundle. */
export function bundleFromThemeState(input: BundleExportInput): ThemePresetBundleV1 {
  const light = cloneThemeState(input.light);
  const dark = input.dark ? cloneThemeState(input.dark) : undefined;
  const darkPanel = dark ?? inferDarkPanel(light);

  return {
    version: PRESET_BUNDLE_VERSION,
    id: input.id,
    name: input.name,
    meta: {
      editor: input.editor ?? "manual",
      defaultDarkMode: input.defaultDarkMode ?? false,
      brandOverridden: light.brandOverridden,
    },
    panel: { light, ...(dark ? { dark } : {}) },
    layerA: input.layerA ?? {
      light: buildLayerAForState(light, "light"),
      dark: buildLayerAForState(darkPanel, "dark"),
    },
    layerB: {
      light: buildLayerBForState(light, input.layerA?.light),
      dark: buildLayerBForState(darkPanel, input.layerA?.dark),
    },
  };
}

/** Restore panel state from a validated bundle. */
export function themeStateFromBundle(bundle: ThemePresetBundleV1): BundleImportResult {
  const light = cloneThemeState(bundle.panel.light);
  const dark = bundle.panel.dark
    ? cloneThemeState(bundle.panel.dark)
    : undefined;

  return {
    light,
    dark,
    defaultDarkMode: bundle.meta.defaultDarkMode ?? false,
    id: bundle.id,
    name: bundle.name,
  };
}

export function serializePresetBundle(bundle: ThemePresetBundleV1): string {
  return JSON.stringify(bundle, null, 2);
}

export function validatePresetBundle(
  value: unknown
): BundleValidationResult {
  if (value == null || typeof value !== "object") {
    return { ok: false, error: "Preset must be a JSON object." };
  }

  const raw = value as Record<string, unknown>;

  if (raw.version !== PRESET_BUNDLE_VERSION) {
    return {
      ok: false,
      error: `Unsupported version "${String(raw.version)}". Expected ${PRESET_BUNDLE_VERSION}.`,
    };
  }

  const panel = raw.panel;
  if (panel == null || typeof panel !== "object") {
    return { ok: false, error: 'Missing "panel" object.' };
  }

  const panelObj = panel as Record<string, unknown>;
  const light = panelObj.light;
  if (!isThemeState(light)) {
    return { ok: false, error: 'Missing or invalid "panel.light" theme state.' };
  }

  const dark = panelObj.dark;
  if (dark !== undefined && !isThemeState(dark)) {
    return { ok: false, error: 'Invalid "panel.dark" theme state.' };
  }

  const meta = raw.meta;
  if (meta == null || typeof meta !== "object") {
    return { ok: false, error: 'Missing "meta" object.' };
  }

  const layerA = raw.layerA;
  const layerB = raw.layerB;
  if (!isLayerMapPair(layerA)) {
    return { ok: false, error: 'Missing or invalid "layerA" (need light and dark maps).' };
  }
  if (!isLayerMapPair(layerB)) {
    return { ok: false, error: 'Missing or invalid "layerB" (need light and dark maps).' };
  }

  const metaObj = meta as Record<string, unknown>;

  const bundle: ThemePresetBundleV1 = {
    version: PRESET_BUNDLE_VERSION,
    id: typeof raw.id === "string" ? raw.id : undefined,
    name: typeof raw.name === "string" ? raw.name : undefined,
    meta: {
      editor:
        metaObj.editor === "tweakcn" || metaObj.editor === "shadcn-create" || metaObj.editor === "manual"
          ? metaObj.editor
          : undefined,
      defaultDarkMode:
        typeof metaObj.defaultDarkMode === "boolean"
          ? metaObj.defaultDarkMode
          : undefined,
      brandOverridden: Boolean(metaObj.brandOverridden),
    },
    panel: {
      light: light as ThemeState,
      ...(dark ? { dark: dark as ThemeState } : {}),
    },
    layerA,
    layerB,
  };

  return { ok: true, bundle };
}

export function parsePresetBundleJson(text: string): BundleValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste preset JSON first." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: "Invalid JSON." };
  }

  return validatePresetBundle(parsed);
}

function isLayerMapPair(value: unknown): value is { light: CssVarMap; dark: CssVarMap } {
  if (value == null || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return isCssVarMap(obj.light) && isCssVarMap(obj.dark);
}

function isCssVarMap(value: unknown): value is CssVarMap {
  if (value == null || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).every(
    (v) => typeof v === "string"
  );
}

function isThemeState(value: unknown): value is ThemeState {
  if (value == null || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.primaryColor === "string" &&
    typeof s.brandColor === "string" &&
    typeof s.backgroundColor === "string" &&
    typeof s.headingFont === "string" &&
    typeof s.bodyFont === "string" &&
    typeof s.h1Size === "number" &&
    typeof s.radius === "number" &&
    typeof s.logoMode === "string" &&
    typeof s.brandOverridden === "boolean"
  );
}
