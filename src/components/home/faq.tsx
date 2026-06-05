"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionTag, fadeUp, stagger as makeStagger } from "./shared";

const stagger = makeStagger(0.08);

const faqs = [
  {
    question: "How does your consulting process work?",
    answer:
      "We start with a free consultation to understand your business needs. Then we develop a tailored strategy, implement solutions, and provide ongoing support to ensure lasting results.",
  },
  {
    question: "What industries do you specialize in?",
    answer:
      "We work across a wide range of industries including technology, healthcare, finance, retail, and manufacturing. Our diverse expertise allows us to bring cross-industry insights to every engagement.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "Most clients begin seeing measurable improvements within 60-90 days. However, the timeline varies based on the scope and complexity of your specific challenges.",
  },
  {
    question: "Do you offer one-time consultations?",
    answer:
      "Yes, we offer both one-time consultations for specific challenges and ongoing retainer packages for businesses that need continuous strategic support.",
  },
  {
    question: "Can small businesses afford your services?",
    answer:
      "Absolutely. Our Standard plan starts at $99/month, making expert consulting accessible for businesses of all sizes. We believe every business deserves access to quality advice.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply click the 'Get started' button to schedule a free consultation. We'll discuss your goals, challenges, and how we can help your business grow.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <motion.section
      id="faq"
      className="px-6 py-14 md:py-[100px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="mx-auto max-w-[700px]">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <SectionTag>FAQ</SectionTag>
          <h2 className="mt-5 text-[28px] font-semibold leading-[1.12] tracking-[-1.35px] text-foreground sm:text-[36px] sm:leading-[1.12] md:text-[45px] md:leading-[1.08]">
            Answers to your most
            <br className="hidden md:block" /> common questions
          </h2>
        </motion.div>

        <div className="flex flex-col">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="border-b border-border"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="pr-4 text-[16px] font-medium tracking-[-0.48px] text-foreground md:text-[18px] md:tracking-[-0.54px]">
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <Plus className="size-5 text-muted-foreground" />
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-[15px] leading-[22px] tracking-[-0.45px] text-muted-foreground">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
