"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/auth-provider";
import { SdcSidebarProvider, AdminSdcSidebar } from "@/components/layout/admin-sdc-sidebar";
import "./admin-sdc.css";

export default function AdminSdcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.user.role !== "admin") {
      router.replace("/account");
    }
  }, [session.user.role, router]);

  if (session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-sdc-root h-full min-h-0">
      <SdcSidebarProvider>
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
          <AdminSdcSidebar />
          {/* Horizontal inset: 20px mobile, 40px md+ */}
          <main className="flex-1 overflow-y-auto bg-background px-5 md:px-10">{children}</main>
        </div>
      </SdcSidebarProvider>
    </div>
  );
}
