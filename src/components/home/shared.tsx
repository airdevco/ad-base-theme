"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ── Shared Framer Motion variants ──

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export const fadeUpSmall = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function stagger(delay = 0.1) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: delay } },
  };
}

/** Eyebrow label: small caps, no pill (used on light sections). */
const sectionLabelBase =
  "inline-block font-sans text-[12px] font-medium uppercase tracking-[0.14em]";

export function SectionTag({ children }: { children: React.ReactNode }) {
  return <span className={`${sectionLabelBase} text-primary`}>{children}</span>;
}

/** Same as {@link SectionTag} for dark / gradient section backgrounds. */
export function SectionTagLight({ children }: { children: React.ReactNode }) {
  return <span className={`${sectionLabelBase} text-brand-foreground`}>{children}</span>;
}

export function PrimaryCTA({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-[39px] items-center gap-2 rounded-[1000px] bg-brand pl-[14px] pr-[3px] text-[16px] font-medium leading-[24px] tracking-[-0.05em] text-brand-foreground transition-colors duration-200 hover:bg-brand-hover active:bg-brand-active font-sans ${className ?? ""}`}
    >
      {children}
      <span className="flex size-[33px] items-center justify-center rounded-full bg-brand-foreground/10">
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}

export function WhiteCTA({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-[39px] items-center gap-2 rounded-[1000px] bg-background pl-[14px] pr-[3px] text-[16px] font-medium leading-[24px] tracking-[-0.05em] text-brand transition-colors duration-200 hover:bg-secondary active:bg-muted font-sans"
    >
      {children}
      <span className="flex size-[33px] items-center justify-center rounded-full bg-brand/10">
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}
