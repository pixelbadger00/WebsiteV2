"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// On-mount fade + slide-up for the hero's SUPPORTING elements (eyebrow, lead,
// CTA, credential strip). Unlike <Reveal> this plays on load (`animate`), not on
// scroll — the hero is above the fold. NEVER wrap the hero H1 or image: they are
// the LCP / first paint. Reduced motion (MotionConfig reducedMotion="user") drops
// the transform; the [data-reveal] CSS override keeps it visible with no JS.
export default function HeroReveal({
  children,
  className,
  delay = 0,
  y = 16,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "p" | "li" | "section";
}) {
  const MTag = m[as];
  return (
    <MTag
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay }}
    >
      {children}
    </MTag>
  );
}
