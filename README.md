# drparispapakostas.com

Rebuild of the website for Dr Paris Papakostas (ENT / rhinoplasty clinic, Nicosia, Cyprus) for Clovo Solutions.

**Stack:** Next.js 16 (App Router, TypeScript strict) · Tailwind CSS v4 · next-intl (el/en/de, `as-needed` prefix) · Sanity CMS (embedded Studio) · Netlify hosting · Cal.com booking.

## Requirements
- Node ≥ 20.9
- pnpm ≥ 10

## Local setup
```bash
pnpm install
cp .env.example .env.local   # fill in as each phase needs it
pnpm dev                     # http://localhost:3000
```

## Scripts
| Script | Purpose |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build (static generation) |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | `tsc --noEmit` (strict) |
| `pnpm lint` | ESLint |

## Internationalisation
- Locales: `el` (default, **unprefixed** URLs), `en` (`/en/…`), `de` (`/de/…`, shell — see below).
- `trailingSlash: true` to match the old WordPress URLs.
- Routing config: `src/i18n/routing.ts`; messages in `messages/{el,en,de}.json`.
- **German launch:** `/de` is a shell — `noindex`, excluded from sitemap + hreflang, DE hidden in the language switcher, only the Impressum live. Flip `GERMAN_ENABLED` in `src/lib/config.ts` (later driven by `siteSettings.germanEnabled`) once German copy exists.

## Project layout
```
src/
  app/[locale]/        # localised routes (root layout, home, 404)
  app/fonts.ts         # Literata + Inter via next/font (self-hosted)
  app/globals.css      # Tailwind v4 + design tokens (@theme)
  components/          # Header, Footer, LanguageSwitcher, MobileActions
  i18n/                # next-intl routing / request / navigation
  lib/                 # config (German flag, placeholder contact)
  proxy.ts             # next-intl middleware (Next 16 "proxy")
messages/              # el/en/de UI strings
docs/                  # inventory, redirects, design, open questions, preview
```

## Status
- **Phase 2a — Scaffold:** ✅ this commit.
- Phase 2b — Sanity schemas + Studio at `/studio`.
- Phase 2c — `scripts/migrate-wp.ts` (dry-run first).
- Phase 2d — pages & components wired to Sanity.

Env vars, Sanity setup, Netlify deploy and webhook instructions are filled in per phase. See `.env.example`.
