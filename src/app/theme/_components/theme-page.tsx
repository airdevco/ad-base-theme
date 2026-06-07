"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemePanel } from "./theme-panel";
import type { ThemeState, ThemePreset } from "./theme-state";
import {
  DEFAULTS,
  computeDarkNavy,
  computeDarkBackground,
  deriveBrandFromPrimary,
} from "./theme-state";
import { PRESETS } from "./presets";
import { buildPreviewStyle, buildScopedCSS } from "./build-theme-css";
import type { ThemePresetBundleV1 } from "./theme-preset-bundle";
import { inferDarkPanel, themeStateFromBundle } from "./theme-preset-bundle";
import {
  parseThemeCss,
  themeStateFromLayerA,
  type ParsedThemeCss,
} from "./parse-theme-css";
import {
  applyPanelToLayerA,
  cloneLayerMaps,
  syncLayerAFromPreset,
} from "./apply-panel-to-layer-a";
import {
  computeHasPresetOverrides,
  createPresetBaseline,
  type PresetBaseline,
} from "./preset-overrides";
import {
  PreviewModeSwitcher,
  type PreviewMode,
} from "./preview-mode-switcher";
import { PreviewHome } from "./previews/preview-home";
import { PreviewAdmin } from "./previews/preview-admin";
import { PreviewComponents } from "./previews/preview-components";
import { ThemePreviewProvider } from "@/lib/theme-preview-context";
import { cn } from "@/lib/utils";

const PREVIEW_ID = "theme-preview";
const SCOPE = `#${PREVIEW_ID}`;

const DEFAULT_INIT = {
  theme: { ...DEFAULTS },
  layerA: null as ParsedThemeCss | null,
  lightPanel: { ...DEFAULTS },
  darkPanel: null as ThemeState | null,
  preset: null as ThemePreset | null,
};

