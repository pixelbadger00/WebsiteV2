// Thin dataLayer push helper. Safe to call always: it only appends to the
// dataLayer array (no external script), so events are recorded whether or not
// GTM is configured — GTM consumes them only once NEXT_PUBLIC_GTM_ID is set and
// consent is granted (Consent Mode v2). Every event carries language + procedure
// per the tracking spec.
export type AnalyticsEvent =
  | "booking_completed"
  | "generate_lead"
  | "click_whatsapp"
  | "click_phone"
  | "click_email";

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

export function pushDataLayer(
  event: AnalyticsEvent,
  params: { language?: string; procedure?: string } = {},
): void {
  if (typeof window === "undefined") {
    return;
  }
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event,
    language:
      params.language ||
      document.documentElement.getAttribute("lang") ||
      "",
    procedure: params.procedure || "",
  });
}
