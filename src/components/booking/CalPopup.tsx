"use client";

import { useEffect } from "react";
import { pushDataLayer } from "@/lib/analytics";

// Cal.com embed bootstrap — the official install snippet, loaded once.
// After init, any element carrying a `data-cal-link` attribute opens the booking
// modal on click: the embed attaches a single delegated click listener on the
// document and finds the nearest [data-cal-link] ancestor, so every booking
// button (including ones that mount later, e.g. the mobile menu) works with no
// per-button wiring. Rendered once in the layout, only when NEXT_PUBLIC_CAL_LINK
// is set.
type CalFn = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns?: Record<string, unknown>;
  q?: unknown[];
};

export default function CalPopup() {
  useEffect(() => {
    const w = window as unknown as { Cal?: CalFn; document: Document };

    (function (C: { Cal?: CalFn; document: Document }, A: string, L: string) {
      const p = (a: { q: unknown[] }, ar: unknown) => {
        a.q.push(ar);
      };
      const d = C.document;
      C.Cal =
        C.Cal ||
        function (...ar: unknown[]) {
          const cal = C.Cal as CalFn;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function (...a: unknown[]) {
              p(api as unknown as { q: unknown[] }, a);
            };
            (api as unknown as { q: unknown[] }).q = [];
            p(cal as unknown as { q: unknown[] }, ar);
            return;
          }
          p(cal as unknown as { q: unknown[] }, ar);
        };
    })(w, "https://app.cal.com/embed/embed.js", "init");

    const Cal = w.Cal as CalFn;
    Cal("init", { origin: "https://cal.com" });
    Cal("ui", {
      theme: "light",
      cssVarsPerTheme: {
        light: { "cal-brand": "#112b4a" },
      },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
    // Keep our GA4 conversion signal (dataLayer push on a completed booking).
    Cal("on", {
      action: "bookingSuccessful",
      callback: () => pushDataLayer("booking_completed"),
    });
  }, []);

  return null;
}
