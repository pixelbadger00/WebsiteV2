import { defineRouting } from "next-intl/routing";

export const locales = ["el", "en", "de"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  // English is the default and serves the unprefixed root URLs (`/`, `/blog`…).
  defaultLocale: "en",
  // English (default): no prefix; Greek: /gr/...; German: /de/...
  // The locale *codes* stay el/en/de (matching the Sanity fields and the
  // `[locale]` segment); only Greek's URL segment is remapped to `gr`.
  localePrefix: {
    mode: "as-needed",
    prefixes: {
      el: "/gr",
    },
  },
  // Deterministic URLs: `/` always serves English. We do NOT auto-redirect by
  // browser language — that would make `/` flip locale and create duplicate
  // content. Visitors change language via the switcher; search engines are
  // guided by hreflang.
  localeDetection: false,
});
