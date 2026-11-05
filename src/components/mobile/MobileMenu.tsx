"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "../LanguageSwitcher";
import BookButton from "../BookButton";
import { NAV_ITEMS, useNavLabel } from "../Header";
import { useMobileUI } from "./MobileUIProvider";

export default function MobileMenu() {
  const t = useTranslations();
  const navLabel = useNavLabel();
  const { menuOpen, setMenuOpen } = useMobileUI();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const close = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusable?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) {
          return;
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  return (
    <AnimatePresence>
      {menuOpen ? (
        <m.div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("A11y.menu")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <m.div
            ref={panelRef}
            className="safe-bottom flex h-[100svh] flex-col bg-porcelain px-5 pt-4"
            initial={reduce ? undefined : { y: -12 }}
            animate={reduce ? undefined : { y: 0 }}
            exit={reduce ? undefined : { y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-16 items-center justify-between">
              <span className="font-serif text-[1.02rem] font-semibold">{t("Meta.siteName")}</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid size-11 place-items-center rounded-lg text-ink"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="mt-2 flex flex-col">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="border-b border-line py-4 font-serif text-[1.35rem] text-ink"
                >
                  {navLabel(item)}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col items-start gap-4 pt-6 pb-6">
              <LanguageSwitcher placement="top" align="left" />
              <BookButton onClick={close} className="btn btn-primary text-[1.05rem]">
                {t("Cta.book")}
              </BookButton>
            </div>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
