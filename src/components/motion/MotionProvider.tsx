"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";

// Enables the small Motion runtime (LazyMotion + domAnimation → the `m`
// component only, no full `motion` bundle) and honours the OS "reduce motion"
// setting globally. Wrap the app once; <Reveal>/<Stagger> use `m` underneath.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
