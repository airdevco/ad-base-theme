import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const platformLinks = [
  { label: "Services", href: "#services" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Team", href: "#team" },
];

const companyLinks = [
  { label: "About us", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Press kit", href: "#" },
  { label: "Partners", href: "#" },
];

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Twitter", href: "#" },
];

const footerText =
  "text-[14px] leading-[21px] tracking-[-0.42px] text-muted-foreground";

/** Column titles — match header nav color; static (no hover). */
const footerColumnHeading =
  "mb-4 text-[14px] font-medium leading-[21px] tracking-[-0.42px] text-foreground";

/** Footer nav links — muted, darken on hover (not full black). */
const footerColumnLink = `${footerText} transition-colors hover:text-foreground`;

export function Footer({ containerClassName }: { containerClassName?: string }) {
  return (
    <footer className="bg-surface pt-12 pb-3 md:pt-16 md:pb-4">
      <div
        className={cn(
          "mx-auto w-full max-w-[1150px] px-6 min-[1198px]:px-0",
          containerClassName
        )}
      >
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
          {/* Brand */}
          <div className="min-w-0 lg:max-w-[300px] lg:shrink-0">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center"
              aria-label="Airdev home"
            >
              <Logo height={26} className="dark:hidden" />
              <Logo height={26} dark className="hidden dark:block" />
            </Link>
            <p className={`mt-4 max-w-[280px] ${footerText}`}>
              Expert consulting that drives real growth. Tailored strategies and
              unwavering support for your business.
            </p>
          </div>

          {/* Platform, Company, Contact — equal columns across remaining width; gap slightly under the old gap-8 */}
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-10 md:grid-cols-3 md:gap-x-5 md:gap-y-0 lg:gap-x-6">
            <div className="min-w-0">
              <h4 className={footerColumnHeading}>Platform</h4>
              <ul className="flex flex-col gap-2.5">
                {platformLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={footerColumnLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className={footerColumnHeading}>Company</h4>
              <ul className="flex flex-col gap-2.5">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={footerColumnLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className={footerColumnHeading}>Contact</h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a href="mailto:hello@airdev.co" className={footerColumnLink}>
                    hello@airdev.co
                  </a>
                </li>
                <li>
                  <span className={footerText}>+1 (555) 000-0000</span>
                </li>
                <li>
                  <span className={footerText}>San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`mt-10 border-t border-border pt-5 ${footerText}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-3">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
              <p className="shrink-0">
                &copy; {new Date().getFullYear()} Airdev. All rights reserved.
              </p>
              <Link
                href="/terms"
                className="shrink-0 transition-colors hover:text-foreground"
              >
                Terms of Use
              </Link>
              <Link
                href="/privacy"
                className="shrink-0 transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:shrink-0 sm:justify-end sm:gap-x-5">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="shrink-0 font-medium transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
