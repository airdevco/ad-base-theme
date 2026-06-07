import {
  DEFAULTS,
  deriveBrandFromPrimary,
  type ThemePreset,
  type ThemeState,
} from "../theme-state";
import { parseThemeCss } from "../parse-theme-css";
import { CORPORATE_THEME_CSS } from "./corporate-theme.css";
import { BOLD_THEME_CSS } from "./bold-theme.css";
import { EDITORIAL_THEME_CSS } from "./editorial-theme.css";
import { MINIMALIST_THEME_CSS } from "./minimalist-theme.css";
import { PLAYFUL_THEME_CSS } from "./playful-theme.css";

const corporateParsed = parseThemeCss(CORPORATE_THEME_CSS);
if (!corporateParsed.ok) {
  throw new Error(`Corporate theme CSS parse failed: ${corporateParsed.error}`);
}

const boldParsed = parseThemeCss(BOLD_THEME_CSS);
if (!boldParsed.ok) {
  throw new Error(`Bold theme CSS parse failed: ${boldParsed.error}`);
}

const editorialParsed = parseThemeCss(EDITORIAL_THEME_CSS);
if (!editorialParsed.ok) {
  throw new Error(`Editorial theme CSS parse failed: ${editorialParsed.error}`);
}

const minimalistParsed = parseThemeCss(MINIMALIST_THEME_CSS);
if (!minimalistParsed.ok) {
  throw new Error(`Minimalist theme CSS parse failed: ${minimalistParsed.error}`);
}

const playfulParsed = parseThemeCss(PLAYFUL_THEME_CSS);
if (!playfulParsed.ok) {
  throw new Error(`Playful theme CSS parse failed: ${playfulParsed.error}`);
}

const CORPORATE_LAYER_A = corporateParsed.parsed;
const BOLD_LAYER_A = boldParsed.parsed;
const EDITORIAL_LAYER_A = editorialParsed.parsed;
const MINIMALIST_LAYER_A = minimalistParsed.parsed;
const PLAYFUL_LAYER_A = playfulParsed.parsed;

const CORPORATE_LIGHT_STATE: ThemeState = {
  ...DEFAULTS,
  primaryColor: "#266df0",
  brandColor: deriveBrandFromPrimary("#266df0"),
  backgroundColor: "#ffffff",
  headingFont: "Funnel Sans",
  bodyFont: "Funnel Sans",
  radius: 0.5,
  brandOverridden: false,
};

const CORPORATE_DARK_STATE: ThemeState = {
  ...DEFAULTS,
  primaryColor: "#3b82f6",
  brandColor: deriveBrandFromPrimary("#3b82f6"),
  backgroundColor: "#09090b",
  headingFont: "Funnel Sans",
  bodyFont: "Funnel Sans",
  radius: 0.5,
  brandOverridden: false,
};

const BOLD_LIGHT_STATE: ThemeState = {
  ...DEFAULTS,
  primaryColor: "#0ea472",
  brandColor: deriveBrandFromPrimary("#0ea472"),
  backgroundColor: "#fcfdfd",
  headingFont: "Inter",
  bodyFont: "Inter",
  radius: 0.6,
  brandOverridden: false,
};

const BOLD_DARK_STATE: ThemeState = {
  ...DEFAULTS,
  primaryColor: "#12d393",
  brandColor: deriveBrandFromPrimary("#12d393"),
  backgroundColor: "#050b09",
  headingFont: "Inter",
  bodyFont: "Inter",
  radius: 0.6,
  brandOverridden: false,
};

const EDITORIAL_LIGHT_STATE: ThemeState = {
  ...DEFAULTS,
  primaryColor: "#cba86c",
  brandColor: deriveBrandFromPrimary("#cba86c"),
  backgroundColor: "#fcfbf8",
  headingFont: "Merriweather",
  bodyFont: "Manrope",
  radius: 0.3,
  brandOverridden: false,
};

