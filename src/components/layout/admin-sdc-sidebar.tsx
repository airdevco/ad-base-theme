"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Mail,
  Scale,
  LogOut,
  Settings,
  Search,
  Command,
  ChevronsUpDown,
  Plus,
  FileText,
  User as UserIcon,
  ArrowRight,
  Building2,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { mockUsers, mockEmailTemplates } from "@/mock";
import { mockLegalPages } from "@/mock/legal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@/providers/auth-provider";
import { Sheet } from "@/components/admin-sdc-ui/sheet";
import { Tooltip } from "@/components/admin-sdc-ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin-sdc-ui/dropdown-menu";

// ── Sidebar context ──────────────────────────────────────────────────

export type AdminPreviewTab =
  | "dashboard"
  | "users"
  | "email-templates"
  | "settings";

const PREVIEW_TAB_HREF: Record<AdminPreviewTab, string> = {
  dashboard: ROUTES.admin.dashboard,
  users: ROUTES.admin.users,
  "email-templates": ROUTES.admin.emailTemplates,
  settings: ROUTES.admin.settings,
};

function hrefToPreviewTab(href: string): AdminPreviewTab | null {
  const entry = Object.entries(PREVIEW_TAB_HREF).find(([, h]) => h === href);
  return entry ? (entry[0] as AdminPreviewTab) : null;
}

interface SidebarContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  /** Desktop only: sidebar hidden when true. */
  desktopCollapsed: boolean;
  setDesktopCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  /** Opens the command palette; `"records"` matches the sidebar search (global record search). */
  openCommandPalette: (mode?: "actions" | "records") => void;
  /** Theme preview: local tab switching instead of routing. */
  previewTab?: AdminPreviewTab;
  setPreviewTab?: (tab: AdminPreviewTab) => void;
  isPreviewMode: boolean;
}

const SdcSidebarContext = createContext<SidebarContextValue>({
  mobileOpen: false,
  setMobileOpen: () => {},
  desktopCollapsed: false,
  setDesktopCollapsed: () => {},
  openCommandPalette: () => {},
  isPreviewMode: false,
});

export function useSdcSidebar() {
  return useContext(SdcSidebarContext);
}

/** Sidebar toggle (top row only; page intros match other tabs). */
export function SdcHeaderLead() {
  const isMobile = useIsMobile();
  const { mobileOpen, setMobileOpen, desktopCollapsed, setDesktopCollapsed } = useSdcSidebar();

  const handleClick = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopCollapsed((c) => !c);
    }
  };

  const sidebarShowing = isMobile ? mobileOpen : !desktopCollapsed;
  const tooltipLabel = sidebarShowing ? "Hide sidebar" : "Show sidebar";

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2 md:gap-0">
      <div className="md:hidden">
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
    </div>
  );
}

// ── Nav items ────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Primary admin nav; routes live under `/admin/*` (UI primitives in `admin-sdc-ui`). */
const navItems: NavItem[] = [
  { href: ROUTES.admin.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.admin.users, label: "Users", icon: Users },
  { href: ROUTES.admin.emailTemplates, label: "Email Templates", icon: Mail },
  { href: ROUTES.admin.settings, label: "Settings", icon: Settings },
];

// ── Provider ─────────────────────────────────────────────────────────

