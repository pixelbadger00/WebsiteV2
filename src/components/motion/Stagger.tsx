"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Staggered reveal for grids/lists. Same element server/client (no hydration
// mismatch); reduced motion via MotionConfig + the [data-reveal] CSS override.
export function Stagger({
  children,
  className,
  step = 0.07,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
}) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ show: { transition: { staggerChildren: step } } }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 18,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <m.div
      data-reveal=""
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
      }}
    >
      {children}
    </m.div>
  );
}
