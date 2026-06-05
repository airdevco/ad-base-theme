"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SectionTagLight, fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger();

function useCountUp(target: number, inView: boolean, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return count;
}

const stats = [
  { value: 7, prefix: "$", suffix: "M+", label: "Revenue generated" },
  { value: 72, prefix: "", suffix: "%", label: "Average growth" },
  { value: 65, prefix: "", suffix: "%", label: "Skills improvement" },
  { value: 78, prefix: "", suffix: "%", label: "Business impact" },
];

export function Impact() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.section
      className="px-6 py-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div
        ref={ref}
        className="mx-auto max-w-[1150px] overflow-hidden rounded-[28px] bg-brand-gradient px-6 py-16 md:px-16 md:py-24"
      >
        <div className="mx-auto max-w-[1050px]">
          <motion.div variants={fadeUp}>
            <SectionTagLight>Impact</SectionTagLight>
            <h2 className="mt-5 text-[28px] font-semibold leading-[1.12] tracking-[-1.35px] text-brand-foreground sm:text-[36px] sm:leading-[1.12] md:text-[45px] md:leading-[1.08]">
              Real results that drive lasting
              <br className="hidden md:block" /> impact for everyone
            </h2>
            <p className="mt-4 max-w-[500px] text-[16px] font-medium leading-[24px] tracking-[-0.48px] text-brand-foreground/60">
              Our track record speaks for itself. Here are the numbers that
              matter most to the businesses we serve.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8"
          >
            {stats.map((stat) => (
              <StatItem key={stat.label} stat={stat} inView={inView} />
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-3"
          >
            <span className="rounded-full bg-brand-foreground/5 px-4 py-2 text-[14px] font-medium text-brand-foreground/60">
              Designers 10+
            </span>
            <span className="rounded-full bg-brand-foreground/5 px-4 py-2 text-[14px] font-medium text-brand-foreground/60">
              Consultants
            </span>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function StatItem({
  stat,
  inView,
}: {
  stat: { value: number; prefix: string; suffix: string; label: string };
  inView: boolean;
}) {
  const count = useCountUp(stat.value, inView);

  return (
    <div>
      <p className="text-[28px] font-semibold leading-none tracking-[-1.08px] text-brand-foreground sm:text-[36px] md:text-[45px] md:tracking-[-1.35px]">
        {stat.prefix}
        {count}
        {stat.suffix}
      </p>
      <p className="mt-2 text-[14px] font-medium tracking-[-0.42px] text-brand-foreground/40">
        {stat.label}
      </p>
    </div>
  );
}
