"use client";

import { useEffect } from "react";
import { pushDataLayer } from "@/lib/analytics";

// Cal.com embed — DEFERRED. We do NOT load Cal's embed.js on page view (that
// would contact app.cal.com before the visitor asks for anything). Instead we
// wait for the first click on a booking trigger ([data-cal-link]) and only then
// bootstrap Cal and open the modal.
//
// Booking is a service the visitor explicitly requested, so it works regardless
// of cookie-consent state — it is not gated behind the consent banner. The
// booking_completed analytics push still respects Consent Mode v2 downstream.
type CalFn = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns?: Record<string, unknown>;
  q?: unknown[];
};

function bootstrap(): CalFn {
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
  return Cal;
}

export default function CalPopup() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    let booted = false;

    function onFirstClick(e: MouseEvent) {
      if (booted) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.("[data-cal-link]") as HTMLElement | null;
      if (!el) {
        return;
      }
      booted = true;

      const calLink = el.getAttribute("data-cal-link") || undefined;
      let config: Record<string, unknown> = { layout: "month_view" };
      const raw = el.getAttribute("data-cal-config");
      if (raw) {
        try {
          config = { ...config, ...(JSON.parse(raw) as Record<string, unknown>) };
        } catch {
          /* keep default config */
        }
      }

      const Cal = bootstrap();
      // Open the modal for THIS click (Cal's own delegated listener isn't
      // attached until embed.js loads; this queued call runs on load). Later
      // clicks are handled by Cal's delegated [data-cal-link] listener.
      if (calLink) {
        Cal("modal", { calLink, config });
      }
      document.removeEventListener("click", onFirstClick, true);
    }

    document.addEventListener("click", onFirstClick, true);
    return () => document.removeEventListener("click", onFirstClick, true);
  }, []);

  return null;
}
