import type { ThemeState } from "./theme-state";

export type PresetBaseline = {
  light: ThemeState;
  dark: ThemeState | null;
};

const PRESET_OVERRIDE_KEYS: (keyof ThemeState)[] = [
  "primaryColor",
  "brandColor",
  "backgroundColor",
  "headingFont",
  "bodyFont",
  "radius",
  "brandOverridden",
];

export function cloneThemeState(state: ThemeState): ThemeState {
  return { ...state };
}

export function panelStatesEqual(a: ThemeState, b: ThemeState): boolean {
  return PRESET_OVERRIDE_KEYS.every((key) => a[key] === b[key]);
}

export function computeHasPresetOverrides(
  baseline: PresetBaseline | null,
  light: ThemeState,
  dark: ThemeState | null
): boolean {
  if (!baseline) return false;
  if (!panelStatesEqual(baseline.light, light)) return true;
  if (baseline.dark && dark && !panelStatesEqual(baseline.dark, dark)) return true;
  return false;
}

export function createPresetBaseline(
  light: ThemeState,
  dark: ThemeState | null
): PresetBaseline {
  return {
    light: cloneThemeState(light),
    dark: dark ? cloneThemeState(dark) : null,
  };
}
