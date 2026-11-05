"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import BookButton from "./BookButton";
import { useMobileUI } from "./mobile/MobileUIProvider";

// `en` is the English fallback shown on the Greek site: the Greek nav labels are
// wide enough in the heading font to collide in the desktop bar, so on `el` we
// render these English labels instead. Other locales use their own translation.
export const NAV_ITEMS = [
  { href: "/services", key: "procedures", en: "Procedures" },
  { href: "/about-the-doctor", key: "about", en: "About" },
  { href: "/treatment-in-cyprus", key: "treatment", en: "Treatment in Cyprus" },
  { href: "/blog", key: "blog", en: "Blog" },
  { href: "/faq", key: "faq", en: "FAQ" },
  { href: "/contact", key: "contact", en: "Contact" },
] as const;

// Nav label: English on the Greek locale (avoids the desktop overlap), otherwise
// the active locale's translation.
export function useNavLabel() {
  const t = useTranslations();
  const locale = useLocale();
  return (item: (typeof NAV_ITEMS)[number]) =>
    locale === "el" ? item.en : t(`Nav.${item.key}`);
}

export default function Header() {
  const t = useTranslations();
  const navLabel = useNavLabel();
  const { setMenuOpen } = useMobileUI();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled
          ? "border-line bg-porcelain/92 shadow-[var(--shadow-sm)]"
          : "border-transparent bg-porcelain/80"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1280px] items-center gap-5 px-5 transition-[height] duration-300 md:px-10 ${
          scrolled ? "h-14" : "h-[4.5rem]"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-serif text-[1.02rem] font-semibold text-ink"
        >
          <Image
            src="/brand/logo-mark.png"
            alt=""
            aria-hidden
            width={32}
            height={32}
            priority
            unoptimized
            className="size-8 rounded-full object-cover"
          />
          <span className="whitespace-nowrap">{t("Meta.siteName")}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="mx-auto hidden gap-5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="link-underline text-[0.95rem] font-medium whitespace-nowrap text-ink hover:text-accent"
            >
              {navLabel(item)}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3.5 lg:flex">
          <LanguageSwitcher />
          <BookButton className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 py-2.5 font-semibold whitespace-nowrap text-white transition-colors hover:bg-accent-700">
            {t("Cta.book")}
          </BookButton>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t("A11y.menu")}
          className="ml-auto grid size-11 place-items-center rounded-lg text-ink lg:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