export function ThemePage({ fontClasses }: { fontClasses: string }) {
  const isMobile = useIsMobile();
  const [theme, setTheme] = useState<ThemeState>(() => ({ ...DEFAULT_INIT.theme }));
  const [darkMode, setDarkMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("components");
  const lightBrandRef = useRef(DEFAULT_INIT.lightPanel.brandColor);
  const lightBgRef = useRef(DEFAULT_INIT.lightPanel.backgroundColor);
  const activePresetRef = useRef<ThemePreset | null>(DEFAULT_INIT.preset);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [layerAOverrides, setLayerAOverrides] = useState<ParsedThemeCss | null>(
    () => DEFAULT_INIT.layerA
  );
  const lightPanelRef = useRef<ThemeState>({ ...DEFAULT_INIT.lightPanel });
  const darkPanelRef = useRef<ThemeState | null>(
    DEFAULT_INIT.darkPanel ? { ...DEFAULT_INIT.darkPanel } : null
  );
  const [activePresetName, setActivePresetName] = useState<string | null>(null);
  const [presetBaseline, setPresetBaseline] = useState<PresetBaseline | null>(null);
  const [hasOverrides, setHasOverrides] = useState(false);

  const syncOverrideFlag = useCallback(
    (light: ThemeState, dark: ThemeState | null, baseline: PresetBaseline | null) => {
      setHasOverrides(computeHasPresetOverrides(baseline, light, dark));
    },
    []
  );

  const handlePreviewModeChange = (mode: PreviewMode) => {
    setPreviewMode(mode);
    scrollRef.current?.scrollTo(0, 0);
  };

  const applyPreset = useCallback((preset: ThemePreset) => {
    activePresetRef.current = preset;
    const presetDarkMode = !!preset.defaultDarkMode;

    const light = preset.layerA
      ? themeStateFromLayerA(preset.layerA.light, preset.state)
      : preset.state;
    const dark = preset.layerA?.dark
      ? themeStateFromLayerA(preset.layerA.dark, preset.darkState ?? light)
      : preset.darkState ?? null;

    const lightWithBrand = light.brandOverridden
      ? light
      : { ...light, brandColor: deriveBrandFromPrimary(light.primaryColor) };
    const darkWithBrand =
      dark && !dark.brandOverridden
        ? { ...dark, brandColor: deriveBrandFromPrimary(dark.primaryColor) }
        : dark;

    lightPanelRef.current = lightWithBrand;
    darkPanelRef.current = darkWithBrand;
    lightBrandRef.current = lightWithBrand.brandColor;
    lightBgRef.current = lightWithBrand.backgroundColor;

    setLayerAOverrides(
      preset.layerA
        ? preset.layerAPatch
          ? syncLayerAFromPreset(
              cloneLayerMaps(preset.layerA),
              lightWithBrand,
              darkWithBrand,
              preset.layerAPatch
            )
          : cloneLayerMaps(preset.layerA)
        : null
    );
    setTheme({
      ...(presetDarkMode && darkWithBrand ? darkWithBrand : lightWithBrand),
      brandOverridden: false,
    });
    setDarkMode(presetDarkMode);
    setActivePresetName(preset.name);
    const baseline = createPresetBaseline(lightWithBrand, darkWithBrand);
    setPresetBaseline(baseline);
    setHasOverrides(false);
  }, []);

  const resetToDefaults = useCallback(() => {
    activePresetRef.current = null;
    lightPanelRef.current = { ...DEFAULTS };
    darkPanelRef.current = null;
    lightBrandRef.current = DEFAULTS.brandColor;
    lightBgRef.current = DEFAULTS.backgroundColor;
    setLayerAOverrides(null);
    setTheme({ ...DEFAULTS });
    setDarkMode(false);
    setActivePresetName(null);
    setPresetBaseline(null);
    setHasOverrides(false);
  }, []);

  const handleReset = () => {
    resetToDefaults();
  };

  const chartRevision = `${theme.primaryColor}-${darkMode}`;

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
      setTheme((prev) => ({
        ...prev,
        brandColor: lightBrandRef.current,
        backgroundColor: lightBgRef.current,
      }));
    }
    setDarkMode(dark);
  };

  const handlePresetApply = (preset: ThemePreset) => {
    applyPreset(preset);
  };

  const handleImportBundle = (bundle: ThemePresetBundleV1) => {
    const matchedPreset =
      PRESETS.find((p) => p.name === bundle.name) ?? null;
    activePresetRef.current = matchedPreset;
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
    setActivePresetName(matchedPreset?.name ?? bundle.name ?? null);
    const baseline = createPresetBaseline(imported.light, imported.dark ?? null);
    setPresetBaseline(baseline);
    setHasOverrides(false);
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
    setActivePresetName(null);
    setPresetBaseline(null);
    setHasOverrides(false);
    return { ok: true as const };
  };

  const handleThemeChange = (incoming: ThemeState) => {
    const next: ThemeState = incoming.brandOverridden
      ? incoming
      : { ...incoming, brandColor: deriveBrandFromPrimary(incoming.primaryColor) };

    if (darkMode) {
      darkPanelRef.current = next;
    } else {
      lightPanelRef.current = next;
      lightBrandRef.current = next.brandColor;
      lightBgRef.current = next.backgroundColor;
    }

    if (layerAOverrides) {
      const mapKey = darkMode ? "dark" : "light";
      const mode = darkMode ? "dark" : "light";
      const patchOpts = activePresetRef.current?.layerAPatch;
      setLayerAOverrides((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [mapKey]: applyPanelToLayerA(prev[mapKey], next, mode, patchOpts),
        };
      });
    }

    setTheme(next);
    const nextLight = lightPanelRef.current;
    const nextDark = darkPanelRef.current;
    syncOverrideFlag(nextLight, nextDark, presetBaseline);
  };

  const getExportInput = () => {
    const preset = activePresetRef.current;
    const light = lightPanelRef.current;
    const dark = darkPanelRef.current ?? undefined;

    let layerA = layerAOverrides ?? preset?.layerA;
    const patchOpts = preset?.layerAPatch;
    if (layerA) {
      const darkPanel = dark ?? inferDarkPanel(light);
      layerA = {
        light: applyPanelToLayerA(layerA.light, light, "light", patchOpts),
        dark: applyPanelToLayerA(layerA.dark, darkPanel, "dark", patchOpts),
      };
    }

    return {
      light,
      dark,
      defaultDarkMode: darkMode,
      id: preset?.name?.toLowerCase().replace(/\s+/g, "-"),
      name: preset?.name,
      editor: preset?.editor ?? (layerA ? "tweakcn" : undefined),
      layerA,
    };
  };

  const activePreset = useMemo(
    () => PRESETS.find((p) => p.name === activePresetName) ?? null,
    [activePresetName]
  );

  const previewStyle = useMemo(
    () => ({
      ...buildPreviewStyle(
        theme,
        darkMode,
        layerAOverrides,
        activePreset?.layerAPatch
      ),
      marginRight: isMobile ? 0 : panelOpen ? 380 : 0,
      transition: "margin-right 300ms ease",
    }),
    [theme, darkMode, layerAOverrides, panelOpen, isMobile, activePreset]
  );

  const activeLayerA = useMemo(() => {
    if (!layerAOverrides || Object.keys(layerAOverrides.light).length === 0) {
      return null;
    }
    return darkMode && Object.keys(layerAOverrides.dark).length > 0
      ? layerAOverrides.dark
      : layerAOverrides.light;
  }, [layerAOverrides, darkMode]);

  const scopedCSS = useMemo(
    () => buildScopedCSS(theme, SCOPE, darkMode, activeLayerA),
    [theme, darkMode, activeLayerA]
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {scopedCSS && <style>{scopedCSS}</style>}

      <div
        ref={scrollRef}
        id={PREVIEW_ID}
        data-chart-revision={chartRevision}
        className={`relative flex-1 bg-background text-foreground ${fontClasses} ${darkMode ? "dark" : ""} ${
          previewMode === "admin"
            ? "flex min-h-0 flex-col overflow-hidden"
            : "overflow-y-auto"
        }`}
        style={previewStyle}
      >
        <ThemePreviewProvider chartRevision={chartRevision}>
          {previewMode === "home" && <PreviewHome darkMode={darkMode} />}
          {previewMode === "admin" && <PreviewAdmin />}
          {previewMode === "components" && <PreviewComponents />}
        </ThemePreviewProvider>

        <div
          className={cn(
            "pointer-events-none z-50 flex justify-center pb-2",
            previewMode === "admin"
              ? "absolute inset-x-0 bottom-6"
              : "sticky bottom-6"
          )}
        >
          <PreviewModeSwitcher
            value={previewMode}
            onChange={handlePreviewModeChange}
          />
        </div>
      </div>

      <ThemePanel
        theme={theme}
        onChange={handleThemeChange}
        onReset={handleReset}
        darkMode={darkMode}
        onDarkModeChange={handleDarkModeChange}
        onPresetApply={handlePresetApply}
        onImportBundle={handleImportBundle}
        getExportInput={getExportInput}
        onImportThemeCss={handleImportThemeCss}
        hasLayerAImport={layerAOverrides != null}
        activePresetName={activePresetName}
        hasOverrides={hasOverrides}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  );
}
