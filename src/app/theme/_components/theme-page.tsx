"use client";

import { useState, useMemo, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemePanel } from "./theme-panel";
import type { ThemeState, ThemePreset } from "./theme-state";
import { DEFAULTS, computeDarkNavy, computeDarkBackground } from "./theme-state";
import { buildPreviewStyle, buildScopedCSS } from "./build-theme-css";
import type { ThemePresetBundleV1 } from "./theme-preset-bundle";
import { themeStateFromBundle } from "./theme-preset-bundle";
import {
  parseThemeCss,
  themeStateFromLayerA,
  type ParsedThemeCss,
} from "./parse-theme-css";
import {
  PreviewModeSwitcher,
  type PreviewMode,
} from "./preview-mode-switcher";
import { PreviewHome } from "./previews/preview-home";
import { PreviewAdmin } from "./previews/preview-admin";
import { PreviewComponents } from "./previews/preview-components";
import { ThemePreviewProvider } from "@/lib/theme-preview-context";

const PREVIEW_ID = "theme-preview";
const SCOPE = `#${PREVIEW_ID}`;

export function ThemePage({ fontClasses }: { fontClasses: string }) {
  const isMobile = useIsMobile();
  const [theme, setTheme] = useState<ThemeState>({ ...DEFAULTS });
  const [darkMode, setDarkMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("components");
  const lightBrandRef = useRef(DEFAULTS.brandColor);
  const lightBgRef = useRef(DEFAULTS.backgroundColor);
  const activePresetRef = useRef<ThemePreset | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [layerAOverrides, setLayerAOverrides] = useState<ParsedThemeCss | null>(null);
  const lightPanelRef = useRef<ThemeState>({ ...DEFAULTS });
  const darkPanelRef = useRef<ThemeState | null>(null);

  const handlePreviewModeChange = (mode: PreviewMode) => {
    setPreviewMode(mode);
    scrollRef.current?.scrollTo(0, 0);
  };

  const handleReset = () => {
    activePresetRef.current = null;
    setLayerAOverrides(null);
    darkPanelRef.current = null;
    lightPanelRef.current = { ...DEFAULTS };
    lightBrandRef.current = DEFAULTS.brandColor;
    lightBgRef.current = DEFAULTS.backgroundColor;
    setTheme({ ...DEFAULTS });
    setDarkMode(false);
  };

  const chartRevision = `${theme.primaryColor}-${darkMode}`;

  // When toggling dark mode, use preset dark/light states if available, otherwise auto-derive
  const handleDarkModeChange = (dark: boolean) => {
    const preset = activePresetRef.current;
    const hasImportedDark =
      layerAOverrides != null && Object.keys(layerAOverrides.dark).length > 0;

    if (hasImportedDark && darkPanelRef.current) {
      setTheme(dark ? { ...darkPanelRef.current } : { ...lightPanelRef.current });
      setDarkMode(dark);
      return;
    }

    if (preset?.darkState) {
      const targetState = dark ? preset.darkState : preset.state;
      lightBrandRef.current = preset.state.brandColor;
      lightBgRef.current = preset.state.backgroundColor;
      setTheme({ ...targetState });
    } else if (dark) {
      lightBrandRef.current = theme.brandColor;
      lightBgRef.current = theme.backgroundColor;
      const darkBrand = computeDarkNavy(theme.primaryColor);
      const darkBg = computeDarkBackground(theme.primaryColor);
      setTheme((prev) => ({ ...prev, brandColor: darkBrand, backgroundColor: darkBg }));
    } else {
      setTheme((prev) => ({ ...prev, brandColor: lightBrandRef.current, backgroundColor: lightBgRef.current }));
    }
    setDarkMode(dark);
  };

  const handlePresetApply = (preset: ThemePreset) => {
    activePresetRef.current = preset;
    const presetDarkMode = !!preset.defaultDarkMode;
    const state = presetDarkMode && preset.darkState ? preset.darkState : preset.state;
    lightBrandRef.current = preset.state.brandColor;
    lightBgRef.current = preset.state.backgroundColor;
    setTheme({ ...state, brandOverridden: false });
    setDarkMode(presetDarkMode);
    setLayerAOverrides(null);
    darkPanelRef.current = preset.darkState ?? null;
  };

  const handleImportBundle = (bundle: ThemePresetBundleV1) => {
    activePresetRef.current = null;
    const imported = themeStateFromBundle(bundle);
    lightBrandRef.current = imported.light.brandColor;
    lightBgRef.current = imported.light.backgroundColor;
    const useDark = imported.defaultDarkMode;
    const nextState =
      useDark && imported.dark ? imported.dark : imported.light;
    setTheme({ ...nextState });
    setDarkMode(useDark);
    setLayerAOverrides({ light: bundle.layerA.light, dark: bundle.layerA.dark });
    lightPanelRef.current = imported.light;
    darkPanelRef.current = imported.dark ?? null;
  };

  const handleImportThemeCss = (css: string) => {
    const result = parseThemeCss(css);
    if (!result.ok) return result;

    activePresetRef.current = null;
    const light = themeStateFromLayerA(result.parsed.light, theme);
    lightBrandRef.current = light.brandColor;
    lightBgRef.current = light.backgroundColor;

    const dark =
      Object.keys(result.parsed.dark).length > 0
        ? themeStateFromLayerA(result.parsed.dark, light)
        : null;
    darkPanelRef.current = dark;
    lightPanelRef.current = light;

    setLayerAOverrides(result.parsed);
    setTheme(darkMode && dark ? { ...dark } : { ...light });
    return { ok: true as const };
  };

  const getExportInput = () => {
    const preset = activePresetRef.current;
    const light =
      (layerAOverrides ? lightPanelRef.current : undefined) ??
      preset?.state ??
      (darkMode
        ? {
            ...theme,
            brandColor: lightBrandRef.current,
            backgroundColor: lightBgRef.current,
          }
        : theme);
    return {
      light,
      dark: preset?.darkState ?? darkPanelRef.current ?? undefined,
      defaultDarkMode: darkMode,
      id: preset?.name?.toLowerCase().replace(/\s+/g, "-"),
      name: preset?.name,
      layerA: layerAOverrides ?? undefined,
    };
  };

  const previewStyle = useMemo(
    () => ({
      ...buildPreviewStyle(theme, darkMode, layerAOverrides),
      marginRight: isMobile ? 0 : panelOpen ? 380 : 0,
      transition: "margin-right 300ms ease",
    }),
    [theme, darkMode, layerAOverrides, panelOpen, isMobile]
  );

  const scopedCSS = useMemo(
    () => buildScopedCSS(theme, SCOPE, darkMode),
    [theme, darkMode]
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {scopedCSS && <style>{scopedCSS}</style>}

      <div
        ref={scrollRef}
        id={PREVIEW_ID}
        data-chart-revision={chartRevision}
        className={`relative flex-1 overflow-y-auto bg-background text-foreground ${fontClasses} ${darkMode ? "dark" : ""}`}
        style={previewStyle}
      >
        <ThemePreviewProvider chartRevision={chartRevision}>
          {previewMode === "home" && <PreviewHome darkMode={darkMode} />}
          {previewMode === "admin" && <PreviewAdmin />}
          {previewMode === "components" && <PreviewComponents />}
        </ThemePreviewProvider>

        <div className="pointer-events-none sticky bottom-6 z-50 flex justify-center pb-2">
          <PreviewModeSwitcher
            value={previewMode}
            onChange={handlePreviewModeChange}
          />
        </div>
      </div>

      <ThemePanel
        theme={theme}
        onChange={(t) => { activePresetRef.current = null; setLayerAOverrides(null); darkPanelRef.current = null; lightPanelRef.current = t; setTheme(t); }}
        onReset={handleReset}
        darkMode={darkMode}
        onDarkModeChange={handleDarkModeChange}
        onPresetApply={handlePresetApply}
        onImportBundle={handleImportBundle}
        getExportInput={getExportInput}
        onImportThemeCss={handleImportThemeCss}
        hasLayerAImport={layerAOverrides != null}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  );
}
