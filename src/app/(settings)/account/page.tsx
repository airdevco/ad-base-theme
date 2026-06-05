"use client";

/** Account settings page (SDC design). */
import { useEffect, useState, useCallback } from "react";
import {
  User,
  Paintbrush,
  Bell,
  Shield,
  CreditCard,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { ProfileSection } from "./_components/profile-section";
import { AppearanceSection } from "./_components/appearance-section";
import { NotificationsSection } from "./_components/notifications-section";
import { SecuritySection } from "./_components/security-section";
import { BillingSection } from "./_components/billing-section";
import {
  AccountSdcSettingsSidebarProvider,
  AccountSdcSettingsSidebarLayout,
  AccountSdcHeaderLead,
  type SettingsNavItem,
} from "./_components/account-sdc-settings-sidebar";

const personalItems: SettingsNavItem[] = [
  { value: "profile", label: "Profile", icon: User },
  { value: "appearance", label: "Appearance", icon: Paintbrush },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "security", label: "Security", icon: Shield },
];

const workspaceItems: SettingsNavItem[] = [
  { value: "billing", label: "Billing", icon: CreditCard },
];

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    document.title = `Settings | ${APP_NAME}`;
  }, []);

  const handleSectionChange = useCallback((value: string) => {
    setActiveSection(value);
  }, []);

  return (
    <AccountSdcSettingsSidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <AccountSdcSettingsSidebarLayout
          personalItems={personalItems}
          workspaceItems={workspaceItems}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        <main className="flex-1 overflow-y-auto bg-background px-5 md:px-10">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 overflow-visible py-2.5 md:hidden">
            <AccountSdcHeaderLead />
          </div>
          <div className="w-full max-w-2xl py-5 text-left md:py-8">
            {activeSection === "profile" && <ProfileSection />}
            {activeSection === "appearance" && <AppearanceSection />}
            {activeSection === "notifications" && <NotificationsSection />}
            {activeSection === "security" && <SecuritySection />}
            {activeSection === "billing" && <BillingSection />}
          </div>
        </main>
      </div>
    </AccountSdcSettingsSidebarProvider>
  );
}
