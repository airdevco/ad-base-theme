"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { SectionTag, fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger();

const team = [
  { name: "Daniel Chen", role: "Growth Strategy Lead", image: "https://mockmind-api.uifaces.co/content/human/80.jpg" },
  { name: "Marco Rodriguez", role: "Digital Transformation Advisor", image: "https://mockmind-api.uifaces.co/content/human/215.jpg" },
  { name: "Thomas Jones", role: "Operations Consultant", image: "https://mockmind-api.uifaces.co/content/human/222.jpg" },
  { name: "Jessica Kim", role: "Brand & Marketing Strategist", image: "https://mockmind-api.uifaces.co/content/human/125.jpg" },
];

export function Team() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  }

  return (
    <motion.section
      id="team"
      className="px-6 py-14 md:py-[100px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="mx-auto max-w-[1150px]">
        <motion.div variants={fadeUp} className="mb-10">
          <SectionTag>Our team</SectionTag>
          <h2 className="mt-5 text-[28px] font-semibold leading-[1.12] tracking-[-1.35px] text-foreground sm:text-[36px] sm:leading-[1.12] md:text-[45px] md:leading-[1.08]">
            Meet the experts behind
            <br className="hidden md:block" /> your business success
          </h2>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="scrollbar-hide -mx-6 flex gap-[14px] overflow-x-auto px-6"
          >
            {team.map((member) => (
              <div
                key={member.name}
                className="card-holo w-[270px] shrink-0 overflow-hidden rounded-[20px] border border-border bg-card"
              >
                <div className="relative h-[300px] overflow-hidden bg-gradient-to-b from-brand/5 to-brand/10">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                </div>
                <div className="p-5">
                  <p className="text-[18px] font-semibold tracking-[-0.54px] text-foreground">
                    {member.name}
                  </p>
                  <p className="mt-1 text-[14px] tracking-[-0.42px] text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex items-center gap-3"
        >
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted/50 disabled:opacity-30"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted/50 disabled:opacity-30"
          >
            <ArrowRight className="size-4" />
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
