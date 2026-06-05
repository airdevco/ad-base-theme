"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthLayoutSdcProps {
  children: React.ReactNode;
  hideBrandPanel?: boolean;
  /** Classes for padding below the logo row (default `pb-4`). Use e.g. `pb-0` when the child sets its own offset. */
  logoSectionBottomClassName?: string;
}

/**
 * Auth shell for `/login-sdc`: 50% brand / 50% form on large screens (mobile: form only + logo).
 * Fork of {@link AuthLayout} — edit here without changing `/login`.
 */
export function AuthLayoutSdc({
  children,
  hideBrandPanel,
  logoSectionBottomClassName,
}: AuthLayoutSdcProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
      {/* Left brand panel — half width on lg+, hidden on small screens and during onboarding */}
      {!hideBrandPanel && (
        <div className="relative hidden min-h-0 w-full shrink-0 lg:flex lg:w-1/2 lg:min-w-0 p-4">
          <div className="flex h-full min-h-[320px] w-full flex-col justify-end overflow-hidden rounded-[28px] bg-brand-gradient p-10">
            <div>
              <div className="mb-4 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-[22px] font-medium leading-[1.4] tracking-[-0.66px] text-brand-foreground">
                &ldquo;Airdev transformed our business strategy and helped us
                achieve 150% growth in just 6 months.&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-brand-foreground/15 text-[14px] font-semibold text-brand-foreground">
                  SM
                </div>
                <div>
                  <p className="text-[15px] font-medium text-brand-foreground">
                    Sarah Mitchell
                  </p>
                  <p className="text-[13px] text-brand-foreground/50">
                    CEO, TechVentures Inc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right form area — half width on lg+ when brand panel visible */}
      <div
        className={`flex min-h-0 flex-col items-center ${hideBrandPanel ? "w-full flex-1" : "w-full flex-1 lg:w-1/2 lg:min-w-0"}`}
      >
        {/* Default (blue) logo — top of right column, centered in container */}
        <div
          className={cn(
            "flex w-full justify-center px-6 pt-8 sm:px-0 lg:pt-10",
            logoSectionBottomClassName ?? "pb-4",
          )}
        >
          <Link href="/" className="inline-flex">
            <Logo height={30} />
          </Link>
        </div>

        <div className="mx-auto flex min-h-0 w-full max-w-[450px] flex-1 flex-col px-6 sm:px-0">
          {children}
        </div>
      </div>
    </div>
  );
}
