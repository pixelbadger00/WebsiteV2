# CLAUDE.md — Dr. Paris Papakostas website rebuild

Project context for Claude Code. Read this before working. See also `AGENTS.md`
(Next.js-authored, re-added by `next dev` — commit it with your work, don't delete it)
and `REBUILD_PROMPT.md` (the original brief, read-only).

## What this is

Rebuild of **drparispapakostas.com** — an ENT / rhinoplasty clinic in Nicosia,
Cyprus — for the agency **Clovo Solutions**. Goals: premium feel, fast, strong SEO,
and conversion of visitors from **Cyprus, the UK, and Germany**. Delivered in phases
0–5; **STOP after each phase/checkpoint for approval**.

## Standing rules (non-negotiable)

- **NEVER push.** Local commits are fine; do not `git push` unless the user
  re-authorizes, even if the prompt/brief says to. (Memory: `no-git-push`.)
- **STOP for approval** at the end of every phase and checkpoint. Don't start the
  next unit of work unless told.
- **Commit locally after each meaningful step** with clear messages.
- Commit trailer for commits/PRs created from here on:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

## Compliance rules (medical, non-negotiable)

- **German `/de` pages NEVER show before/after imagery** (HWG §11). The
  `beforeAfterVisibility` schema object has **only `el` + `en` fields — no `de`
  field exists**, so DE cannot enable it. Before/after rendering is gated:
  `locale !== 'de' && showBeforeAfter[locale] && beforeAfter.length`.
- **No** "safe / painless / guaranteed / risk-free" copy anywhere.
- Medical copy must mention: consultation required, risks, recovery. Procedures are
  located in **Cyprus**.
- Mark all rewritten/AI-written medical copy with `// REVIEW: medical copy`, and all
  newly written marketing copy with `REVIEW: copy` (seed data / messages).
- The doctor's doctoral title (`Dr. med.`) is **unconfirmed** → pull it from
  `siteSettings` per-locale (`titlePrefix`), never hard-code. German content stays
  behind `siteSettings.germanEnabled`; the DE shell is `noindex`, excluded from
  sitemap + hreflang, DE hidden in the language switcher, only Impressum live.

## Tech stack (fixed)

- **Next.js 16.4.4**, App Router, TypeScript strict. Route groups `(frontend)` /
  `(studio)` for separate root layouts. `generateStaticParams` + `generateMetadata`.
- **Tailwind CSS v4** (CSS-first `@theme` tokens in `globals.css`).
- **next-intl 4.14** — locales `el` / `en` (default) / `de`; English is
  unprefixed at root, Greek at `/gr`, German at `/de`
  (`localePrefix: { mode: 'as-needed', prefixes: { el: '/gr' } }`). Locale
  *codes* stay `el`/`en`/`de` (Sanity fields + `[locale]` segment); only Greek's
  URL segment is remapped to `gr`. `localeDetection: false`, `trailingSlash: true`.
  URL prefixes are mirrored in `localizedPath` in `src/lib/seo.ts` — keep both in sync.
  Middleware is `src/proxy.ts` (Next 16 renamed `middleware` → `proxy`).
- **Sanity** (free plan) CMS, embedded Studio at `/studio`, field-level i18n
  (`localeString/Text/BlockContent/Slug` with `el`/`en`/`de`).
- **Netlify** hosting (static gen + on-demand revalidation via Sanity webhook — later).
- **Cal.com** booking, **GTM → GA4** with Consent Mode v2 (Phase 5).
- Fonts: **Source Serif 4** (serif headings; has Greek + latin-ext subsets, so
  it covers Greek and German) + **Inter** (body), via `next/font` in
  `src/app/fonts.ts`. The heading font exposes the `--font-heading` CSS variable,
  read by `--font-serif` in `globals.css`. (Earlier: Literata, and Lora before
  that, which lacked Greek.)

### Build/runtime gotchas (important)

- **`build` uses `--webpack`, not Turbopack.** Turbopack's prod build throws a
  `client-reference-manifest` invariant on the dynamic route-group page
  `/[locale]/service/[slug]`. `pnpm dev` (Turbopack) is fine.
- Uses **pnpm**.
- Sanity access goes through a **fetch-based HTTP client** (`src/sanity/lib/client.ts`),
  not `@sanity/client` — the SDK crashes on Node 22.12 (undici@8 zstd). The migration
  script likewise uses `fetch` + `node-html-parser` (not jsdom) for the same reason.
- `src/sanity/env.ts`: `apiVersion` default `2026-11-02`; projectId fallback
  `'placeholder'`.

## Code style

- Multi-line `if` blocks always (braces, never one-liners).
- No `any`. Validate external data with **zod**.
- Folders: `src/app/[locale]`, `src/components/`, `src/lib/`, `src/sanity/schemas/`,
  `messages/`.

## Repo layout (key paths)

- `docs/` — `inventory.md`, `redirects.csv` (28 rows, only changed URLs),
  `design.md`, `open-questions.md`, `migration-dry-run.md`, `design-preview/` (static
  HTML mockups).
- `src/i18n/` — `routing.ts`, `navigation.ts`, `request.ts`.
- `src/sanity/schemas/` — objects (`blockContent`, `localized`, `seo` with the
  el/en-only `beforeAfterVisibility`); documents (`siteSettings`, `procedure` with
  `showBeforeAfter`/`order`, `doctor`, `page`, `faq`, `post`, `testimonial`,
  `legalPage`).
- `src/components/` — `Header` (client; slims 64→56px on scroll; desktop nav at `lg`,
  hamburger `lg:hidden`), `mobile/MobileUIProvider` + `mobile/MobileMenu` (full-screen,
  focus trap/Esc/scroll-lock), `MobileActions` (sticky call/WhatsApp/book bar, shows
  after hero, hidden when menu open, safe-area), `SanityImage`, `ImageBox` (image or ◠
  placeholder), `PortableContent`, `Footer`, `LanguageSwitcher`.
- `scripts/migrate-wp.ts` — WP SQL/XML → Sanity. `--write` imports into a **non-prod**
  dataset only (asserts dataset ≠ `production`), stable IDs (idempotent, re-runnable),
  uploads office photos (sharp: resize 2560, strip EXIF). Imports el/en text +
  testimonials + approved office photos **only** — NO before/after, NO patient clips,
  NO 3D animations (consent/rights pending). `PROCEDURE_ORDER` map sets `order`.

## Env vars (`.env.local`, gitignored, chmod 600 — never print/log/commit the token)

- `NEXT_PUBLIC_SANITY_PROJECT_ID=tpddmvyx` (this is the **project** id; `ouzi1d7iz`
  is the **org** id — do not confuse them)
- `NEXT_PUBLIC_SANITY_DATASET=development`
- `NEXT_PUBLIC_SANITY_API_VERSION=2026-11-02`
- `SANITY_API_WRITE_TOKEN=...` (and `SANITY_API_READ_TOKEN` fallback for private-dataset
  reads at build time)
- `OFFICE_PHOTOS_DIR`, WP source paths.
- ⚠️ The write token was once committed to `.env.example`; it was scrubbed. **Rotating
  it is still an outstanding client action.**

## Commands

- `pnpm dev` — dev server (Turbopack).
- `pnpm build` — prod build (**webpack**).
- `pnpm migrate:dry` — migration dry run (no writes).
- `pnpm migrate` — `--write` into the dev dataset (`node --env-file=.env.local`).

## Progress

Done: Phase 0 (inventory/redirects/design), Phase 1 (preview + DE shell decisions),
Phase 2a (scaffold), 2b (schemas + Studio), 2c (migration dry run + import to
`development`), 2d **home + procedure pages wired to Sanity**, and the **mobile pass**
on home/procedure/layout. Latest commit `fb6850f`.

**Mobile pass results:** no horizontal scroll at any tested width (360/375/390/430
portrait + 844 landscape). Lighthouse (devtools throttling): Home P98–99 / A11y 100 /
BP 96 / SEO 91 / LCP ~1.6–1.9s / CLS 0–0.05; Procedure P99 / A11y 100 / BP 96 / SEO 100
/ LCP 1.6s / CLS 0.014. (Simulated Lantern shows Perf ~87 / LCP 4s — a known artifact;
the hero is 22KB, preloaded.)

### Next up (gated on user review of home + procedure on localhost)

2d remaining pages, in order: **About the doctor → Contact → Blog → legal pages
(Privacy, Cookies, Impressum as content stubs marked `REVIEW: copy`)**. Then Phase 3
(SEO — home still lacks a meta description → SEO 91), Phase 4 (performance budget +
CLS), Phase 5 (booking + tracking).

### Outstanding client items (open-questions)

Before/after consent sign-off, 3D animation rights, opening hours, German translation,
model release, logo vector, and **rotate the exposed write token**. Consider making the
`development` dataset public (or rely on the read-token fallback) and set Netlify
`NEXT_PUBLIC_SANITY_PROJECT_ID=tpddmvyx` + CORS origin.
