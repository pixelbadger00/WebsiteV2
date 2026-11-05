"use client";

import { useEffect } from "react";
import { pushDataLayer, type AnalyticsEvent } from "@/lib/analytics";

const TRACKED: ReadonlySet<string> = new Set([
  "click_whatsapp",
  "click_phone",
  "click_email",
]);

// One delegated listener for click_whatsapp / click_phone / click_email, so the
// tracked links stay plain server-rendered <a>s carrying data-analytics-event
// (+ optional data-analytics-procedure). Only appends to dataLayer — no external
// script — so it is harmless when GTM is not configured.
export default function AnalyticsListener() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.("[data-analytics-event]") as HTMLElement | null;
      if (!el) {
        return;
      }
      const event = el.getAttribute("data-analytics-event");
      if (!event || !TRACKED.has(event)) {
        return;
      }
      pushDataLayer(event as AnalyticsEvent, {
        procedure: el.getAttribute("data-analytics-procedure") || "",
      });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
