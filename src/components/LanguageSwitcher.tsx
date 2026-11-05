"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, m } from "motion/react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";

// Endonyms (each language in its own name) + short codes for the trigger.
const NAMES: Record<string, string> = { el: "Ελληνικά", en: "English", de: "Deutsch" };
const CODES: Record<string, string> = { el: "EL", en: "EN", de: "DE" };
const EASE = [0.22, 1, 0.36, 1] as const;

export default function LanguageSwitcher({
  placement = "bottom",
  align = "right",
}: {
  placement?: "bottom" | "top";
  align?: "left" | "right";
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("A11y");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function switchTo(next: string) {
    setOpen(false);
    router.replace(pathname, { locale: next });
  }

  const up = placement === "top";
  const left = align === "left";
  // Literal class names so Tailwind's scanner picks them up.
  const originClass = up
    ? left
      ? "origin-bottom-left"
      : "origin-bottom-right"
    : left
      ? "origin-top-left"
      : "origin-top-right";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("languageSwitcher")}
        className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-[0.82rem] font-semibold text-ink transition-colors hover:border-ink"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-500">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
        <span>{CODES[locale]}</span>
        <m.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="text-slate-500"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </m.svg>
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            role="menu"
            aria-label={t("languageSwitcher")}
            initial={{ opacity: 0, y: up ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE }}
            className={`absolute z-50 min-w-[10rem] overflow-hidden rounded-lg border border-line bg-surface p-1.5 shadow-[var(--shadow-lift)] ${
              left ? "left-0" : "right-0"
            } ${up ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]"} ${originClass}`}
          >
            {locales.map((l) => {
              const active = l === locale;
              return (
                <button
                  key={l}
                  type="button"
                  role="menuitem"
                  onClick={() => switchTo(l)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center justify-between gap-4 rounded-md px-3 py-2 text-left text-[0.9rem] transition-colors ${
                    active
                      ? "bg-accent-50 font-semibold text-accent"
                      : "text-ink hover:bg-porcelain"
                  }`}
                >
                  <span>{NAMES[l]}</span>
                  <span className="text-[0.72rem] font-semibold text-slate-500">{CODES[l]}</span>
                </button>
              );
            })}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
