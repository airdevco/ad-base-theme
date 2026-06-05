"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Star } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  hideBrandPanel?: boolean;
}

export function AuthLayout({ children, hideBrandPanel }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left brand panel — desktop only, hidden when in onboarding steps */}
      {!hideBrandPanel && (
        <div className="relative hidden w-[540px] shrink-0 p-4 lg:block">
          <div className="flex h-full flex-col justify-end overflow-hidden rounded-[28px] bg-brand-gradient p-10">
            <Link href="/" className="absolute left-10 top-10">
              <Logo height={22} dark />
            </Link>

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

      {/* Right form area */}
      <div className="flex flex-1 flex-col items-center">
        {/* Show centered logo: always on mobile, only when brand panel hidden on desktop */}
        <div
          className={`pb-4 pt-8 lg:pt-10 ${hideBrandPanel ? "" : "lg:hidden"}`}
        >
          <Link href="/">
            <Logo height={24} className="dark:hidden" />
            <Logo height={24} dark className="hidden dark:block" />
          </Link>
        </div>

        <div
          className={`flex flex-1 flex-col px-6 sm:px-0 ${
            hideBrandPanel ? "w-full max-w-[520px]" : "w-full max-w-[400px]"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
