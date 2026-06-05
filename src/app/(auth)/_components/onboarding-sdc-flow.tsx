"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Link2, Plus, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { AuthLayoutSdc } from "./auth-layout-sdc";
import { Input } from "@/components/admin-sdc-ui/input";
import { Button } from "@/components/admin-sdc-ui/button";
import { cn } from "@/lib/utils";
import {
  Chip,
  fieldLabelClass,
  FlowInput,
  FlowSelect,
  GoogleIcon,
  MicrosoftIcon,
  sdcDialogOutlineButton,
  sdcFieldHeight,
  sdcInputField,
  sectionSubtextClass,
  sectionTitleClass,
  SkipButton,
} from "./auth-flow-sdc-shared";

const TOTAL_ONBOARDING_STEPS = 6;

/** Space between stacked fields (inputs, sections). */
const onboardingFieldStackGap = "gap-5";
/** 4px between label / hint line and the control below it. */
const onboardingLabelToControl = "gap-[4px]";
/** Shared form id for sticky Continue → submit (one step mounted at a time). */
const ONBOARDING_STEP_FORM_ID = "onboarding-step-form";
/** Aligns main copy and sticky bar actions. */
const ONBOARDING_CONTENT_MAX = "mx-auto w-full max-w-[450px] px-6";
/** Step 4 (import contacts) — narrower column. */
const ONBOARDING_IMPORT_CONTENT_MAX = "mx-auto w-full max-w-[400px] px-6";

/** Progress track (sits at top of sticky footer). */
function OnboardingProgressTrack({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const progress = ((current + 1) / total) * 100;
  return (
    <div className="h-[3px] w-full bg-muted">
      <div
        className="h-full bg-primary transition-all duration-500"
        style={{
          width: `${progress}%`,
          transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
        }}
      />
    </div>
  );
}

/** Matches admin-sdc email template dialog footer (Cancel / Save Changes). */
const onboardingStickyCancelClass =
  "h-9 max-h-[40px] shrink-0 rounded-lg border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-sidebar-accent/60 hover:text-foreground";
const onboardingStickyPrimaryClass =
  "h-9 max-h-[40px] shrink-0 rounded-lg px-4 text-sm font-medium";

const EASE = [0.2, 0, 0, 1] as const;

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
};

const stepTransition = { duration: 0.3, ease: EASE };

function clampStep(raw: string | null): number {
  if (raw === null || raw.trim() === "") return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(TOTAL_ONBOARDING_STEPS, Math.max(1, n));
}
/* ── Profile step ────────────────────────────────────────────────── */

/* Simulated username availability check */
const TAKEN_USERNAMES = ["admin", "user", "test", "airdev", "demo"];

