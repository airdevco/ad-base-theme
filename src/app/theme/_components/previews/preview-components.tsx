"use client";

import { useState } from "react";
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Minus,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/admin-sdc-ui/button";
import { Input } from "@/components/admin-sdc-ui/input";
import { Textarea } from "@/components/admin-sdc-ui/textarea";
import { Label } from "@/components/admin-sdc-ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/admin-sdc-ui/card";
import { Avatar, AvatarFallback } from "@/components/admin-sdc-ui/avatar";
import { ThinCheckbox } from "@/components/admin-sdc-ui/thin-checkbox";
import { Toggle } from "@/components/admin-sdc-ui/toggle";
import { Separator } from "@/components/admin-sdc-ui/separator";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin-sdc-ui/dialog";
import { USERS_FILTER_LABEL_CLASS } from "@/app/(admin)/admin/users/users-filter-pills";
import { cn } from "@/lib/utils";
import { RevenueChart } from "@/app/(admin)/admin/dashboard/_components/revenue-chart";
import { UserGrowthChart } from "@/app/(admin)/admin/dashboard/_components/user-growth-chart";

const PREVIEW_SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-[border-color] focus-visible:border-primary focus-visible:outline-none";

const GOAL_BUTTON_CLASS =
  "inline-flex size-8 items-center justify-center rounded-full border border-input bg-background text-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function BentoCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border shadow-none dark:border-transparent",
        className
      )}
    >
      {children}
    </Card>
  );
}

function MiniCalendar() {
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const dates = Array.from({ length: 35 }, (_, i) => {
    const day = i - 3;
    return day < 1 || day > 30 ? null : day;
  });
  const rangeStart = 12;
  const rangeEnd = 20;

  function getDateCellClass(date: number, index: number): string {
    if (date < rangeStart || date > rangeEnd) {
      return "text-foreground hover:bg-muted";
    }
    if (date === rangeStart || date === rangeEnd) {
      const col = index % 7;
      const isStartOfRow = col === 0;
      const isEndOfRow = col === 6;
      let rounded = "rounded-md";
      if (date === rangeStart && !isEndOfRow) {
        rounded = "rounded-l-md rounded-r-none";
      } else if (date === rangeEnd && !isStartOfRow) {
        rounded = "rounded-r-md rounded-l-none";
      }
      return cn("bg-primary text-primary-foreground", rounded);
    }
    return "bg-primary/15 text-foreground";
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="size-7" tabIndex={-1}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium">June 2023</span>
        <Button variant="ghost" size="icon" className="size-7" tabIndex={-1}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((d) => (
          <div key={d} className="py-1 text-muted-foreground">
            {d}
          </div>
        ))}
        {dates.map((date, i) => (
          <div
            key={i}
            className={cn(
              "flex size-8 items-center justify-center text-xs",
              date == null && "invisible",
              date != null && getDateCellClass(date, i)
            )}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
}

function CircleGoal() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex size-28 items-center justify-center">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray="264"
            strokeDashoffset="66"
            strokeLinecap="round"
            className="text-primary"
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-2xl font-bold leading-none text-foreground">350</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            CALORIES/DAY
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={GOAL_BUTTON_CLASS} tabIndex={-1}>
          <Minus className="size-3.5" />
        </button>
        <button type="button" className={GOAL_BUTTON_CLASS} tabIndex={-1}>
          <Plus className="size-3.5" />
        </button>
      </div>
      <Button className="w-full" size="sm" tabIndex={-1}>
        Set Goal
      </Button>
    </div>
  );
}

const TEAM_MEMBERS = [
  { initials: "SD", name: "Sofia Davis", email: "m@example.com", role: "Owner" },
  { initials: "JL", name: "Jackson Lee", email: "p@example.com", role: "Developer" },
  { initials: "IN", name: "Isabella Nguyen", email: "i@example.com", role: "Billing" },
];

const CHAT_INVITE_USERS = [
  { initials: "OM", name: "Olivia Martin", email: "olivia.martin@example.com" },
  { initials: "JL", name: "Jackson Lee", email: "jackson.lee@example.com" },
  { initials: "IN", name: "Isabella Nguyen", email: "isabella.nguyen@example.com" },
  { initials: "SD", name: "Sofia Davis", email: "sofia.davis@example.com" },
  { initials: "EW", name: "Ethan Wilson", email: "ethan.wilson@example.com" },
];

const PAYMENT_STATUS_DOTS: Record<string, string> = {
  Success: "bg-status-success-text",
  Processing: "bg-status-neutral-text",
  Failed: "bg-status-error-text",
};

const PAYMENTS = [
  { status: "Success", email: "ken99@example.com", amount: "$316.00" },
  { status: "Success", email: "abe45@example.com", amount: "$242.00" },
  { status: "Processing", email: "monserrat44@example.com", amount: "$837.00" },
  { status: "Failed", email: "carmella@example.com", amount: "$721.00" },
];

function NewMessageDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(CHAT_INVITE_USERS[0].email);

  const filteredUsers = CHAT_INVITE_USERS.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange} contentClassName="max-w-md">
      <DialogHeader className="border-b border-border pb-4">
        <DialogTitle>New message</DialogTitle>
        <DialogDescription>
          Invite a user to this thread. This will create a new group message.
        </DialogDescription>
      </DialogHeader>

      <div className="border-b border-border px-6 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto px-2 py-2">
        {filteredUsers.map((user) => (
          <button
            key={user.email}
            type="button"
            onClick={() => setSelectedEmail(user.email)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors",
              selectedEmail === user.email
                ? "bg-primary/15"
                : "hover:bg-primary/10"
            )}
            tabIndex={-1}
          >
            <Avatar className="size-9">
              <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </button>
        ))}
      </div>

      <DialogFooter className="flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Select users to add to this thread.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            tabIndex={-1}
            onClick={() => onOpenChange(false)}
            className="h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          >
            Cancel
          </Button>
          <Button size="sm" tabIndex={-1} onClick={() => onOpenChange(false)}>
            Continue
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}

