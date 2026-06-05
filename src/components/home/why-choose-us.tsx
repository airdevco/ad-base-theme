"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { SectionTag, fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger();

const otherFirms = [
  {
    title: "Generic Strategies",
    description:
      "Cookie-cutter approaches that fail to address your unique business challenges and goals.",
  },
  {
    title: "Limited Guidance",
    description:
      "Minimal support after initial consultation, leaving you to figure things out on your own.",
  },
  {
    title: "Hidden Fees",
    description:
      "Unexpected costs that inflate your budget and erode trust in the partnership.",
  },
];

const withUs = [
  {
    title: "Tailored Consulting",
    description:
      "Custom strategies designed specifically for your business needs, industry, and growth goals.",
  },
  {
    title: "Dedicated Support",
    description:
      "Ongoing expert guidance at every step, ensuring you never feel lost or unsupported.",
  },
  {
    title: "Transparent Pricing",
    description:
      "Clear, upfront costs with no hidden fees — so you always know exactly what you're paying for.",
  },
];

export function WhyChooseUs() {
  return (
    <motion.section
      className="bg-background px-6 py-14 md:py-[100px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="mx-auto max-w-[1050px]">
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <SectionTag>Why choose us</SectionTag>
          <h2 className="mt-2 font-semibold text-[28px] leading-[1.12] tracking-[-1.35px] text-foreground sm:text-[36px] sm:leading-[1.12] md:text-[45px] md:leading-[1.08]">
            Expert consulting tailored to
            <br className="hidden md:block" /> your business success
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Other Firms */}
          <motion.div
            variants={fadeUp}
            className="card-holo rounded-[20px] border border-border bg-card p-6 md:p-8"
          >
            <h3 className="mb-6 text-[18px] font-medium tracking-[-0.54px] text-muted-foreground">
              Other Firms
            </h3>
            <div className="flex flex-col gap-6">
              {otherFirms.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <X className="size-3.5 text-red-500" />
                  </span>
                  <div>
                    <p className="text-[16px] font-medium tracking-[-0.48px] text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[14px] leading-[21px] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* With Airdev — same surface as Other Firms; primary on icons only */}
          <motion.div
            variants={fadeUp}
            className="card-holo rounded-[20px] border border-border bg-card p-6 md:p-8"
          >
            <h3 className="mb-6 text-[18px] font-medium tracking-[-0.54px] text-primary">
              With Airdev
            </h3>
            <div className="flex flex-col gap-6">
              {withUs.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="size-3.5 text-primary" />
                  </span>
                  <div>
                    <p className="text-[16px] font-medium tracking-[-0.48px] text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[14px] leading-[21px] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