function ProfileStep({
  isLoading,
  onSubmit,
  onContinueEnabledChange,
}: {
  isLoading: boolean;
  onSubmit: () => void;
  onContinueEnabledChange?: (enabled: boolean) => void;
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

  useEffect(() => {
    onContinueEnabledChange?.(
      Boolean(
        firstName.trim() &&
          lastName.trim() &&
          username.trim() &&
          usernameStatus === "available",
      ),
    );
  }, [
    firstName,
    lastName,
    username,
    usernameStatus,
    onContinueEnabledChange,
  ]);

  return (
    <div className="flex w-full flex-col">
      <h1 className={sectionTitleClass}>Let&apos;s get to know you</h1>

      <p className={sectionSubtextClass}>
        Add a few details so we can set up your profile and personalize your{" "}
        {APP_NAME} workspace.
      </p>

      <form
        id={ONBOARDING_STEP_FORM_ID}
        onSubmit={handleSubmit}
        className={cn("mt-6 flex flex-col", onboardingFieldStackGap)}
      >
        <FlowInput
          label="First name"
          inputRef={inputRef}
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          required
          autoComplete="given-name"
          fieldRootClassName={onboardingLabelToControl}
        />

        <FlowInput
          label="Last name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
          required
          autoComplete="family-name"
          fieldRootClassName={onboardingLabelToControl}
        />

        <div>
          <FlowInput
            label="Username"
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="Choose a unique username"
            required
            autoComplete="username"
            fieldRootClassName={onboardingLabelToControl}
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
  onContinueEnabledChange,
}: {
  isLoading: boolean;
  onSubmit: () => void;
  onContinueEnabledChange?: (enabled: boolean) => void;
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

  useEffect(() => {
    onContinueEnabledChange?.(Boolean(companyName.trim()));
  }, [companyName, onContinueEnabledChange]);

  return (
    <div className="flex w-full flex-col">
      <h1 className={sectionTitleClass}>Tell us about your company</h1>

      <p className={sectionSubtextClass}>This helps us customize your experience</p>

      <form
        id={ONBOARDING_STEP_FORM_ID}
        onSubmit={handleSubmit}
        className={cn("mt-6 flex flex-col", onboardingFieldStackGap)}
      >
        <FlowInput
          label="Company name"
          inputRef={inputRef}
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter your company name..."
          required
          autoComplete="organization"
          fieldRootClassName={onboardingLabelToControl}
        />

        <FlowSelect
          label="Industry"
          value={industry}
          onChange={setIndustry}
          options={INDUSTRIES}
          placeholder="Select your industry"
          fieldRootClassName={onboardingLabelToControl}
        />

        <FlowSelect
          label="Company size"
          value={size}
          onChange={setSize}
          options={COMPANY_SIZES}
          placeholder="Select company size"
          fieldRootClassName={onboardingLabelToControl}
        />
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
    <div className="flex w-full flex-col">
      <h1 className={sectionTitleClass}>How did you hear about us?</h1>

      <p className={sectionSubtextClass}>
        Please select below where you found out about {APP_NAME}. This step is
        optional.
      </p>

      <form
        id={ONBOARDING_STEP_FORM_ID}
        onSubmit={handleSubmit}
        className={cn("mt-6 flex flex-col", onboardingFieldStackGap)}
      >
        <div className="flex flex-wrap gap-3">
          {HEAR_ABOUT_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={selected.includes(option)}
              onClick={() => toggle(option)}
            />
          ))}
        </div>

        <div className="mt-8">
          <SkipButton onClick={onSkip}>Skip for now</SkipButton>
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
    <div className="flex w-full flex-col">
      <h1 className={sectionTitleClass}>Bring your contacts in</h1>

      <p className={sectionSubtextClass}>
        By connecting your email and calendar, you&apos;ll be able to instantly
        see contacts from your entire network.
      </p>

      <div className={cn("mt-6 flex flex-col", onboardingFieldStackGap)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={sdcDialogOutlineButton}
          onClick={() => {
            console.log("Auth: connect Google");
            toast.info("Google integration coming soon");
            onSubmit();
          }}
        >
          <GoogleIcon className="size-[18px]" />
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={sdcDialogOutlineButton}
          onClick={() => {
            console.log("Auth: connect Microsoft");
            toast.info("Microsoft integration coming soon");
            onSubmit();
          }}
        >
          <MicrosoftIcon className="size-[16px]" />
          Continue with Microsoft
        </Button>

        <div className="rounded-xl border border-border/80 bg-muted/25 p-4">
          <p className="text-balance text-center text-sm leading-snug text-muted-foreground">
            <span className="font-medium text-foreground">Privacy first.</span>{" "}
            Only you see synced email, and it stays private until you share.
          </p>
          <div
            className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-border/60 pt-3"
            role="list"
            aria-label="Compliance certifications"
          >
            {(
              [
                { id: "gdpr", label: "GDPR" },
                { id: "ccpa", label: "CCPA" },
                { id: "iso", label: "ISO 27001" },
              ] as const
            ).map((item) => (
              <span
                key={item.id}
                role="listitem"
                className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                <Shield className="size-3 shrink-0 opacity-70" aria-hidden />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2">
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
    <div className="flex w-full flex-col">
      <h1 className={sectionTitleClass}>A few more questions</h1>

      <p className={sectionSubtextClass}>
        Tell us about your use case to get started with the right templates, or
        you can start with a blank canvas.
      </p>

      <form
        id={ONBOARDING_STEP_FORM_ID}
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-8"
      >
        <div className="flex flex-col gap-3">
          <p className={fieldLabelClass}>
            What will you be using {APP_NAME} for?
          </p>
          <div className="flex flex-wrap gap-3">
            {USE_CASES.map((uc) => (
              <Chip
                key={uc}
                label={uc}
                selected={useCase === uc}
                onClick={() => setUseCase(useCase === uc ? null : uc)}
              />
            ))}
          </div>
        </div>

        {useCase && (
          <div className="flex flex-col gap-3">
            <p className={fieldLabelClass}>
              Please tell us more about your use case.
            </p>
            <div className="flex flex-wrap gap-3">
              {APPROACHES.map((a) => (
                <Chip
                  key={a}
                  label={a}
                  selected={approaches.includes(a)}
                  onClick={() => toggleApproach(a)}
                />
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

/* ── Invite teammates step ───────────────────────────────────────── */

type InviteRow = { id: string; email: string; role: string };

function InviteStep({
  isLoading,
  onSubmit,
  onSkip,
}: {
  isLoading: boolean;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const [invites, setInvites] = useState<InviteRow[]>(() => [
    { id: crypto.randomUUID(), email: "", role: "Member" },
    { id: crypto.randomUUID(), email: "", role: "Member" },
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
    setInvites((prev) => [
      ...prev,
      { id: crypto.randomUUID(), email: "", role: "Member" },
    ]);
  }

  function removeRow(id: string) {
    setInvites((prev) =>
      prev.length <= 1 ? prev : prev.filter((inv) => inv.id !== id),
    );
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
    <div className="flex w-full flex-col">
      <h1 className={sectionTitleClass}>Collaborate with your team</h1>

      <p className={sectionSubtextClass}>
        Invite your teammates from {APP_NAME} to join the platform and
        collaborate with you.
      </p>

      <form
        id={ONBOARDING_STEP_FORM_ID}
        onSubmit={handleSubmit}
        className={cn("mt-6 flex flex-col", onboardingFieldStackGap)}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <p className={cn(fieldLabelClass, "min-w-0 flex-1")}>
              Invite your team to collaborate
            </p>
            <button
              type="button"
              onClick={() => {
                toast.info("Invite link copied!");
              }}
              className="flex shrink-0 items-center gap-1 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Link2 className="size-3.5" />
              Copy invite link
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-visible">
            {invites.map((inv, idx) => (
              <div key={inv.id} className="group relative w-full overflow-visible">
                <div className="flex w-full min-w-0 items-center gap-2">
                  <Input
                    type="email"
                    value={inv.email}
                    onChange={(e) => updateEmail(idx, e.target.value)}
                    placeholder="example@email.com"
                    className={cn(sdcInputField, "min-w-0 flex-1")}
                  />
                  <div className="relative shrink-0">
                    <select
                      value={inv.role}
                      onChange={(e) => updateRole(idx, e.target.value)}
                      className={cn(
                        sdcFieldHeight,
                        "cursor-pointer appearance-none rounded-md border border-input bg-background px-2 pr-7 text-sm text-foreground outline-none transition-[border-color] focus-visible:border-primary"
                      )}
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                {invites.length > 1 && (
                  <>
                    {/* Keeps group-hover active while moving pointer from row to X */}
                    <div
                      aria-hidden
                      className="pointer-events-auto absolute inset-y-0 left-full z-[5] w-11"
                    />
                    <button
                      type="button"
                      aria-label="Remove invite row"
                      onClick={() => removeRow(inv.id)}
                      className={cn(
                        "absolute left-full top-1/2 z-10 ml-0.5 -translate-y-1/2",
                        "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none",
                        "pointer-events-none opacity-0 transition-opacity",
                        "group-hover:pointer-events-auto group-hover:opacity-100",
                        "focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                    >
                      <X className="size-4 shrink-0" aria-hidden />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-0.5 flex justify-start">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1 text-[14px] font-medium text-primary transition-colors hover:text-primary/90"
            >
              <Plus className="size-3.5" />
              Add more
            </button>
          </div>
        </div>

        <div className="mt-8">
          <SkipButton onClick={onSkip}>Skip for now</SkipButton>
        </div>
      </form>
    </div>
  );
}

export function OnboardingSdcFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const step = clampStep(stepParam);

  useEffect(() => {
    const canonical = clampStep(stepParam);
    const asStr = String(canonical);
    if (stepParam !== asStr) {
      router.replace(`${ROUTES.onboarding}?step=${asStr}`);
    }
  }, [stepParam, router]);

  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [continueEnabled, setContinueEnabled] = useState(true);

  const reportContinueEnabled = useCallback((enabled: boolean) => {
    setContinueEnabled(enabled);
  }, []);

  useEffect(() => {
    setContinueEnabled(true);
  }, [step]);

  function goNext() {
    setDirection(1);
    if (step >= TOTAL_ONBOARDING_STEPS) return;
    router.push(`${ROUTES.onboarding}?step=${step + 1}`);
  }

  function goBack() {
    setDirection(-1);
    if (step <= 1) {
      router.push(ROUTES.signup);
      return;
    }
    router.push(`${ROUTES.onboarding}?step=${step - 1}`);
  }

  async function handleInviteSubmit() {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    toast.success("Welcome to " + APP_NAME + "!");
    router.push(ROUTES.account);
  }

  function finishOnboarding() {
    toast.success("Welcome to " + APP_NAME + "!");
    router.push(ROUTES.account);
  }

  const progressIndex = step - 1;

  const continueLabel =
    step === 6
      ? isLoading
        ? "Sending..."
        : "Send invites"
      : isLoading
        ? "Continuing..."
        : "Continue";

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
        {step === 1 && (
          <div className={ONBOARDING_CONTENT_MAX}>
            <ProfileStep
              isLoading={isLoading}
              onSubmit={goNext}
              onContinueEnabledChange={reportContinueEnabled}
            />
          </div>
        )}
        {step === 2 && (
          <div className={ONBOARDING_CONTENT_MAX}>
            <CompanyStep
              isLoading={isLoading}
              onSubmit={goNext}
              onContinueEnabledChange={reportContinueEnabled}
            />
          </div>
        )}
        {step === 3 && (
          <div className={ONBOARDING_CONTENT_MAX}>
            <HearAboutStep
              isLoading={isLoading}
              onSubmit={goNext}
              onSkip={() =>
                router.push(`${ROUTES.onboarding}?step=4`)
              }
            />
          </div>
        )}
        {step === 4 && (
          <div className={ONBOARDING_IMPORT_CONTENT_MAX}>
            <ImportContactsStep
              isLoading={isLoading}
              onSubmit={goNext}
              onSkip={() =>
                router.push(`${ROUTES.onboarding}?step=5`)
              }
            />
          </div>
        )}
        {step === 5 && (
          <div className={ONBOARDING_CONTENT_MAX}>
            <InterestsStep isLoading={isLoading} onSubmit={goNext} />
          </div>
        )}
        {step === 6 && (
          <div className={ONBOARDING_CONTENT_MAX}>
            <InviteStep
              isLoading={isLoading}
              onSubmit={handleInviteSubmit}
              onSkip={finishOnboarding}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <AuthLayoutSdc hideBrandPanel logoSectionBottomClassName="pb-0">
      <div className="flex min-h-0 flex-1 flex-col pb-28 pt-[60px] md:pt-[140px]">
        <div className="w-full pb-6 sm:pb-10">{stepContent}</div>

        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
          <OnboardingProgressTrack
            current={progressIndex}
            total={TOTAL_ONBOARDING_STEPS}
          />
          <div className="mx-auto w-full max-w-[450px] px-6">
            <div className="flex items-center justify-between gap-3 py-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goBack}
                className={onboardingStickyCancelClass}
              >
                Back
              </Button>
              {step === 4 ? (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={isLoading}
                  className={onboardingStickyPrimaryClass}
                  onClick={goNext}
                >
                  {continueLabel}
                </Button>
              ) : (
                <Button
                  type="submit"
                  form={ONBOARDING_STEP_FORM_ID}
                  variant="default"
                  size="sm"
                  disabled={isLoading || !continueEnabled}
                  className={onboardingStickyPrimaryClass}
                >
                  {continueLabel}
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </AuthLayoutSdc>
  );
}
