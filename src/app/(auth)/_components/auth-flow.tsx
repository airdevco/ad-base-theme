"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  Link2,
  Lock,
  Plus,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { AuthLayout } from "./auth-layout";

/* ── Design tokens ─────────────────────────────────────────────────── */

const inputShadowDefault = "var(--input-shadow)";
const inputShadowFocus = "var(--input-shadow-focus)";

const labelClass =
  "mb-1 block text-[12px] font-medium tracking-[-0.12px] text-muted-foreground";

const btnShadow = `rgba(0,0,0,0.1) 0px 0px 0px 1px inset, rgba(0,0,0,0.08) 0px 2px 4px -2px`;

const headingStyle = {
  fontSize: "24px",
  lineHeight: "28px",
  letterSpacing: "-0.48px",
  color: "var(--foreground)",
} as const;

const subtextStyle = {
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "20px",
  letterSpacing: "-0.14px",
  color: "var(--muted-foreground)",
} as const;

/* ── Steps ─────────────────────────────────────────────────────────── */

type Step =
  | "welcome"
  | "verify"
  | "profile"
  | "company"
  | "hearAbout"
  | "importContacts"
  | "interests"
  | "invite";

const ONBOARDING_STEPS: Step[] = [
  "verify",
  "profile",
  "company",
  "hearAbout",
  "importContacts",
  "interests",
  "invite",
];

const TOTAL_STEPS = ONBOARDING_STEPS.length;

function stepIndex(s: Step) {
  const idx = ONBOARDING_STEPS.indexOf(s);
  return idx === -1 ? 0 : idx;
}

/* ── Animation ───────────────────────────────────────────────────── */

const EASE = [0.2, 0, 0, 1] as const;

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
};

const stepTransition = { duration: 0.3, ease: EASE };

/* ── Reusable input component ────────────────────────────────────── */

function AttioInput({
  label,
  inputRef,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div
        className="flex items-center transition-shadow"
        style={{
          height: "34px",
          borderRadius: "10px",
          padding: "0 10px",
          boxShadow: focused ? inputShadowFocus : inputShadowDefault,
          transitionDuration: "0.14s",
        }}
      >
        <input
          ref={inputRef}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className="h-full w-full border-none bg-transparent outline-none placeholder:text-muted-foreground"
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--foreground)",
            letterSpacing: "-0.14px",
          }}
        />
      </div>
    </div>
  );
}

/* ── Reusable select component ───────────────────────────────────── */

function AttioSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div
        className="relative flex items-center transition-shadow"
        style={{
          height: "34px",
          borderRadius: "10px",
          padding: "0 10px",
          boxShadow: focused ? inputShadowFocus : inputShadowDefault,
          transitionDuration: "0.14s",
        }}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-full w-full cursor-pointer appearance-none border-none bg-transparent pr-6 outline-none"
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: value ? "var(--foreground)" : "var(--muted-foreground)",
            letterSpacing: "-0.14px",
          }}
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
        <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

/* ── Reusable button component ───────────────────────────────────── */

function AttioButton({
  children,
  disabled,
  type = "submit",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        height: "32px",
        borderRadius: "9px",
        backgroundColor: "var(--brand)",
        boxShadow: btnShadow,
        fontSize: "14px",
        fontWeight: 500,
        color: "var(--brand-foreground)",
      }}
    >
      {children}
    </button>
  );
}

/* ── Skip / secondary link ───────────────────────────────────────── */

function SkipButton({
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
      className="mt-3 w-full text-center text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </button>
  );
}

/* ── Selectable chip ─────────────────────────────────────────────── */

function Chip({
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
      className="cursor-pointer rounded-full px-3 py-1.5 text-[13px] font-medium transition-all duration-150"
      style={{
        boxShadow: selected
          ? "0 0 0 1.5px var(--brand) inset"
          : "0 0 0 1px var(--border) inset",
        backgroundColor: selected
          ? "color-mix(in srgb, var(--brand) 5%, transparent)"
          : "transparent",
        color: selected ? "var(--brand)" : "var(--foreground)",
      }}
    >
      {label}
    </button>
  );
}

/* ── Icons ───────────────────────────────────────────────────────── */

