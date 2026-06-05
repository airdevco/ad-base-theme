import type { ThemeState } from "./theme-state";
import { DEFAULTS, computeDarkVariant, deriveExtensionTokens, CURATED_FONTS, hexToHsl } from "./theme-state";
import type { CssVarMap } from "./theme-preset-bundle";
import { layerAToPreviewTokens } from "./parse-theme-css";


/** Map font display names to their next/font CSS variable names */
const FONT_VAR_MAP: Record<string, string> = {
  Inter: "var(--font-preview-inter)",
  "DM Sans": "var(--font-preview-dm-sans)",
  "Space Grotesk": "var(--font-preview-space-grotesk)",
  Outfit: "var(--font-preview-outfit)",
  "Plus Jakarta Sans": "var(--font-preview-plus-jakarta-sans)",
  Sora: "var(--font-preview-sora)",
  Manrope: "var(--font-preview-manrope)",
  Poppins: "var(--font-preview-poppins)",
  Raleway: "var(--font-preview-raleway)",
  "Playfair Display": "var(--font-preview-playfair-display)",
  Merriweather: "var(--font-preview-merriweather)",
  Lora: "var(--font-preview-lora)",
};

function getFontValue(fontName: string): string {
  const cssVar = FONT_VAR_MAP[fontName];
  const config = CURATED_FONTS.find((f) => f.name === fontName);
  const fallback = config?.category ?? "sans-serif";
  return cssVar
    ? `${cssVar}, '${fontName}', ${fallback}`
    : `'${fontName}', ${fallback}`;
}

/** Proportional radius tiers: [hardcoded px value, multiplier relative to --radius] */
const RADIUS_TIERS: [number, number][] = [
  [28, 3.5],
  [24, 3],
  [20, 2.5],
  [16, 2],
  [12, 1.5],
];

function buildRadiusOverrides(scope: string): string {
  const rules = RADIUS_TIERS.map(
    ([px, mult]) =>
      `${scope} [class*="rounded-[${px}px]"] { border-radius: calc(var(--radius) * ${mult}) !important; }`
  );

  // Nested radius: inner elements inside padded containers need outer_radius - padding
  // for concentric curves (hero image + contact image are 16px inside 28px with p-4 = 16px padding)
  rules.push(
    `${scope} [class*="rounded-[28px]"] [class*="rounded-[16px]"] { border-radius: max(calc(var(--radius) * 3.5 - 16px), 0px) !important; }`
  );

  return rules.join("\n");
}

// ── Light mode design tokens (from globals.css :root) ──
const LIGHT_TOKENS: Record<string, string> = {
  "--color-background": "#ffffff",
  "--color-foreground": "#242529",
  "--color-card": "#ffffff",
  "--color-card-foreground": "#242529",
  "--color-popover": "#ffffff",
  "--color-popover-foreground": "#242529",
  "--color-primary": "#266df0",
  "--color-primary-foreground": "#ffffff",
  "--color-secondary": "#eeeff1",
  "--color-secondary-foreground": "#242529",
  "--color-muted": "#eeeff1",
  "--color-muted-foreground": "rgba(0, 0, 0, 0.55)",
  "--color-accent": "#eeeff1",
  "--color-accent-foreground": "#242529",
  "--color-destructive": "hsl(0 84.2% 60.2%)",
  "--color-destructive-foreground": "hsl(0 0% 98%)",
  "--color-border": "#eeeff1",
  "--color-input": "#eeeff1",
  "--color-ring": "#266df0",
  "--color-chart-1": "#266df0",
  "--color-surface": "#fafafa",
  "--color-sidebar": "#fbfbfb",
  "--color-sidebar-foreground": "#242529",
  "--color-sidebar-primary": "#266df0",
  "--color-sidebar-primary-foreground": "#ffffff",
  "--color-sidebar-accent": "#eeeff1",
  "--color-sidebar-accent-foreground": "#242529",
  "--color-sidebar-border": "#eeeff1",
  "--color-sidebar-ring": "#266df0",
};

/**
 * Derive dark mode tokens from the navy color.
 * Keeps the navy's hue & saturation but at very low lightness values,
 * giving a rich glossy dark feel that's branded rather than neutral gray.
 */
