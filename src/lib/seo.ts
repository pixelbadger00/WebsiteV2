import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/routing";
import { getSiteSettings } from "@/sanity/queries";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://drparispapakostas.com"
).replace(/\/$/, "");

// URL segment per locale. Must stay in sync with `routing.localePrefix` in
// src/i18n/routing.ts: English (default) is unprefixed, Greek uses /gr, German
// uses /de.
const LOCALE_PREFIX: Record<Locale, string> = {
  en: "",
  el: "/gr",
  de: "/de",
};

/** Locale-prefixed, trailing-slashed path (English is unprefixed). */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  const prefix = LOCALE_PREFIX[locale];
  const tail = clean ? `/${clean}` : "";
  return `${prefix}${tail}/`;
}

export function absoluteUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${localizedPath(locale, path)}`;
}

/** Read the launch switch from Sanity (authoritative); defaults to off. */
export async function getGermanEnabled(): Promise<boolean> {
  const settings = await getSiteSettings();
  return Boolean(settings?.germanEnabled);
}

type AlternatePaths = Partial<Record<Locale, string>>;

/**
 * canonical + hreflang alternates. German is excluded while germanEnabled is
 * off (its pages are noindex and out of hreflang). `paths` maps each locale to
 * its path (without locale prefix); for fixed-path pages pass the same string.
 */
export function buildAlternates(
  currentLocale: Locale,
  paths: AlternatePaths,
  germanEnabled: boolean,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    if (l === "de" && !germanEnabled) {
      continue;
    }
    const p = paths[l];
    if (p !== undefined) {
      languages[l] = absoluteUrl(l, p);
    }
  }
  // x-default points at the default locale (English).
  if (paths.en !== undefined) {
    languages["x-default"] = absoluteUrl("en", paths.en);
  }
  const selfPath = paths[currentLocale] ?? paths.en ?? "/";
  return { canonical: absoluteUrl(currentLocale, selfPath), languages };
}

/** Same fixed path across locales → alternates for all enabled locales. */
export function fixedPathAlternates(
  currentLocale: Locale,
  path: string,
  germanEnabled: boolean,
): NonNullable<Metadata["alternates"]> {
  const paths: AlternatePaths = { el: path, en: path, de: path };
  return buildAlternates(currentLocale, paths, germanEnabled);
}

type JsonLd = Record<string, unknown>;

/** Clinic (LocalBusiness/MedicalClinic) + Physician graph from siteSettings. */
export function clinicJsonLd(opts: {
  siteName: string;
  doctorName?: string;
  phone?: string;
  email?: string;
  address?: string;
  mapUrl?: string;
  locale: Locale;
}): JsonLd {
  const clinic: JsonLd = {
    "@type": "MedicalClinic",
    "@id": `${SITE_URL}/#clinic`,
    name: opts.siteName,
    url: SITE_URL,
    medicalSpecialty: "Otolaryngologic",
    areaServed: "CY",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Lordou Vyronos 2",
      postalCode: "1096",
      addressLocality: "Nicosia",
      addressCountry: "CY",
    },
  };
  if (opts.phone) {
    clinic.telephone = opts.phone;
  }
  if (opts.email) {
    clinic.email = opts.email;
  }
  if (opts.mapUrl) {
    clinic.hasMap = opts.mapUrl;
  }
  const graph: JsonLd[] = [clinic];
  if (opts.doctorName) {
    graph.push({
      "@type": "Physician",
      "@id": `${SITE_URL}/#physician`,
      name: opts.doctorName,
      url: absoluteUrl(opts.locale, "/about-the-doctor"),
      medicalSpecialty: "Otolaryngologic",
      worksFor: { "@id": `${SITE_URL}/#clinic` },
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function medicalProcedureJsonLd(opts: {
  name: string;
  description?: string;
  url: string;
}): JsonLd {
  const node: JsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: opts.name,
    url: opts.url,
    // Procedures are performed at the clinic in Cyprus.
    location: { "@id": `${SITE_URL}/#clinic` },
  };
  if (opts.description) {
    node.description = opts.description;
  }
  return node;
}

export function faqPageJsonLd(
  items: { question: string; answer: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
