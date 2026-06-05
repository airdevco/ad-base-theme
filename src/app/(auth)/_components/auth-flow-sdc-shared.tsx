"use client";

import { useEffect, useId, useState } from "react";
import { Check, ChevronDown, Eye, EyeOff, X } from "lucide-react";
import { Input } from "@/components/admin-sdc-ui/input";
import { Label } from "@/components/admin-sdc-ui/label";
import { cn } from "@/lib/utils";

/** Matches account-sdc section titles (e.g. Profile). */
export const sectionTitleClass =
  "text-[28px] font-bold leading-tight text-foreground";
export const sectionSubtextClass = "mt-2 text-sm text-muted-foreground";
export const fieldHintClass = "text-sm font-medium text-muted-foreground";
/** Same typography as <Label> above FlowInput / FlowSelect (foreground, not hint). */
export const fieldLabelClass =
  "text-sm font-medium leading-none text-foreground";

/** Same vertical size as account-sdc modal inputs & footer buttons (billing, security). */
export const sdcFieldHeight = "h-9 max-h-[40px]";
/** Space between label and control — matches login-sdc / forgot-password-sdc (4px). */
export const sdcLabelFieldGap = "gap-[4px]";
/**
 * Inputs: override default `py-2` so `h-9` is exact and padding matches on email + password.
 */
export const sdcInputField = cn(sdcFieldHeight, "py-0 leading-normal");
export const sdcDialogPrimaryButton = cn(
  sdcFieldHeight,
  "w-full rounded-lg px-4",
);
export const sdcDialogOutlineButton = cn(
  sdcFieldHeight,
  "w-full gap-2 rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
);

/* ── Password policy (aligned with account-sdc Security → Change password) ─ */

export function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

export const strengthColors = [
  "bg-rose-400",
  "bg-amber-400",
  "bg-yellow-400",
  "bg-emerald-400",
];

export const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

/* ── Fields aligned with account-sdc / admin-sdc-ui (Input, Label, Button) ─ */

export function FlowInput({
  label,
  labelEnd,
  inputRef,
  id,
  className,
  fieldRootClassName,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  labelEnd?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
  /** Label-to-control gap (default `sdcLabelFieldGap`, e.g. 4px). */
  fieldRootClassName?: string;
}) {
  const uid = useId();
  const fieldId = id ?? `login-sdc-field-${uid}`;
  return (
    <div
      className={cn("flex flex-col", fieldRootClassName ?? sdcLabelFieldGap)}
    >
      {labelEnd ? (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={fieldId}>{label}</Label>
          {labelEnd}
        </div>
      ) : (
        <Label htmlFor={fieldId}>{label}</Label>
      )}
      <Input
        ref={inputRef}
        id={fieldId}
        className={cn(sdcInputField, className)}
        {...props}
      />
    </div>
  );
}

export function FlowPasswordInput({
  label,
  labelEnd,
  inputRef,
  id,
  className,
  passwordPolicy,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type"> & {
  label: string;
  labelEnd?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
  /** Signup: strength meter + requirements (account-sdc Security change-password pattern). */
  passwordPolicy?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [policyFocused, setPolicyFocused] = useState(false);
  const uid = useId();
  const fieldId = id ?? `login-sdc-field-${uid}`;
  const passwordStr = String(props.value ?? "");
  const showToggle = passwordStr.length > 0;

  useEffect(() => {
    if (!passwordStr) setVisible(false);
  }, [passwordStr]);

  const strength = getPasswordStrength(passwordStr);
  const hasMinLength = passwordStr.length >= 8;
  const hasMixedCase =
    /[a-z]/.test(passwordStr) && /[A-Z]/.test(passwordStr);
  const hasNumber = /\d/.test(passwordStr);
  const requirements = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "Uppercase and lowercase letters", met: hasMixedCase },
    { label: "At least one number", met: hasNumber },
  ];

  return (
    <div className={cn("flex flex-col", sdcLabelFieldGap)}>
      {passwordPolicy ? (
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={fieldId} className="shrink-0">
            {label}
          </Label>
          {passwordStr ? (
            <div className="flex min-w-0 items-center justify-end gap-2">
              <span className="text-xs text-muted-foreground">
                {strengthLabels[strength - 1] ?? "Too short"}
              </span>
              <div className="flex w-[88px] shrink-0 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < strength
                        ? strengthColors[strength - 1]
                        : "bg-accent",
                    )}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : labelEnd ? (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={fieldId}>{label}</Label>
          {labelEnd}
        </div>
      ) : (
        <Label htmlFor={fieldId}>{label}</Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id={fieldId}
          type={visible ? "text" : "password"}
          className={cn(sdcInputField, showToggle && "pr-10", className)}
          {...props}
          onFocus={(e) => {
            if (passwordPolicy) setPolicyFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            const next = e.relatedTarget as HTMLElement | null;
            if (next?.closest?.("[data-password-toggle]")) {
              return;
            }
            if (passwordPolicy) setPolicyFocused(false);
            props.onBlur?.(e);
          }}
        />
        {showToggle ? (
          <button
            type="button"
            data-password-toggle
            className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOff className="size-4 shrink-0" aria-hidden />
            ) : (
              <Eye className="size-4 shrink-0" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      {passwordPolicy && policyFocused ? (
        <div className="mt-2">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Password requirements
          </p>
          <ul className="flex flex-col gap-1">
            {requirements.map((req) => (
              <li
                key={req.label}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                {passwordStr ? (
                  req.met ? (
                    <Check className="size-3 shrink-0 text-emerald-500" />
                  ) : (
                    <X className="size-3 shrink-0 text-red-400" />
                  )
                ) : (
                  <div className="size-3 shrink-0 rounded-full border border-border" />
                )}
                {req.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function FlowSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  fieldRootClassName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  fieldRootClassName?: string;
}) {
  const uid = useId();
  const fieldId = `login-sdc-select-${uid}`;
  return (
    <div
      className={cn("flex flex-col", fieldRootClassName ?? sdcLabelFieldGap)}
    >
      <Label htmlFor={fieldId}>{label}</Label>
      <div className="relative">
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex w-full cursor-pointer appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm outline-none transition-[border-color] focus-visible:border-primary",
            sdcInputField,
            !value ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

export function SkipButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 w-full text-center text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </button>
  );
}

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-foreground hover:bg-muted/50",
      )}
    >
      {label}
    </button>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
