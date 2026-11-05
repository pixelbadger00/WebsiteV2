import type { MetadataRoute } from "next";
import { locales, type Locale } from "@/i18n/routing";
import { absoluteUrl, getGermanEnabled } from "@/lib/seo";
import { getAllProcedureSlugs, getAllPostSlugs } from "@/sanity/queries";

// Pages present at the same path in every locale.
const FIXED_PATHS = [
  "/",
  "/services",
  "/about-the-doctor",
  "/treatment-in-cyprus",
  "/blog",
  "/faq",
  "/contact",
  "/privacy",
  "/cookies",
  "/imprint",
];

type SlugSet = { el?: string; en?: string; de?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const germanEnabled = await getGermanEnabled();
  // /de is noindex while German is off → keep it out of the sitemap entirely.
  const activeLocales = locales.filter((l) => l !== "de" || germanEnabled);

  const entries: MetadataRoute.Sitemap = [];

  // Build a sitemap row per locale for a set of per-locale paths, with hreflang
  // alternates pointing at the sibling-locale URLs that exist.
  function addGroup(pathFor: Partial<Record<Locale, string>>) {
    const languages: Record<string, string> = {};
    for (const l of activeLocales) {
      const p = pathFor[l];
      if (p !== undefined) {
        languages[l] = absoluteUrl(l, p);
      }
    }
    for (const l of activeLocales) {
      const p = pathFor[l];
      if (p === undefined) {
        continue;
      }
      entries.push({
        url: absoluteUrl(l, p),
        alternates: { languages },
      });
    }
  }

  for (const path of FIXED_PATHS) {
    addGroup({ el: path, en: path, de: path });
  }

  const procedures = await getAllProcedureSlugs();
  for (const s of procedures as SlugSet[]) {
    addGroup({
      el: s.el ? `/service/${s.el}` : undefined,
      en: s.en ? `/service/${s.en}` : undefined,
      de: s.de ? `/service/${s.de}` : undefined,
    });
  }

  const posts = await getAllPostSlugs();
  for (const p of posts as SlugSet[]) {
    addGroup({
      el: p.el ? `/blog/${p.el}` : undefined,
      en: p.en ? `/blog/${p.en}` : undefined,
      de: p.de ? `/blog/${p.de}` : undefined,
    });
  }

  return entries;
}
