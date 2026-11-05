import type { Locale } from "@/i18n/routing";

/** Field-level localized value (matches localeString/Text/BlockContent). */
export type Localized<T> = { el?: T; en?: T; de?: T } | null | undefined;

/**
 * Pick a localized value for the active locale.
 *
 * Fallback policy (per the "never show Greek on /en" rule):
 * - `en`: English only — NEVER falls back to Greek. A Greek-only item returns
 *   undefined and the caller hides it.
 * - `de`: the /de shell may fall back de → en → el (it is noindex until enabled).
 * - `el` (default/source): el → en.
 */
export function pick<T>(field: Localized<T>, locale: Locale): T | undefined {
  if (!field) {
    return undefined;
  }
  if (locale === "en") {
    return field.en;
  }
  if (locale === "de") {
    return field.de ?? field.en ?? field.el;
  }
  return field.el ?? field.en;
}
