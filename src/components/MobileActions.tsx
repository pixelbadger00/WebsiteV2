"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CONTACT } from "@/lib/config";
import BookButton from "./BookButton";
import { useMobileUI } from "./mobile/MobileUIProvider";

// Sticky bottom bar on mobile: click-to-call, WhatsApp, booking. Appears only
// after the user scrolls past the hero (so the hero CTA isn't doubled) and
// hides while the menu is open.
export default function MobileActions() {
  const t = useTranslations("Cta");
  const { menuOpen } = useMobileUI();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (menuOpen || !show) {
    return null;
  }

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-300 bg-porcelain/95 px-4 pt-2 backdrop-blur lg:hidden">
      <a
        href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
        data-analytics-event="click_phone"
        className="flex min-h-12 flex-1 flex-col items-center justify-center rounded-xl border border-slate-300 text-[0.72rem] font-semibold text-ink"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11 11 0 003.4.55 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.55 3.4 1 1 0 01-.24 1z" fill="currentColor" />
        </svg>
        {t("call")}
      </a>
      <a
        href={`https://wa.me/${CONTACT.whatsapp}`}
        data-analytics-event="click_whatsapp"
        className="flex min-h-12 flex-1 flex-col items-center justify-center rounded-xl border border-slate-300 text-[0.72rem] font-semibold text-ink"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 0112 4zm4.4 10.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-3.2-2.8c-.2-.4.2-.4.6-1.2a.5.5 0 000-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 00-.7.3c-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6a9.3 9.3 0 004.4 3.7c1.6.6 1.6.4 1.9.4s1.4-.6 1.6-1.1.2-1 .1-1.1z" />
        </svg>
        {t("whatsapp")}
      </a>
      <BookButton className="flex min-h-12 flex-[1.4] flex-col items-center justify-center rounded-xl bg-accent text-[0.72rem] font-semibold text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 2v3M17 2v3M3.5 8h17M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {t("book")}
      </BookButton>
    </div>
  );
}
