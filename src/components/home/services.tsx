"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SectionTag, fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger();

const services = [
  {
    title: "Digital transformation",
    description:
      "Leverage cutting-edge technology to modernize your business and stay ahead.",
    image: "/images/laptop-overhead.jpg",
  },
  {
    title: "Business consulting",
    description:
      "Gain a clear roadmap for growth with tailored strategies that align with your goals.",
    image: "/images/team-computer.png",
  },
  {
    title: "Operational efficiency",
    description:
      "Streamline workflows and optimize processes to boost productivity and reduce costs.",
    image: "/images/office-lounge.png",
  },
  {
    title: "Market research & analysis",
    description:
      "Make informed decisions with in-depth market insights and competitor analysis.",
    image: "/images/team-whiteboard.png",
  },
];

// Position configs for each slot relative to center
const positions = {
  left: { x: -500, rotateY: -15, scale: 0.62, opacity: 0.35, zIndex: 1 },
  center: { x: 0, rotateY: 0, scale: 1, opacity: 1, zIndex: 10 },
  right: { x: 500, rotateY: 15, scale: 0.62, opacity: 0.35, zIndex: 1 },
  hiddenLeft: { x: -800, rotateY: -25, scale: 0.5, opacity: 0, zIndex: 0 },
  hiddenRight: { x: 800, rotateY: 25, scale: 0.5, opacity: 0, zIndex: 0 },
} as const;

function getCardPosition(cardIndex: number, activeIndex: number, total: number) {
  const diff = ((cardIndex - activeIndex + total) % total);
  if (diff === 0) return positions.center;
  if (diff === 1) return positions.right;
  if (diff === total - 1) return positions.left;
  // Cards further away are hidden
  if (diff <= total / 2) return positions.hiddenRight;
  return positions.hiddenLeft;
}

const springTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 30,
  mass: 1,
};

export function Services() {
  const [activeIndex, setActiveIndex] = useState(3);

  const goTo = useCallback((dir: -1 | 1) => {
    setActiveIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return services.length - 1;
      if (next >= services.length) return 0;
      return next;
    });
  }, []);

  return (
    <motion.section
      id="services"
      className="overflow-x-clip px-6 py-14 md:py-[100px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="mx-auto max-w-[1150px]">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <SectionTag>Services</SectionTag>
          <h2 className="mt-5 text-[28px] font-semibold leading-[1.12] tracking-[-1.35px] text-foreground sm:text-[36px] sm:leading-[1.12] md:text-[45px] md:leading-[1.08]">
            Reliable expertise to drive
            <br className="hidden md:block" /> your greatest success
          </h2>
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        {/* Desktop 3D carousel — all cards rendered, each animates to its position */}
        <div className="relative mx-auto hidden h-[420px] max-w-[1440px] items-center justify-center md:flex">
          <div
            className="relative flex size-full items-center justify-center"
            style={{ perspective: "1200px" }}
          >
            {services.map((service, i) => {
              const pos = getCardPosition(i, activeIndex, services.length);
              return (
                <motion.div
                  key={service.title}
                  className="absolute"
                  animate={{
                    x: pos.x,
                    rotateY: pos.rotateY,
                    scale: pos.scale,
                    opacity: pos.opacity,
                  }}
                  transition={springTransition}
                  style={{
                    width: 580,
                    height: 405,
                    zIndex: pos.zIndex,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="relative size-full overflow-hidden rounded-[24px]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-8">
                      <h3 className="text-[24px] font-medium leading-[1.2] tracking-[-0.6px] text-white">
                        {service.title}
                      </h3>
                      <p className="mt-2 text-[16px] leading-[24px] text-brand-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => goTo(-1)}
            className="absolute left-1/2 z-20 flex size-[40px] -translate-x-[305px] items-center justify-center rounded-full bg-brand text-brand-foreground transition-transform hover:scale-105"
            aria-label="Previous"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            onClick={() => goTo(1)}
            className="absolute left-1/2 z-20 flex size-[40px] translate-x-[265px] items-center justify-center rounded-full bg-brand text-brand-foreground transition-transform hover:scale-105"
            aria-label="Next"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <div className="relative mx-auto h-[340px] max-w-[400px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.9, x: 100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -100 }}
                transition={{ duration: 0.4, ease: "easeInOut" as const }}
                className="absolute inset-0"
              >
                <div className="relative h-full overflow-hidden rounded-[24px]">
                  <img
                    src={services[activeIndex].image}
                    alt={services[activeIndex].title}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-[22px] font-medium leading-[1.2] tracking-[-0.66px] text-white">
                      {services[activeIndex].title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-[20px] text-brand-foreground">
                      {services[activeIndex].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => goTo(-1)}
              className="flex size-[40px] items-center justify-center rounded-full bg-brand text-brand-foreground"
              aria-label="Previous"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex gap-1.5">
              {services.map((_, i) => (
                <div
                  key={i}
                  className={`size-2 rounded-full transition-colors ${
                    i === activeIndex ? "bg-brand" : "bg-brand/20"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => goTo(1)}
              className="flex size-[40px] items-center justify-center rounded-full bg-brand text-brand-foreground"
              aria-label="Next"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
