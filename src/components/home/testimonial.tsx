"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger(0.12);

export function TestimonialSection() {
  return (
    <section className="px-6 py-10">
      <motion.div
        className="mx-auto max-w-[1150px] overflow-hidden rounded-[28px] bg-brand-gradient px-5 py-10 text-center md:px-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-foreground/10 px-4 py-1.5 text-[14px] font-medium text-brand-foreground">
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
            Rated 4.9/5
          </span>
        </motion.div>

        <motion.blockquote
          variants={fadeUp}
          className="mx-auto mt-10 max-w-[700px] font-semibold text-[24px] leading-[1.4] tracking-[-0.84px] text-brand-foreground sm:text-[28px] md:text-[36px] md:leading-[1.35]"
        >
          &ldquo;Airdev revolutionized our customer understanding, boosting
          retention like never before.&rdquo;
        </motion.blockquote>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-[16px] font-medium tracking-[-0.48px] text-brand-foreground/60"
        >
          Muzamal Hussain
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="rounded-full bg-brand-foreground/10 px-4 py-1.5 text-[14px] font-medium text-brand-foreground">
            High conversion
          </span>
          <span className="rounded-full bg-brand-foreground/10 px-4 py-1.5 text-[14px] font-medium text-brand-foreground">
            2x sales
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
