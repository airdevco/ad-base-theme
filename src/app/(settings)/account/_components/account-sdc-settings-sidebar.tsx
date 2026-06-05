"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Paintbrush,
  Bell,
  Shield,
  CreditCard,
  Settings,
  LogOut,
  Users,
  ChevronsUpDown,
  Building2,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useSession } from "@/providers/auth-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet } from "@/components/admin-sdc-ui/sheet";
import { Tooltip } from "@/components/admin-sdc-ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin-sdc-ui/dropdown-menu";

interface AccountSdcSidebarContextValue {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AccountSdcSidebarContext = createContext<AccountSdcSidebarContextValue | null>(null);

export function AccountSdcSettingsSidebarProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <AccountSdcSidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </AccountSdcSidebarContext.Provider>
  );
}

function useAccountSdcSettingsSidebar() {
  const ctx = useContext(AccountSdcSidebarContext);
  if (!ctx) {
    throw new Error("useAccountSdcSettingsSidebar must be used within AccountSdcSettingsSidebarProvider");
  }
  return ctx;
}

/** Sidebar toggle on small viewports — matches {@link SdcHeaderLead} in admin-sdc (wrap row with `md:hidden` on the page). */
export function AccountSdcHeaderLead() {
  const { mobileOpen, setMobileOpen } = useAccountSdcSettingsSidebar();

  const handleClick = useCallback(() => {
    setMobileOpen((o) => !o);
  }, [setMobileOpen]);

  const tooltipLabel = mobileOpen ? "Hide sidebar" : "Show sidebar";

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2">
      <Tooltip content={tooltipLabel} side="bottom" align="start">
        <button
          type="button"
          onClick={handleClick}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent"
          aria-label={tooltipLabel}
        >
          <PanelLeft className="size-4" strokeWidth={2} />
        </button>
      </Tooltip>
    </div>
  );
}

/** Matches `SidebarNav` inactive icon/label in admin-sdc (light hex + dark theme tokens). */
const SIDEBAR_NAV_ICON_MUTED = "text-muted-foreground";
const SIDEBAR_NAV_LABEL = "text-sidebar-foreground";

const AIRDEV_FAVICON_URL =
  "https://1ad0fcb18ec6cf492f21eeb75aa30267.cdn.bubble.io/d44/f1774645797529x427816427582007360/favicon.png";

interface Workspace {
  name: string;
  faviconUrl?: string;
}

const workspaces: Workspace[] = [
  { name: "Airdev", faviconUrl: AIRDEV_FAVICON_URL },
  { name: "Stratex Labs" },
  { name: "Northwind Co" },
  { name: "Acme Corp" },
];

function WorkspaceTile({
  workspace,
  size = "md",
}: {
  workspace: Workspace;
  size?: "md" | "sm";
}) {
  const box = size === "md" ? "size-7 rounded-[8px]" : "size-6 rounded-[6px]";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-brand text-brand-foreground",
        box
      )}
    >
      {workspace.faviconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote favicon; matches admin-sdc sidebar
        <img src={workspace.faviconUrl} alt="" className="size-full object-cover" />
      ) : (
        <Building2
          className={cn("shrink-0 text-brand-foreground", size === "md" ? "size-[14px]" : "size-3")}
          strokeWidth={2}
        />
      )}
    </div>
  );
}

