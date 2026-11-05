# Open questions for the client (Phase 0)

Nothing here has been invented. These are gaps the source material (WordPress export, DB dump, media folders, live site) does not answer, plus consent/rights sign-offs that must happen before the relevant media is used.

## A. Consent & media rights (blockers for those assets)

1. **Before/after patient photos — written consent required per file.** These are health data. We will use **only** files the doctor confirms in writing have patient consent for web use. Please sign off (yes/no) on each case folder below. We will then strip all EXIF, crop out anything not approved, and rename to neutral names. **Never shown on `/de` pages** (German HWG §11).

   | Case folder | Files |
   |---|---|
   | `Neuer Ordner` | IMG_3788, IMG_3789, IMG_4084 (3) |
   | `Neuer Ordner/Neuer Ordner` | IMG_3212–3216 (5) |
   | `Neuer Ordner/Neuer Ordner 2` | IMG_3188–3191 (4) |
   | `Neuer Ordner/Neuer Ordner 3` | 3 phone **video clips** (.MOV, 10 s) |
   | `Neuer Ordner/Neuer Ordner 4` | IMG_3308 (1) |
   | `Neuer Ordner/Neuer Ordner 5` | IMG_4005–4007 (3) |
   | `Neuer Ordner/Neuer Ordner 6` | IMG_4143–4145 (3) |
   | `Neuer Ordner/Neuer Ordner 6/Neuer Ordner 8` | IMG_5045–5047 (3) |
   | `Neuer Ordner/Neuer Ordner 7` | IMG_4265–4267 (3) |
   | `Neuer Ordner/Neuer Ordner 8` | IMG_5142, 5147, 5149 (3) |
   | `Neuer Ordner/Neuer Ordner 9` | IMG_4363–4365 (3) |

   - Which of each set is **before** vs **after**, and for **which procedure**, so we can label and group them correctly?
   - Any features to crop (tattoos, jewellery, background, eyes) beyond the face itself?

2. **Model release for the office-shoot photos.** Several 2026 photos show an identifiable **model patient's face** (consultation, hand-mirror, on-screen simulation). Do we have a signed model release permitting web use? If not, we use only the clinic/doctor/instrument shots.

3. **3D animations — usage rights.** The 3 animations are credited **"by 3DMedWorld"** (third party). Does the clinic have the right to publish them on the website? Any required credit? They are long (85–102 s) and large (285–424 MB) — OK to **trim to short web loops** and re-encode (H.264 MP4 + WebM, muted)?

## B. Business information not in any source

4. **Opening hours** — not published anywhere in the export. Please provide weekly hours (per day) for the footer, contact page and `MedicalClinic` JSON-LD.
5. **Phone / WhatsApp confirmation** — we found landline **+357 22 730269** and mobile **+357 99 623821**. Which is the public booking line? Is the mobile the **WhatsApp** number for the mobile CTA? Confirm the email **dr.paris.papakostas@gmail.com** is the right public inbox (vs. an agency inbox).
6. **Exact address + map** — confirm "Λόρδου Βύρωνος 2, 1096 Λευκωσία" (Vyronos Building 2) is complete (floor/suite?) and give the precise **geo-coordinates** for JSON-LD and the static map image.
7. **Credentials for trust badges** — full list of qualifications, **medical registration number(s)** (Cyprus / Germany), society memberships (e.g. EAFPS, Hellenic/Cyprus ENT societies), years in practice, and any hospital affiliations. Needed near every CTA; must be verifiable (no invented claims).
7a. **Doctoral title — exact wording & German display.** The clinic branding reads **"Dr. med."** (German medical doctorate). Please confirm the doctor's exact doctoral title and the institution/country that conferred it. In Germany **"Dr. med." is a legally protected academic title**; how it may be shown on the **`/de`** pages depends on whether the degree is German or officially recognised for use in Germany. Confirm the precise form to display per locale (e.g. "Dr. med." on `/de` only if permissible, vs "Δρ." / "Dr." on `/el` and `/en`).

## C. Content & scope

8. **German (`/de`) content** — all German fields start empty. Who produces the German translations (professional medical translator?), and for which pages at launch vs later? `/de` must never show before/after.
9. **Default locale** — current site defaults to Greek. New site keeps **`el` default but always prefixed** (`/el`,`/en`,`/de`). Confirm, and confirm whether `/` should redirect by browser language or go straight to `/el`.
10. **Thin procedure content** — FESS, laser-turbinate and navigation-FESS pages are short stubs. Who expands them? Any medical copy we rewrite will be flagged `// REVIEW: medical copy` for the doctor's approval.
11. **Legal pages missing** — the current site has **no Privacy, Cookies or Imprint page**. We will draft templates (GDPR + Cyprus + German Impressum for `/de`), but the doctor must supply/approve the data-controller details, processors and the lawful basis for the contact form.
12. **Treatment-in-Cyprus page** — new page (travel, length of stay, video follow-up, aftercare). Please confirm the real process: typical stay, follow-up method (video?), who to contact at home.
13. **Testimonials** — are the 10 existing testimonials cleared for continued display (named)? Any to add (e.g. verified Google reviews) or remove?
    ⚠️ **ACTION TAKEN (pending client confirmation):** all 10 were set `consentToDisplay: true` (`pnpm enable:testimonials`) so the home "Patients from Cyprus and abroad" section renders. These are the reviews already shown publicly, with names, on the original live site, so this is continuity, not new exposure — but it is a consent call the **client owns**. It is local only until deploy. To hide any specific review, set its `consentToDisplay` back to `false` in Studio. Confirm the full list is cleared, or tell us which to remove.
14. **Contact form today** — no form plugin is active; how does the current contact page collect enquiries, and where do they go? (So we match the recipient and don't lose leads.)

## D. Technical / handover

15. **Logo & brand assets** — `./legacy/files/` (old FTP install) is **not present**. Please provide the **vector logo** (the nose-profile mark + wordmark) and the exact brand **colours/fonts**, or authorise us to extract them from the signage photos.
16. **Cal.com account** — which Cal.com account/event types for booking? Fields to collect (name, email, phone, country, procedure, preferred language — **no medical history**).
17. **GTM / GA4 / consent** — provide the GTM container ID and GA4 property, or should we create them? Confirm Consent Mode v2 banner (all signals `denied` by default).
18. **Email sending** — SMTP credentials for the clinic's existing email (for the contact form), or use Netlify Forms?
19. **DNS** — registrar/DNS provider access for go-live; we keep MX/SPF/DKIM untouched.
20. **Domain history** — any current paid ads / Search Console property to preserve? Any existing redirects we should know about (none found in the DB).

## E. Claims to confirm before display (from the migrated bio)

21. **"5,000 rhinoplasty procedures"** — the bio states "5000 Rhinoplasty procedures". This figure is **not displayed on the site until the doctor confirms it** (volume claims must be substantiable). Confirm the exact, current number and the wording he wants.
22. **"PhD from Charité" / doctoral title** — the bio states a PhD/dissertation at Charité University Medicine Berlin ("Dr. med."). The doctoral/`Dr. med.` title stays out of display until confirmed (ties to the existing `titlePrefix` question). Confirm the title, awarding institution and year.
23. **Model release for patient photos** — ~34 of the 80 office photos show a patient/model (examination, hand-mirror, consultation, and on-screen facial imaging). These are **excluded from the site** (see `docs/photo-mapping.md`) until a signed model release exists; the on-screen before/after facial comparisons also need before/after consent and must never appear on `/de`.
