"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Percent } from "lucide-react";
import type { LegalPage } from "@/types";
import type { AppVariable } from "@/types/app-variable";
import { mockAppVariables } from "@/mock/app-variables";
import { AdminSdcPageHeader } from "@/components/layout/admin-sdc-page-header";
import { SdcHeaderLead } from "@/components/layout/admin-sdc-sidebar";
import { AdminSdcPageHeaderActions } from "@/components/layout/admin-sdc-page-header-actions";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { LegalPageEditDialog } from "./legal-page-edit-dialog";
import { AppVariableDialog } from "./app-variable-dialog";
import { loadLegalPages, loadAppVariables, persistLegalPages, persistAppVariables } from "./_lib/settings-storage";

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatVariableSubtitle(v: AppVariable): string {
  const raw =
    v.valueKind === "picklist"
      ? v.value
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .join(", ")
      : v.value.trim();
  if (!raw) return "No value set";
  return raw.length > 80 ? `${raw.slice(0, 80)}…` : raw;
}

const defaultSingletonVariable: AppVariable =
  mockAppVariables[0] ?? {
    id: "var_singleton",
    key: "app_variable",
    label: "App variable",
    valueKind: "input",
    value: "",
    category: "General",
    description: "Application-wide configuration value.",
  };

export default function AdminSdcSettingsPage() {
  const [legalPages, setLegalPages] = useState<LegalPage[]>(() => loadLegalPages());
  const [appVariable, setAppVariable] = useState<AppVariable>(() => {
    const loaded = loadAppVariables();
    return loaded[0] ?? defaultSingletonVariable;
  });
  const [legalDialogPage, setLegalDialogPage] = useState<LegalPage | null>(null);
  const [appVarDialogOpen, setAppVarDialogOpen] = useState(false);

  useEffect(() => {
    document.title = `Settings | ${APP_NAME}`;
  }, []);

  const termsPage = useMemo(
    () => legalPages.find((p) => p.slug === "terms"),
    [legalPages]
  );
  const privacyPage = useMemo(
    () => legalPages.find((p) => p.slug === "privacy"),
    [legalPages]
  );

  const handleSaveLegal = useCallback((updated: LegalPage) => {
    setLegalPages((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      persistLegalPages(next);
      return next;
    });
  }, []);

  const handleSaveAppVariable = useCallback((v: AppVariable) => {
    setAppVariable(v);
    persistAppVariables([v]);
  }, []);

  const boxButtonClass =
    "flex h-8 shrink-0 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AdminSdcPageHeader
        title="Settings"
        breadcrumb={{ label: "Admin", href: ROUTES.admin.dashboard }}
        lead={<SdcHeaderLead />}
        actions={<AdminSdcPageHeaderActions />}
        introTitle="Settings"
        introDescription="Terms of Use, Privacy Policy, and one app-wide variable"
      />

      <div className="min-h-0 flex-1 overflow-y-auto py-5">
        <div className="flex w-full max-w-xl flex-col gap-3 text-left">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <FileText className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Terms of Use</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {termsPage
                      ? `${termsPage.status === "draft" ? "Draft" : "Published"} · Updated ${formatUpdated(termsPage.updatedAt)}`
                      : "Not found"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={boxButtonClass}
                disabled={!termsPage}
                onClick={() => termsPage && setLegalDialogPage(termsPage)}
              >
                Edit
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <FileText className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Privacy Policy</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {privacyPage
                      ? `${privacyPage.status === "draft" ? "Draft" : "Published"} · Updated ${formatUpdated(privacyPage.updatedAt)}`
                      : "Not found"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={boxButtonClass}
                disabled={!privacyPage}
                onClick={() => privacyPage && setLegalDialogPage(privacyPage)}
              >
                Edit
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <Percent className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{appVariable.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {appVariable.description?.trim() || formatVariableSubtitle(appVariable)}
                  </p>
                </div>
              </div>
              <button type="button" className={boxButtonClass} onClick={() => setAppVarDialogOpen(true)}>
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {legalDialogPage && (
        <LegalPageEditDialog
          key={`${legalDialogPage.id}-${legalDialogPage.updatedAt}`}
          open
          onClose={() => setLegalDialogPage(null)}
          page={legalDialogPage}
          onSave={handleSaveLegal}
        />
      )}

      <AppVariableDialog
        open={appVarDialogOpen}
        onClose={() => setAppVarDialogOpen(false)}
        mode="edit"
        variable={appVariable}
        onSave={handleSaveAppVariable}
      />
    </div>
  );
}