function buildDarkTokens(brandColor: string, primaryColor: string, backgroundColor?: string): Record<string, string> {
  const { h, s } = hexToHsl(brandColor);
  // Use a dampened saturation so it tints without overwhelming
  const sat = Math.round(Math.min(s * 100, 40));
  const hue = Math.round(h);

  const hsl = (l: number) => `hsl(${hue} ${sat}% ${l}%)`;

  return {
    "--color-background": backgroundColor || hsl(4),       // page bg — very dark
    "--color-foreground": "hsl(0 0% 98%)",
    "--color-card": hsl(7),             // cards — slightly lighter
    "--color-card-foreground": "hsl(0 0% 98%)",
    "--color-popover": hsl(7),
    "--color-popover-foreground": "hsl(0 0% 98%)",
    "--color-primary": primaryColor,
    "--color-primary-foreground": "hsl(0 0% 98%)",
    "--color-secondary": hsl(14),
    "--color-secondary-foreground": "hsl(0 0% 98%)",
    "--color-muted": hsl(14),
    "--color-muted-foreground": `hsl(${hue} ${Math.round(sat * 0.4)}% 65%)`,
    "--color-accent": hsl(14),
    "--color-accent-foreground": "hsl(0 0% 98%)",
    "--color-destructive": "hsl(0 62.8% 30.6%)",
    "--color-destructive-foreground": "hsl(0 0% 98%)",
    "--color-border": hsl(18),
    "--color-input": hsl(11),
    "--color-ring": primaryColor,
    "--color-chart-1": primaryColor,
    "--color-surface": hsl(7),
    "--color-sidebar": hsl(8),
    "--color-sidebar-foreground": "hsl(0 0% 96%)",
    "--color-sidebar-primary": primaryColor,
    "--color-sidebar-primary-foreground": "hsl(0 0% 100%)",
    "--color-sidebar-accent": hsl(14),
    "--color-sidebar-accent-foreground": "hsl(0 0% 96%)",
    "--color-sidebar-border": hsl(18),
    "--color-sidebar-ring": primaryColor,
  };
}

/**
 * Build inline style object for the preview container.
 * Uses Tailwind v4 `--color-*` theme tokens directly, since @theme resolves
 * var() at compile time and nested containers can't override via --background alone.
 */
