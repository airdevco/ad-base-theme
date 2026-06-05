"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileX } from "lucide-react";
import { mockEmailTemplates } from "@/mock";
import { AdminSdcPageHeader } from "@/components/layout/admin-sdc-page-header";
import { SdcHeaderLead } from "@/components/layout/admin-sdc-sidebar";
import { EmptyState } from "@/components/admin-sdc-ui/empty-state";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { EmailTemplateDialog } from "../email-template-dialog";

export default function EmailTemplateByIdPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const isNew = id === "new";

  const template = useMemo(() => {
    if (isNew) return null;
    return mockEmailTemplates.find((t) => t.id === id) ?? null;
  }, [id, isNew]);

  const initialStatus = useMemo((): "active" | "draft" => {
    if (isNew || !template) return "active";
    const i = mockEmailTemplates.findIndex((t) => t.id === template.id);
    return i >= 0 && i % 3 === 0 ? "draft" : "active";
  }, [isNew, template]);

  useEffect(() => {
    document.title = isNew
      ? `New Template | ${APP_NAME}`
      : `${template?.name ?? "Template"} | ${APP_NAME}`;
  }, [isNew, template?.name]);

  if (!isNew && !template) {
    return (
      <div className="flex flex-col">
        <AdminSdcPageHeader title="Template Not Found" lead={<SdcHeaderLead />} />
        <div className="py-12">
          <EmptyState
            icon={<FileX />}
            title="Template not found"
            description="The email template you're looking for doesn't exist."
          />
        </div>
      </div>
    );
  }

  return (
    <EmailTemplateDialog
      open
      templateId={id}
      initialTemplate={template}
      initialStatus={initialStatus}
      onClose={() => router.push(ROUTES.admin.emailTemplates)}
    />
  );
}
