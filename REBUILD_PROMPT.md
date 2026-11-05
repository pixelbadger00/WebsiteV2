# Rebuild: drparispapakostas.com

You are rebuilding the website of Dr Paris Papakostas, a medical clinic in Cyprus, for the agency Clovo Solutions. The current site is WordPress on SiteGround. The new site must look more premium and trustworthy, load fast, rank well, and turn visitors from Cyprus, the UK and Germany into booked consultations.

Work in phases. **Stop at the end of each phase and wait for my approval before continuing.**

---

## Inputs you have

The source material below is read-only. It lives outside the repo, and must never be copied into the repo, committed, deployed or modified. Media is uploaded only to Sanity, after processing.

- `/downloads/wetransfer_paris-papakostas-new-office-2026-by-dec_2026-10-22_1017` — **new professional photos of the clinic and doctor (2026). Primary image source** for hero, about, clinic and procedure pages.
- `/downloads/wetransfer_before-and-after-zip_2026-10-30_0830` — before/after photos and an `animations` folder with procedure videos. Special rules below ("Before/after and video").
- `./legacy/files/` (optional, git-ignored) — FTP download of the old WordPress install. Use only for the logo, brand fonts/colours and any old image the new sets don't cover.
- `/downloads/drparispapakostas.WordPress.2026-10-28.xml` — WordPress export (WXR). **Primary source for content:** pages, posts, menus, attachments, postmeta (including SEO-plugin titles and descriptions).
- `/downloads/db5vni9lavwmuj.sql` — MySQL dump of the WordPress database. Use it for what the XML lacks: language links between GR/EN pages (e.g. WPML `icl_translations` or Polylang term relations), SEO plugin settings, menus, redirects. To query it, load it into a throwaway local MySQL container (`docker run` with the dump mounted) and query read-only. Never connect to the live database.
- The live site, https://drparispapakostas.com — only for visual reference and to check the current URLs.
- If something is in none of these, list it as a question. Never invent medical facts, credentials, prices, statistics, reviews or results.

**Before/after and video:**

- Before/after images are patient photos, which are health data. Use only ones the doctor confirms in writing have **patient consent for web use**; list every file you plan to use in `docs/open-questions.md` for his sign-off. Strip all EXIF/metadata, crop out identifying features he hasn't approved, and use neutral file names (never patient names or dates).
- They appear only on procedure pages, behind a small "Results vary. Every procedure carries risks." note, in a gallery the visitor opens on purpose. Never in the hero, ads or social images, and **never on `/de` pages**.
- Videos from the `animations` folder: ask who made them and confirm the clinic may use them on the web. Re-encode for the web with ffmpeg (H.264 MP4 + WebM, max 1080p, short, no audio unless needed), make a poster image for each, and host them on Sanity's file CDN (never on Netlify). Load on click or when scrolled into view, muted and `playsinline`, with captions if they contain speech. Report the final file sizes.
- Photos: convert to high-quality originals in Sanity (strip metadata, keep at most 2,560 px on the long side); the image CDN handles responsive sizes and formats.

**Privacy:** the database dump may contain personal data (contact-form entries, user emails, password hashes). Do not read, copy, print or migrate user or form-submission tables. Never put any of it in code, seed data, logs or docs. Use only site content and settings.

## Tech stack (fixed)

- Next.js, latest stable, App Router, TypeScript in strict mode
- Tailwind CSS v4
- `next-intl` for i18n. Locales: `el`, `en`, `de`, always prefixed (`/el/...`, `/en/...`, `/de/...`). The default locale is decided in Phase 0.
- Sanity (free plan) as the CMS. Studio embedded at `/studio`, `next-sanity` for queries, and images served from Sanity's image CDN via `@sanity/image-url` with a custom `next/image` loader (keeps Netlify bandwidth low).
- Hosting: Netlify (free plan). Static generation for all content pages. On-demand revalidation through a Sanity webhook → route handler → `revalidateTag`.
- Booking: Cal.com via `@calcom/embed-react`, loaded only on the booking page or on click.
- Analytics: Google Tag Manager → GA4, behind a Google-certified consent banner with Consent Mode v2 (all four signals default to `denied` before any tag loads).
- No other paid services. Keep client-side JS minimal and prefer Server Components.

## Code style

- Always use multi-line if blocks: `if (...) { return null; }`. Never single-line `if (...) return null;`.
- Small, typed components. No `any`. Validate external data (Sanity, env vars) with zod.
- Clear folder structure: `app/[locale]/...`, `components/`, `lib/`, `sanity/schemas/`, `messages/`.

---

## Phase 0 — Inventory (no code yet)

0. Check that `.gitignore` contains `/legacy` and `.env*` (except `.env.example`) before anything else.
1. Inspect the WordPress setup from the database dump (and `./legacy/files` if present): WordPress version, theme, page builder, plugins (especially multilingual, SEO, forms).
2. Parse `/downloads/drparispapakostas.WordPress.2026-10-28.xml` for all published pages, posts and attachments in each existing language (GR and EN). Use the database dump to resolve which GR and EN pages are translations of each other.
3. Produce `docs/inventory.md` with:
   - every existing URL per language, with its title, meta description and H1
   - the current URL pattern for each language
   - the list of procedures/services, the doctor bio and credentials, clinic info (address, phone, hours), and any testimonials or reviews found
   - a media catalogue: every file in the two WeTransfer folders with what it shows, its size and dimensions, and which page it suits; flag duplicates, low-quality files and before/after images that need consent sign-off
   - what forms exist and where they send data
