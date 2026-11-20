# Legal pages — editor & review checklist

For whoever finalises the **Privacy Policy**, **Cookie Policy** and **Imprint**
before launch. All three are Sanity documents, fully editable — **no developer
needed** to change wording or fill the gaps below.

> ⚠️ All copy currently in these pages is a **draft pending legal review**
> (`REVIEW: copy`; professional/medical lines also `REVIEW: medical copy`).
> It was drafted from the real clinic details in `siteSettings` plus the actual
> tech stack. Nothing legally specific was invented — unknowns are left as
> clearly-bracketed `[...]` placeholders that must be filled or removed.

## Where to edit

Sanity Studio → **`/studio`** → **"Legal pages"** → open each page.
Per page you can edit, each with **el / en / de** language tabs:

- **Title** (localized)
- **Body** — the full rich text (headings, paragraphs, bullet lists, links)
- **Slug** — URL segment, per locale
- **SEO** — meta title / description

Edits are live in dev immediately; in production they appear on the next deploy
or Sanity→Netlify revalidation.

> **Do not re-run `pnpm seed:legal-content`** after editing in Studio — it uses
> `createOrReplace` on fixed IDs and would overwrite Studio edits. The seed is a
> one-time starting point only.

## Status

| Page | Sanity ID | State |
|---|---|---|
| Cookie Policy | `legal.cookies` | ✅ Complete — accurate to the live consent flow. Review only. |
| Privacy Policy | `legal.privacy` | ◑ Full draft — fill placeholders, then legal review. |
| Imprint | `legal.imprint` | ◑ Full draft — fill placeholders, then legal review. |

## Placeholders to fill (search the body for `[` )

These `[...]` passages are legally required and were left blank on purpose:

### Privacy Policy (`legal.privacy`)
- [ ] **Controller legal details** — legal registration / VAT of the controller,
      and a data-protection contact if one exists.
- [ ] **Retention periods** — how long enquiry / booking data is kept before
      deletion or anonymisation.
- [x] ~~Email provider~~ — resolved: clinic uses **Google (Gmail)**, now named in
      the processors list.

### Imprint (`legal.imprint`)
- [ ] **Professional title origin** — country where the medical title was
      awarded. (Ties to the unconfirmed `Dr. med.` title — see `open-questions.md`.)
- [ ] **Medical registration** — Cyprus Medical Association / Medical Council
      registration number, and the exact competent-body name.
- [ ] **VAT / tax** — VAT number, or a statement that the clinic is not
      VAT-registered.
- [ ] **Professional liability insurance** — insurer name, address, and
      geographic scope of cover (required for the German market).

## Review notes (not blockers, but check)

- [ ] **Contact email is a Gmail address** (`dr.paris.papakostas@gmail.com`).
      Consider a domain email (e.g. `info@drparispapakostas.com`) for a more
      professional and stable legal contact. Used in both Privacy and Imprint.
- [ ] **Supervisory authority** — Privacy names the Cyprus *Office of the
      Commissioner for Personal Data Protection* (`www.dataprotection.gov.cy`).
      Confirm the reference is current.
- [ ] **German (de) copy** — drafted but **not yet live** (`germanEnabled: false`).
      Needs medical/HWG + legal sign-off before enabling. Per project rules only
      the **Imprint** is intended live in DE.
- [ ] **"No before/after on /de"** rule is unaffected by these pages, but keep in
      mind when the German shell goes live.
- [ ] Have a lawyer confirm the **Imprint structure** (built to German §5 DDG
      expectations for a Cyprus-established provider) actually fits the markets
      served (Cyprus, UK, Germany).

## How the pages are built (for developers)

- Schema: `src/sanity/schemas/documents/legalPage.ts` (`kind` = privacy / cookies
  / imprint; `title`, `slug`, `body`, `seo`).
- Rendered by: `src/components/LegalPageView.tsx` (falls back to a "content
  coming" message if `body` for the locale is empty).
- Routes: `src/app/(frontend)/[locale]/{privacy,cookies,imprint}/page.tsx`.
- Initial content seeds: `scripts/seed-legal.ts` (original stubs) and
  `scripts/seed-legal-content.ts` (full Privacy + Imprint draft). Non-prod
  dataset only.