const EDITORIAL_DARK_STATE: ThemeState = {
  ...DEFAULTS,
  primaryColor: "#cba86c",
  brandColor: deriveBrandFromPrimary("#cba86c"),
  backgroundColor: "#0d0d0d",
  headingFont: "Merriweather",
  bodyFont: "Manrope",
  radius: 0.3,
  brandOverridden: false,
};

const MINIMALIST_LIGHT_STATE: ThemeState = {
  ...DEFAULTS,
  primaryColor: "#101723",
  brandColor: deriveBrandFromPrimary("#101723"),
  backgroundColor: "#ffffff",
  headingFont: "DM Sans",
  bodyFont: "DM Sans",
  radius: 0.625,
  brandOverridden: false,
};

const MINIMALIST_DARK_STATE: ThemeState = {
  ...DEFAULTS,
  primaryColor: "#d7dfe5",
  brandColor: deriveBrandFromPrimary("#d7dfe5"),
  backgroundColor: "#141d2b",
  headingFont: "DM Sans",
  bodyFont: "DM Sans",
  radius: 0.625,
  brandOverridden: false,
};

const PLAYFUL_LIGHT_STATE: ThemeState = {
  ...DEFAULTS,
  primaryColor: "#db0000",
  brandColor: deriveBrandFromPrimary("#db0000"),
  backgroundColor: "#ffffff",
  headingFont: "Inter",
  bodyFont: "Inter",
  radius: 0,
  brandOverridden: false,
};

const PLAYFUL_DARK_STATE: ThemeState = {
  ...DEFAULTS,
  primaryColor: "#ff0000",
  brandColor: deriveBrandFromPrimary("#ff0000"),
  backgroundColor: "#000000",
  headingFont: "Inter",
  bodyFont: "Inter",
  radius: 0,
  brandOverridden: false,
};

export const PRESETS: ThemePreset[] = [
  {
    name: "Corporate",
    description: "Funnel Sans / Blue",
    swatch: "#266df0",
    layerA: CORPORATE_LAYER_A,
    editor: "tweakcn",
    state: CORPORATE_LIGHT_STATE,
    darkState: CORPORATE_DARK_STATE,
  },
  {
    name: "Bold",
    description: "Inter / Green",
    swatch: "#0ea472",
    layerA: BOLD_LAYER_A,
    editor: "tweakcn",
    layerAPatch: { chartsFromPrimary: "hue" },
    state: BOLD_LIGHT_STATE,
    darkState: BOLD_DARK_STATE,
  },
  {
    name: "Editorial",
    description: "Merriweather / Gold",
    swatch: "#cba86c",
    layerA: EDITORIAL_LAYER_A,
    editor: "tweakcn",
    layerAPatch: {
      patchRingFromPrimary: false,
      patchSidebarPrimaryFromPrimary: false,
    },
    state: EDITORIAL_LIGHT_STATE,
    darkState: EDITORIAL_DARK_STATE,
  },
  {
    name: "Warm",
    description: "Geist / Coral",
    swatch: "#E5583E",
    state: {
      ...DEFAULTS,
      primaryColor: "#E5583E",
      brandColor: "#3D1A0A",
      backgroundColor: "#FAF7F2",
      headingFont: "Geist",
      bodyFont: "Geist",
      radius: 0.75,
    },
  },
  {
    name: "Minimalist",
    description: "DM Sans / Neutral",
    swatch: "#101723",
    layerA: MINIMALIST_LAYER_A,
    editor: "tweakcn",
    layerAPatch: {
      chartsFromPrimary: "neutral",
      patchRingFromPrimary: false,
      patchSidebarPrimaryFromPrimary: false,
    },
    state: MINIMALIST_LIGHT_STATE,
    darkState: MINIMALIST_DARK_STATE,
  },
  {
    name: "Playful",
    description: "Inter / Red",
    swatch: "#db0000",
    layerA: PLAYFUL_LAYER_A,
    editor: "tweakcn",
    layerAPatch: {
      patchRingFromPrimary: false,
      patchSidebarPrimaryFromPrimary: false,
    },
    state: PLAYFUL_LIGHT_STATE,
    darkState: PLAYFUL_DARK_STATE,
  },
];
