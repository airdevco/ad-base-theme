"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import {
  SdcSidebarProvider,
  AdminSdcSidebar,
  type AdminPreviewTab,
} from "@/components/layout/admin-sdc-sidebar";
import { cn } from "@/lib/utils";
import "@/app/(admin)/admin/admin-sdc.css";

const DashboardPage = dynamic(
  () => import("@/app/(admin)/admin/dashboard/page"),
  { ssr: false }
);
const UsersPage = dynamic(
  () => import("@/app/(admin)/admin/users/page"),
  { ssr: false }
);
const EmailTemplatesPage = dynamic(
  () => import("@/app/(admin)/admin/email-templates/page"),
  { ssr: false }
);
const SettingsPage = dynamic(
  () => import("@/app/(admin)/admin/settings/page"),
  { ssr: false }
);

const PREVIEW_INERT_CLASS =
  "pointer-events-none select-none [&_a]:pointer-events-none [&_button]:pointer-events-none [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none";

function PreviewAdminContent({ tab }: { tab: AdminPreviewTab }) {
  switch (tab) {
    case "dashboard":
      return <DashboardPage />;
    case "users":
      return <UsersPage />;
    case "email-templates":
      return <EmailTemplatesPage />;
    case "settings":
      return <SettingsPage />;
  }
}

function PreviewLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Loading preview…
    </div>
  );
}

export function PreviewAdmin() {
  const [tab, setTab] = useState<AdminPreviewTab>("dashboard");

  return (
    <div className="admin-sdc-root flex min-h-0 flex-1 flex-col">
      <SdcSidebarProvider previewTab={tab} onPreviewTabChange={setTab}>
        <div className="flex min-h-0 flex-1 overflow-hidden bg-background text-foreground">
          <AdminSdcSidebar />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-background px-5 md:px-10">
            <div className={cn("flex min-h-0 flex-1 flex-col", PREVIEW_INERT_CLASS)}>
              <Suspense fallback={<PreviewLoading />}>
                <PreviewAdminContent tab={tab} />
              </Suspense>
            </div>
          </main>
        </div>
      </SdcSidebarProvider>
    </div>
  );
}
