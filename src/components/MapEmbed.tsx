"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// Click-to-load Google Maps. A Maps iframe contacts Google and sets cookies, so
// we never load it on page view. We auto-load only if the visitor has already
// accepted cookies (same localStorage key the consent banner writes); otherwise
// we show a placeholder and load on click — the click being the visitor's own
// request. Also listens for a live "Accept" in the banner so the map appears
// without a second click.
const CONSENT_KEY = "consent-choice-v1";

export default function MapEmbed({ src, title }: { src: string; title: string }) {
  const t = useTranslations("Contact");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(CONSENT_KEY) === "granted") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- consent is a client-only value read after mount
        setLoaded(true);
      }
    } catch {
      /* storage unavailable → keep the placeholder */
    }
    function onConsentChange(e: Event) {
      if ((e as CustomEvent<boolean>).detail === true) {
        setLoaded(true);
      }
    }
    window.addEventListener("consent:changed", onConsentChange);
    return () => window.removeEventListener("consent:changed", onConsentChange);
  }, []);

  if (loaded) {
    return (
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-full min-h-[300px] w-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="flex h-full min-h-[300px] w-full flex-col items-center justify-center gap-2 bg-surface px-6 text-center"
    >
      <span className="font-semibold text-accent">{t("showMap")}</span>
      <span className="max-w-[42ch] text-sm text-slate-500">{t("mapConsentNote")}</span>
    </button>
  );
}
