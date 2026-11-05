"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TestimonialCard = {
  _id: string;
  quote: string;
  author: string;
  language?: string;
  procedure: string | null;
};

type Props = {
  items: TestimonialCard[];
  prevLabel: string;
  nextLabel: string;
};

/**
 * Horizontal scroll-snap carousel for the "In their words" section. Shows
 * 1 / 2 / 3 cards per viewport (mobile / sm / lg) and advances exactly one
 * card per arrow click (snaps to the next testimonial). Arrows are hidden
 * when the track does not overflow (e.g. the Greek locale's 3 reviews fill
 * the row). Keyboard-scrollable and reduced-motion aware.
 */
export default function TestimonialsCarousel({ items, prevLabel, nextLabel }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const maxScroll = track.scrollWidth - track.clientWidth;
    setOverflowing(maxScroll > 4);
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    update();
    const track = trackRef.current;
    if (!track) {
      return;
    }
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const card = track.querySelector<HTMLElement>("li");
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * step, behavior: reduce ? "auto" : "smooth" });
  }, []);

  return (
    <div className="mt-10">
      <ul
        ref={trackRef}
        className="-mx-6 flex snap-x snap-mandatory gap-7 overflow-x-auto scroll-smooth px-6 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <li
            key={item._id}
            className="flex-[0_0_85%] snap-start sm:flex-[0_0_calc((100%-1.75rem)/2)] lg:flex-[0_0_calc((100%-3.5rem)/3)]"
          >
            <figure className="flex h-full flex-col rounded-card border border-line bg-porcelain p-7">
              <span aria-hidden className="font-serif text-[2.6rem] leading-[0.6] text-accent/35">
                &ldquo;
              </span>
              <blockquote
                lang={item.language}
                className="mt-3 flex-1 font-serif text-[1.08rem] leading-[1.55] text-ink"
              >
                {item.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-line pt-4">
                <span className="block font-semibold text-ink">{item.author}</span>
                {item.procedure ? <span className="eyebrow">{item.procedure}</span> : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {overflowing ? (
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label={prevLabel}
            className="grid size-11 place-items-center rounded-full border border-line text-ink transition hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label={nextLabel}
            className="grid size-11 place-items-center rounded-full border border-line text-ink transition hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
