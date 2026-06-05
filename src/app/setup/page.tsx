import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Setup",
};

interface EnvCheck {
  name: string;
  envKey: string;
  isSet: boolean;
  description: string;
}

function getEnvChecks(): EnvCheck[] {
  return [
    {
      name: "Convex",
      envKey: "NEXT_PUBLIC_CONVEX_URL",
      isSet: !!process.env.NEXT_PUBLIC_CONVEX_URL,
      description:
        "Set NEXT_PUBLIC_CONVEX_URL in your .env.local file. Get it from the Convex dashboard after creating a project.",
    },
    {
      name: "WorkOS Client",
      envKey: "WORKOS_CLIENT_ID",
      isSet: !!process.env.WORKOS_CLIENT_ID,
      description:
        "Set WORKOS_CLIENT_ID in your .env.local file. Find it in the WorkOS dashboard under API Keys.",
    },
    {
      name: "WorkOS API",
      envKey: "WORKOS_API_KEY",
      isSet: !!process.env.WORKOS_API_KEY,
      description:
        "Set WORKOS_API_KEY in your .env.local file. Generate a secret key in the WorkOS dashboard.",
    },
    {
      name: "Resend",
      envKey: "RESEND_API_KEY",
      isSet: !!process.env.RESEND_API_KEY,
      description:
        "Set RESEND_API_KEY in your .env.local file. Create an API key at resend.com/api-keys.",
    },
  ];
}

export default function SetupPage() {
  const checks = getEnvChecks();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-6">
      <PageHeader
        title="Developer Setup"
      />

      <div className="grid gap-4">
        {checks.map((check) => (
          <Card key={check.envKey}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {check.isSet ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <CardTitle className="text-base">{check.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {check.envKey}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {check.isSet
                  ? "This integration is configured."
                  : check.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
