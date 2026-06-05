"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { WhiteCTA, fadeUpSmall as fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger(0.12);

const partners = [
  "Accenture",
  "Deloitte",
  "McKinsey",
  "Stripe",
  "Shopify",
  "Notion",
  "Figma",
  "Linear",
  "Vercel",
  "Supabase",
];

export function Hero() {
  return (
    <section className="px-6 pb-10 pt-6 md:pb-16 md:pt-10">
      {/* Hero card — 28px radius, 16px padding, flex row inside */}
      <div className="mx-auto max-w-[1150px] overflow-hidden rounded-[28px] bg-brand-gradient p-4">
        <motion.div
          className="flex min-h-[420px] gap-[34px] md:min-h-[580px]"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Left text column */}
          <div className="flex flex-1 flex-col justify-center py-6 pl-5 md:py-12 md:pl-12">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-foreground/10 px-4 py-1.5 text-[14px] font-medium leading-[21px] text-brand-foreground">
                <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                Rated 4.9/5
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-4 text-[32px] font-semibold leading-[1.25] tracking-[-1.68px] text-brand-foreground md:mt-6 md:text-[56px] md:leading-[70px]"
            >
              Expert consulting
              <br />
              that drives real
              <br />
              growth
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-[440px] text-[17px] font-medium leading-[26px] tracking-[-0.51px] text-brand-foreground/70 md:text-[20px] md:leading-[30px] md:tracking-[-0.6px]"
            >
              Elevate your business with expert insights, tailored strategies,
              and unwavering support designed to fuel sustainable growth.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <WhiteCTA href="/signup">Get started</WhiteCTA>
            </motion.div>
          </div>

          {/* Right image column */}
          <motion.div
            variants={fadeUp}
            className="relative hidden w-[450px] shrink-0 overflow-hidden rounded-[16px] md:block"
          >
            <img
              src="/hero-image.png"
              alt="Business consultant"
              className="size-full object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Logo marquee */}
      <div className="mx-auto mt-8 max-w-[1150px] md:mt-12">
        <p className="mb-6 text-center text-[14px] font-medium tracking-[-0.42px] text-foreground/40">
          We&apos;ve partnered with:
        </p>
        <div className="relative overflow-hidden">
          <div className="animate-marquee flex w-max items-center gap-[52px]">
            {[...partners, ...partners].map((name, i) => (
              <span
                key={i}
                className="whitespace-nowrap text-[18px] font-semibold tracking-[-0.54px] text-foreground/20"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