function GoogleIcon({ className }: { className?: string }) {
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

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

/* ── Progress bar ─────────────────────────────────────────────────── */

function StepProgress({ current, total }: { current: number; total: number }) {
  const progress = ((current + 1) / total) * 100;
  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-[2px] bg-border">
      <div
        className="h-full transition-all duration-500"
        style={{
          width: `${progress}%`,
          backgroundColor: "var(--brand)",
          transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
        }}
      />
    </div>
  );
}

/* ── Welcome step ────────────────────────────────────────────────── */

function WelcomeStep({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  onSubmit,
  mode,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  mode: "signin" | "signup";
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Signup: allow continuing to onboarding without email/password (temporary dev UX).
    if (mode === "signup") {
      onSubmit();
      return;
    }
    if (!email.trim() || !password.trim()) return;
    onSubmit();
  }

  return (
    <div>
      <h1 className="text-center font-semibold" style={headingStyle}>
        {mode === "signin" ? "Sign in" : "Create an account"}
      </h1>

      {/* Google OAuth */}
      <div className="mt-8">
        <button
          type="button"
          className="flex h-[32px] w-full cursor-pointer items-center justify-center gap-2 rounded-[9px] border-0 bg-background transition-shadow duration-150"
          style={{
            boxShadow:
              "rgba(28, 40, 64, 0.18) 0px 0px 2px 0px, rgba(24, 41, 75, 0.04) 0px 1px 3px 0px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow =
              "rgba(28, 40, 64, 0.25) 0px 0px 3px 0px, rgba(24, 41, 75, 0.08) 0px 2px 4px 0px")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow =
              "rgba(28, 40, 64, 0.18) 0px 0px 2px 0px, rgba(24, 41, 75, 0.04) 0px 1px 3px 0px")
          }
          onClick={() => {
            console.log("Auth: Google OAuth clicked");
            toast.info("Google SSO coming soon");
          }}
        >
          <GoogleIcon className="size-[18px]" />
          <span
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
          </span>
        </button>
      </div>

      {/* Divider */}
      <div
        className="my-7"
        style={{ height: "1px", backgroundColor: "var(--border)" }}
      />

      {/* Email + Password form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <AttioInput
          label="Email"
          inputRef={inputRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email address"
          required={mode === "signin"}
          autoComplete="email"
        />
        <AttioInput
          label={mode === "signup" ? "Create a password" : "Password"}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={
            mode === "signup" ? "Create a password" : "Enter your password"
          }
          required={mode === "signin"}
          autoComplete={
            mode === "signup" ? "new-password" : "current-password"
          }
        />

        {mode === "signin" && (
          <div className="flex justify-end">
            <Link
              href={ROUTES.forgotPassword}
              className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <div className="mt-1">
          <AttioButton disabled={isLoading}>
            {isLoading
              ? "Continuing..."
              : mode === "signin"
                ? "Sign in"
                : "Continue"}
          </AttioButton>
        </div>
      </form>

      <p
        className="mt-5 text-center"
        style={{
          fontSize: "12px",
          fontWeight: 500,
          lineHeight: "16px",
          letterSpacing: "-0.12px",
          color: "var(--muted-foreground)",
        }}
      >
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href={ROUTES.signup}
              className="underline transition-colors hover:text-foreground"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href={ROUTES.login}
              className="underline transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

/* ── Verify step ─────────────────────────────────────────────────── */

function VerifyStep({
  email,
  isLoading,
  onSubmit,
}: {
  email: string;
  isLoading: boolean;
  onSubmit: () => void;
}) {
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    onSubmit();
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-semibold" style={headingStyle}>
        Check your email
      </h1>

      <p className="mt-2" style={subtextStyle}>
        We sent a sign-in code to{" "}
        <span style={{ color: "var(--foreground)" }}>{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-3">
        <AttioInput
          label="Verification code"
          inputRef={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(val);
          }}
          placeholder="Enter 6-digit code"
        />

        <div className="mt-auto pt-4">
          <AttioButton disabled={isLoading || code.length !== 6}>
            {isLoading ? "Verifying..." : "Verify"}
          </AttioButton>
        </div>
      </form>

      <button
        type="button"
        className="mt-4 w-full text-center text-[12px] font-medium text-muted-foreground transition-colors hover:underline"
        onClick={() => {
          console.log("Auth: Resend code requested");
          toast.success("Code resent!");
        }}
      >
        Resend code
      </button>
    </div>
  );
}

/* ── Profile step ────────────────────────────────────────────────── */

/* Simulated username availability check */
const TAKEN_USERNAMES = ["admin", "user", "test", "airdev", "demo"];

function ProfileStep({
  isLoading,
  onSubmit,
}: {
  isLoading: boolean;
  onSubmit: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const checkTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  function handleUsernameChange(val: string) {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setUsername(sanitized);

    if (checkTimeout.current) clearTimeout(checkTimeout.current);

    if (!sanitized.trim()) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    checkTimeout.current = setTimeout(() => {
      setUsernameStatus(
        TAKEN_USERNAMES.includes(sanitized) ? "taken" : "available",
      );
    }, 500);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !username.trim()) return;
    if (usernameStatus !== "available") return;
    console.log("Auth: profile", { firstName, lastName, username });
    onSubmit();
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-semibold" style={headingStyle}>
        Let&apos;s get to know you
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-3">
        <AttioInput
          label="First name"
          inputRef={inputRef}
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          required
          autoComplete="given-name"
        />

        <AttioInput
          label="Last name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
          required
          autoComplete="family-name"
        />

        <div>
          <AttioInput
            label="Username"
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="Choose a unique username"
            required
            autoComplete="username"
          />
          {username.trim() !== "" && usernameStatus !== "idle" && (
            <div
              className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium"
              style={{
                color:
                  usernameStatus === "available"
                    ? "rgb(22, 163, 74)"
                    : usernameStatus === "taken"
                      ? "rgb(220, 38, 38)"
                      : "rgb(140, 141, 145)",
              }}
            >
              {usernameStatus === "checking" && (
                <>
                  <span className="inline-block size-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
                  Checking availability...
                </>
              )}
              {usernameStatus === "available" && (
                <>
                  <svg
                    className="size-3.5"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                  </svg>
                  Username is available
                </>
              )}
              {usernameStatus === "taken" && (
                <>
                  <svg
                    className="size-3.5"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
                  </svg>
                  Username is taken
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4">
          <AttioButton
            disabled={
              isLoading ||
              !firstName.trim() ||
              !lastName.trim() ||
              usernameStatus !== "available"
            }
          >
            {isLoading ? "Setting up..." : "Continue"}
          </AttioButton>
        </div>
      </form>
    </div>
  );
}

/* ── Company step ────────────────────────────────────────────────── */

const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance & Banking" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "real-estate", label: "Real Estate" },
  { value: "media", label: "Media & Entertainment" },
  { value: "other", label: "Other" },
];

const COMPANY_SIZES = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-1000", label: "201–1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
];

function CompanyStep({
  isLoading,
  onSubmit,
}: {
  isLoading: boolean;
  onSubmit: () => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;
    console.log("Auth: company info", { companyName, industry, size });
    onSubmit();
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-semibold" style={headingStyle}>
        Tell us about your company
      </h1>

      <p className="mt-2" style={subtextStyle}>
        This helps us customize your experience
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-3">
        <AttioInput
          label="Company name"
          inputRef={inputRef}
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter your company name..."
          required
          autoComplete="organization"
        />

        <AttioSelect
          label="Industry"
          value={industry}
          onChange={setIndustry}
          options={INDUSTRIES}
          placeholder="Select your industry"
        />

        <AttioSelect
          label="Company size"
          value={size}
          onChange={setSize}
          options={COMPANY_SIZES}
          placeholder="Select company size"
        />

        <div className="mt-auto pt-4">
          <AttioButton disabled={isLoading}>
            {isLoading ? "Continuing..." : "Continue"}
          </AttioButton>
        </div>
      </form>
    </div>
  );
}

/* ── How did you hear about us step ──────────────────────────────── */

const HEAR_ABOUT_OPTIONS = [
  "X.com",
  "AI",
  "Facebook",
  "Billboard / Outside",
  "Friends / Coworker",
  "Youtube",
  "Podcast",
  "Newsletter",
  "Google",
  "Reddit",
  "Instagram",
  "LinkedIn",
  "Other",
];

function HearAboutStep({
  isLoading,
  onSubmit,
  onSkip,
}: {
  isLoading: boolean;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(option: string) {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Auth: hear about us", selected);
    onSubmit();
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-semibold" style={headingStyle}>
        How did you hear about us?
      </h1>

      <p className="mt-2" style={subtextStyle}>
        Please select below where you found out about {APP_NAME}. This step is
        optional.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col">
        <div className="flex flex-wrap gap-2">
          {HEAR_ABOUT_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={selected.includes(option)}
              onClick={() => toggle(option)}
            />
          ))}
        </div>

        <div className="mt-auto pt-6">
          <AttioButton disabled={isLoading}>
            {isLoading ? "Continuing..." : "Continue"}
          </AttioButton>
          <SkipButton onClick={onSkip}>Skip</SkipButton>
        </div>
      </form>
    </div>
  );
}

/* ── Import contacts step ────────────────────────────────────────── */

function ImportContactsStep({
  isLoading,
  onSubmit,
  onSkip,
}: {
  isLoading: boolean;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-semibold" style={headingStyle}>
        Bring your contacts into {APP_NAME}
      </h1>

      <p className="mt-2" style={subtextStyle}>
        By connecting your email and calendar, you&apos;ll be able to instantly
        see contacts from your entire network.
      </p>

      <div className="mt-6 flex flex-1 flex-col">
        {/* Google connect */}
        <button
          type="button"
          onClick={() => {
            console.log("Auth: connect Google");
            toast.info("Google integration coming soon");
            onSubmit();
          }}
          className="flex h-[32px] w-full cursor-pointer items-center justify-center gap-2 rounded-[9px] border-0 bg-[#1a73e8] text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          style={{
            boxShadow:
              "rgba(26, 115, 232, 0.3) 0px 2px 6px 0px, rgba(26, 115, 232, 0.15) 0px 0px 0px 1px inset",
          }}
        >
          <GoogleIcon className="size-[18px]" />
          Continue with Google
        </button>

        {/* Microsoft connect */}
        <button
          type="button"
          onClick={() => {
            console.log("Auth: connect Microsoft");
            toast.info("Microsoft integration coming soon");
            onSubmit();
          }}
          className="mt-3 flex h-[32px] w-full cursor-pointer items-center justify-center gap-2 rounded-[9px] border-0 bg-background text-[14px] font-medium text-foreground transition-shadow duration-150"
          style={{
            boxShadow:
              "rgba(28, 40, 64, 0.18) 0px 0px 2px 0px, rgba(24, 41, 75, 0.04) 0px 1px 3px 0px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow =
              "rgba(28, 40, 64, 0.25) 0px 0px 3px 0px, rgba(24, 41, 75, 0.08) 0px 2px 4px 0px")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow =
              "rgba(28, 40, 64, 0.18) 0px 0px 2px 0px, rgba(24, 41, 75, 0.04) 0px 1px 3px 0px")
          }
        >
          <MicrosoftIcon className="size-[16px]" />
          Continue with Microsoft
        </button>

        {/* Privacy note */}
        <div className="mt-5 flex items-start gap-2 text-[12px] text-muted-foreground">
          <Lock className="mt-0.5 size-3 shrink-0" />
          <span>
            Privacy first. Only you can see the email content we sync.
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="size-3" /> GDPR
          </span>
          <span className="flex items-center gap-1">
            <Shield className="size-3" /> CCPA
          </span>
          <span className="flex items-center gap-1">
            <Shield className="size-3" /> ISO 27001
          </span>
        </div>

        <div className="mt-auto pt-6">
          <SkipButton onClick={onSkip}>
            I&apos;ll manually create my contacts
          </SkipButton>
        </div>
      </div>
    </div>
  );
}

