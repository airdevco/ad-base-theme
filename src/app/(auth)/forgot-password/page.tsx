"use client";

import { Suspense, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { AuthLayoutSdc } from "@/app/(auth)/_components/auth-layout-sdc";
import { Input } from "@/components/admin-sdc-ui/input";
import { Label } from "@/components/admin-sdc-ui/label";
import { Button } from "@/components/admin-sdc-ui/button";
import { cn } from "@/lib/utils";

/** Matches `auth-flow-sdc` welcome step. */
const sectionTitleClass = "text-[28px] font-bold leading-tight text-foreground";
const sectionSubtextClass = "mt-2 text-sm text-muted-foreground";
const sdcFieldHeight = "h-9 max-h-[40px]";
const sdcLabelFieldGap = "gap-[4px]";
const sdcInputField = cn(sdcFieldHeight, "py-0 leading-normal");
const sdcDialogPrimaryButton = cn(
  sdcFieldHeight,
  "w-full rounded-lg px-4",
);

function ForgotPasswordSdcContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(() => emailFromUrl);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const emailId = `forgot-sdc-email-${uid}`;

  useEffect(() => {
    setEmail(emailFromUrl);
  }, [emailFromUrl]);

  useEffect(() => {
    document.title = `Forgot Password | ${APP_NAME}`;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Reset link sent! Check your email.");
    setIsLoading(false);
  }

  return (
    <AuthLayoutSdc>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <h1 className={cn(sectionTitleClass, "text-center")}>
              Forgot your password?
            </h1>
            <p className={cn(sectionSubtextClass, "text-center")}>
              Enter your email and we&apos;ll send you a reset link
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-3 text-left"
            >
              <div className={cn("flex flex-col", sdcLabelFieldGap)}>
                <Label htmlFor={emailId}>Email</Label>
                <Input
                  ref={inputRef}
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                  className={sdcInputField}
                />
              </div>

              <div className="mt-1">
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  disabled={isLoading}
                  className={sdcDialogPrimaryButton}
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </div>
            </form>

            <Link
              href={ROUTES.login}
              className="mt-5 block w-full text-center text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Return to login
            </Link>
          </div>
        </div>

        <div className="mt-auto pb-6 pt-8 text-center text-xs font-medium text-muted-foreground">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>
              &copy; {new Date().getFullYear()} {APP_NAME}
            </span>
            <span className="text-muted-foreground/50" aria-hidden>
              |
            </span>
            <Link href={ROUTES.terms} className="underline hover:text-foreground">
              Terms and Conditions
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
          </p>
        </div>
      </div>
    </AuthLayoutSdc>
  );
}

export default function ForgotPasswordSdcPage() {
  return (
    <Suspense
      fallback={
        <AuthLayoutSdc>
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center pb-20 pt-8">
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        </AuthLayoutSdc>
      }
    >
      <ForgotPasswordSdcContent />
    </Suspense>
  );
}
