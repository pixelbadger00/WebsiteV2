# Design direction — drparispapakostas.com (Phase 1)

A calm, premium, clinical-but-warm system for a top private ENT / rhinoplasty clinic in Nicosia, Cyprus. Not a template: generous white space, restrained colour, one confident serif + one clean sans, real photography of Dr Papakostas and the clinic, and a trust signal beside every call to action.

> **Confirmed decisions (end of Phase 1):** accent = **deep teal-slate `#2F5D62`**; type = **Literata (headings) + Inter (body)**; German launches as a **built `/de` shell**. `/de` never shows before/after.
>
> **Font note:** Lora was dropped — on Google Fonts it ships only latin/latin-ext/cyrillic/vietnamese, **no `greek`** subset, and Greek is our default locale. Replaced with **Literata**, verified to include `greek` + `greek-ext` (and latin-ext for German ä/ö/ü/ß) in its Google Fonts / `next/font` subset list. Verified by rendering a real Greek H1 and a German H1 ("Für Ästhetik, Atmung und Nasengröße.") — both render correctly (see `design-preview/home_el.html`, `home_de.html`). Other greek-capable candidates considered: EB Garamond, Noto Serif Display, Source Serif 4.
>
> **German `/de` shell at launch:** until German copy exists, `/de` pages are **`noindex`**, **excluded from `sitemap.xml` and from `hreflang`/`x-default` alternates**, and **DE is hidden in the language switcher**. A boolean in `siteSettings` (`germanEnabled`) flips all of this on later. **Only the Impressum is live** on `/de` at launch. el/en ship fully.

> Colours and type below are **derived from the 2026 clinic photography and signage** (charcoal panel + white nose-profile logo on porcelain-grey interiors). The **exact logo vector and official brand hex/fonts are not in the sources** (`./legacy/files` absent) — see `open-questions.md` #15. Treat these as the refined proposal to confirm against the real brand assets.

---

## 1. Principles
1. **One job per screen.** Every page drives to **"Book a consultation"** — a single, consistent primary CTA.
2. **Earn trust before asking.** Credentials, German training, memberships, years in practice and "Nicosia, Cyprus" sit next to every CTA.
3. **Honest medical tone.** No "safe / painless / guaranteed / risk-free", no countdowns or pressure. Every procedure states that a consultation is required and that there are risks and recovery time.
4. **Photography first.** Real doctor/clinic images; no stock models, no generic illustrations. Before/after only inside opt-in procedure galleries, never on `/de`.
5. **Quiet motion.** Subtle, short, `prefers-reduced-motion`-respecting; never blocks content or shifts layout.

---

## 2. Colour

Monochrome-led, as the brand is: ink on porcelain with a single restrained accent. All pairings below meet **WCAG 2.2 AA** (body ≥ 4.5:1, large text/UI ≥ 3:1).

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--ink` | `#171A1F` | Primary text, header/footer ground | 15.8:1 on porcelain |
| `--slate-900` | `#20242B` | Deep panels (echoes the signage charcoal) | — |
| `--slate-600` | `#5A626C` | Secondary text, captions | 5.6:1 on porcelain |
| `--slate-300` | `#C7CDD2` | Hairlines, borders, dividers | — |
| `--porcelain` | `#F6F5F2` | Page background (warm white, not sterile) | — |
| `--surface` | `#FFFFFF` | Cards, inputs | — |
| `--accent` | `#2F5D62` | Primary CTA, links, focus — deep teal-slate from the signage's cool cast; calm + clinical | 5.9:1 on porcelain; white text on accent = 5.1:1 |
| `--accent-700` | `#244A4E` | CTA hover/active | white text 6.8:1 |
| `--sage` | `#6E7F6A` | Sparing natural accent (echoes clinic greenery) — dividers/illustrative only, never text-on-light | — |
| `--focus` | `#3B82A0` | Focus ring (3px, 2px offset), distinct from accent | ≥ 3:1 vs adjacent |

Dark sections (header/footer/hero scrim) use `--slate-900` ground with porcelain text (≥ 12:1). Accent is used *once* per view as the primary action; secondary actions are outline/ghost on ink.

**Semantic:** success `#2E6B4F`, error `#9B2C2C`, both AA on porcelain — used only for form states.

---

## 3. Typography

Two self-hosted families (via `next/font`, `display: swap`, subset **latin + latin-ext + greek**). Both cover **Greek and German** fully.

- **Headings / display — Literata** (serif). Warm, bookish, high-legibility at display sizes; **confirmed `greek` + `greek-ext` + `latin-ext`** subsets (covers Greek and German ä/ö/ü/ß). Weights 500/600. Used for H1–H3 and pull quotes.
- **Body / UI — Inter** (sans). Neutral, excellent Greek + German, great at small sizes. Weights 400/500/600. Used for body, nav, buttons, labels, captions.

Rationale: a refined serif gives the "private-clinic" warmth; a clean grotesque keeps UI and long medical copy legible. Only two families keeps the page light and fast. Greek is the default locale, so the heading serif **must** carry a real Greek subset — this is why Lora (no Greek on Google Fonts) was rejected in favour of Literata.

**Type scale** (fluid, `clamp`, 1.2–1.25 ratio):
| Role | Size (desktop → mobile) | Family / weight |
|---|---|---|
| Display H1 | 56 → 34 px | Literata 600 |
| H2 | 36 → 26 px | Literata 600 |
| H3 | 24 → 20 px | Literata 500 |
| Lead | 20 → 18 px | Inter 400 |
| Body | 18 → 16 px | Inter 400, line-height 1.65 |
| Small / caption | 14 px | Inter 500 |
| Eyebrow / label | 13 px, +0.08em tracking, uppercase | Inter 600 |

One **H1 per page**. Measure capped at ~68ch for body.

