"use client";

import { motion } from "framer-motion";
import { SectionTag, fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger();

const inputClass =
  "h-[52px] w-full rounded-[12px] border border-border bg-background px-5 text-[16px] text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-0";

export function Contact() {
  return (
    <motion.section
      id="contact"
      className="bg-background px-6 py-14 md:py-[100px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="mx-auto max-w-[1050px]">
        <motion.div
          variants={fadeUp}
          className="card-holo overflow-hidden rounded-[20px] border border-border bg-card p-6 sm:p-8 md:p-10 lg:p-12"
        >
          <div className="flex flex-col gap-8 md:flex-row md:gap-10">
            <div className="flex min-w-0 flex-1 flex-col">
              <SectionTag>Contact us</SectionTag>
              <h2 className="mt-5 font-semibold text-[22px] leading-[1.3] tracking-[-0.66px] text-foreground md:text-[24px]">
                Get in touch
              </h2>
              <p className="mt-3 text-[15px] leading-[22px] tracking-[-0.45px] text-muted-foreground">
                Share a few details and we&apos;ll get back to you within one business day.
              </p>

              <form
                className="mt-8 flex flex-col gap-3.5"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid gap-3.5 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Full name"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-3.5 md:grid-cols-2">
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    className={inputClass}
                  />
                </div>

                <textarea
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full resize-none rounded-[12px] border border-border bg-background p-5 text-[16px] text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-0"
                />

                <button
                  type="submit"
                  className="mt-1 inline-flex h-[39px] w-fit items-center justify-center rounded-[1000px] bg-brand px-[18px] text-[16px] font-medium leading-[24px] tracking-[-0.05em] text-brand-foreground transition-colors duration-200 hover:bg-brand-hover active:bg-brand-active font-sans"
                >
                  Submit
                </button>
              </form>
            </div>

            <div className="relative hidden w-full shrink-0 overflow-hidden rounded-[16px] border border-border md:block md:w-[380px]">
              <img
                src="/images/man-glasses.png"
                alt="Business consultant"
                className="size-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
