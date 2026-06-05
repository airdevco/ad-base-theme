"use client";

/**
 * Home layout variant used by `/search` so the nav/header can diverge
 * without affecting the rest of the marketing pages.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const headerNavTextClass =
  "text-[16px] font-medium leading-[24px] tracking-[-0.8px]";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it works", href: "#how-it-works" },
];

export default function HomeSdcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full bg-background transition-[border-color] duration-200 ${scrolled ? "border-b border-border" : "border-b border-transparent"}`}>
        <div className="mx-auto grid w-full max-w-[1150px] grid-cols-[1fr_auto] items-center gap-x-4 px-6 py-4 md:grid-cols-[1fr_auto_1fr] md:gap-x-6 min-[1198px]:px-0">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center justify-self-start"
            aria-label="Airdev home"
          >
            <Logo height={26} className="dark:hidden" />
            <Logo height={26} dark className="hidden dark:block" />
          </Link>

          {/* Centered in full bar: equal 1fr side columns + auto nav column */}
          <nav
            className={`col-span-2 hidden items-center justify-center gap-8 md:col-span-1 md:col-start-2 md:flex ${headerNavTextClass}`}
            aria-label="Primary"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={isSearchPage ? `/${link.href}` : link.href}
                className="text-foreground transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-5 justify-self-end md:col-start-3">
            <div className="hidden items-center gap-5 md:flex">
              <Link
                href="/login"
                className={`${headerNavTextClass} text-foreground transition-opacity hover:opacity-70`}
              >
                Sign in
              </Link>
              <SearchSdcNavGetStarted />
            </div>
            <button
              className="md:hidden"
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-background px-6 pb-6 md:hidden">
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={isSearchPage ? `/${link.href}` : link.href}
                  className={`${headerNavTextClass} text-foreground`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className={`${headerNavTextClass} text-foreground`}
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <SearchSdcNavGetStarted className="w-full justify-center" />
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>
    </>
  );
}

/** Local CTA — keeps `/search` header isolated from marketing shared CTA styles. */
function SearchSdcNavGetStarted({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/signup"
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-[1000px] bg-primary pl-3 pr-0.5 text-[16px] font-medium leading-[24px] tracking-[-0.8px] text-primary-foreground transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active font-sans ${className}`}
    >
      Get started
      <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-primary-foreground/10">
        <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}
