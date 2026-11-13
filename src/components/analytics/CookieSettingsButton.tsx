"use client";

import { useTranslations } from "next-intl";

// Footer "Cookie settings" control: re-opens the consent banner so a visitor can
// change or withdraw their choice. Dispatches the "consent:open" event that
// ConsentBanner listens for. Renders nothing (incl. its separator) unless GTM is
// configured — when there's no tracking, there's nothing to manage.
export default function CookieSettingsButton({ className }: { className?: string }) {
  const t = useTranslations("Consent");
  if (!process.env.NEXT_PUBLIC_GTM_ID) {
    return null;
  }
  return (
    <>
      <span aria-hidden>·</span>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("consent:open"))}
        className={className}
      >
        {t("manage")}
      </button>
    </>
  );
}
