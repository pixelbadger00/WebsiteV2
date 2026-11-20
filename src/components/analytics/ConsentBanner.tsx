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

  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (!visible) {
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
      />
      {/* Centered modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-porcelain p-6 shadow-2xl sm:p-8"
      >
        <h2 className="font-serif text-xl text-ink">{t("title")}</h2>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-slate-600">
          {t("message")}{" "}
          <Link href="/cookies" className="font-semibold text-accent hover:text-accent-700">
            {t("learnMore")}
          </Link>
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => choose(true)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-accent px-5 py-2 font-semibold text-white hover:bg-accent-700"
          >
            {t("accept")}
          </button>
          <button
            type="button"
            onClick={() => choose(false)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-slate-300 px-5 py-2 font-semibold text-ink hover:border-ink"
          >
            {t("reject")}
          </button>
        </div>
      </div>
    </div>
  );
}
