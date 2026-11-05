import { locales, type Locale } from "@/i18n/routing";

/**
 * German launch switch. While German content does not yet exist, `/de` pages
 * are noindex, excluded from sitemap + hreflang, and DE is hidden in the
 * language switcher. In Phase 2d this is driven by `siteSettings.germanEnabled`;
 * for the 2a shell it is a constant.
 */
export const GERMAN_ENABLED = false;

/** Locales shown in the language switcher (DE hidden until enabled). */
export function visibleLocales(): readonly Locale[] {
  return GERMAN_ENABLED ? locales : locales.filter((l) => l !== "de");
}

/**
 * Placeholder clinic contact details. In Phase 2d these come from the Sanity
 * `siteSettings` document (localised). The doctor's title (e.g. "Dr. med." on
 * German pages) is NOT hard-coded here — it is read from siteSettings per locale.
 */
export const CONTACT = {
  phone: "+357 22 730269",
  mobile: "+357 99 623821",
  whatsapp: "35799623821",
  email: "dr.paris.papakostas@gmail.com",
  addressLines: ["Lordou Vyronos 2", "1096 Nicosia, Cyprus"],
  mapUrl: "https://maps.google.com/?q=Lordou+Vyronos+2,+1096+Nicosia,+Cyprus",
  // The doctor's existing public profiles (carried over from the WordPress site).
  // Eventual home is `siteSettings.socials` (used for sameAs in JSON-LD); kept here
  // alongside the other placeholder contact details until that is wired in.
  socials: [
    {
      platform: "instagram",
      label: "Instagram",
      url: "https://www.instagram.com/dr.paris_papakostas/",
    },
    {
      platform: "facebook",
      label: "Facebook",
      url: "https://www.facebook.com/dr.paris.papakostas/",
    },
    {
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://cy.linkedin.com/in/paris-papakostas-57490880",
    },
  ],
} as const;