---

## 4. Layout & spacing
- **Grid:** 12-col, max content width **1200px**, gutters 24px; text blocks max ~720px. Mobile: single column, 20px side padding.
- **Spacing scale (4px base):** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Sections breathe at 96–128px desktop / 56–72px mobile.
- **Radius:** 10px cards/inputs, 999px pills/buttons. **Shadows:** one soft token (`0 1px 2px rgba(23,26,31,.06), 0 8px 24px rgba(23,26,31,.06)`) — used sparingly; prefer hairlines over heavy shadow.
- **Imagery:** large, calm, lots of negative space. Hero = a doctor portrait or clinic interior with a subtle ink scrim for text contrast. Fixed aspect ratios (no CLS).

---

## 5. Components
- **Header (sticky):** logo left; nav centre (Procedures, About, Treatment in Cyprus, Blog, Contact); right = **language switcher** (EL/EN/DE, stays on the same page) + **"Book a consultation"** button (accent). Condenses on scroll. Mobile: logo + CTA + hamburger; sticky **click-to-call** and **WhatsApp** buttons.
- **Primary button:** accent fill, porcelain text, pill, 48px min height; hover `--accent-700`; visible focus ring. **Secondary:** ink outline/ghost.
- **Trust strip:** compact row under hero and above every CTA — "German-trained ENT surgeon · Univ. of Patras MD · Facial plastic surgery · Nicosia, Cyprus" + membership marks. (Exact credentials pending — `open-questions.md` #7/#7a.)
- **Procedure card:** image, name, one-line summary, recovery-time chip, "Learn more". Index grid 3-up desktop / 1-up mobile.
- **Before/after gallery (procedure pages only):** collapsed by default; opens on purpose; small persistent note **"Results vary. Every procedure carries risks."**; slider/compare. **Rendered impossible on `/de`** (the `showBeforeAfter` flag can't be set for `de`).
- **FAQ accordion:** keyboard-operable (`<details>`/ARIA), feeds `FAQPage` JSON-LD.
- **Testimonial:** quote (Lora), name, procedure tag. Real reviews from the export.
- **Footer:** NAP (name, address, phone), hours, static map **image** linking out (no Google Maps iframe on load), language switcher, legal links, "Clinic and procedures located in Cyprus."
- **Booking:** Cal.com embed loaded only on `/book` or on click; fields = name, email, phone, country, procedure, preferred language. **No medical-history fields.**

---

## 6. Accessibility (WCAG 2.2 AA — release target)
- Contrast AA across light/dark sections (table §2). Visible focus on every interactive element (`--focus`, 3px, 2px offset).
- Full keyboard flow; logical tab order; skip-to-content link; menus and accordions operable by keyboard with correct ARIA.
- `prefers-reduced-motion`: disables transforms/parallax, keeps instant state changes.
- Descriptive `alt` per language; one H1; semantic landmarks; 44×44px min tap targets; forms with real `<label>`s and inline errors.

---

## 7. Motion
- Entrance: 150–250ms opacity + 8px rise, once, staggered subtly. Hover: 120ms colour only. No autoplay video, no carousels that move on their own. Everything disabled under reduced-motion.

---

## 8. Static preview
`docs/design-preview/index.html` — self-contained mockup of **Home, a Procedure page (Rhinoplasty), and Booking**, each shown at **desktop and mobile** widths, using the real palette, type and copy. Home is provided in all three languages — `home.html` (EN), `home_el.html` (**EL, default locale**), `home_de.html` (**DE**, shown as a "when-enabled" proof) — to validate Literata's Greek glyphs and the German ä/ö/ü/ß. The home previews **reference 4–6 real 2026 photos** (hero, portrait, exam room, consultation, instruments) **directly from `~/Downloads/wetransfer_…/HIGH RES/` via absolute `file://` paths — these are never copied into the repo**; the production build serves them from the Sanity CDN. Fonts load from the Google CDN *in the mockup only*; the production build self-hosts them via `next/font`. The DE switcher is hidden in the EL/EN previews per the launch rule.

---

## 9. Performance budget (Phase 4)

Targets (Lighthouse mobile, applied/"devtools" 4G throttling — the field-realistic method, confirmed against PageSpeed/CrUX): **Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100**; **LCP < 2.0 s, CLS < 0.05, INP < 200 ms**.

- **First-load JS: ≤ ~150 KB gzipped** for content pages (raised from the original 100 KB). **Why:** the shared baseline is ~140 KB gz and is almost entirely the framework runtime — **React 19 + Next.js 16 App Router + the next-intl client provider** (verified: no Sanity/CMS code reaches the browser, `"use client"` is limited to the menu, sticky action bar, language switcher and contact form; the FAQ accordion is a JS-free `<details>`). Dropping under 100 KB would mean abandoning the App Router or the client-side i18n provider — a disproportionate architectural cost for a brochure site that already hits Perf 99 / LCP < 2 s under applied throttling. 150 KB leaves ~10 KB of headroom for per-page client code and is enforced as the new ceiling.
- **Known tooling artifact:** Lighthouse's default *simulated* (Lantern) throttling reports Perf ~87 / LCP ~4 s because it over-penalises the cross-origin image CDN. Mitigation: the **hero LCP image is served same-origin via Netlify's Image CDN** (Sanity URL as source, see `netlify.toml [images].remote_images`), keeping the hotspot crop and responsive `srcset`; all other images stay on the Sanity CDN. Measure with PageSpeed Insights on the Netlify deploy, not local Lantern.
- Images: Sanity/Netlify CDN, explicit sizes, AVIF/WebP via content negotiation, lazy below the fold, `priority` on the hero. No third-party scripts before consent (Consent Mode v2, all signals denied by default); Cal.com loads only on interaction.