export function SdcSidebarProvider({
  children,
  previewTab,
  onPreviewTabChange,
}: {
  children: React.ReactNode;
  previewTab?: AdminPreviewTab;
  onPreviewTabChange?: (tab: AdminPreviewTab) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandMode, setCommandMode] = useState<"actions" | "records">("actions");
  const isPreviewMode = previewTab != null && onPreviewTabChange != null;

  const openCommandPalette = useCallback((mode: "actions" | "records" = "actions") => {
    setCommandMode(mode);
    setCommandOpen(true);
  }, []);

  // ⌘K — quick actions (disabled in theme preview)
  useEffect(() => {
    if (isPreviewMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((v) => {
          if (!v) {
            setCommandMode("actions");
            return true;
          }
          return false;
        });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewMode]);

  return (
    <SdcSidebarContext.Provider
      value={{
        mobileOpen,
        setMobileOpen,
        desktopCollapsed,
        setDesktopCollapsed,
        openCommandPalette,
        previewTab,
        setPreviewTab: onPreviewTabChange,
        isPreviewMode,
      }}
    >
      {children}
      {!isPreviewMode && (
        <CommandPalette
          open={commandOpen}
          onClose={() => setCommandOpen(false)}
          initialMode={commandMode}
        />
      )}
    </SdcSidebarContext.Provider>
  );
}

// ── Workspace switcher ───────────────────────────────────────────────

const AIRDEV_FAVICON_URL =
  "https://1ad0fcb18ec6cf492f21eeb75aa30267.cdn.bubble.io/d44/f1774645797529x427816427582007360/favicon.png";

interface Workspace {
  name: string;
  /** When set, shown inside the navy tile instead of the building icon. */
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
  const box =
    size === "md"
      ? "size-7 rounded-[8px]"
      : "size-6 rounded-[6px]";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-brand text-brand-foreground",
        box
      )}
    >
      {workspace.faviconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote Bubble CDN favicon; avoids image domain config
        <img
          src={workspace.faviconUrl}
          alt=""
          className="size-full object-cover"
        />
      ) : (
        <Building2
          className={cn(
            "shrink-0 text-brand-foreground",
            size === "md" ? "size-[14px]" : "size-3"
          )}
          strokeWidth={2}
        />
      )}
    </div>
  );
}

/** Company / org label only — admin portal does not switch workspaces here. */
function WorkspaceSwitcher() {
  const activeWorkspace = workspaces[0];

  return (
    <div className="w-full px-2.5 py-2.5">
      <div className="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-2">
        <WorkspaceTile workspace={activeWorkspace} size="md" />
        <p className="m-0 min-w-0 flex-1 truncate text-[14px] font-semibold leading-none text-foreground">
          {activeWorkspace.name}
        </p>
      </div>
    </div>
  );
}

// ── User profile (bottom of sidebar) ────────────────────────────────

function UserProfile({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const session = useSession();
  const { isPreviewMode } = useSdcSidebar();
  const { firstName, lastName, email } = session.user;
  const initials = `${firstName[0]}${lastName[0]}`;

  if (isPreviewMode) {
    return (
      <div className="w-full px-2.5 py-2.5">
        <div className="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-[14px] font-semibold leading-none text-foreground">
              {firstName} {lastName}
            </span>
            <span className="truncate text-[11px] leading-none text-muted-foreground">{email}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2.5 py-2.5">
      <DropdownMenu className="block w-full">
        <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent">
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
          <DropdownMenuItem
            onClick={() => {
              onNavigate?.();
              router.push("/account");
            }}
          >
            <Settings className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
            <span>Account settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onNavigate?.();
              router.push(ROUTES.admin.dashboard);
            }}
          >
            <Users className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
            <span>Admin</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              onNavigate?.();
              router.push("/login");
            }}
          >
            <LogOut className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Command palette ──────────────────────────────────────────────────

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

interface RecordItem {
  id: string;
  label: string;
  sublabel?: string;
  type: "user" | "page" | "template";
  href: string;
}

