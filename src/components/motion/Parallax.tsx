"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { m, useScroll, useTransform, useReducedMotion } from "motion/react";

// Scroll-linked parallax for a background layer. The inner layer is taller than
// the frame (-top-[15%] h-[130%]) so translating it never exposes an edge. The
// frame must clip (overflow-hidden). Disabled under reduced motion. Transform
// only → no layout shift.
export default function Parallax({
  children,
  className,
  distance = 60,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-distance, distance]);

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <m.div className="absolute inset-x-0 -top-[15%] h-[130%]" style={{ y }}>
        {children}
      </m.div>
    </div>
  );
}
