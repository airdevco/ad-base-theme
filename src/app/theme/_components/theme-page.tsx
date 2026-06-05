"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { PrimaryCTA } from "@/components/home/shared";
import { Hero } from "@/components/home/hero";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { Services } from "@/components/home/services";
import { Features } from "@/components/home/features";
import { Pricing } from "@/components/home/pricing";
import { HowItWorks } from "@/components/home/how-it-works";
import { Team } from "@/components/home/team";
import { FAQ } from "@/components/home/faq";
import { Contact } from "@/components/home/contact";
import { Footer } from "@/components/home/footer";
import { TestimonialSection } from "@/components/home/testimonial";
import { Impact } from "@/components/home/impact";
import { ThemePanel } from "./theme-panel";
import type { ThemeState, ThemePreset } from "./theme-state";
import { DEFAULTS, generatePlaceholderLogoDataUrl, computeDarkNavy, computeDarkBackground } from "./theme-state";
import { buildPreviewStyle, buildScopedCSS } from "./build-theme-css";
import type { ThemePresetBundleV1 } from "./theme-preset-bundle";
import { themeStateFromBundle } from "./theme-preset-bundle";
import {
  parseThemeCss,
  themeStateFromLayerA,
  type ParsedThemeCss,
} from "./parse-theme-css";

const PREVIEW_ID = "theme-preview";
const SCOPE = `#${PREVIEW_ID}`;

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it works", href: "#how-it-works" },
];

export function ThemePage({ fontClasses }: { fontClasses: string }) {
  const isMobile = useIsMobile();
  const [theme, setTheme] = useState<ThemeState>({ ...DEFAULTS });
  const [darkMode, setDarkMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const lightBrandRef = useRef(DEFAULTS.brandColor);
  const lightBgRef = useRef(DEFAULTS.backgroundColor);
  const activePresetRef = useRef<ThemePreset | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [layerAOverrides, setLayerAOverrides] = useState<ParsedThemeCss | null>(null);
  const lightPanelRef = useRef<ThemeState>({ ...DEFAULTS });
  const darkPanelRef = useRef<ThemeState | null>(null);

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

  // Apply a preset: set theme state directly and toggle dark mode
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

  // Regenerate placeholder logo when primary color, text, or icon changes
  useEffect(() => {
    if (theme.logoMode === "placeholder" && theme.logoText) {
      const newDataUrl = generatePlaceholderLogoDataUrl(
        theme.logoText,
        theme.logoIcon,
        theme.primaryColor,
        darkMode
      );
      if (newDataUrl !== theme.logoDataUrl) {
        setTheme((prev) => ({ ...prev, logoDataUrl: newDataUrl }));
      }
    }
  }, [theme.logoMode, theme.logoText, theme.logoIcon, theme.primaryColor, darkMode]);

  const showCustomLogo =
    theme.logoMode !== "none" && theme.logoDataUrl != null;

  // Inline style sets --color-* Tailwind tokens directly (highest specificity)
  const previewStyle = useMemo(
    () => ({
      ...buildPreviewStyle(theme, darkMode, layerAOverrides),
      marginRight: isMobile ? 0 : panelOpen ? 380 : 0,
      transition: "margin-right 300ms ease",
    }),
    [theme, darkMode, layerAOverrides, panelOpen, isMobile]
  );

  // Scoped CSS for brand overrides + heading sizes + dark mode card-holo
  const scopedCSS = useMemo(
    () => buildScopedCSS(theme, SCOPE, darkMode),
    [theme, darkMode]
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {scopedCSS && <style>{scopedCSS}</style>}

      {/* Preview area — inline style sets all Tailwind --color-* tokens */}
      <div
        ref={scrollRef}
        id={PREVIEW_ID}
        className={`flex-1 overflow-y-auto bg-background text-foreground ${fontClasses} ${darkMode ? "dark" : ""}`}
        style={previewStyle}
      >
        {/* Navigation bar — mirrors home layout */}
        <nav className="sticky top-0 z-50 w-full border-b border-transparent bg-background">
          <div className="mx-auto flex max-w-[1150px] items-center justify-between px-6 py-[20px] min-[1198px]:px-0">
            <Link href="/" className="shrink-0">
              {showCustomLogo ? (
                <img
                  src={theme.logoDataUrl!}
                  alt="Logo"
                  className="h-9 max-w-[240px] object-contain"
                />
              ) : (
                <>
                  <Logo
                    height={24}
                    className={darkMode ? "hidden" : "block"}
                  />
                  <Logo
                    height={24}
                    dark
                    className={darkMode ? "block" : "hidden"}
                  />
                </>
              )}
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <span
                  key={link.label}
                  className="cursor-default text-[16px] font-medium leading-[24px] tracking-[-0.8px] text-foreground"
                >
                  {link.label}
                </span>
              ))}
            </div>

            <div className="hidden items-center gap-5 md:flex">
              <span className="cursor-default text-[16px] font-medium leading-[24px] tracking-[-0.8px] text-foreground">
                Sign in
              </span>
              <PrimaryCTA href="#">Get started</PrimaryCTA>
            </div>

            <button className="md:hidden">
              <Menu className="size-6" />
            </button>
          </div>
        </nav>

        {/* Homepage sections */}
        <main>
          <Hero />
          <WhyChooseUs />
          <Services />
          <TestimonialSection />
          <Features />
          <Pricing />
          <HowItWorks />
          <Impact />
          <Team />
          <FAQ />
          <Contact />
          <Footer />
        </main>
      </div>

      {/* Theme Panel */}
      <ThemePanel
        theme={theme}
        onChange={(t) => { activePresetRef.current = null; setLayerAOverrides(null); darkPanelRef.current = null; lightPanelRef.current = t; setTheme(t); }}
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
