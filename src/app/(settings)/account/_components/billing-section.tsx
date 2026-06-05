"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronDown, Clock, MoreHorizontal, CreditCard, Download, Users } from "lucide-react";
import { useSession } from "@/providers/auth-provider";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin-sdc-ui/dialog";
import { Button } from "@/components/admin-sdc-ui/button";
import { Input } from "@/components/admin-sdc-ui/input";
import { Label } from "@/components/admin-sdc-ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin-sdc-ui/dropdown-menu";

const invoices = [
  {
    id: "inv_001",
    date: "Mar 1, 2026",
    description: "Pro Plan - Monthly",
    amount: "$49.00",
    status: "Paid",
  },
  {
    id: "inv_002",
    date: "Feb 1, 2026",
    description: "Pro Plan - Monthly",
    amount: "$49.00",
    status: "Paid",
  },
  {
    id: "inv_003",
    date: "Jan 1, 2026",
    description: "Pro Plan - Monthly",
    amount: "$49.00",
    status: "Paid",
  },
];

const footerOutlineBtnClass =
  "h-9 max-h-[40px] rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground";
const footerPrimaryBtnClass = "h-9 max-h-[40px] rounded-lg px-4";

const USAGE_CARDS = [
  {
    key: "seats" as const,
    label: "Seats",
    value: "1",
    max: "5",
    /** Percent width for progress bar */
    pct: 20,
  },
  {
    key: "credits" as const,
    label: "Credits",
    value: "0",
    max: "10,000",
    pct: 0,
  },
] as const;

const CREDIT_PACKS = [
  { id: "500", credits: 500, label: "500 credits", price: "$10.00", hint: "Light use" },
  { id: "2000", credits: 2000, label: "2,000 credits", price: "$35.00", hint: "Most popular" },
  { id: "5000", credits: 5000, label: "5,000 credits", price: "$79.00", hint: "Best value" },
] as const;

/** Display as 4242 4242 4242 4242 (max 19 digits). */
function formatCardNumberInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** Display as MM / YY from typed digits. */
function formatExpiryInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

/** Prefill expiry field from stored `MM/YY` or `MM / YY`. */
function expiryStoredToInput(stored: string): string {
  const digits = stored.replace(/\D/g, "").slice(0, 4);
  return formatExpiryInput(digits);
}

type SeatRole = "Admin" | "Member";

type SeatMember = {
  id: string;
  email: string;
  role: SeatRole;
  status: "Invited" | "Joined";
};

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  cardholderName?: string;
};

