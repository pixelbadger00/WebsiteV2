"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Fade + slide-up on scroll into view (once). Always renders the same element on
// server and client (no useReducedMotion branch → no hydration mismatch).
// Reduced motion is handled by MotionConfig reducedMotion="user" (no transform)
// plus the [data-reveal] CSS override (instant + visible without JS). No CLS.
// Never wrap the hero H1/image with this (they are the LCP, first-paint).
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const MTag = m[as];
  return (
    <MTag
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
    >
      {children}
    </MTag>
  );
}
