export interface GalleryThemePreset {
  id: string;
  name: string;
  description: string;
  font: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    border: string;
  };
  swatches: string[];
}

export const themePresets: GalleryThemePreset[] = [
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark luxury with deep navy tones and gold accents",
    font: "Inter",
    colors: {
      background: "#0f172a",
      foreground: "#f8fafc",
      card: "#1e293b",
      cardForeground: "#f8fafc",
      primary: "#c9a84c",
      primaryForeground: "#0f172a",
      secondary: "#1e293b",
      secondaryForeground: "#f8fafc",
      muted: "#1e293b",
      mutedForeground: "#94a3b8",
      accent: "#1e293b",
      border: "#334155",
    },
    swatches: ["#0f172a", "#1e293b", "#c9a84c", "#94a3b8", "#f8fafc"],
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool, calming blues inspired by deep water",
    font: "Geist",
    colors: {
      background: "#ffffff",
      foreground: "#0c1222",
      card: "#ffffff",
      cardForeground: "#0c1222",
      primary: "#0066cc",
      primaryForeground: "#ffffff",
      secondary: "#eff6ff",
      secondaryForeground: "#0066cc",
      muted: "#f0f7ff",
      mutedForeground: "#5b7a9e",
      accent: "#eff6ff",
      border: "#dce8f5",
    },
    swatches: ["#ffffff", "#eff6ff", "#0066cc", "#5b7a9e", "#0c1222"],
  },
  {
    id: "warm-neutral",
    name: "Warm Neutral",
    description: "Earthy, natural tones with warm undertones",
    font: "Geist",
    colors: {
      background: "#faf9f7",
      foreground: "#292524",
      card: "#ffffff",
      cardForeground: "#292524",
      primary: "#a16207",
      primaryForeground: "#fefce8",
      secondary: "#f5f0e8",
      secondaryForeground: "#a16207",
      muted: "#f5f0e8",
      mutedForeground: "#78716c",
      accent: "#f5f0e8",
      border: "#e7e0d5",
    },
    swatches: ["#faf9f7", "#f5f0e8", "#a16207", "#78716c", "#292524"],
  },
  {
    id: "slate",
    name: "Slate",
    description: "Sophisticated gray palette with violet accents",
    font: "Geist",
    colors: {
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#ffffff",
      cardForeground: "#0f172a",
      primary: "#6d28d9",
      primaryForeground: "#ffffff",
      secondary: "#f1f5f9",
      secondaryForeground: "#6d28d9",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      accent: "#f1f5f9",
      border: "#e2e8f0",
    },
    swatches: ["#ffffff", "#f1f5f9", "#6d28d9", "#64748b", "#0f172a"],
  },
  {
    id: "coral",
    name: "Coral",
    description: "Vibrant warm tones with a bold, modern feel",
    font: "Inter",
    colors: {
      background: "#fffbfa",
      foreground: "#1c1917",
      card: "#ffffff",
      cardForeground: "#1c1917",
      primary: "#e11d48",
      primaryForeground: "#ffffff",
      secondary: "#fff1f2",
      secondaryForeground: "#e11d48",
      muted: "#fef2f2",
      mutedForeground: "#78716c",
      accent: "#fff1f2",
      border: "#fce7e7",
    },
    swatches: ["#fffbfa", "#fff1f2", "#e11d48", "#78716c", "#1c1917"],
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural greens with a calm, grounded aesthetic",
    font: "Geist",
    colors: {
      background: "#fafdf7",
      foreground: "#1a2e1a",
      card: "#ffffff",
      cardForeground: "#1a2e1a",
      primary: "#15803d",
      primaryForeground: "#ffffff",
      secondary: "#f0fdf4",
      secondaryForeground: "#15803d",
      muted: "#f0fdf4",
      mutedForeground: "#6b7c6b",
      accent: "#f0fdf4",
      border: "#dcedd9",
    },
    swatches: ["#fafdf7", "#f0fdf4", "#15803d", "#6b7c6b", "#1a2e1a"],
  },
];
