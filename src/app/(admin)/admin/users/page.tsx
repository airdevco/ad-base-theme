"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { mockUsers } from "@/mock";
import type { User, UserRole, UserStatus } from "@/types";
import { AdminSdcPageHeader } from "@/components/layout/admin-sdc-page-header";
import { SdcHeaderLead } from "@/components/layout/admin-sdc-sidebar";
import { AdminSdcPageHeaderActions } from "@/components/layout/admin-sdc-page-header-actions";
import { Button } from "@/components/admin-sdc-ui/button";
import { Input } from "@/components/admin-sdc-ui/input";
import { Label } from "@/components/admin-sdc-ui/label";
import { EmptyState } from "@/components/admin-sdc-ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin-sdc-ui/table";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin-sdc-ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin-sdc-ui/dropdown-menu";
import {
  useTableFilters,
  type FilterDefinition,
} from "@/components/admin-sdc-ui/table-filters";
import { AdminSdcUsersHeaderSearch } from "@/components/layout/admin-sdc-users-header-search";
import { UsersFilterPills, USERS_FILTER_LABEL_CLASS } from "./users-filter-pills";
import { EditColumnsMenu } from "@/components/admin-sdc-ui/edit-columns-menu";
import { ThinCheckbox } from "@/components/admin-sdc-ui/thin-checkbox";
import { cn } from "@/lib/utils";
import { APP_NAME, ROUTES } from "@/lib/constants";
import {
  Users,
  MoreHorizontal,
  Plus,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Shield,
  Activity,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const statusDotColors: Record<string, string> = {
  active: "bg-status-success-text",
  inactive: "bg-status-neutral-text",
  pending: "bg-status-warning-text",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ── Add User Dialog ─────────────────────────────────────────────────

function AddUserDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (user: User) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("member");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      avatarUrl: null,
      role,
      status: "pending",
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    onAdd(newUser);
    toast.success(`${firstName} ${lastName} has been added`);
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("member");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogHeader>
        <DialogTitle>Invite User</DialogTitle>
        <DialogDescription>
          Create a new user account. They will receive an invitation email.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 px-6 pb-4 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="add-first-name">First name</Label>
              <Input
                id="add-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="h-9"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="add-last-name">Last name</Label>
              <Input
                id="add-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                className="h-9"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="h-9"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="add-role">Role</Label>
            <select
              id="add-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="flex h-9 max-h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-[border-color] focus-visible:border-primary focus-visible:outline-none"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="h-9 max-h-[40px] rounded-lg px-4">
            Invite User
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

// ── Action dialogs ──────────────────────────────────────────────────

type DialogType = "edit" | "resetPassword" | "toggleStatus" | "addUser" | null;

function EditUserDialog({
  user,
  open,
  onClose,
  onSave,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
  onSave: (updated: User) => void;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  useEffect(() => {
    if (open) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [open, user]);

  function handleSave() {
    onSave({ ...user, firstName, lastName, email, role });
    toast.success(`${firstName} ${lastName} updated`);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>
          Update account details for {user.firstName} {user.lastName}.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-5 px-6 pb-4 pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="edit-first-name">First name</Label>
            <Input
              id="edit-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="edit-last-name">Last name</Label>
            <Input
              id="edit-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="edit-role">Role</Label>
          <select
            id="edit-role"
            value={role}
            onChange={(e) => setRole(e.target.value as User["role"])}
            className="flex h-9 max-h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-[border-color] focus-visible:border-primary focus-visible:outline-none"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleSave} className="h-9 max-h-[40px] rounded-lg px-4">
          Save Changes
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function ResetPasswordDialog({
  user,
  open,
  onClose,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
}) {
  function handleConfirm() {
    toast.success(`Password reset email sent to ${user.email}`);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      contentClassName="max-w-xs"
    >
      <DialogHeader>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogDescription>
          A password reset email will be sent to{" "}
          <span className="font-medium text-foreground">{user.email}</span>.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleConfirm}
          className="h-9 max-h-[40px] rounded-lg px-4 text-sm font-medium"
        >
          Reset Password
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function ToggleStatusDialog({
  user,
  open,
  onClose,
  onConfirm: onConfirmProp,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isDeactivating = user.status !== "inactive";
  const name = `${user.firstName} ${user.lastName}`;

  function handleConfirm() {
    onConfirmProp();
    toast.success(
      isDeactivating
        ? `${name} has been deactivated`
        : `${name} has been reactivated`
    );
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      contentClassName="max-w-xs"
    >
      <DialogHeader>
        <DialogTitle>
          {isDeactivating ? "Deactivate" : "Reactivate"} User
        </DialogTitle>
        <DialogDescription>
          {isDeactivating
            ? `${name} will no longer be able to sign in.`
            : `${name} will be able to sign in again.`}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={isDeactivating ? "destructive" : "default"}
          size="sm"
          onClick={handleConfirm}
          className="h-9 max-h-[40px] rounded-lg px-4 text-sm font-medium"
        >
          {isDeactivating ? "Deactivate" : "Reactivate"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

// ── Main page ───────────────────────────────────────────────────────

const USER_FILTER_DEFINITIONS: FilterDefinition[] = [
  {
    key: "role",
    label: "Role",
    type: "select",
    icon: Shield,
    options: [
      { label: "Admin", value: "admin" },
      { label: "Member", value: "member" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    icon: Activity,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ],
  },
  {
    key: "lastLoginAt",
    label: "Last login",
    type: "date",
    icon: Calendar,
  },
];

const USER_TABLE_COLUMN_DEFS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "lastLogin", label: "Last Login" },
  { key: "status", label: "Status" },
] as const;

export default function UsersPage() {

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);


  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const tableRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(["name", "email", "role", "lastLogin", "status"])
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    USER_TABLE_COLUMN_DEFS.map((c) => c.key)
  );

  const orderedVisibleColumns = useMemo(
    () => columnOrder.filter((k) => visibleColumns.has(k)),
    [columnOrder, visibleColumns]
  );

  const toggleColumn = useCallback((col: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) {
        if (next.size > 1) next.delete(col);
      } else {
        next.add(col);
      }
      return next;
    });
  }, []);

  const {
    filters,
    upsertFilter,
    removeFilterByKey,
    clearAll,
    applyFilters,
  } = useTableFilters(USER_FILTER_DEFINITIONS);

  useEffect(() => {
    document.title = `Users | ${APP_NAME}`;
  }, []);

  // Prepare data with a "name" key for the filter system
  const usersWithName = useMemo(
    () =>
      users.map((u) => ({
        ...u,
        name: `${u.firstName} ${u.lastName}`,
      })),
    [users]
  );

  const filteredUsers = useMemo(() => {
    let result = applyFilters(usersWithName);
    result = [...result].sort((a, b) => {
      let aVal: string, bVal: string;
      switch (sortField) {
        case "email":
          aVal = a.email;
          bVal = b.email;
          break;
        case "lastLoginAt":
          aVal = a.lastLoginAt ?? "";
          bVal = b.lastLoginAt ?? "";
          break;
        default:
          aVal = `${a.firstName} ${a.lastName}`;
          bVal = `${b.firstName} ${b.lastName}`;
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return result;
  }, [usersWithName, applyFilters, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredUsers.slice(start, start + perPage);
  }, [filteredUsers, currentPage, perPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortDirection, filters]);

  const openDialog = useCallback((user: User, type: DialogType) => {
    setSelectedUser(user);
    setDialogType(type);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedUser(null);
  }, []);

  const handleAddUser = useCallback((newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
  }, []);

  const handleSort = useCallback((field: string) => {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filteredUsers.length) return new Set();
      return new Set(filteredUsers.map((u) => u.id));
    });
  }, [filteredUsers]);

  const handleBulkDeactivate = useCallback(() => {
    setUsers((prev) =>
      prev.map((u) =>
        selectedIds.has(u.id) ? { ...u, status: "inactive" as UserStatus } : u
      )
    );
    toast.success(`${selectedIds.size} users deactivated`);
    setSelectedIds(new Set());
  }, [selectedIds]);

  if (users.length === 0) {
    return (
      <div className="flex flex-col">
        <AdminSdcPageHeader
          title="Users"
          sticky
          breadcrumb={{ label: "Admin", href: ROUTES.admin.dashboard }}
          lead={<SdcHeaderLead />}
          introTitle="Users"
          introDescription="Manage team members, roles, and access"
          introBelow={
            <div className="w-full max-w-[21.6rem]">
              <AdminSdcUsersHeaderSearch className="w-full" />
            </div>
          }
        />
        <div className="py-12">
          <EmptyState
            icon={<Users />}
            title="No users found"
            description="There are no users to display"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <AdminSdcPageHeader
        title="Users"
        sticky
        introBelowDivider={false}
        breadcrumb={{ label: "Admin", href: ROUTES.admin.dashboard }}
        lead={<SdcHeaderLead />}
        actions={<AdminSdcPageHeaderActions />}
        introTitle="Users"
        introDescription="Manage team members, roles, and access"
        introBelow={
          <div className="flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="min-w-0 w-full md:max-w-[min(100%,28rem)]">
              <AdminSdcUsersHeaderSearch className="w-full" />
            </div>
            <div className="flex w-full min-w-0 flex-row items-center justify-between gap-2 sm:gap-3 md:flex-1 md:justify-end">
              <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] py-0.5 md:max-w-[min(100%,36rem)]">
                <div className="flex w-max max-w-none flex-nowrap items-center justify-start gap-2 md:ml-auto md:justify-end">
                  <UsersFilterPills
                    definitions={USER_FILTER_DEFINITIONS}
                    filters={filters}
                    upsertFilter={upsertFilter}
                    removeFilterByKey={removeFilterByKey}
                    clearAll={clearAll}
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center">
                <EditColumnsMenu
                  open={columnsMenuOpen}
                  onOpenChange={setColumnsMenuOpen}
                  columns={[...USER_TABLE_COLUMN_DEFS]}
                  columnOrder={columnOrder}
                  onColumnOrderChange={setColumnOrder}
                  visibleColumns={visibleColumns}
                  onToggleColumn={toggleColumn}
                />
              </div>
            </div>
          </div>
        }
        introTrailing={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                toast.success("CSV exported successfully");
              }}
              className="flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent/60"
            >
              <Download className="size-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={() => setDialogType("addUser")}
              className="flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active"
            >
              <Plus className="size-3.5" />
              Invite User
            </button>
          </div>
        }
      />

      {/* Table body scrolls; thead sticks under bulk bar (when any); toolbar stays in sticky page header above */}
      <div ref={tableRef} className="min-h-0 min-w-0 flex-1 overflow-auto">
        {selectedIds.size > 0 && (
          <div className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b border-border bg-surface py-2 pl-4 pr-5">
            <span className="text-sm font-medium text-foreground">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={handleBulkDeactivate}
              className="text-sm font-medium text-destructive hover:underline"
            >
              Deactivate
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-sm font-medium text-muted-foreground hover:underline"
            >
              Clear selection
            </button>
          </div>
        )}
        <Table className="border-separate border-spacing-0 [&_td]:text-foreground">
          <TableHeader
            className={cn(
              "border-b-0 [&_th]:sticky [&_th]:z-[15] [&_th]:bg-background [&_th]:border-b [&_th]:border-border",
              /* Top rule + header row flush: no JS offset; bulk uses fixed top-10 (~40px) */
              selectedIds.size === 0 && "[&_th]:border-t [&_th]:border-border [&_th]:top-0",
              selectedIds.size > 0 && "[&_th]:top-10"
            )}
          >
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(USERS_FILTER_LABEL_CLASS, "w-10 pl-2 pr-4")}>
                <ThinCheckbox
                  checked={selectedIds.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                />
              </TableHead>
              {orderedVisibleColumns.map((colKey) => {
                switch (colKey) {
                  case "name":
                    return (
                      <TableHead key={colKey} className={USERS_FILTER_LABEL_CLASS}>
                        <button
                          type="button"
                          className={cn(USERS_FILTER_LABEL_CLASS, "flex items-center gap-1 text-muted-foreground")}
                          onClick={() => handleSort("name")}
                        >
                          Name {sortField === "name" ? (sortDirection === "asc" ? <ArrowUp className="size-3 text-muted-foreground" /> : <ArrowDown className="size-3 text-muted-foreground" />) : <ArrowUpDown className="size-3 text-muted-foreground" />}
                        </button>
                      </TableHead>
                    );
                  case "email":
                    return (
                      <TableHead key={colKey} className={USERS_FILTER_LABEL_CLASS}>
                        <button
                          type="button"
                          className={cn(USERS_FILTER_LABEL_CLASS, "flex items-center gap-1 text-muted-foreground")}
                          onClick={() => handleSort("email")}
                        >
                          Email {sortField === "email" ? (sortDirection === "asc" ? <ArrowUp className="size-3 text-muted-foreground" /> : <ArrowDown className="size-3 text-muted-foreground" />) : <ArrowUpDown className="size-3 text-muted-foreground" />}
                        </button>
                      </TableHead>
                    );
                  case "role":
                    return (
                      <TableHead key={colKey} className={USERS_FILTER_LABEL_CLASS}>
                        Role
                      </TableHead>
                    );
                  case "lastLogin":
                    return (
                      <TableHead key={colKey} className={USERS_FILTER_LABEL_CLASS}>
                        <button
                          type="button"
                          className={cn(USERS_FILTER_LABEL_CLASS, "flex items-center gap-1 text-muted-foreground")}
                          onClick={() => handleSort("lastLoginAt")}
                        >
                          Last Login {sortField === "lastLoginAt" ? (sortDirection === "asc" ? <ArrowUp className="size-3 text-muted-foreground" /> : <ArrowDown className="size-3 text-muted-foreground" />) : <ArrowUpDown className="size-3 text-muted-foreground" />}
                        </button>
                      </TableHead>
                    );
                  case "status":
                    return (
                      <TableHead key={colKey} className={USERS_FILTER_LABEL_CLASS}>
                        Status
                      </TableHead>
                    );
                  default:
                    return null;
                }
              })}
              <TableHead className={cn(USERS_FILTER_LABEL_CLASS, "w-12")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => {
              const isInactive = user.status === "inactive";
              return (
                <TableRow key={user.id}>
                  <TableCell className="pl-2 pr-4 text-foreground">
                    <ThinCheckbox
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </TableCell>
                  {orderedVisibleColumns.map((colKey) => {
                    switch (colKey) {
                      case "name":
                        return (
                          <TableCell key={colKey} className="text-foreground">
                            <button
                              type="button"
                              onClick={() => openDialog(user, "edit")}
                              className="font-medium text-foreground hover:underline"
                            >
                              {user.firstName} {user.lastName}
                            </button>
                          </TableCell>
                        );
                      case "email":
                        return <TableCell key={colKey} className="text-foreground">{user.email}</TableCell>;
                      case "role":
                        return (
                          <TableCell key={colKey} className="text-sm text-foreground">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </TableCell>
                        );
                      case "lastLogin":
                        return (
                          <TableCell key={colKey} className="text-foreground">
                            {formatDate(user.lastLoginAt)}
                          </TableCell>
                        );
                      case "status":
                        return (
                          <TableCell key={colKey} className="text-foreground">
                            <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                              <span className={`size-1.5 rounded-full ${statusDotColors[user.status] ?? "bg-muted-foreground"}`} />
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </TableCell>
                        );
                      default:
                        return null;
                    }
                  })}
                  <TableCell className="text-foreground">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex size-7 items-center justify-center rounded-lg text-foreground hover:bg-sidebar-accent/60">
                        <MoreHorizontal className="size-4 text-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-max min-w-0 whitespace-nowrap"
                      >
                        <DropdownMenuItem onClick={() => openDialog(user, "edit")}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDialog(user, "resetPassword")}>
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDialog(user, "toggleStatus")}
                          className={isInactive ? "" : "text-destructive hover:!text-destructive"}
                        >
                          {isInactive ? "Reactivate" : "Deactivate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex shrink-0 items-center justify-between border-t border-border py-2">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filteredUsers.length} {filteredUsers.length === 1 ? "result" : "results"}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">Show</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="h-6 rounded-md border border-border bg-background px-1.5 text-sm text-foreground outline-none"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); tableRef.current?.scrollTo(0, 0); }}
              disabled={currentPage === 1}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent/60 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => { setCurrentPage(p as number); tableRef.current?.scrollTo(0, 0); }}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      currentPage === p
                        ? "bg-foreground text-white"
                        : "text-muted-foreground hover:bg-sidebar-accent/60"
                    )}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); tableRef.current?.scrollTo(0, 0); }}
              disabled={currentPage === totalPages}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent/60 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Add User Dialog */}
      {dialogType === "addUser" && (
        <AddUserDialog
          open={true}
          onClose={closeDialog}
          onAdd={handleAddUser}
        />
      )}

      {/* Action Dialogs */}
      {selectedUser && dialogType === "edit" && (
        <EditUserDialog
          user={selectedUser}
          open={true}
          onClose={closeDialog}
          onSave={(updated) => {
            setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
          }}
        />
      )}
      {selectedUser && dialogType === "resetPassword" && (
        <ResetPasswordDialog
          user={selectedUser}
          open={true}
          onClose={closeDialog}
        />
      )}
      {selectedUser && dialogType === "toggleStatus" && (
        <ToggleStatusDialog
          user={selectedUser}
          open={true}
          onClose={closeDialog}
          onConfirm={() => {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === selectedUser.id
                  ? { ...u, status: (u.status === "inactive" ? "active" : "inactive") as UserStatus }
                  : u
              )
            );
          }}
        />
      )}
    </div>
  );
}
