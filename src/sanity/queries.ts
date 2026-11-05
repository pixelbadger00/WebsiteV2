import { sanityFetch } from "./lib/client";
import type {
  SiteSettings,
  HomePage,
  Procedure,
  Testimonial,
  Doctor,
  Page,
  Post,
  LegalPage,
  SanityImage,
} from "./types";

const IMAGE = `{ alt, asset->{ url, metadata{ dimensions{ width, height }, lqip } } }`;

// ── siteSettings ──
export function getSiteSettings() {
  return sanityFetch<SiteSettings>(
    `*[_type=="siteSettings"][0]{
      siteName, titlePrefix, tagline, contact, address, mapUrl, openingHours, germanEnabled
    }`,
    {},
    ["siteSettings"],
  );
}

// ── homePage (singleton: hero + editorial copy, localised) ──
export function getHomePage() {
  return sanityFetch<HomePage>(
    `*[_type=="homePage"][0]{
      "heroImage": heroImage{ alt, hotspot, asset->{ url, metadata{ dimensions{ width, height }, lqip } } },
      heroEyebrow, heroTitle, heroLead, trustBadges,
      proceduresTitle, proceduresIntro, proceduresCtaLabel,
      aboutEyebrow, aboutCtaLabel,
      reviewsEyebrow, reviewsTitle,
      closingCtaTitle, closingCtaBody
    }`,
    {},
    ["homePage"],
  );
}

// ── procedures ──
const PROCEDURE_CARD = `{
  _id, name, slug, summary, recoveryTime, order,
  "heroImage": heroImage${IMAGE}
}`;

export function getProcedures() {
  return sanityFetch<Procedure[]>(
    `*[_type=="procedure"] | order(order asc, name.en asc) ${PROCEDURE_CARD}`,
    {},
    ["procedure"],
  );
}

export function getProcedureBySlug(slug: string) {
  return sanityFetch<Procedure | null>(
    `*[_type=="procedure" && (slug.el.current==$slug || slug.en.current==$slug || slug.de.current==$slug)][0]{
      _id, name, slug, summary, recoveryTime, body, showBeforeAfter,
      "heroImage": heroImage${IMAGE},
      "beforeAfter": beforeAfter[]{ caption, "before": before${IMAGE}, "after": after${IMAGE} },
      faqs, seo
    }`,
    { slug },
    ["procedure"],
  );
}

export function getAllProcedureSlugs() {
  return sanityFetch<{ el?: string; en?: string; de?: string }[]>(
    `*[_type=="procedure"]{ "el": slug.el.current, "en": slug.en.current, "de": slug.de.current }`,
    {},
    ["procedure"],
  );
}

// ── doctor ──
export function getDoctor() {
  return sanityFetch<Doctor | null>(
    `*[_type=="doctor"][0]{
      _id, name, shortBio, bio, credentials, memberships, registrationNumbers, seo,
      timeline[]{ year, label },
      "portrait": portrait${IMAGE}
    }`,
    {},
    ["doctor"],
  );
}

// ── testimonials ──
// Only reviews with explicit display consent are ever fetched (open-questions
// #13). Shown on EVERY locale in their ORIGINAL language (not translated): the
// real reviews are mostly English, so filtering by locale left the Greek page
// short and the German page empty. Each card carries its own `language` for a
// correct lang attribute. When none are approved this returns [], and the home
// section hides itself (see the `testimonials.length > 0` guard on the home page).
export function getTestimonials(locale: string, max = 6) {
  return sanityFetch<Testimonial[]>(
    `*[_type=="testimonial" && consentToDisplay==true] | order(order asc) [0...$max]{
      _id, quote, author, language,
      "procedureName": procedureTag->name
    }`,
    { locale, max },
    ["testimonial"],
  );
}

// ── office photo by original filename (until images are assigned in Studio) ──
export function getOfficeImage(filename: string) {
  return sanityFetch<SanityImage>(
    `*[_type=="sanity.imageAsset" && originalFilename==$filename][0]{
      "asset": { url, metadata{ dimensions{ width, height }, lqip } }
    }`,
    { filename },
    ["asset"],
  );
}

// ── blog posts ──
const POST_CARD = `{
  _id, title, slug, excerpt, publishedAt,
  "coverImage": coverImage${IMAGE}
}`;

export function getPosts() {
  return sanityFetch<Post[]>(
    `*[_type=="post" && defined(publishedAt)] | order(publishedAt desc) ${POST_CARD}`,
    {},
    ["post"],
  );
}

export function getPostBySlug(slug: string) {
  return sanityFetch<Post | null>(
    `*[_type=="post" && (slug.el.current==$slug || slug.en.current==$slug || slug.de.current==$slug)][0]{
      _id, title, slug, excerpt, body, publishedAt,
      "coverImage": coverImage${IMAGE}, seo
    }`,
    { slug },
    ["post"],
  );
}

export function getAllPostSlugs() {
  return sanityFetch<{ el?: string; en?: string; de?: string }[]>(
    `*[_type=="post" && defined(publishedAt)]{ "el": slug.el.current, "en": slug.en.current, "de": slug.de.current }`,
    {},
    ["post"],
  );
}

// ── legal pages (privacy / cookies / imprint) ──
export function getLegalPage(kind: "privacy" | "cookies" | "imprint") {
  return sanityFetch<LegalPage | null>(
    `*[_type=="legalPage" && kind==$kind][0]{ _id, kind, title, slug, body, seo }`,
    { kind },
    ["legalPage"],
  );
}

// ── FAQ page (page.faq document; body holds the Q&A content) ──
export function getFaqPage() {
  return sanityFetch<Page | null>(
    `*[_type=="page" && _id=="page.faq"][0]{
      _id, title, slug, body, seo
    }`,
    {},
    ["page"],
  );
}

// ── contact page (fixed singleton-style page document) ──
export function getContactPage() {
  return sanityFetch<Page | null>(
    `*[_type=="page" && _id=="page.contact"][0]{
      _id, title, slug, body, "heroImage": heroImage${IMAGE}, seo
    }`,
    {},
    ["page"],
  );
}

// ── generic page by key/slug ──
export function getPageBySlug(slug: string) {
  return sanityFetch<Page | null>(
    `*[_type=="page" && (slug.el.current==$slug || slug.en.current==$slug || slug.de.current==$slug)][0]{
      _id, title, slug, body, "heroImage": heroImage${IMAGE}, seo
    }`,
    { slug },
    ["page"],
  );
}
