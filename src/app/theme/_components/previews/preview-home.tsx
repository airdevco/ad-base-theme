"use client";

import { Menu } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { PrimaryCTA } from "@/components/home/shared";
import { Hero } from "@/components/home/hero";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { Services } from "@/components/home/services";
import { Features } from "@/components/home/features";
import { Pricing } from "@/components/home/pricing";
import { HowItWorks } from "@/components/home/how-it-works";
import { Team } from "@/components/home/team";
import { FAQ } from "@/components/home/faq";
import { Contact } from "@/components/home/contact";
import { Footer } from "@/components/home/footer";
import { TestimonialSection } from "@/components/home/testimonial";
import { Impact } from "@/components/home/impact";

const headerNavTextClass =
  "text-[16px] font-medium leading-[24px] tracking-[-0.8px]";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it works", href: "#how-it-works" },
];

interface PreviewHomeProps {
  darkMode: boolean;
}

export function PreviewHome({ darkMode }: PreviewHomeProps) {
  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-transparent bg-background">
        {/* Always keep px-6 — preview width is narrower than viewport when theme panel is open */}
        <div className="mx-auto grid w-full max-w-[1150px] grid-cols-[1fr_auto] items-center gap-x-4 px-6 py-4 md:grid-cols-[1fr_auto_1fr] md:gap-x-6">
          <div className="inline-flex shrink-0 items-center justify-self-start">
            <Logo height={26} className={darkMode ? "hidden" : "block"} />
            <Logo height={26} dark className={darkMode ? "block" : "hidden"} />
          </div>

          <div
            className={`col-span-2 hidden items-center justify-center gap-8 md:col-span-1 md:col-start-2 md:flex ${headerNavTextClass}`}
          >
            {navLinks.map((link) => (
              <span key={link.label} className="cursor-default text-foreground">
                {link.label}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-end gap-5 justify-self-end md:col-start-3">
            <div className="hidden items-center gap-5 md:flex">
              <span className={`cursor-default ${headerNavTextClass} text-foreground`}>
                Sign in
              </span>
              <PrimaryCTA href="#">Get started</PrimaryCTA>
            </div>
            <button type="button" className="md:hidden" tabIndex={-1}>
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <WhyChooseUs />
        <Services />
        <TestimonialSection />
        <Features />
        <Pricing />
        <HowItWorks />
        <Impact />
        <Team />
        <FAQ />
        <Contact />
        <Footer containerClassName="min-[1198px]:px-6" />
      </main>
    </>
  );
}