function AccountSdcWorkspaceSwitcher() {
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  return (
    <div className="w-full px-2.5 py-2.5">
      <DropdownMenu className="block w-full">
        <DropdownMenuTrigger className="flex w-full cursor-pointer items-center gap-2 rounded-[9px] px-2.5 py-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent">
          <WorkspaceTile workspace={activeWorkspace} size="md" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="m-0 truncate text-[14px] font-semibold leading-none text-foreground">{activeWorkspace.name}</p>
            <p className="m-0 truncate text-[11px] leading-none text-muted-foreground">Workspace</p>
          </div>
          <span
            className="inline-flex size-4 shrink-0 items-center justify-center self-center text-muted-foreground"
            aria-hidden
          >
            <ChevronsUpDown className="size-4" />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" matchTriggerWidth>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.name}
              onClick={() => setActiveWorkspace(ws)}
              className={cn(
                "gap-2.5",
                ws.name === activeWorkspace.name &&
                  "!bg-sidebar-accent hover:!bg-sidebar-accent focus:!bg-sidebar-accent"
              )}
            >
              <WorkspaceTile workspace={ws} size="sm" />
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">{ws.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export interface SettingsNavItem {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sectionLabelClass =
  "mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground";

function AccountSdcSidebarUserFooter() {
  const router = useRouter();
  const session = useSession();
  const { firstName, lastName, email } = session.user;
  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <div className="w-full px-2.5 py-2.5">
      <DropdownMenu className="block w-full">
        <DropdownMenuTrigger className="flex w-full cursor-pointer items-center gap-2 rounded-[9px] px-2.5 py-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-[14px] font-semibold leading-none text-foreground">
              {firstName} {lastName}
            </span>
            <span className="truncate text-[11px] leading-none text-muted-foreground">{email}</span>
          </div>
          <span className="inline-flex size-4 shrink-0 items-center justify-center self-center text-muted-foreground" aria-hidden>
            <ChevronsUpDown className="size-4" strokeWidth={2} />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" matchTriggerWidth>
          <DropdownMenuItem onClick={() => router.push(ROUTES.account)}>
            <Settings className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
            <span>Account settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(ROUTES.admin.dashboard)}>
            <Users className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
            <span>Admin</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(ROUTES.login)}>
            <LogOut className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface AccountSdcSettingsSidebarProps {
  personalItems: SettingsNavItem[];
  workspaceItems: SettingsNavItem[];
  activeSection: string;
  onSectionChange: (value: string) => void;
  /** Called after a nav item is chosen (e.g. close mobile sheet). */
  onNavigate?: () => void;
}

/**
 * Visual match for {@link AdminSdcSidebar} shell (workspace switcher, nav row styles, user footer).
 * Local to `/account` only.
 */
export function AccountSdcSettingsSidebar({
  personalItems,
  workspaceItems,
  activeSection,
  onSectionChange,
  onNavigate,
}: AccountSdcSettingsSidebarProps) {
  const navButtonClass = (isActive: boolean) =>
    cn(
      "flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-sm font-medium transition-colors hover:bg-sidebar-accent/80 dark:hover:bg-sidebar-accent/60",
      isActive && "text-primary"
    );

  const iconClass = (isActive: boolean) =>
    cn("size-4 shrink-0", isActive ? "text-primary" : SIDEBAR_NAV_ICON_MUTED);

  const labelClass = (isActive: boolean) => (isActive ? "text-primary" : SIDEBAR_NAV_LABEL);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-sidebar">
      <AccountSdcWorkspaceSwitcher />

      <nav className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto px-2.5 py-2">
        {personalItems.length > 0 && (
          <div className="flex flex-col gap-0">
            <p className={sectionLabelClass}>Personal</p>
            <div className="flex flex-col gap-0">
              {personalItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      onSectionChange(item.value);
                      onNavigate?.();
                    }}
                    className={navButtonClass(isActive)}
                  >
                    <Icon className={iconClass(isActive)} />
                    <span className={labelClass(isActive)}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {workspaceItems.length > 0 && (
          <div className="mt-6 flex flex-col gap-0">
            <p className={sectionLabelClass}>Workspace</p>
            <div className="flex flex-col gap-0">
              {workspaceItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      onSectionChange(item.value);
                      onNavigate?.();
                    }}
                    className={navButtonClass(isActive)}
                  >
                    <Icon className={iconClass(isActive)} />
                    <span className={labelClass(isActive)}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <AccountSdcSidebarUserFooter />
    </div>
  );
}

/** Desktop: fixed aside. Mobile: off-canvas sheet (same pattern as admin-sdc). */
export function AccountSdcSettingsSidebarLayout(props: AccountSdcSettingsSidebarProps) {
  const isMobile = useIsMobile();
  const { mobileOpen, setMobileOpen } = useAccountSdcSettingsSidebar();

  if (isMobile) {
    return (
      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        side="left"
        showCloseButton={false}
        contentClassName="flex h-full min-h-0 flex-col overflow-hidden p-0"
        className="w-[280px] max-w-[min(280px,100vw)] border-r border-border bg-white shadow-lg dark:border-sidebar-border dark:bg-sidebar"
      >
        <AccountSdcSettingsSidebar {...props} onNavigate={() => setMobileOpen(false)} />
      </Sheet>
    );
  }

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col overflow-hidden border-r border-border bg-white dark:border-sidebar-border dark:bg-sidebar">
      <AccountSdcSettingsSidebar {...props} />
    </aside>
  );
}

export function AccountSdcSettingsSidebarShell({ children }: { children: ReactNode }) {
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col overflow-hidden border-r border-border bg-white dark:border-sidebar-border dark:bg-sidebar">
      {children}
    </aside>
  );
}
