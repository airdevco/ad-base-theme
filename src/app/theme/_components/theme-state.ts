// ── Theme state types, defaults, presets, fonts, color utilities ──

export type LogoMode = "none" | "upload" | "placeholder";

export interface ThemeState {
  primaryColor: string;
  brandColor: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
  h1Size: number;
  h2Size: number;
  h3Size: number;
  h4Size: number;
  h5Size: number;
  h6Size: number;
  bodySize: number;
  radius: number;
  logoMode: LogoMode;
  logoDataUrl: string | null;
  logoText: string;
  logoIcon: string;
  brandOverridden: boolean;
}

export const DEFAULTS: ThemeState = {
  primaryColor: "#266df0",
  brandColor: "#0F1E4B",
  backgroundColor: "#ffffff",
  headingFont: "Inter",
  bodyFont: "Inter",
  h1Size: 56,
  h2Size: 45,
  h3Size: 24,
  h4Size: 20,
  h5Size: 18,
  h6Size: 16,
  bodySize: 16,
  radius: 0.5,
  logoMode: "none",
  logoDataUrl: null,
  logoText: "",
  logoIcon: "briefcase",
  brandOverridden: false,
};

export type CuratedFont = {
  name: string;
  weights: number[];
  category: "sans-serif" | "serif" | "display";
};

export const CURATED_FONTS: CuratedFont[] = [
  { name: "Geist", weights: [400, 500, 600, 700], category: "sans-serif" },
  { name: "Funnel Sans", weights: [400, 500, 600, 700], category: "sans-serif" },
  { name: "Inter", weights: [400, 500, 600, 700], category: "sans-serif" },
  { name: "DM Sans", weights: [400, 500, 600, 700], category: "sans-serif" },
  { name: "Space Grotesk", weights: [400, 500, 600, 700], category: "sans-serif" },
  { name: "Outfit", weights: [400, 500, 600, 700], category: "sans-serif" },
  { name: "Plus Jakarta Sans", weights: [400, 500, 600, 700, 800], category: "sans-serif" },
  { name: "Sora", weights: [400, 500, 600, 700], category: "sans-serif" },
  { name: "Manrope", weights: [400, 500, 600, 700, 800], category: "sans-serif" },
  { name: "Poppins", weights: [400, 500, 600, 700], category: "sans-serif" },
  { name: "Raleway", weights: [400, 500, 600, 700], category: "sans-serif" },
  { name: "Playfair Display", weights: [400, 500, 600, 700], category: "serif" },
  { name: "Merriweather", weights: [400, 700], category: "serif" },
  { name: "Lora", weights: [400, 500, 600, 700], category: "serif" },
];

export type ThemePreset = {
  name: string;
  description: string;
  swatch: string; // primary color for the swatch
  state: ThemeState;
  defaultDarkMode?: boolean;
  /** If provided, this preset has dedicated dark mode colors */
  darkState?: ThemeState;
  /** Full TweakCN Layer A tokens (light + dark) */
  layerA?: { light: import("./theme-preset-bundle").CssVarMap; dark: import("./theme-preset-bundle").CssVarMap };
  editor?: "tweakcn" | "shadcn-create" | "manual";
  /** How to merge panel state into Layer A (charts, ring, sidebar). */
  layerAPatch?: import("./apply-panel-to-layer-a").LayerAPatchOptions;
};

/** Build a single Google Fonts URL that preloads all curated fonts with all weights */
export function buildAllFontsUrl(): string {
  const families = CURATED_FONTS.map(
    (f) => `family=${f.name.replace(/ /g, "+")}:wght@${f.weights.join(";")}`
  ).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// ── Color utilities ──

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r: r255, g: g255, b: b255 } = hexToRgb(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) {
    const v = Math.round(l * 255);
    return rgbToHex(v, v, v);
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hN = h / 360;
  return rgbToHex(
    Math.round(hue2rgb(p, q, hN + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, hN) * 255),
    Math.round(hue2rgb(p, q, hN - 1 / 3) * 255)
  );
}

/** Lighten a hex color by a fraction (0–1) */
export function lightenHex(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.min(1, l + amount));
}

/** Darken a hex color by a fraction (0–1) */
export function darkenHex(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}

/**
 * Compute proportionally adjusted variant shades when the base navy changes.
 * The original navy (#0F1E4B) has known variants at specific lightness offsets.
 * We preserve the same relative offsets for the new navy.
 */
export function computeNavyVariants(newNavy: string): {
  base: string;
  lighter1: string; // replaces #142858
  lighter2: string; // replaces #162D6B
  darker1: string;  // replaces #0B1735
  footerDark: string; // replaces #0A1634
} {
  const baseHsl = hexToHsl(newNavy);
  // Original offsets from #0F1E4B (l ≈ 0.176):
  // #142858 (l ≈ 0.212) → +0.036
  // #162D6B (l ≈ 0.254) → +0.078
  // #0B1735 (l ≈ 0.125) → -0.051
  // #0A1634 (l ≈ 0.120) → -0.056
  return {
    base: newNavy,
    lighter1: hslToHex(baseHsl.h, baseHsl.s, Math.min(1, baseHsl.l + 0.036)),
    lighter2: hslToHex(baseHsl.h, baseHsl.s, Math.min(1, baseHsl.l + 0.078)),
    darker1: hslToHex(baseHsl.h, baseHsl.s, Math.max(0, baseHsl.l - 0.051)),
    footerDark: hslToHex(baseHsl.h, baseHsl.s, Math.max(0, baseHsl.l - 0.056)),
  };
}

