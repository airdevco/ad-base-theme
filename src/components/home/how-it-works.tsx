"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SectionTag, fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger(0.15);

const steps = [
  {
    number: "01",
    title: "Simple Booking",
    description:
      "Effortlessly schedule a consultation to discuss your business needs and challenges. We streamline the process to get started quickly.",
    image: "/images/office-lounge.png",
  },
  {
    number: "02",
    title: "Tailored Strategy",
    description:
      "We analyze your goals and create a customized strategy designed to drive measurable success for your business needs and exploring more ideas.",
    image: "/images/team-whiteboard.png",
  },
  {
    number: "03",
    title: "Continuous Support",
    description:
      "From implementation to optimization, we provide ongoing guidance and adjustments to ensure long-term growth for you and your business with Airdev.",
    image: "/images/team-computer.png",
  },
];

export function HowItWorks() {
  return (
    <motion.section
      id="how-it-works"
      className="px-6 py-14 md:py-[100px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="mx-auto max-w-[1050px]">
        {/* Section header */}
        <motion.div variants={fadeUp} className="mb-12 text-center md:mb-16">
          <SectionTag>How it works</SectionTag>
          <h2 className="mt-5 text-[28px] font-semibold leading-[1.12] tracking-[-1.35px] text-foreground sm:text-[36px] sm:leading-[1.12] md:text-[45px] md:leading-[1.08]">
            A proven process to achieve
            <br className="hidden md:block" /> your biggest goals
          </h2>
        </motion.div>

        {/* Timeline — mobile: single column, desktop: zigzag with center line */}

        {/* Mobile layout */}
        <div className="flex flex-col gap-12 md:hidden">
          {steps.map((step) => (
            <motion.div key={step.number} variants={fadeUp} className="flex flex-col gap-5">
              <div className="overflow-hidden rounded-[20px]">
                <img src={step.image} alt={step.title} className="aspect-[4/3] w-full object-cover" />
              </div>
              <div className="flex items-start gap-4">
                <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-brand text-[14px] font-medium text-brand-foreground">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-[24px] font-medium leading-[1.2] tracking-[-1px] text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[24px] text-muted-foreground">
                    {step.description}
                  </p>
                  <Link href="#" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold tracking-[-0.42px] text-foreground transition-opacity hover:opacity-70">
                    Discover More →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop timeline layout */}
        <div className="relative hidden md:block">
          {/* Vertical center line */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />

          <div className="flex flex-col gap-16">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0; // 0, 2 = image left, text right
              return (
                <motion.div key={step.number} variants={fadeUp} className="relative flex items-center">
                  {/* Number circle — centered on the line */}
                  <div className="absolute left-1/2 z-10 flex -translate-x-1/2 items-center justify-center">
                    <span className="flex size-[30px] items-center justify-center rounded-full bg-brand text-[13px] font-medium text-brand-foreground">
                      {step.number}
                    </span>
                  </div>

                  {/* Left column */}
                  <div className="w-1/2 pr-12">
                    {isEven ? (
                      <div className="overflow-hidden rounded-[28px]">
                        <img src={step.image} alt={step.title} className="aspect-[4/3] w-full object-cover" />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-[28px] font-medium leading-[1.2] tracking-[-1.4px] text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-[16px] leading-[24px] text-muted-foreground">
                          {step.description}
                        </p>
                        <Link href="#" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold tracking-[-0.42px] text-foreground transition-opacity hover:opacity-70">
                          Discover More →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Right column */}
                  <div className="w-1/2 pl-12">
                    {isEven ? (
                      <div>
                        <h3 className="text-[28px] font-medium leading-[1.2] tracking-[-1.4px] text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-[16px] leading-[24px] text-muted-foreground">
                          {step.description}
                        </p>
                        <Link href="#" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold tracking-[-0.42px] text-foreground transition-opacity hover:opacity-70">
                          Discover More →
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-[28px]">
                        <img src={step.image} alt={step.title} className="aspect-[4/3] w-full object-cover" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
