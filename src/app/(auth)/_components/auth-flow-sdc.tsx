"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { AuthLayoutSdc } from "./auth-layout-sdc";
import { Button } from "@/components/admin-sdc-ui/button";
import { cn } from "@/lib/utils";
import {
  FlowInput,
  FlowPasswordInput,
  GoogleIcon,
  MicrosoftIcon,
  sectionTitleClass,
  sdcDialogPrimaryButton,
  sdcDialogOutlineButton,
} from "./auth-flow-sdc-shared";

type Step = "welcome" | "verify";

/* ── Animation ───────────────────────────────────────────────────── */

const EASE = [0.2, 0, 0, 1] as const;

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
};

const stepTransition = { duration: 0.3, ease: EASE };

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
    <div className="w-full">
      <h1 className={cn(sectionTitleClass, "text-center")}>
        {mode === "signin" ? "Log in to your account" : "Create an account"}
      </h1>

      <div className="mt-8 text-left">
        {/* Google OAuth — outline style like account-sdc secondary actions */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={sdcDialogOutlineButton}
          onClick={() => {
            console.log("Auth: Google OAuth clicked");
            toast.info("Google SSO coming soon");
          }}
        >
          <GoogleIcon className="size-[18px]" />
          {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
        </Button>

        {/* Divider */}
        <div className="my-7 h-px bg-border" />

        {/* Email + Password form — shared gap for login-sdc + signup-sdc (email / password / button) */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FlowInput
          label="Email"
          inputRef={inputRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email address"
          required={mode === "signin"}
          autoComplete="email"
        />

        <FlowPasswordInput
          label={mode === "signup" ? "Create a password" : "Password"}
          passwordPolicy={mode === "signup"}
          labelEnd={
            mode === "signin" ? (
              <Link
                href={
                  email.trim()
                    ? `${ROUTES.forgotPassword}?email=${encodeURIComponent(email.trim())}`
                    : ROUTES.forgotPassword
                }
                className="text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Forgot password?
              </Link>
            ) : undefined
          }
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

        <div>
          <Button
            type="submit"
            size="sm"
            variant="default"
            disabled={isLoading}
            className={sdcDialogPrimaryButton}
          >
            {isLoading
              ? "Continuing..."
              : mode === "signin"
                ? "Sign in"
                : "Continue"}
          </Button>
        </div>
        </form>
      </div>

      <p className="mt-5 text-center text-[14px] font-medium text-muted-foreground">
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

/** All onboarding steps (verify + profile, company, …) use the same card width. */
const onboardingCardMaxWidthClass = "max-w-[450px]";

/** 6×w-10 + 5×gap-2 — matches OTP row width for Verify button alignment */
const verifyOtpRowWidth = "w-[17.5rem] max-w-full";

const otpBoxClass =
  "flex h-12 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background text-center text-[20px] font-medium tabular-nums text-foreground outline-none transition-[border-color] focus:border-primary focus:ring-0 focus-visible:border-primary";

function VerificationCodeBoxes({
  onChange,
  disabled,
}: {
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [cells, setCells] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string[]) => {
    const normalized = next.slice(0, 6);
    while (normalized.length < 6) normalized.push("");
    setCells(normalized);
    onChange(normalized.join(""));
  };

  useEffect(() => {
    const t = setTimeout(() => refs.current[0]?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn("flex justify-center gap-2", verifyOtpRowWidth)}
      onPaste={(e) => {
        e.preventDefault();
        const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!t) return;
        const next = t.split("").concat(["", "", "", "", "", ""]).slice(0, 6);
        commit(next);
        refs.current[Math.min(t.length, 5)]?.focus();
      }}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={cells[i]}
          aria-label={`Digit ${i + 1} of 6`}
          className={otpBoxClass}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (raw.length > 1) {
              const next = raw
                .split("")
                .concat(["", "", "", "", "", ""])
                .slice(0, 6);
              commit(next);
              refs.current[Math.min(raw.length, 5)]?.focus();
              return;
            }
            const next = [...cells];
            next[i] = raw.slice(-1) || "";
            commit(next);
            if (raw && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              const next = [...cells];
              if (next[i]) {
                next[i] = "";
                commit(next);
              } else if (i > 0) {
                next[i - 1] = "";
                commit(next);
                refs.current[i - 1]?.focus();
              }
              e.preventDefault();
            }
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}

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
  const displayEmail = email.trim() || "your email";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <div className="flex min-h-[min(300px,36vh)] w-full flex-col p-[30px]">
      <div className="shrink-0 space-y-1 text-center">
        <h1 className={cn(sectionTitleClass, "text-center")}>Check your email</h1>
        <p className="text-sm leading-snug text-muted-foreground">
          We sent a verification code to{" "}
          <span className="font-medium text-foreground">{displayEmail}</span>
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-14 sm:py-16">
          <VerificationCodeBoxes onChange={setCode} disabled={isLoading} />
        </div>

        <div className={cn("mx-auto flex w-full shrink-0 flex-col gap-3", verifyOtpRowWidth)}>
          <Button
            type="submit"
            size="sm"
            variant="default"
            disabled={isLoading}
            className={cn(sdcDialogPrimaryButton, "w-full")}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>

          <p className="text-center text-[14px] font-medium text-muted-foreground">
            Didn&apos;t receive a code?{" "}
            <button
              type="button"
              className="underline transition-colors hover:text-foreground"
              onClick={() => {
                console.log("Auth: Resend code requested");
                toast.success("Code resent!");
              }}
            >
              Resend code
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

/* ── Verify shell (no outer padding — VerifyStep supplies it) ─── */

function VerifyOnboardingCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-[16px] border border-border bg-background",
        onboardingCardMaxWidthClass,
      )}
    >
      <div className="flex w-full flex-col">{children}</div>
    </div>
  );
}

/* ── Main auth flow ──────────────────────────────────────────────── */

export function AuthFlowSdc({
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
    router.push(`${ROUTES.onboarding}?step=1`);
  }

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
          <VerifyOnboardingCard>
            <VerifyStep
              email={email}
              isLoading={isLoading}
              onSubmit={handleVerifySubmit}
            />
          </VerifyOnboardingCard>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <AuthLayoutSdc hideBrandPanel={isOnboarding}>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Centered step content */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className={isOnboarding ? "w-full max-w-[450px] px-6" : "w-full"}
          >
            {stepContent}
          </div>
        </div>

        {/* Footer — legal links hidden during onboarding */}
        <div className="mt-auto pb-6 pt-8 text-center text-xs font-medium text-muted-foreground">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>
              &copy; {new Date().getFullYear()} {APP_NAME}
            </span>
            {!isOnboarding && (
              <>
                <span className="text-muted-foreground/50" aria-hidden>
                  |
                </span>
                <Link href={ROUTES.terms} className="underline hover:text-foreground">
                  Terms of Use
                </Link>
                <span className="text-muted-foreground/50" aria-hidden>
                  |
                </span>
                <Link
                  href={ROUTES.privacy}
                  className="underline hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </AuthLayoutSdc>
  );
}
