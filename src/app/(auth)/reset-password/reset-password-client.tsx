"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { AuthLayout } from "@/app/(auth)/_components/auth-layout";

const inputShadowDefault = "var(--input-shadow)";
const inputShadowFocus = "var(--input-shadow-focus)";
const btnShadow = `rgba(0,0,0,0.1) 0px 0px 0px 1px inset, rgba(0,0,0,0.08) 0px 2px 4px -2px`;

export function ResetPasswordClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Password reset successfully");
    router.push(ROUTES.login);
    setIsLoading(false);
  }

  return (
    <AuthLayout>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full">
          <h1
            className="text-center font-semibold"
            style={{
              fontSize: "24px",
              lineHeight: "28px",
              letterSpacing: "-0.48px",
              color: "var(--foreground)",
            }}
          >
            Reset your password
          </h1>

          <p
            className="mt-2 text-center"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              letterSpacing: "-0.14px",
              color: "var(--muted-foreground)",
            }}
          >
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium tracking-[-0.12px] text-muted-foreground">
                New password
              </label>
              <div
                className="flex items-center transition-shadow"
                style={{
                  height: "34px",
                  borderRadius: "10px",
                  padding: "0 10px",
                  boxShadow:
                    focusedField === "password"
                      ? inputShadowFocus
                      : inputShadowDefault,
                  transitionDuration: "0.14s",
                }}
              >
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="New password"
                  required
                  autoComplete="new-password"
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

            <div>
              <label className="mb-1 block text-[12px] font-medium tracking-[-0.12px] text-muted-foreground">
                Confirm password
              </label>
              <div
                className="flex items-center transition-shadow"
                style={{
                  height: "34px",
                  borderRadius: "10px",
                  padding: "0 10px",
                  boxShadow:
                    focusedField === "confirm"
                      ? inputShadowFocus
                      : inputShadowDefault,
                  transitionDuration: "0.14s",
                }}
              >
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Confirm password"
                  required
                  autoComplete="new-password"
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

            <button
              type="submit"
              disabled={isLoading}
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
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <Link
            href={ROUTES.login}
            className="mt-4 block w-full text-center text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Return to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