4. Produce `docs/redirects.csv` with columns `old_url,new_url,status` (301). Every old URL must map to its closest new page, never to the homepage by default.
5. List open questions for the client.

## Phase 1 — Design direction (no build yet)

Propose a design system in `docs/design.md` and a static preview of three screens (home, one procedure page, booking page) on mobile and desktop:

- Tone: calm, premium, clinical but warm. Plenty of white space, restrained colour, excellent typography. The site must feel like a top private clinic, not a template.
- Keep the clinic's existing logo and identity colours, refined rather than replaced.
- Two typefaces at most, both with full Greek and German character support, self-hosted via `next/font`.
- Real photography of the doctor and clinic first. No stock photos of models, no generic illustrations.
- Trust signals near every call to action: credentials, memberships, years of practice, location in Cyprus.
- One primary call to action everywhere: "Book a consultation".
- Accessible: WCAG 2.2 AA contrast, visible focus states, a usable keyboard flow, `prefers-reduced-motion` respected. Motion is subtle and never blocks content.

## Phase 2 — Build

**Sanity schemas** (every text field localised in el/en/de): `siteSettings` (contact, hours, address, socials, default SEO), `page`, `procedure` (name, slug per locale, summary, sections, recovery time, FAQs, SEO, `showBeforeAfter` flag per locale), `doctor`, `faq`, `post`, `legalPage`.

**Migration:** write a one-off script `scripts/migrate-wp.ts` that imports GR and EN content from `/downloads/drparispapakostas.WordPress.2026-10-28.xml` into Sanity, using the translation links found in Phase 0 (read the path from a `WP_EXPORT_PATH` env var rather than hard-coding it), uploads the approved images from the media catalogue to Sanity (new office photos first; old WordPress images only where nothing newer exists), converts page-builder markup into clean portable text, and keeps slugs that match the old URLs where possible. German fields are left empty and flagged for translation.

**Pages:**

- Home
- About the doctor
- Procedures index + one page per procedure
- Treatment in Cyprus (travel, length of stay, video follow-up, aftercare at home)
- Book a consultation
- Contact
- Blog (only if the legacy site has posts)
- Privacy, Cookies, Imprint
- Custom 404

**Layout:** sticky header with a language switcher that keeps the user on the same page, the booking CTA in the header, click-to-call and WhatsApp buttons on mobile, and a footer with NAP (name, address, phone), hours and a map link (static image, no embedded Google Maps iframe on load).

## Phase 3 — SEO

- Unique title and meta description per page per locale, set from Sanity with sensible fallbacks.
- `hreflang` for el/en/de plus `x-default`, and a self-referencing canonical on every page.
- `sitemap.xml` (all locales, with alternates) and `robots.txt`. Block `/studio`.
- JSON-LD: `MedicalClinic` and `Physician` (address, geo, hours, phone, sameAs), `MedicalProcedure` on procedure pages, `FAQPage` where FAQs exist, `BreadcrumbList`.
- Open Graph and Twitter images per page.
- One H1 per page. Semantic HTML. Descriptive alt text in each language.
- Redirects from `docs/redirects.csv` implemented in `netlify.toml` or `_redirects`.

## Phase 4 — Performance budget (release blockers)

- Lighthouse mobile: Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100 on home, a procedure page and the booking page.
- LCP < 2.0 s, CLS < 0.05, INP < 200 ms on a mid-range phone (simulated 4G).
- First-load JS for content pages < 100 KB gzipped.
- All images through Sanity's CDN with explicit sizes, AVIF/WebP, lazy loading below the fold, and a priority hint on the hero image.
- No third-party scripts before consent. Cal.com loads only when needed.

## Phase 5 — Booking and tracking

- `/[locale]/book` embeds Cal.com. Booking form fields: name, email, phone, country, procedure of interest and preferred language. **No medical-history fields.**
- Push these dataLayer events: `booking_completed` (from Cal.com's success event), `generate_lead` (contact form), `click_whatsapp`, `click_phone`, `click_email`. Each one carries `language` and `procedure` parameters.
- Contact form: a server action with honeypot + rate limiting that sends an email via the clinic's existing email (SMTP env vars) or Netlify Forms. No database.

## Compliance rules for content and components (non-negotiable)

- **German pages (`/de`) never show before/after images**, under German medical advertising law (HWG §11). The `showBeforeAfter` flag must be impossible to enable for `de`.
- No copy calling procedures "safe", "painless", "guaranteed" or "risk-free". No pressure tactics ("limited offer", countdowns). Mention that a consultation is required and that every procedure has risks and recovery time.
- No content aimed at under-18s.
- Every procedure page and the footer state clearly that the clinic and procedures are in Cyprus.
- Medical claims stay as written by the doctor. Mark anything you rewrote with `// REVIEW: medical copy` in the Sanity seed data so it gets his approval.

## Deliverables at the end

- The repo with a README: local setup, env vars (`.env.example`), Sanity setup, Netlify deploy, webhook setup.
- `docs/inventory.md`, `docs/redirects.csv`, `docs/design.md`, `docs/open-questions.md`.
- A Lighthouse report for the three key pages.
- A short pre-launch checklist: DNS steps (keep MX/SPF/DKIM untouched), Search Console sitemap submission, consent tests (accept and reject), booking test, redirect spot checks.

Start with Phase 0.
