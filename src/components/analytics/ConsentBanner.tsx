"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// SWAPPABLE CMP INTEGRATION POINT.
// The client's CMP is undecided. This is a minimal, standards-correct stand-in:
// it updates Google Consent Mode v2 (gtag('consent','update', …)) on the user's
// choice and remembers it. To swap in a real CMP (Cookiebot, Osano, Usercentrics,
// …), replace this component's UI/storage but keep calling `updateConsent(...)`
// so Consent Mode v2 stays wired. Renders nothing unless GTM is configured.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "consent-choice-v1";
const GRANTED = {
  ad_storage: "granted",
  analytics_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
} as const;
const DENIED = {
  ad_storage: "denied",
  analytics_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

type Gtag = (...args: unknown[]) => void;

function updateConsent(granted: boolean) {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof g === "function") {
    g("consent", "update", granted ? GRANTED : DENIED);
  }
}

export default function ConsentBanner() {
  const t = useTranslations("Consent");
  const configured = Boolean(process.env.NEXT_PUBLIC_GTM_ID);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!configured) {
      return;
    }
    let prior: string | null = null;
    try {
      prior = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage unavailable → show the banner */
    }
    if (prior === "granted" || prior === "denied") {
      updateConsent(prior === "granted");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- visibility is a client-only decision from localStorage, resolved after mount
      setVisible(true);
    }
  }, [configured]);

  // Re-open the banner on demand (e.g. the footer "Cookie settings" link) so a
  // visitor can change or withdraw a prior choice at any time.
  useEffect(() => {
    if (!configured) {
      return;
    }
    function open() {
      setVisible(true);
    }
    window.addEventListener("consent:open", open);
    return () => window.removeEventListener("consent:open", open);
  }, [configured]);

  function choose(granted: boolean) {
    try {
      localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied");
    } catch {
      /* ignore storage errors */
    }
    updateConsent(granted);
    // Let consent-gated embeds (e.g. the click-to-load map) react immediately.
    window.dispatchEvent(new CustomEvent("consent:changed", { detail: granted }));
    setVisible(false);
  }

  if (!configured || !visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-300 bg-porcelain/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[70ch] text-[0.9rem] text-slate-600">
          {t("message")}{" "}
          <Link href="/cookies" className="font-semibold text-accent hover:text-accent-700">
            {t("learnMore")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose(false)}
            className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-5 py-2 font-semibold text-ink hover:border-ink"
          >
            {t("reject")}
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 py-2 font-semibold text-white hover:bg-accent-700"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