export function BillingSection() {
  const { user } = useSession();
  const [usageDialog, setUsageDialog] = useState<null | "seats" | "credits">(null);
  const [creditPurchaseChoice, setCreditPurchaseChoice] = useState<string | null>(null);

  const [seatMembers, setSeatMembers] = useState<SeatMember[]>([
    { id: "1", email: "sarah@agency.com", role: "Admin", status: "Joined" },
    { id: "2", email: "dev@agency.com", role: "Member", status: "Joined" },
    { id: "3", email: "alex@agency.com", role: "Member", status: "Invited" },
    { id: "4", email: "sam@agency.com", role: "Member", status: "Joined" },
    { id: "5", email: "team@agency.com", role: "Member", status: "Invited" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDialogMode, setPaymentDialogMode] = useState<"add" | "edit">("add");
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  const [addressEmail, setAddressEmail] = useState(user.email);
  const [companyName, setCompanyName] = useState("Airdev");
  const [addressLine, setAddressLine] = useState("123 Agency St");
  const [city, setCity] = useState("San Francisco");
  const [stateRegion, setStateRegion] = useState("CA");
  const [country, setCountry] = useState("United States of America");
  const [zip, setZip] = useState("94102");

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "pm_initial",
      brand: "VISA",
      last4: "4242",
      expiry: "12/26",
      cardholderName: "Jane Smith",
    },
  ]);
  const [defaultPaymentId, setDefaultPaymentId] = useState("pm_initial");

  function handleSaveAddress() {
    toast.success("Billing address updated");
    setAddressDialogOpen(false);
  }

  function resetPaymentForm() {
    setPaymentDialogMode("add");
    setEditingPaymentId(null);
    setCardholderName("");
    setCardNumber("");
    setExpiry("");
    setCvc("");
  }

  function handleSavePayment() {
    const expDigits = expiry.replace(/\D/g, "");
    if (!cardholderName.trim() || expDigits.length !== 4) {
      toast.error("Enter cardholder name and expiry as MM / YY");
      return;
    }
    const expiryStored = `${expDigits.slice(0, 2)}/${expDigits.slice(2)}`;
    const digits = cardNumber.replace(/\D/g, "");
    const isEdit = paymentDialogMode === "edit" && editingPaymentId;

    if (isEdit) {
      if (digits.length > 0 && digits.length < 13) {
        toast.error("Enter a full card number to replace this card, or leave the field blank to keep it");
        return;
      }
      if (digits.length >= 13 && !cvc.trim()) {
        toast.error("Enter CVC for the new card");
        return;
      }
      setPaymentMethods((prev) =>
        prev.map((pm) => {
          if (pm.id !== editingPaymentId) return pm;
          let brand = pm.brand;
          let last4 = pm.last4;
          if (digits.length >= 13) {
            last4 = digits.slice(-4);
            const first = digits[0];
            brand = first === "5" ? "MC" : first === "3" ? "AMEX" : "VISA";
          }
          return {
            ...pm,
            cardholderName: cardholderName.trim(),
            expiry: expiryStored,
            brand,
            last4,
          };
        })
      );
      toast.success("Payment method updated");
      setPaymentDialogOpen(false);
      resetPaymentForm();
      return;
    }

    if (digits.length < 13) {
      toast.error("Enter cardholder name, full card number, and expiry as MM / YY");
      return;
    }
    if (!cvc.trim()) {
      toast.error("Enter CVC");
      return;
    }
    const last4 = digits.slice(-4);
    const first = digits[0];
    const brand = first === "5" ? "MC" : first === "3" ? "AMEX" : "VISA";
    const id = crypto.randomUUID();
    setPaymentMethods((prev) => [
      ...prev,
      { id, brand, last4, expiry: expiryStored, cardholderName: cardholderName.trim() },
    ]);
    setDefaultPaymentId(id);
    toast.success("Payment method added");
    setPaymentDialogOpen(false);
    resetPaymentForm();
  }

  function openEditPayment(pm: PaymentMethod) {
    setPaymentDialogMode("edit");
    setEditingPaymentId(pm.id);
    setCardholderName(pm.cardholderName ?? "");
    setCardNumber("");
    setExpiry(expiryStoredToInput(pm.expiry));
    setCvc("");
    setPaymentDialogOpen(true);
  }

  function handleDeletePayment(id: string) {
    setPaymentMethods((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setDefaultPaymentId((def) => (def === id ? next[0]?.id ?? "" : def));
      return next;
    });
    toast.success("Payment method removed");
  }

  function openUsageDialog(key: "seats" | "credits") {
    if (key === "seats") {
      setInviteEmail("");
    }
    if (key === "credits") {
      setCreditPurchaseChoice(null);
    }
    setUsageDialog(key);
  }

  function handleUsageDialogClose() {
    setUsageDialog(null);
  }

  function handlePurchaseCredits() {
    if (!creditPurchaseChoice) {
      toast.error("Choose a credit pack");
      return;
    }
    const pack = CREDIT_PACKS.find((p) => p.id === creditPurchaseChoice);
    if (pack) {
      toast.success(`Proceeding to checkout: ${pack.label} (${pack.price})`);
      handleUsageDialogClose();
    }
  }

  const canPurchaseCredits = creditPurchaseChoice != null;

  const SEAT_LIMIT = 5;

  function handleSendInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (seatMembers.some((m) => m.email.toLowerCase() === email)) {
      toast.error("That email is already invited");
      return;
    }
    if (seatMembers.length >= SEAT_LIMIT) {
      toast.error(`You've reached your limit of ${SEAT_LIMIT} seats. Purchase more to invite others.`);
      return;
    }
    setSeatMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        email,
        role: "Member",
        status: "Invited" as const,
      },
    ]);
    setInviteEmail("");
    toast.success("Invitation sent");
  }

  function handleRemoveSeat(id: string) {
    setSeatMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success("Seat removed");
  }

  function handleResendInvite(email: string) {
    toast.success(`Invitation resent to ${email}`);
  }

  function handleSeatRoleChange(id: string, role: SeatRole) {
    setSeatMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight text-foreground">Billing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Explore plans and manage your subscription, usage, and billing information
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-lg border border-status-warning-bg bg-status-warning-bg py-2 pl-2.5 pr-3 sm:flex-nowrap">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Clock className="size-3.5 shrink-0 text-status-warning-text" strokeWidth={2} aria-hidden />
          <span className="text-sm leading-snug text-status-warning-text">
            There are 14 days left on your trial
          </span>
        </div>
        <button
          type="button"
          className="shrink-0 text-left text-sm font-medium text-status-warning-text underline underline-offset-2 decoration-status-warning-text/70 hover:text-status-warning-text/80"
          onClick={() =>
            document.getElementById("billing-details-section")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        >
          Add billing details
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-[20px] font-bold leading-[30px] text-foreground">Current plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">Starts April 5th, 2026</p>
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
            <CreditCard className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Pro</p>
            <p className="mt-0.5 text-xs text-muted-foreground">$49.00/mo per seat, billed monthly</p>
          </div>
        </div>
      </div>

      <div className="my-8 border-t border-border" />

      <div>
        <h2 className="text-[20px] font-bold leading-[30px] text-foreground">Usage</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your seats and credits</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {USAGE_CARDS.map((item) => {
            const seatMax = 5;
            const seatCount = seatMembers.length;
            const seatPct = Math.min(100, (seatCount / seatMax) * 100);
            const displayValue = item.key === "seats" ? String(seatCount) : item.value;
            const displayPct = item.key === "seats" ? seatPct : item.pct;
            return (
              <div
                key={item.key}
                className="flex min-h-[102px] flex-col rounded-lg border border-border bg-background p-2.5"
              >
                <div className="flex shrink-0 items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => openUsageDialog(item.key)}
                    className="shrink-0 text-xs font-medium text-primary hover:underline"
                  >
                    Manage
                  </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col justify-center py-0.5">
                  <p className="text-[18px] font-semibold leading-none text-foreground">
                    {displayValue}{" "}
                    <span className="font-normal text-muted-foreground">/ {item.max}</span>
                  </p>
                </div>
                <div className="shrink-0 pt-1.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
                    <div
                      className="h-full min-w-0 rounded-full bg-primary transition-[width]"
                      style={{
                        width: displayPct <= 0 ? "0%" : `${Math.min(100, displayPct)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="my-8 border-t border-border" />

      <div id="billing-details-section" className="scroll-mt-4">
        <h2 className="text-[20px] font-bold leading-[30px] text-foreground">Billing details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your payment methods and billing information</p>

        <div className="mt-4 flex flex-col gap-3">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Address</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Update your billing address</p>
              </div>
              <button
                type="button"
                onClick={() => setAddressDialogOpen(true)}
                className="shrink-0 text-xs font-medium text-primary hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{addressEmail}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Company name</span>
                <span className="font-medium text-foreground">{companyName}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right font-medium text-foreground">{country}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Payment</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Manage your payment methods</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetPaymentForm();
                  setPaymentDialogOpen(true);
                }}
                className="shrink-0 text-xs font-medium text-primary hover:underline"
              >
                Add payment
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {paymentMethods.map((pm) => {
                const isDefault = defaultPaymentId === pm.id;
                const brandLabel =
                  pm.brand === "MC" ? "MC" : pm.brand === "AMEX" ? "AMEX" : pm.brand === "VISA" ? "VISA" : pm.brand;
                return (
                  <div
                    key={pm.id}
                    className="group relative flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                  >
                    <input
                      type="radio"
                      name="default-payment-method"
                      checked={isDefault}
                      onChange={() => setDefaultPaymentId(pm.id)}
                      className="size-4 shrink-0 border-border text-primary accent-primary"
                      aria-label={`Use card ending ${pm.last4} as default`}
                    />
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      onClick={() => setDefaultPaymentId(pm.id)}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded bg-foreground">
                        <span className="text-[10px] font-bold text-background">{brandLabel}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">&bull;&bull;&bull;&bull; {pm.last4}</p>
                        <p className="text-xs text-muted-foreground">Expires {pm.expiry}</p>
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      {isDefault ? (
                        <span className="rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          DEFAULT
                        </span>
                      ) : null}
                      <div className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            type="button"
                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                            aria-label={`More actions for card ${pm.last4}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" sideOffset={4}>
                            <DropdownMenuItem onClick={() => openEditPayment(pm)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeletePayment(pm.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="my-8 border-t border-border" />

      <div>
        <h2 className="text-[20px] font-bold leading-[30px] text-foreground">Invoice history</h2>
        <p className="mt-1 text-sm text-muted-foreground">Download past invoices and receipts</p>

        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <Table className="[&_td]:text-foreground">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-sm font-medium">{invoice.date}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{invoice.description}</TableCell>
                  <TableCell className="text-sm font-medium">{invoice.amount}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <span className="size-1.5 rounded-full bg-status-success-text" />
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="flex size-7 items-center justify-center rounded-lg hover:bg-muted/50"
                      onClick={() => toast.success("Invoice downloaded")}
                      aria-label="Download invoice"
                    >
                      <Download className="size-4 text-muted-foreground" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogHeader>
          <DialogTitle>Edit billing address</DialogTitle>
          <DialogDescription>Update your billing address for invoices and receipts.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 px-6 pb-4 pt-0">
          <div className="flex flex-col gap-1">
            <Label htmlFor="billing-address-email">Email</Label>
            <Input
              id="billing-address-email"
              type="email"
              value={addressEmail}
              onChange={(e) => setAddressEmail(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="billing-company">Company name</Label>
            <Input
              id="billing-company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="billing-address-line">Address</Label>
            <Input
              id="billing-address-line"
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="billing-city">City</Label>
              <Input id="billing-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="billing-state">State / Region</Label>
              <Input
                id="billing-state"
                type="text"
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="billing-country">Country</Label>
              <Input
                id="billing-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="billing-zip">ZIP / Postal code</Label>
              <Input id="billing-zip" type="text" value={zip} onChange={(e) => setZip(e.target.value)} className="h-9" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddressDialogOpen(false)}
            className={footerOutlineBtnClass}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSaveAddress} className={footerPrimaryBtnClass}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          setPaymentDialogOpen(open);
          if (!open) resetPaymentForm();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {paymentDialogMode === "edit" ? "Edit payment method" : "Add payment method"}
          </DialogTitle>
          <DialogDescription>
            {paymentDialogMode === "edit"
              ? "Update card details. Leave card number blank to keep the current card on file."
              : "Enter your card details to add a new payment method."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5 px-6 pb-4 pt-0"
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="billing-card-name">Cardholder name</Label>
            <Input
              id="billing-card-name"
              name="billing-cardholder-name"
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Jane Smith"
              className="h-9"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="billing-card-number">Card number</Label>
            <Input
              id="billing-card-number"
              name="billing-pan"
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
              placeholder={
                paymentDialogMode === "edit"
                  ? "Leave blank to keep current card"
                  : "4242 4242 4242 4242"
              }
              className="h-9"
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="billing-expiry">Expiry date</Label>
              <Input
                id="billing-expiry"
                name="billing-expiry"
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiryInput(e.target.value))}
                placeholder="MM / YY"
                className="h-9"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="billing-cvc">CVC</Label>
              <Input
                id="billing-cvc"
                name="billing-cvc"
                type="text"
                inputMode="numeric"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                className="h-9"
                autoComplete="off"
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPaymentDialogOpen(false);
              resetPaymentForm();
            }}
            className={footerOutlineBtnClass}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSavePayment} className={footerPrimaryBtnClass}>
            {paymentDialogMode === "edit" ? "Save changes" : "Add payment method"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={usageDialog !== null}
        onOpenChange={(open) => !open && handleUsageDialogClose()}
        contentClassName={
          usageDialog === "seats" ? "max-w-2xl" : usageDialog === "credits" ? "max-w-xl" : undefined
        }
      >
        <DialogHeader>
          {usageDialog === "seats" ? (
            <>
              <DialogTitle>Manage seats</DialogTitle>
              <DialogDescription>
                Invite teammates by email, manage who has access, and purchase more seats when you need room to grow.
              </DialogDescription>
            </>
          ) : null}
          {usageDialog === "credits" ? (
            <>
              <DialogTitle>Purchase credits</DialogTitle>
              <DialogDescription>
                Buy credit packs for automations, AI features, and premium actions. Credits apply after payment
                completes.
              </DialogDescription>
            </>
          ) : null}
        </DialogHeader>

        {usageDialog === "seats" ? (
          <div className="grid gap-5 px-6 pb-4 pt-0">
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
              <p className="text-sm font-medium text-foreground">
                {seatMembers.length} of {SEAT_LIMIT} seats in use
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {seatMembers.length >= SEAT_LIMIT
                  ? "Your plan is at capacity. Purchase more seats below to invite additional teammates."
                  : "Each invited user uses one seat. Remove someone or purchase more seats to invite additional people."}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="billing-invite-email">Invite by email</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Input
                  id="billing-invite-email"
                  type="email"
                  autoComplete="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendInvite();
                    }
                  }}
                  className="h-9 sm:min-w-0 sm:flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSendInvite}
                  className={`h-9 shrink-0 ${footerPrimaryBtnClass}`}
                >
                  Send invite
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">People on this plan</p>
              <div className="mt-2 overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="min-w-[8.5rem] font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="w-12 text-right font-semibold">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seatMembers.map((m) => (
                      <TableRow key={m.id} className="hover:bg-transparent">
                        <TableCell className="text-sm text-foreground">{m.email}</TableCell>
                        <TableCell className="text-sm">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              type="button"
                              className="group inline-flex h-8 min-w-[7.5rem] items-center justify-between gap-2 rounded-md border border-input bg-background px-2.5 text-left text-sm text-foreground shadow-none transition-[border-color,colors] hover:bg-transparent focus-visible:border-primary focus-visible:outline-none data-[state=open]:border-primary"
                              aria-label={`Role for ${m.email}`}
                            >
                              <span>{m.role}</span>
                              <ChevronDown
                                className="size-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180"
                                aria-hidden
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              sideOffset={4}
                              className="shadow-none"
                            >
                              <DropdownMenuItem
                                className="hover:bg-transparent focus:bg-transparent"
                                onClick={() => handleSeatRoleChange(m.id, "Admin")}
                              >
                                Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="hover:bg-transparent focus:bg-transparent"
                                onClick={() => handleSeatRoleChange(m.id, "Member")}
                              >
                                Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{m.status}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              type="button"
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-[border-color,colors] hover:bg-transparent hover:text-foreground focus-visible:border-primary focus-visible:outline-none data-[state=open]:border-primary"
                              aria-label={`Actions for ${m.email}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={4} className="shadow-none">
                              {m.status === "Invited" ? (
                                <>
                                  <DropdownMenuItem
                                    className="hover:bg-transparent focus:bg-transparent"
                                    onClick={() => handleResendInvite(m.email)}
                                  >
                                    Resend invite
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              ) : null}
                              <DropdownMenuItem
                                className="text-destructive hover:bg-transparent focus:bg-transparent focus:text-destructive"
                                onClick={() => handleRemoveSeat(m.id)}
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {seatMembers.length >= SEAT_LIMIT ? (
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-lg border border-status-warning-bg bg-status-warning-bg py-2 pl-2.5 pr-3 sm:flex-nowrap">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Users className="size-3.5 shrink-0 text-status-warning-text" strokeWidth={2} aria-hidden />
                  <span className="text-sm leading-snug text-status-warning-text">
                    Add seat packs ($49/mo each) to invite more teammates
                  </span>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-left text-sm font-medium text-status-warning-text underline underline-offset-2 decoration-status-warning-text/70 hover:text-status-warning-text/80"
                  onClick={() => toast.success("Opening checkout…")}
                >
                  Purchase seats
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {usageDialog === "credits" ? (
          <div className="grid gap-5 px-6 pb-4 pt-0">
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
              <p className="text-sm font-medium text-foreground">Current balance: 0 of 10,000 included credits</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Included credits refresh on your billing date. Purchased credits are added on top and typically do not
                expire mid-cycle.
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Credit packs</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {CREDIT_PACKS.map((pack) => {
                  const selected = creditPurchaseChoice === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setCreditPurchaseChoice(pack.id)}
                      className={cn(
                        "flex flex-col rounded-lg border px-3 py-3 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-background hover:bg-muted/30"
                      )}
                    >
                      <span className="text-sm font-semibold text-foreground">{pack.label}</span>
                      <span className="mt-1 text-sm text-muted-foreground">{pack.price}</span>
                      <span className="mt-0.5 text-xs text-muted-foreground">{pack.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[14px] text-muted-foreground">
              You&apos;ll confirm payment on the next step. Charges appear on your default payment method.
            </p>
          </div>
        ) : null}

        <DialogFooter>
          {usageDialog === "seats" ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUsageDialogClose}
                className={footerOutlineBtnClass}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleUsageDialogClose} className={footerPrimaryBtnClass}>
                Done
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUsageDialogClose}
                className={footerOutlineBtnClass}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handlePurchaseCredits}
                disabled={!canPurchaseCredits}
                className={footerPrimaryBtnClass}
              >
                Purchase credits
              </Button>
            </>
          )}
        </DialogFooter>
      </Dialog>
    </div>
  );
}