/* ── Interests step ──────────────────────────────────────────────── */

const USE_CASES = [
  "Sales",
  "Customer success",
  "Recruiting",
  "Fundraising",
  "Investing",
  "Other",
];

const APPROACHES = [
  "Product-led",
  "Sales-led",
  "Inbound",
  "Outbound",
  "SMB",
  "Mid-market",
  "Enterprise",
];

function InterestsStep({
  isLoading,
  onSubmit,
}: {
  isLoading: boolean;
  onSubmit: () => void;
}) {
  const [useCase, setUseCase] = useState<string | null>(null);
  const [approaches, setApproaches] = useState<string[]>([]);

  function toggleApproach(v: string) {
    setApproaches((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Auth: interests", { useCase, approaches });
    onSubmit();
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-semibold" style={headingStyle}>
        A few more questions
      </h1>

      <p className="mt-2" style={subtextStyle}>
        Tell us about your use case to get started with the right templates, or
        you can start with a blank canvas.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col">
        <p className={labelClass}>What will you be using {APP_NAME} for?</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {USE_CASES.map((uc) => (
            <Chip
              key={uc}
              label={uc}
              selected={useCase === uc}
              onClick={() => setUseCase(useCase === uc ? null : uc)}
            />
          ))}
        </div>

        {useCase && (
          <>
            <p className={`mt-5 ${labelClass}`}>
              Please tell us more about your use case.
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {APPROACHES.map((a) => (
                <Chip
                  key={a}
                  label={a}
                  selected={approaches.includes(a)}
                  onClick={() => toggleApproach(a)}
                />
              ))}
            </div>
          </>
        )}

        <div className="mt-auto pt-6">
          <AttioButton disabled={isLoading}>
            {isLoading ? "Continuing..." : "Continue"}
          </AttioButton>
        </div>
      </form>
    </div>
  );
}

/* ── Invite teammates step ───────────────────────────────────────── */

function InviteStep({
  isLoading,
  onSubmit,
  onSkip,
}: {
  isLoading: boolean;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const [invites, setInvites] = useState([
    { email: "", role: "Member" },
    { email: "", role: "Member" },
  ]);

  function updateEmail(idx: number, email: string) {
    setInvites((prev) =>
      prev.map((inv, i) => (i === idx ? { ...inv, email } : inv)),
    );
  }

  function updateRole(idx: number, role: string) {
    setInvites((prev) =>
      prev.map((inv, i) => (i === idx ? { ...inv, role } : inv)),
    );
  }

  function addRow() {
    setInvites((prev) => [...prev, { email: "", role: "Member" }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filled = invites.filter((inv) => inv.email.trim());
    console.log("Auth: invites", filled);
    if (filled.length > 0) {
      toast.success(`${filled.length} invite(s) sent!`);
    }
    onSubmit();
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-semibold" style={headingStyle}>
        Collaborate with your team
      </h1>

      <p className="mt-2" style={subtextStyle}>
        The more your teammates use {APP_NAME}, the more powerful it becomes.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col">
        <p className={labelClass}>Invite your team to collaborate</p>

        <div className="mt-1 flex flex-col gap-2">
          {invites.map((inv, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex-1">
                <div
                  className="flex items-center transition-shadow"
                  style={{
                    height: "34px",
                    borderRadius: "10px",
                    padding: "0 10px",
                    boxShadow: inputShadowDefault,
                  }}
                >
                  <input
                    type="email"
                    value={inv.email}
                    onChange={(e) => updateEmail(idx, e.target.value)}
                    placeholder="example@email.com"
                    className="h-full w-full border-none bg-transparent outline-none placeholder:text-muted-foreground"
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--foreground)",
                      letterSpacing: "-0.14px",
                    }}
                  />
                </div>
              </div>
              <div className="relative shrink-0">
                <select
                  value={inv.role}
                  onChange={(e) => updateRole(idx, e.target.value)}
                  className="cursor-pointer appearance-none border-none bg-transparent pr-5 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="size-3.5" />
            Add more
          </button>
          <button
            type="button"
            onClick={() => {
              toast.info("Invite link copied!");
            }}
            className="flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Link2 className="size-3.5" />
            Copy invite link
          </button>
        </div>

        <div className="mt-auto pt-6">
          <AttioButton disabled={isLoading}>
            {isLoading ? "Sending..." : "Send invites"}
          </AttioButton>
          <SkipButton onClick={onSkip}>Skip for now</SkipButton>
        </div>
      </form>
    </div>
  );
}

/* ── Onboarding card (two-column: form left, placeholder right) ─── */

function OnboardingCard({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-border bg-background">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute left-3 top-3 z-10 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-muted-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      <div className="flex min-h-[480px]">
        <div className="flex w-full flex-col p-8 pt-14 md:p-10 md:pt-14">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Main auth flow ──────────────────────────────────────────────── */

export function AuthFlow({
  mode = "signin",
}: { mode?: "signin" | "signup" } = {}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isOnboarding = mode === "signup" && step !== "welcome";

  function goForward(next: Step) {
    setDirection(1);
    setStep(next);
  }

  function goBack(prev: Step) {
    setDirection(-1);
    setStep(prev);
  }

  async function handleWelcomeSubmit() {
    setIsLoading(true);
    console.log("Auth: email submitted", email);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);

    if (mode === "signin") {
      toast.success("Welcome back to " + APP_NAME + "!");
      router.push(ROUTES.account);
    } else {
      goForward("verify");
    }
  }

  async function handleVerifySubmit() {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    goForward("profile");
  }

  function handleProfileSubmit() {
    goForward("company");
  }

  function handleCompanySubmit() {
    goForward("hearAbout");
  }

  function handleHearAboutSubmit() {
    goForward("importContacts");
  }

  function handleImportSubmit() {
    goForward("interests");
  }

  function handleInterestsSubmit() {
    goForward("invite");
  }

  async function handleInviteSubmit() {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Welcome to " + APP_NAME + "!");
    router.push(ROUTES.account);
  }

  function finishOnboarding() {
    toast.success("Welcome to " + APP_NAME + "!");
    router.push(ROUTES.account);
  }

  /* Previous step map for back navigation */
  const prevStep: Partial<Record<Step, Step>> = {
    verify: "welcome",
    profile: "verify",
    company: "profile",
    hearAbout: "company",
    importContacts: "hearAbout",
    interests: "importContacts",
    invite: "interests",
  };

  const stepContent = (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={step}
        custom={direction}
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={stepTransition}
      >
        {step === "welcome" && (
          <WelcomeStep
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            onSubmit={handleWelcomeSubmit}
            mode={mode}
          />
        )}
        {step === "verify" && (
          <OnboardingCard onBack={() => goBack("welcome")}>
            <VerifyStep
              email={email}
              isLoading={isLoading}
              onSubmit={handleVerifySubmit}
            />
          </OnboardingCard>
        )}
        {step === "profile" && (
          <OnboardingCard onBack={() => goBack("verify")}>
            <ProfileStep
              isLoading={isLoading}
              onSubmit={handleProfileSubmit}
            />
          </OnboardingCard>
        )}
        {step === "company" && (
          <OnboardingCard onBack={() => goBack("profile")}>
            <CompanyStep
              isLoading={isLoading}
              onSubmit={handleCompanySubmit}
            />
          </OnboardingCard>
        )}
        {step === "hearAbout" && (
          <OnboardingCard onBack={() => goBack("company")}>
            <HearAboutStep
              isLoading={isLoading}
              onSubmit={handleHearAboutSubmit}
              onSkip={() => goForward("importContacts")}
            />
          </OnboardingCard>
        )}
        {step === "importContacts" && (
          <OnboardingCard onBack={() => goBack("hearAbout")}>
            <ImportContactsStep
              isLoading={isLoading}
              onSubmit={handleImportSubmit}
              onSkip={() => goForward("interests")}
            />
          </OnboardingCard>
        )}
        {step === "interests" && (
          <OnboardingCard onBack={() => goBack("importContacts")}>
            <InterestsStep
              isLoading={isLoading}
              onSubmit={handleInterestsSubmit}
            />
          </OnboardingCard>
        )}
        {step === "invite" && (
          <OnboardingCard onBack={() => goBack("interests")}>
            <InviteStep
              isLoading={isLoading}
              onSubmit={handleInviteSubmit}
              onSkip={finishOnboarding}
            />
          </OnboardingCard>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <AuthLayout hideBrandPanel={isOnboarding}>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Progress bar (signup onboarding steps only) */}
        {isOnboarding && (
          <StepProgress current={stepIndex(step)} total={TOTAL_STEPS} />
        )}

        {/* Centered step content */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className={isOnboarding ? "w-full max-w-[520px] px-6" : "w-full"}
          >
            {stepContent}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pb-6 pt-8">
          {!isOnboarding && (
            <p
              className="text-center"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: "16px",
                letterSpacing: "-0.12px",
                color: "rgba(0, 0, 0, 0.55)",
              }}
            >
              By proceeding you acknowledge that you have read, understood and
              agree to our{" "}
              <Link href={ROUTES.terms} className="underline">
                Terms and Conditions.
              </Link>
            </p>
          )}

          <div
            className={`flex items-center justify-center gap-4 ${isOnboarding ? "" : "pt-4"}`}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "16px",
              letterSpacing: "-0.12px",
              color: "rgba(0, 0, 0, 0.55)",
            }}
          >
            <span>
              &copy; {new Date().getFullYear()} {APP_NAME}
            </span>
            <Link href={ROUTES.privacy} className="underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
