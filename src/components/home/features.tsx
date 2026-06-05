"use client";

import { motion } from "framer-motion";
import { SectionTag, fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger(0.08);

const features = [
  {
    title: "Unlimited consultations",
    description:
      "Get expert advice whenever you need it — no caps, no limits, just reliable support on demand.",
  },
  {
    title: "Tailored solutions",
    description:
      "Every strategy is custom-built for your unique challenges, goals, and business environment.",
  },
  {
    title: "Expert insights",
    description:
      "Leverage deep industry knowledge and data-driven analysis to make smarter business decisions.",
  },
  {
    title: "Data strategies",
    description:
      "Transform your data into actionable insights that drive measurable growth and competitive advantage.",
  },
  {
    title: "Ongoing support",
    description:
      "We don't just consult and leave — we stay with you to ensure lasting, sustainable results.",
  },
  {
    title: "Seamless execution",
    description:
      "From strategy to implementation, we ensure every step is executed smoothly and efficiently.",
  },
];

export function Features() {
  return (
    <motion.section
      id="features"
      className="bg-background px-6 py-14 md:py-[100px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="mx-auto max-w-[1050px]">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <SectionTag>Features</SectionTag>
          <h2 className="mt-5 font-semibold text-[28px] leading-[1.12] tracking-[-1.35px] text-foreground sm:text-[36px] sm:leading-[1.12] md:text-[45px] md:leading-[1.08]">
            Key benefits that set us apart
            <br className="hidden md:block" /> from other firms
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="card-holo rounded-[20px] border border-border bg-card p-6 md:p-8"
            >
              <h3 className="font-semibold text-[22px] leading-[1.3] tracking-[-0.66px] text-foreground md:text-[24px]">
                {feature.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[22px] tracking-[-0.45px] text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
