"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionTag, PrimaryCTA, fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger();

const standardFeatures = [
  "Monthly strategy sessions",
  "Email & chat support",
  "Basic market analysis",
  "Quarterly business review",
  "Access to resource library",
  "Standard reporting",
];

const premiumFeatures = [
  "Weekly strategy sessions",
  "Priority 24/7 support",
  "Advanced market analysis",
  "Monthly business review",
  "Custom resource library",
  "Real-time reporting & dashboards",
];

export function Pricing() {
  return (
    <motion.section
      id="pricing"
      className="px-6 py-14 md:py-[100px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="mx-auto max-w-[1050px]">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <SectionTag>Pricing</SectionTag>
          <h2 className="mt-5 text-[28px] font-semibold leading-[1.12] tracking-[-1.35px] text-foreground sm:text-[36px] sm:leading-[1.12] md:text-[45px] md:leading-[1.08]">
            Flexible pricing tailored to
            <br className="hidden md:block" /> your business needs
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Standard */}
          <motion.div
            variants={fadeUp}
            className="card-holo flex flex-col rounded-[20px] border border-border bg-card p-6 transition-shadow hover:shadow-lg sm:p-8 md:p-10"
          >
            <h3 className="text-[28px] font-semibold leading-[36.4px] tracking-[-0.84px] text-foreground">
              Standard
            </h3>
            <p className="mt-2 text-[15px] leading-[22px] tracking-[-0.45px] text-muted-foreground">
              Perfect for small businesses looking to grow with expert guidance
              and proven strategies.
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-[45px] font-semibold leading-none tracking-[-1.35px] text-foreground">
                $99
              </span>
              <span className="text-[16px] tracking-[-0.48px] text-muted-foreground">
                /mo
              </span>
            </div>
            <div className="mt-8">
              <PrimaryCTA href="/signup">Get started</PrimaryCTA>
            </div>
            <div className="mt-8 border-t border-border pt-8">
              <ul className="flex flex-col gap-3.5">
                {standardFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Check className="size-3 text-primary" />
                    </span>
                    <span className="text-[15px] tracking-[-0.45px] text-foreground/70">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Premium — same surface as Standard */}
          <motion.div
            variants={fadeUp}
            className="relative card-holo flex flex-col rounded-[20px] border border-border bg-card p-6 transition-shadow hover:shadow-lg sm:p-8 md:p-10"
          >
            <span className="absolute right-6 top-6 rounded-full bg-primary/15 px-3 py-1 text-[13px] font-medium text-primary">
              Popular
            </span>
            <h3 className="text-[28px] font-semibold leading-[36.4px] tracking-[-0.84px] text-foreground">
              Premium
            </h3>
            <p className="mt-2 text-[15px] leading-[22px] tracking-[-0.45px] text-muted-foreground">
              For growing companies that need comprehensive consulting and
              dedicated expert support.
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-[45px] font-semibold leading-none tracking-[-1.35px] text-foreground">
                $299
              </span>
              <span className="text-[16px] tracking-[-0.48px] text-muted-foreground">
                /mo
              </span>
            </div>
            <div className="mt-8">
              <PrimaryCTA href="/signup">Get started</PrimaryCTA>
            </div>
            <div className="mt-8 border-t border-border pt-8">
              <ul className="flex flex-col gap-3.5">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Check className="size-3 text-primary" />
                    </span>
                    <span className="text-[15px] tracking-[-0.45px] text-foreground/70">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
