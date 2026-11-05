"use client";

import { useEffect, useState } from "react";

// Desktop-only in-page nav for long procedure pages, with scroll-spy. Smooth
// scroll comes from CSS (scroll-behavior). Hidden on mobile.
export default function StickyNav({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting);
        if (vis[0]?.target.id) {
          setActive(vis[0].target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) {
        obs.observe(el);
      }
    }
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden lg:block">
      <ul className="space-y-1 text-[0.9rem]">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? "true" : undefined}
              className={`block rounded-sm px-3 py-1.5 transition-colors ${
                active === it.id
                  ? "bg-accent-50 font-semibold text-accent"
                  : "text-slate-500 hover:text-ink"
              }`}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
