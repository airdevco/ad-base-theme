import type { LegalPage } from "@/types";
import { mockLegalPages } from "@/mock/legal";
import type { AppVariable, AppVariableValueKind } from "@/types/app-variable";
import { mockAppVariables } from "@/mock/app-variables";

const LEGAL_KEY = "admin-sdc-legal-pages";
const VARS_KEY = "admin-sdc-app-variables";

/** Migrates older stored rows that lack `valueKind`. */
function normalizeAppVariable(raw: AppVariable): AppVariable {
  const k = raw.valueKind;
  if (k === "input" || k === "picklist") return raw;
  let valueKind: AppVariableValueKind = "input";
  if (/picklist|tags/i.test(raw.key) || /tag/i.test(raw.label.toLowerCase())) {
    valueKind = "picklist";
  }
  return { ...raw, valueKind };
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw) as T;
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadLegalPages(): LegalPage[] {
  if (typeof window === "undefined") return mockLegalPages;
  const parsed = safeParse<LegalPage[]>(localStorage.getItem(LEGAL_KEY), mockLegalPages);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : mockLegalPages;
}

export function persistLegalPages(pages: LegalPage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEGAL_KEY, JSON.stringify(pages));
}

export function loadAppVariables(): AppVariable[] {
  if (typeof window === "undefined") {
    return mockAppVariables.map(normalizeAppVariable);
  }
  const parsed = safeParse<AppVariable[]>(localStorage.getItem(VARS_KEY), mockAppVariables);
  const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : mockAppVariables;
  return list.map(normalizeAppVariable);
}

export function persistAppVariables(vars: AppVariable[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VARS_KEY, JSON.stringify(vars));
}