function CommandPalette({ open, onClose, initialMode = "actions" }: { open: boolean; onClose: () => void; initialMode?: "actions" | "records" }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"actions" | "records">("actions");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickActionItem[] = useMemo(
    () => [
      { id: "search", label: "Search records", icon: Search, action: () => { setMode("records"); setQuery(""); setActiveIndex(0); } },
      { id: "add-user", label: "Add User", icon: Plus, action: () => { onClose(); router.push(ROUTES.admin.users); } },
      { id: "add-page", label: "Add Page", icon: Plus, action: () => { onClose(); router.push(`${ROUTES.admin.pages}/new`); } },
      { id: "add-template", label: "Add Template", icon: Plus, action: () => { onClose(); router.push(`${ROUTES.admin.emailTemplates}/new`); } },
      { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, action: () => { onClose(); router.push(ROUTES.admin.dashboard); } },
      { id: "users", label: "Go to Users", icon: Users, action: () => { onClose(); router.push(ROUTES.admin.users); } },
      { id: "templates", label: "Go to Email Templates", icon: Mail, action: () => { onClose(); router.push(ROUTES.admin.emailTemplates); } },
      { id: "pages", label: "Go to Pages", icon: Scale, action: () => { onClose(); router.push(ROUTES.admin.pages); } },
      { id: "settings", label: "Open account settings", icon: Settings, action: () => { onClose(); router.push("/account"); } },
    ],
    [router, onClose]
  );

  const allRecords: RecordItem[] = useMemo(() => {
    const users: RecordItem[] = mockUsers.slice(0, 50).map((u) => ({
      id: `user-${u.id}`,
      label: `${u.firstName} ${u.lastName}`,
      sublabel: u.email,
      type: "user" as const,
      href: ROUTES.admin.users,
    }));
    const pages: RecordItem[] = mockLegalPages.map((p) => ({
      id: `page-${p.id}`,
      label: p.title,
      sublabel: p.status,
      type: "page" as const,
      href: `${ROUTES.admin.pages}/${p.id}`,
    }));
    const templates: RecordItem[] = mockEmailTemplates.map((t) => ({
      id: `tpl-${t.id}`,
      label: t.name,
      sublabel: t.subject,
      type: "template" as const,
      href: `${ROUTES.admin.emailTemplates}/${t.id}`,
    }));
    return [...users, ...pages, ...templates];
  }, []);

  const lowerQuery = query.toLowerCase().trim();

  // Actions mode
  const filteredActions = lowerQuery
    ? quickActions.filter((a) => a.label.toLowerCase().includes(lowerQuery))
    : quickActions;

  // Records: filter and group by type
  const getFilteredRecordsByType = useCallback(() => {
    const filtered = lowerQuery
      ? allRecords.filter(
          (r) =>
            r.label.toLowerCase().includes(lowerQuery) ||
            r.sublabel?.toLowerCase().includes(lowerQuery)
        )
      : allRecords;

    const users = filtered.filter((r) => r.type === "user");
    const pages = filtered.filter((r) => r.type === "page");
    const templates = filtered.filter((r) => r.type === "template");

    return { users, pages, templates };
  }, [lowerQuery, allRecords]);

  const groupedRecords = mode === "records" ? getFilteredRecordsByType() : { users: [], pages: [], templates: [] };
  const flatRecords = mode === "records" ? [...groupedRecords.users, ...groupedRecords.pages, ...groupedRecords.templates] : [];

  // Build flat item list for keyboard nav
  const allItems = mode === "actions"
    ? filteredActions.map((a) => ({ kind: "action" as const, item: a }))
    : flatRecords.map((r) => ({ kind: "record" as const, item: r }));

  // Reset active index when query or mode changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query, mode]);

  // Focus input when opened, reset mode
  useEffect(() => {
    if (open) {
      setQuery("");
      setMode(initialMode);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, initialMode]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !query && mode === "records") {
        setMode("actions");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = allItems[activeIndex];
        if (selected?.kind === "action") {
          (selected.item as QuickActionItem).action();
        } else if (selected?.kind === "record") {
          onClose();
          router.push((selected.item as RecordItem).href);
        }
      }
    },
    [allItems, activeIndex, onClose, router, query, mode]
  );

  if (!open) return null;

  const recordTypeIcon = (type: string) => {
    if (type === "user") return UserIcon;
    if (type === "page") return FileText;
    return Mail;
  };

  const renderRecordRow = (record: RecordItem, idx: number) => {
    const Icon = recordTypeIcon(record.type);
    return (
      <button
        key={record.id}
        data-index={idx}
        className={cn(
          "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-foreground transition-colors",
          activeIndex === idx ? "bg-sidebar-accent" : "hover:bg-muted/50"
        )}
        onMouseEnter={() => setActiveIndex(idx)}
        onClick={() => {
          onClose();
          router.push(record.href);
        }}
      >
        <Icon className={cn("size-4 shrink-0", activeIndex === idx ? "text-muted-foreground" : "text-muted-foreground")} />
        <span className="flex-1 truncate">{record.label}</span>
        {record.sublabel && (
          <span className={cn("truncate text-xs", activeIndex === idx ? "text-muted-foreground" : "text-muted-foreground")}>
            {record.sublabel}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Palette */}
      <div className="relative z-50 w-full max-w-[560px] rounded-xl border border-border p-[1px] shadow-lg animate-in fade-in-0 zoom-in-95">
        <div className="rounded-[11px] border border-border bg-background">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder={mode === "records" ? "Search all records..." : "Search quick actions and records..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[400px] overflow-y-auto py-1">
            {mode === "actions" ? (
              <>
                {/* Quick Actions */}
                {filteredActions.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Quick Action
                    </p>
                    {filteredActions.map((action, i) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          data-index={i}
                          className={cn(
                            "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-foreground transition-colors",
                            activeIndex === i ? "bg-sidebar-accent" : "hover:bg-muted/50"
                          )}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => action.action()}
                        >
                          <Icon className={cn("size-4 shrink-0", activeIndex === i ? "text-muted-foreground" : "text-muted-foreground")} />
                          <span className="flex-1">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {filteredActions.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">No results found</p>
                )}
              </>
            ) : (
              <>
                {/* Records mode — grouped by type */}
                {groupedRecords.users.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Users ({groupedRecords.users.length})
                    </p>
                    {groupedRecords.users.map((record) => {
                      const idx = flatRecords.indexOf(record);
                      return renderRecordRow(record, idx);
                    })}
                  </div>
                )}
                {groupedRecords.pages.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Pages ({groupedRecords.pages.length})
                    </p>
                    {groupedRecords.pages.map((record) => {
                      const idx = flatRecords.indexOf(record);
                      return renderRecordRow(record, idx);
                    })}
                  </div>
                )}
                {groupedRecords.templates.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Email Templates ({groupedRecords.templates.length})
                    </p>
                    {groupedRecords.templates.map((record) => {
                      const idx = flatRecords.indexOf(record);
                      return renderRecordRow(record, idx);
                    })}
                  </div>
                )}
                {flatRecords.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">No records found</p>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-border px-4 py-2">
            {mode === "actions" ? (
              <button
                onClick={() => { setMode("records"); setQuery(""); setActiveIndex(0); }}
                className="flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-active"
              >
                Search records
                <ArrowRight className="size-3" />
              </button>
            ) : (
              <button
                onClick={() => { setMode("actions"); setQuery(""); setActiveIndex(0); }}
                className="flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                <Command className="size-3" />
                Quick actions
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar nav content ──────────────────────────────────────────────

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { previewTab, setPreviewTab, isPreviewMode } = useSdcSidebar();

  return (
    <nav className="flex flex-1 flex-col gap-0 px-2.5 py-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const tabKey = hrefToPreviewTab(item.href);
        const isActive = isPreviewMode
          ? tabKey != null && previewTab === tabKey
          : pathname === item.href || pathname.startsWith(item.href + "/");

        const className = cn(
          "flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent/80 dark:hover:bg-sidebar-accent/60",
          isActive && "text-primary"
        );

        const content = (
          <>
            <Icon
              className={cn(
                "size-4 shrink-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className={isActive ? "text-primary" : "text-sidebar-foreground"}>
              {item.label}
            </span>
          </>
        );

        if (isPreviewMode && tabKey && setPreviewTab) {
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => {
                setPreviewTab(tabKey);
                onNavigate?.();
              }}
              className={className}
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

// ── Sidebar content (shared between desktop and mobile) ──────────────

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-sidebar">
      <WorkspaceSwitcher />
      <SidebarNav onNavigate={onNavigate} />
      <UserProfile onNavigate={onNavigate} />
    </div>
  );
}

// ── Sidebar component ────────────────────────────────────────────────

export function AdminSdcSidebar() {
  const isMobile = useIsMobile();
  const { mobileOpen, setMobileOpen, desktopCollapsed } = useSdcSidebar();

  // Mobile: overlay sheet (full-bleed sidebar content; no extra padding / floating trigger)
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
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </Sheet>
    );
  }

  // Desktop: width transition (sidebar stays mounted for smooth collapse)
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden border-r border-border bg-white transition-[width] duration-300 ease-in-out dark:border-sidebar-border dark:bg-sidebar",
        desktopCollapsed ? "w-0 min-w-0 border-transparent" : "w-[280px]"
      )}
      aria-hidden={desktopCollapsed}
    >
      <SidebarContent />
    </aside>
  );
}