export function buildPreviewStyle(
  theme: ThemeState,
  isDark: boolean,
  layerA?: { light: CssVarMap; dark: CssVarMap } | null
): React.CSSProperties {
  // Dark tokens are derived from navy color for a rich branded feel;
  // primary color is baked into the dark tokens by the builder function.
  const hasLayerA = layerA != null && Object.keys(layerA.light).length > 0;
  const activeLayerA =
    hasLayerA && isDark && Object.keys(layerA!.dark).length > 0
      ? layerA!.dark
      : hasLayerA
        ? layerA!.light
        : null;

  const tokens = isDark
    ? buildDarkTokens(theme.brandColor, computeDarkVariant(theme.primaryColor), theme.backgroundColor)
    : { ...LIGHT_TOKENS };

  if (activeLayerA) {
    Object.assign(tokens, layerAToPreviewTokens(activeLayerA));
  } else {
    // Light mode: apply primary color override to relevant tokens
    if (!isDark && theme.primaryColor !== DEFAULTS.primaryColor) {
      tokens["--color-primary"] = theme.primaryColor;
      tokens["--color-ring"] = theme.primaryColor;
      tokens["--color-chart-1"] = theme.primaryColor;
      tokens["--color-sidebar-primary"] = theme.primaryColor;
      tokens["--color-sidebar-ring"] = theme.primaryColor;
    }

    // Background color override (light or dark)
    if (!isDark && theme.backgroundColor !== DEFAULTS.backgroundColor) {
      tokens["--color-background"] = theme.backgroundColor;
      tokens["--color-surface"] = theme.backgroundColor;
      tokens["--color-sidebar"] = theme.backgroundColor;
    }
  }


  // Layer B brand tokens (hero/auth use bg-brand / bg-brand-gradient)
  const ext = deriveExtensionTokens(theme.primaryColor, theme.brandColor);
  tokens["--color-brand"] = ext.brand;
  tokens["--color-brand-foreground"] = ext.brandForeground;
  tokens["--color-brand-hover"] = ext.brandHover;
  tokens["--color-brand-active"] = ext.brandActive;
  tokens["--color-gradient-brand-from"] = ext.gradientBrandFrom;
  tokens["--color-gradient-brand-via"] = ext.gradientBrandVia;
  tokens["--color-gradient-brand-to"] = ext.gradientBrandTo;
  tokens["--color-primary-hover"] = ext.primaryHover;
  tokens["--color-primary-active"] = ext.primaryActive;
  // Raw Layer B vars consumed by .bg-brand-gradient and var(--brand) references
  tokens["--brand"] = ext.brand;
  tokens["--brand-foreground"] = ext.brandForeground;
  tokens["--brand-hover"] = ext.brandHover;
  tokens["--brand-active"] = ext.brandActive;
  tokens["--gradient-brand-from"] = ext.gradientBrandFrom;
  tokens["--gradient-brand-via"] = ext.gradientBrandVia;
  tokens["--gradient-brand-to"] = ext.gradientBrandTo;
  tokens["--primary-hover"] = ext.primaryHover;
  tokens["--primary-active"] = ext.primaryActive;

  // Radius
  const style: Record<string, string> = { ...tokens };
  const layerRadius = activeLayerA?.["--radius"];
  style["--radius"] = layerRadius ?? `${theme.radius}rem`;
  style["--radius-lg"] = `${theme.radius}rem`;
  style["--radius-md"] = `calc(${theme.radius}rem - 2px)`;
  style["--radius-sm"] = `calc(${theme.radius}rem - 4px)`;

  // Heading font
  style["--font-heading"] = getFontValue(theme.headingFont);

  // Body font
  if (theme.bodyFont !== DEFAULTS.bodyFont) {
    style["fontFamily"] = getFontValue(theme.bodyFont);
  }
  if (theme.bodySize !== DEFAULTS.bodySize) {
    style["fontSize"] = `${theme.bodySize}px`;
  }

  if (isDark) {
    style["colorScheme"] = "dark";
  }

  return style as React.CSSProperties;
}

/**
 * Build scoped CSS for overrides that can't be done with inline styles
 * (heading sizes, dark mode card-holo).
 */
export function buildScopedCSS(theme: ThemeState, scope: string, isDark: boolean): string {
  const lines: string[] = [];

  // Heading font sizes — only override when changed
  const sizeKeys: [string, keyof ThemeState][] = [
    ["h1", "h1Size"], ["h2", "h2Size"], ["h3", "h3Size"],
    ["h4", "h4Size"], ["h5", "h5Size"], ["h6", "h6Size"],
  ];
  for (const [tag, key] of sizeKeys) {
    if (theme[key] !== DEFAULTS[key]) {
      lines.push(`${scope} ${tag} { font-size: ${theme[key]}px; }`);
    }
  }

  // Radius overrides — scale hardcoded rounded-[Npx] classes proportionally
  lines.push(buildRadiusOverrides(scope));

  // Dark mode: override card-holo gradient with branded dark colors
  if (isDark) {
    const { h, s } = hexToHsl(theme.brandColor);
    const sat = Math.round(Math.min(s * 100, 40));
    const hue = Math.round(h);
    const hsl = (l: number) => `hsl(${hue} ${sat}% ${l}%)`;

    lines.push(`
${scope}.dark .card-holo {
  border-color: transparent;
  background: linear-gradient(135deg, ${hsl(9)} 0%, ${hsl(7)} 25%, ${hsl(10)} 50%, ${hsl(9)} 75%, ${hsl(7)} 100%) !important;
  box-shadow: 0 0 0 1px hsla(0 0% 100% / 0.04), 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 hsla(0 0% 100% / 0.03);
}
${scope}.dark [class*="bg-red-100"] {
  background-color: hsl(0 30% 15%) !important;
}`);
  }

  return lines.join("\n");
}
