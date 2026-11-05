"use client";

import { useState } from "react";
import { m, AnimatePresence, useReducedMotion } from "motion/react";

export type AccordionItem = { q: string; a: string };

// Accessible accordion with animated height (expand/collapse). Button toggles,
// aria-expanded reflects state. Under reduced motion, content shows instantly.
export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-line">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex min-h-12 w-full items-center justify-between gap-4 py-4 text-left font-semibold text-ink"
            >
              <span>{it.q}</span>
              <span
                aria-hidden
                className={`shrink-0 text-xl text-accent transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>
            {reduce ? (
              isOpen ? <p className="pb-5 leading-[1.7] text-slate-600">{it.a}</p> : null
            ) : (
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <p className="pb-5 leading-[1.7] text-slate-600">{it.a}</p>
                  </m.div>
                ) : null}
              </AnimatePresence>
            )}
          </div>
        );
      })}
    </div>
  );
}
