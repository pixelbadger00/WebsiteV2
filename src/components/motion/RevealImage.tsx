"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";

// Gentle image reveal for large photos below the fold: scale 1.04 → 1 + fade.
// Wrapper must clip (overflow-hidden) + fixed aspect so scale never shifts layout.
// Same element server/client (no hydration mismatch); reduced motion handled by
// MotionConfig + the [data-reveal] CSS override.
export default function RevealImage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, scale: 1.04 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
