"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Palette,
  ChevronRight,
  Copy,
  RotateCcw,
  Lock,
  Sun,
  Moon,
  X,
} from "lucide-react";
import type { ThemeState, ThemePreset } from "./theme-state";
import {
  DEFAULTS,
  CURATED_FONTS,
  deriveBrandFromPrimary,
} from "./theme-state";
import { PRESETS } from "./presets";
import type { ThemePresetBundleV1 } from "./theme-preset-bundle";
import {
  bundleFromThemeState,
  parsePresetBundleJson,
  serializePresetBundle,
} from "./theme-preset-bundle";
import { globalsCssFromBundle } from "./export-globals-css";
import { ColorPicker } from "./color-picker";
import { cn } from "@/lib/utils";

type ThemePanelProps = {
  theme: ThemeState;
  onChange: (theme: ThemeState) => void;
  onReset: () => void;
  darkMode: boolean;
  onDarkModeChange: (dark: boolean) => void;
  onPresetApply: (preset: ThemePreset) => void;
  onImportBundle: (bundle: ThemePresetBundleV1) => void;
  getExportInput: () => Parameters<typeof bundleFromThemeState>[0];
  onImportThemeCss: (css: string) => { ok: true } | { ok: false; error: string };
  hasLayerAImport?: boolean;
  activePresetName?: string | null;
  hasOverrides?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ThemePanel({
  theme,
  onChange,
  onReset,
  darkMode,
  onDarkModeChange,
  onPresetApply,
  onImportBundle,
  getExportInput,
  onImportThemeCss,
  hasLayerAImport,
  activePresetName,
  hasOverrides = false,
  open,
  onOpenChange,
}: ThemePanelProps) {
  const isMobile = useIsMobile();
  const [copiedPreset, setCopiedPreset] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [cssImportOpen, setCssImportOpen] = useState(false);
  const [cssImportText, setCssImportText] = useState("");
  const [cssImportError, setCssImportError] = useState<string | null>(null);

  const update = (partial: Partial<ThemeState>) => {
    onChange({ ...theme, ...partial });
  };

  const handlePrimaryChange = (v: string) => {
    if (!theme.brandOverridden) {
      update({ primaryColor: v, brandColor: deriveBrandFromPrimary(v) });
    } else {
      update({ primaryColor: v });
    }
  };

  const handleBrandChange = (v: string) => {
    update({ brandColor: v, brandOverridden: true });
  };

  const handleResetBrandToDerived = () => {
    update({
      brandColor: deriveBrandFromPrimary(theme.primaryColor),
      brandOverridden: false,
    });
  };



  const handleCopyPresetJson = async () => {
    const bundle = bundleFromThemeState(getExportInput());
    await navigator.clipboard.writeText(serializePresetBundle(bundle));
    setCopiedPreset(true);
    setTimeout(() => setCopiedPreset(false), 2000);
  };

  const handleCopyGlobalsCss = async () => {
    const bundle = bundleFromThemeState(getExportInput());
    await navigator.clipboard.writeText(globalsCssFromBundle(bundle));
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };


  const handleImportThemeCss = () => {
    const result = onImportThemeCss(cssImportText);
    if (!result.ok) {
      setCssImportError(result.error);
      return;
    }
    setCssImportError(null);
    setCssImportText("");
    setCssImportOpen(false);
  };

  const handleImportPreset = () => {
    const result = parsePresetBundleJson(importText);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    setImportError(null);
    onImportBundle(result.bundle);
    setImportText("");
    setImportOpen(false);
  };

  return (
    <>
      {/* Toggle tab — hidden on mobile when panel is open */}
      <button
        onClick={() => onOpenChange(!open)}
        className={`fixed z-50 transition-all duration-300 ease-in-out ${
          isMobile
            ? "bottom-5 right-5 flex size-12 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-lg"
            : "right-0 top-1/2 -translate-y-1/2 rounded-l-lg border border-r-0 border-zinc-200 bg-white/90 px-1.5 py-3 shadow-lg backdrop-blur-sm hover:bg-zinc-50"
        }`}
        style={isMobile ? { display: open ? "none" : undefined } : { right: open ? 380 : 0 }}
        title={open ? "Close theme panel" : "Open theme panel"}
      >
        {open && !isMobile ? (
          <ChevronRight className="h-4 w-4 text-zinc-600" />
        ) : (
          <Palette className="h-4 w-4 text-zinc-600" />
        )}
      </button>

      {/* Mobile backdrop overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Panel */}
      <div
        className="fixed right-0 top-0 z-40 flex h-full w-full flex-col border-l border-zinc-200 bg-white shadow-xl transition-transform duration-300 ease-in-out sm:w-[380px]"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-800">
              Theme Previewer
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onReset}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
              title="Reset to defaults"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 sm:hidden"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Presets */}
          <Section title="Presets">
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => {
                const isSelected = activePresetName === preset.name;
                const isModified = isSelected && hasOverrides;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => onPresetApply(preset)}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "border-zinc-900"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <div
                      className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.swatch }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-medium text-zinc-800">
                          {preset.name}
                        </span>
                        {isModified && (
                          <span className="shrink-0 rounded bg-amber-100 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-amber-800">
                            Edited
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[10px] text-zinc-500">
                        {preset.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {hasOverrides && activePresetName && (
              <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
                {activePresetName} has custom changes. Copy Preset JSON or Copy CSS
                includes your overrides.
              </p>
            )}
          </Section>

          {/* Light/Dark Toggle */}
          <Section title="Display">
            <div className="flex gap-1 rounded-lg border border-zinc-200 p-0.5">
              <button
                onClick={() => onDarkModeChange(false)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  !darkMode
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                Light
              </button>
              <button
                onClick={() => onDarkModeChange(true)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  darkMode
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                Dark
              </button>
            </div>
          </Section>

          {/* Colors */}
          <Section title="Colors">
            <ColorPicker
              label="Primary"
              value={theme.primaryColor}
              onChange={handlePrimaryChange}
            />
            <div className="mt-3">
              <ColorPicker
                label="Brand"
                value={theme.brandColor}
                onChange={handleBrandChange}
              />
              {theme.brandOverridden ? (
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <Lock className="h-3 w-3 shrink-0" />
                    Manual override
                  </span>
                  <button
                    type="button"
                    onClick={handleResetBrandToDerived}
                    className="text-[10px] font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
                  >
                    Reset to derived
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-[10px] text-zinc-400">
                  Auto-derived from primary
                </p>
              )}
            </div>
            <div className="mt-3">
              <ColorPicker
                label="Page Background"
                value={theme.backgroundColor}
                onChange={(v) => update({ backgroundColor: v })}
              />
            </div>
          </Section>

          {/* Typography */}
          <Section title="Typography">
            <div className="space-y-3">
              <FontSelect
                label="Heading Font"
                value={theme.headingFont}
                onChange={(v) => update({ headingFont: v })}
              />
              <FontSelect
                label="Body Font"
                value={theme.bodyFont}
                onChange={(v) => update({ bodyFont: v })}
              />
            </div>
          </Section>


          {/* Layer A paste — TweakCN or shadcn create (4b) */}
          <Section title="Theme CSS">
            <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
              Paste a{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-[10px]">:root</code>
              {" + "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-[10px]">.dark</code>
              {" "}block from{" "}
              <a
                href="https://tweakcn.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
              >
                TweakCN
              </a>
              {" or "}
              <a
                href="https://ui.shadcn.com/create"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
              >
                shadcn create
              </a>
              . Layer B (brand, gradients) still derives from primary.
            </p>
            {hasLayerAImport && (
              <p className="mb-2 text-[10px] font-medium text-emerald-700">
                Layer A loaded from pasted CSS
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setCssImportOpen((v) => !v);
                setCssImportError(null);
              }}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              {cssImportOpen ? "Hide CSS paste" : "Paste theme CSS"}
            </button>
            {cssImportOpen && (
              <div className="mt-2 space-y-2">
                <textarea
                  value={cssImportText}
                  onChange={(e) => {
                    setCssImportText(e.target.value);
                    setCssImportError(null);
                  }}
                  placeholder={`:root {
  --primary: #266df0;
  --background: #ffffff;
  ...
}
.dark {
  ...
}`}
                  rows={8}
                  className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-2.5 py-2 font-mono text-[10px] text-zinc-800 outline-none focus:border-zinc-400"
                />
                {cssImportError && (
                  <p className="text-[10px] text-red-600">{cssImportError}</p>
                )}
                <button
                  type="button"
                  onClick={handleImportThemeCss}
                  disabled={!cssImportText.trim()}
                  className="flex w-full items-center justify-center rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Apply Layer A CSS
                </button>
              </div>
            )}
          </Section>
        </div>

        {/* Footer — export / import preset JSON (4a) */}
        <div className="space-y-2 border-t border-zinc-200 px-4 py-3">
          <button
            onClick={handleCopyPresetJson}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            <Copy className="h-3.5 w-3.5" />
            {copiedPreset ? "Copied!" : "Copy Preset JSON"}
          </button>
          <button
            onClick={handleCopyGlobalsCss}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            <Copy className="h-3.5 w-3.5" />
            {copiedCss ? "Copied!" : "Copy CSS for ad-base"}
          </button>
          {/* Copy Prompt hidden until Apply CSS (4c) — generate-prompt.ts kept */}
          <div>
            <button
              type="button"
              onClick={() => {
                setImportOpen((v) => !v);
                setImportError(null);
              }}
              className="w-full text-center text-[11px] font-medium text-zinc-500 hover:text-zinc-700"
            >
              {importOpen ? "Hide import" : "Import Preset JSON"}
            </button>
            {importOpen && (
              <div className="mt-2 space-y-2">
                <textarea
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setImportError(null);
                  }}
                  placeholder='Paste ThemePresetBundle JSON (version 1)...'
                  rows={6}
                  className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-2.5 py-2 font-mono text-[10px] text-zinc-800 outline-none focus:border-zinc-400"
                />
                {importError && (
                  <p className="text-[10px] text-red-600">{importError}</p>
                )}
                <button
                  type="button"
                  onClick={handleImportPreset}
                  disabled={!importText.trim()}
                  className="flex w-full items-center justify-center rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Apply imported preset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ──

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:border-zinc-400"
        style={{ fontFamily: `'${value}', sans-serif` }}
      >
        {CURATED_FONTS.map((font) => (
          <option
            key={font.name}
            value={font.name}
            style={{ fontFamily: `'${font.name}', sans-serif` }}
          >
            {font.name} ({font.category})
          </option>
        ))}
      </select>
    </div>
  );
}