function ChatPreviewCard() {
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  return (
    <>
      <BentoCard>
        <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
          <Avatar className="size-9">
            <AvatarFallback className="text-xs">SD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">Sofia Davis</CardTitle>
            <CardDescription className="text-xs">m@example.com</CardDescription>
          </div>
          <button
            type="button"
            onClick={() => setNewMessageOpen(true)}
            className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted hover:text-foreground"
            tabIndex={-1}
          >
            <Plus className="size-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
              Hi, how can I help you today?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
              Hey, I&apos;m having trouble with my account.
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
              What seems to be the problem?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
              I can&apos;t log in.
            </div>
          </div>
          <div className="relative">
            <Input
              placeholder="Type your message..."
              className="pr-12"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2 rounded-full"
              tabIndex={-1}
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </CardContent>
      </BentoCard>

      <NewMessageDialog open={newMessageOpen} onOpenChange={setNewMessageOpen} />
    </>
  );
}

export function PreviewComponents() {
  const [plan, setPlan] = useState<"starter" | "pro">("starter");
  const [strictCookies, setStrictCookies] = useState(true);
  const [functionalCookies, setFunctionalCookies] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

  return (
    <div className="min-h-full bg-muted/30 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-4">
          {/* Total Revenue */}
          <BentoCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">$15,231.89</p>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
              <RevenueChart height={120} />
            </CardContent>
          </BentoCard>

          {/* Upgrade subscription */}
          <BentoCard>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Upgrade your subscription
              </CardTitle>
              <CardDescription>
                You are currently on the free plan. Upgrade to unlock more
                features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input defaultValue="John Doe" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input defaultValue="john@example.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Card Number</Label>
                <Input defaultValue="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Expiry</Label>
                  <Input defaultValue="MM/YY" />
                </div>
                <div className="space-y-1.5">
                  <Label>CVC</Label>
                  <Input defaultValue="123" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["starter", "pro"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlan(p)}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-colors",
                        plan === p
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <p className="text-sm font-medium capitalize">{p} Plan</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {p === "starter" ? "Basic features" : "All features"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  className="min-h-[60px]"
                  defaultValue="Additional notes..."
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-start gap-2 text-sm">
                  <ThinCheckbox
                    checked={termsChecked}
                    onChange={(e) => setTermsChecked(e.target.checked)}
                    tabIndex={-1}
                  />
                  <span>I agree to the terms and conditions</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <ThinCheckbox
                    checked={emailUpdates}
                    onChange={(e) => setEmailUpdates(e.target.checked)}
                    tabIndex={-1}
                  />
                  <span>Allow us to send you emails</span>
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" tabIndex={-1}>
                Cancel
              </Button>
              <Button size="sm" tabIndex={-1}>
                Upgrade Plan
              </Button>
            </CardFooter>
          </BentoCard>

          {/* Team Members */}
          <BentoCard>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Team Members</CardTitle>
              <CardDescription>
                Invite your team members to collaborate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {TEAM_MEMBERS.map((member) => (
                <div key={member.email} className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs font-medium">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                  <select
                    className={cn(PREVIEW_SELECT_CLASS, "h-8 w-auto shrink-0 px-2 text-xs")}
                    defaultValue={member.role}
                  >
                    <option value="Owner">Owner</option>
                    <option value="Developer">Developer</option>
                    <option value="Billing">Billing</option>
                  </select>
                </div>
              ))}
            </CardContent>
          </BentoCard>

          {/* Cookie Settings */}
          <BentoCard>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Cookie Settings</CardTitle>
              <CardDescription>Manage your cookie preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Strictly Necessary</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Required for the site to function.
                  </p>
                </div>
                <Toggle
                  checked={strictCookies}
                  onCheckedChange={setStrictCookies}
                  size="sm"
                  tabIndex={-1}
                />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Functional Cookies</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Enable personalized features.
                  </p>
                </div>
                <Toggle
                  checked={functionalCookies}
                  onCheckedChange={setFunctionalCookies}
                  size="sm"
                  tabIndex={-1}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
              <Button className="w-full" size="sm" tabIndex={-1}>
                Save preferences
              </Button>
            </CardFooter>
          </BentoCard>

          {/* Chat */}
          <ChatPreviewCard />
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-4">
          {/* Calendar + Move Goal */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BentoCard>
              <CardContent className="pt-6">
                <MiniCalendar />
              </CardContent>
            </BentoCard>
            <BentoCard>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Move Goal</CardTitle>
                <CardDescription>Set your daily activity goal.</CardDescription>
              </CardHeader>
              <CardContent>
                <CircleGoal />
              </CardContent>
            </BentoCard>
          </div>

          {/* Exercise Minutes */}
          <BentoCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Exercise Minutes</CardTitle>
              <CardDescription>
                Your exercise minutes are ahead of where you normally are.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserGrowthChart height={180} />
            </CardContent>
          </BentoCard>

          {/* Payments table */}
          <BentoCard>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Payments</CardTitle>
              <CardDescription>
                Manage your payments and view history.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table className="border-separate border-spacing-0 [&_td]:text-foreground">
                <TableHeader
                  className="border-b-0 [&_th]:sticky [&_th]:top-0 [&_th]:z-[15] [&_th]:border-b [&_th]:border-t [&_th]:border-border [&_th]:bg-background"
                >
                  <TableRow className="hover:bg-transparent">
                    <TableHead className={cn(USERS_FILTER_LABEL_CLASS, "w-10 pl-2 pr-4")}>
                      <ThinCheckbox tabIndex={-1} readOnly />
                    </TableHead>
                    <TableHead className={USERS_FILTER_LABEL_CLASS}>Status</TableHead>
                    <TableHead className={USERS_FILTER_LABEL_CLASS}>Email</TableHead>
                    <TableHead className={cn(USERS_FILTER_LABEL_CLASS, "text-right")}>
                      Amount
                    </TableHead>
                    <TableHead className={cn(USERS_FILTER_LABEL_CLASS, "w-12 pr-6")} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PAYMENTS.map((row) => (
                    <TableRow key={row.email}>
                      <TableCell className="pl-2 pr-4 text-foreground">
                        <ThinCheckbox tabIndex={-1} readOnly />
                      </TableCell>
                      <TableCell className="text-foreground">
                        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              PAYMENT_STATUS_DOTS[row.status] ?? "bg-muted-foreground"
                            )}
                          />
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground">{row.email}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {row.amount}
                      </TableCell>
                      <TableCell className="pr-6 text-foreground">
                        <span className="flex size-7 items-center justify-center rounded-lg text-foreground">
                          <MoreHorizontal className="size-4 text-foreground" />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {PAYMENTS.length} results
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <span className="flex h-6 items-center rounded-md border border-border bg-background px-1.5 text-sm text-foreground">
                    10
                  </span>
                  <span className="text-sm text-muted-foreground">per page</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="flex size-7 items-center justify-center rounded-lg text-muted-foreground opacity-30">
                  <ChevronLeft className="size-3.5" />
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-sm font-medium text-white">
                  1
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg text-muted-foreground opacity-30">
                  <ChevronRight className="size-3.5" />
                </span>
              </div>
            </div>
          </BentoCard>

          {/* Share document */}
          <BentoCard>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Share this document
              </CardTitle>
              <CardDescription>
                Anyone with the link can view this document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  defaultValue="https://example.com/doc/abc123"
                  className="flex-1"
                />
                <Button variant="outline" className="gap-1.5 shrink-0" tabIndex={-1}>
                  <Copy className="size-3.5" />
                  Copy Link
                </Button>
              </div>
              <Separator />
              <div>
                <p className="mb-3 text-sm font-medium">People with access</p>
                <div className="space-y-3">
                  {TEAM_MEMBERS.slice(0, 2).map((member) => (
                    <div key={member.email} className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      <select
                        className={cn(PREVIEW_SELECT_CLASS, "h-7 w-auto shrink-0 px-2 text-xs")}
                        defaultValue="Can edit"
                      >
                        <option value="Can edit">Can edit</option>
                        <option value="Can view">Can view</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </BentoCard>

          {/* Report an issue */}
          <BentoCard>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Report an issue</CardTitle>
              <CardDescription>
                What area are you having problems with?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Area</Label>
                  <select className={PREVIEW_SELECT_CLASS} defaultValue="Billing">
                    <option value="Billing">Billing</option>
                    <option value="Account">Account</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Security Level</Label>
                  <select className={PREVIEW_SELECT_CLASS} defaultValue="Severity 2">
                    <option value="Severity 1">Severity 1</option>
                    <option value="Severity 2">Severity 2</option>
                    <option value="Severity 3">Severity 3</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input defaultValue="I need help with..." />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea defaultValue="Please include all information relevant to your issue." />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" tabIndex={-1}>
                Cancel
              </Button>
              <Button size="sm" tabIndex={-1}>
                Submit
              </Button>
            </CardFooter>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