/**
 * Compute a suggested dark mode primary color — lighter and more saturated
 * to maintain contrast on dark backgrounds.
 */
export function computeDarkVariant(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  // Increase lightness by ~15% and bump saturation slightly
  return hslToHex(h, Math.min(1, s * 1.1), Math.min(0.85, l + 0.15));
}

/**
 * Compute a dark navy color from a given color's hue.
 * Uses the same hue, high saturation, and very low lightness (~8%)
 * for a rich branded dark background.
 */
export function computeDarkNavy(sourceColor: string): string {
  const { h } = hexToHsl(sourceColor);
  return hslToHex(h, 0.7, 0.08);
}

/**
 * Compute a dark background color from a given color's hue.
 * Uses the same hue with dampened saturation and very low lightness (4%),
 * matching the dark token derivation in build-theme-css.
 */
export function computeDarkBackground(sourceColor: string): string {
  const { h, s } = hexToHsl(sourceColor);
  const sat = Math.min(s, 0.4);
  return hslToHex(h, sat, 0.04);
}


export type ExtensionTokens = {
  brand: string;
  brandForeground: string;
  brandHover: string;
  brandActive: string;
  gradientBrandFrom: string;
  gradientBrandVia: string;
  gradientBrandTo: string;
  primaryHover: string;
  primaryActive: string;
};

/** Derive Layer B brand base from primary (same hue, low lightness). */
export function deriveBrandFromPrimary(primary: string): string {
  const { l } = hexToHsl(primary);
  // Light primaries (e.g. minimalist dark-mode panel): navy from hue
  if (l > 0.55) {
    return computeDarkNavy(primary);
  }
  // Already a dark brand-like primary — deepen slightly for gradient range
  if (l < 0.22) {
    return darkenHex(primary, 0.03);
  }
  return computeDarkNavy(primary);
}

/** Derive Layer B extension tokens; optional brandOverride skips auto-derive. */
export function deriveExtensionTokens(
  primary: string,
  brandOverride?: string
): ExtensionTokens {
  const brand = brandOverride ?? deriveBrandFromPrimary(primary);
  const variants = computeNavyVariants(brand);
  const { h, s, l } = hexToHsl(primary);
  return {
    brand,
    brandForeground: "#ffffff",
    brandHover: lightenHex(brand, 0.05),
    brandActive: variants.darker1,
    gradientBrandFrom: variants.base,
    gradientBrandVia: variants.lighter1,
    gradientBrandTo: variants.darker1,
    primaryHover: hslToHex(h, s, Math.min(1, l + 0.05)),
    primaryActive: hslToHex(h, s, Math.max(0, l - 0.02)),
  };
}

/** Check if theme state differs from defaults */
export function hasChanges(state: ThemeState): boolean {
  return (Object.keys(DEFAULTS) as (keyof ThemeState)[]).some(
    (key) => state[key] !== DEFAULTS[key]
  );
}

// ── Placeholder logo generation ──

/** Curated icon SVG paths (24x24 viewBox, from lucide) */
export const LOGO_ICONS: Record<string, { label: string; paths: string[] }> = {
  briefcase: {
    label: "Briefcase",
    paths: [
      "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
      "M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z",
    ],
  },
  rocket: {
    label: "Rocket",
    paths: [
      "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",
      "M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
      "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0",
      "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
    ],
  },
  shield: {
    label: "Shield",
    paths: [
      "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
    ],
  },
  zap: {
    label: "Zap",
    paths: ["M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"],
  },
  globe: {
    label: "Globe",
    paths: [
      "M21.54 15H17a2 2 0 0 0-2 2v4.54",
      "M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17",
      "M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05",
      "M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0",
    ],
  },
  star: {
    label: "Star",
    paths: [
      "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
    ],
  },
  building: {
    label: "Building",
    paths: [
      "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",
      "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",
      "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
      "M10 6h4",
      "M10 10h4",
      "M10 14h4",
      "M10 18h4",
    ],
  },
  sparkles: {
    label: "Sparkles",
    paths: [
      "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      "M20 3v4",
      "M22 5h-4",
      "M4 17v2",
      "M5 18H3",
    ],
  },
};

/**
 * Generate a placeholder logo SVG as a data URL.
 * Renders: [colored circle with icon] [company name text]
 */
export function generatePlaceholderLogoDataUrl(
  text: string,
  iconName: string,
  primaryColor: string,
  darkMode = false
): string {
  const icon = LOGO_ICONS[iconName] ?? LOGO_ICONS.briefcase;
  const circleR = 16;
  const iconSize = 14;
  const textX = circleR * 2 + 8;
  // Generous text width estimate (~11px per char at font-size 18, fallback fonts can be wider)
  const textWidth = Math.max(text.length * 12, 60);
  const svgWidth = textX + textWidth + 16;
  const svgHeight = circleR * 2 + 4;

  const iconPaths = icon.paths
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <circle cx="${circleR}" cy="${circleR + 2}" r="${circleR}" fill="${primaryColor}"/>
  <g transform="translate(${circleR - iconSize / 2}, ${circleR + 2 - iconSize / 2}) scale(${iconSize / 24})">
    ${iconPaths}
  </g>
  <text x="${textX}" y="${svgHeight / 2 + 6}" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="${darkMode ? "#ffffff" : "#242529"}">${escapeXml(text)}</text>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
