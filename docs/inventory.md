# Inventory — drparispapakostas.com (Phase 0)

Source: WordPress export `drparispapakostas.WordPress.2026-10-28.xml` + MySQL dump `db5vni9lavwmuj.sql` (read-only, queried from the files only — live DB never touched). All source material lives outside the repo.

> No personal data (contact-form entries, user emails, password hashes) was read, copied or migrated. Only site content and settings are recorded here.

---

## 1. Current WordPress setup

| Item | Value |
|---|---|
| Site title | Dr Paris Papakostas |
| Site URL | https://drparispapakostas.com (DB stores `http://`, live is `https://`) |
| DB table prefix | `yby_` |
| Theme | **doctent** (+ `doctent-core` companion plugin) — medical/doctor theme |
| Page builder | **Elementor** (+ Redux Framework options, **Slider Revolution**) |
| Multilingual | **Polylang** (+ "Duplicate content addon for Polylang") |
| SEO | **AIOSEO (All in One SEO)** — tables present, plugin currently **deactivated**; per-page meta almost entirely unset (template defaults) |
| Analytics | MonsterInsights tables present, plugin **deactivated** |
| E-commerce | WooCommerce tables present (`woocommerce_db_version` 9.3.3), plugin **deactivated** — not used by the clinic |
| Host tooling | SG Optimizer (`sg-cachepress`), SG Security (SiteGround) |
| Admin email | georgeclp@gmail.com (agency) |

**Active plugins (10):** polylang, doctent-core, duplicate-content-addon-for-polylang, elementor, redux-framework, revslider, sg-cachepress, sg-security, widget-css-classes, siteground-wizard.

### Language configuration (Polylang)
- Languages: **el** (Greek) and **en** (English). No German yet.
- **Default language: `el` (Greek)**, with `hide_default = true`.
- Current URL pattern:
  - **Greek (default): no prefix** — e.g. `/`, `/about-the-doctor/`, `/service/rhinoplasty/`.
  - **English: `/en/` prefix** — e.g. `/en/about-the-doctor/`… actually `/en/professional-profile/`, `/en/service/rhinoplasty-en/`.
- Custom post types use singular bases: `/service/…`, `/team/…`, `/testimonial/…`.

**New-site decision (Phase 0, revised):** `next-intl` with **`localePrefix: 'as-needed'`** and **`el` as default** → **Greek keeps its current unprefixed URLs** (`/about-the-doctor/`, `/service/rhinoplasty/`), **English stays `/en/…`**, **German is new at `/de/…`**. **`trailingSlash: true`** so WordPress's trailing-slash URLs resolve unchanged.

**Slug policy:** keep every existing slug and path shape wherever a page persists (same `/service/…` and `/services/` bases; posts stay at root, resolved by slug from Sanity). Only the Polylang-duplicate `-2`/`-en` slugs and removed/merged pages change — those are the *only* redirects (see §7).

---

## 2. Content inventory (published)

Totals: 16 pages, 10 `service` (procedures), 11 `post` (blog), 1 `team` (doctor), 10 `testimonial`, 76 attachments. (27 `elementor_library`, global styles, CSS = builder artefacts, not content.)

Translation links come from Polylang `post_translations` groups in the DB (18 groups).

### 2a. Pages

| EL URL (kept) | EL title | EN URL | EN title | Change |
|---|---|---|---|---|
| `/` | Αρχική (Home) | `/en/` | Home | GR unchanged; EN `/en/home/` → `/en/` |
| `/about-the-doctor/` | Βιογραφικό | `/en/professional-profile/` | Professional Profile | both kept (team CPT merges in) |
| `/services/` | Υπηρεσίες | `/en/services/` | Services | GR unchanged; EN `services-2` → `services` |
| `/blog/` | Άρθρα | `/en/blog/` | Posts | GR unchanged; EN `posts` (empty) → `blog` |
| `/contact-us/` | Επικοινωνία | `/en/contact/` | Contact | both unchanged |
| `/faq/` | Συχνές Ερωτήσεις | `/en/faq/` | FAQ | GR unchanged; EN `faq-2` → `faq` |
| `/instructions/` | Μετεγχειρητικές Οδηγίες | `/en/post-surgery-guide/` | Post-operative Instructions | both kept |
| `/before-after-2/` | Πριν και μετά | `/en/before-after/` *(empty)* | Before & After | **removed** → merged into procedure galleries |

> EN `Posts` and EN `Before & After` pages have **no content** (empty placeholders).

### 2b. Procedures (`service` CPT) — 5 procedures × 2 languages

Base stays `/service/{slug}/` (GR) and `/en/service/{slug}/` (EN). Each GR slug drops its Polylang `-2`; EN rhinoplasty drops `-en`. In Sanity, slugs are locale-scoped so GR and EN can share the same clean slug without the WP collision that forced the suffixes.

| Procedure | EL URL (kept slug) | EN URL (kept slug) | Change |
|---|---|---|---|
| Rhinoplasty (Ρινοπλαστική) — richest content | `/service/rhinoplasty/` | `/en/service/rhinoplasty/` | GR unchanged; EN `rhinoplasty-en` → `rhinoplasty` |
| Septoplasty (Πλαστική Διαφράγματος) | `/service/septoplasty/` | `/en/service/septoplasty/` | GR `septoplasty-2` → `septoplasty`; EN unchanged |
| Functional Endoscopic Sinus Surgery / FESS (Ενδοσκοπική χειρουργική παραρρινίων) | `/service/functional-endoscopic-sinus-surgery-fess/` | `/en/service/functional-endoscopic-sinus-surgery-fess/` | GR drops `-2`; EN unchanged |
| Laser reduction of inferior nasal turbinates (Καυτηρίαση ρινικών κόγχων) | `/service/laser-reduction-of-the-inferior-nasal-turbinates/` | `/en/service/laser-reduction-of-the-inferior-nasal-turbinates/` | GR drops `-2`; EN unchanged |
| Navigation-assisted FESS (Χρήση πλοήγησης σε ενδοσκοπικά χειρουργεία) | `/service/navigation-systems-in-functional-endoscopic-sinus-surgery/` | `/en/service/navigation-systems-in-functional-endoscopic-sinus-surgery/` | GR drops `-2`; EN unchanged |

All are **ENT / rhinology** procedures. Only Rhinoplasty + Septoplasty have substantial body copy; the other three are short stubs → content expansion needed (open question).

### 2c. Blog posts (`post`) — 11

| Topic | EL URL | EN URL |
|---|---|---|
| Chronic sinusitis | `/chronic-sinusitis-2/` | `/en/chronic-sinusitis/` |
| Deviated nasal septum | `/deviated-nasal-septum-2/` | `/en/deviated-nasal-septum/` |
| European Rhinoplasty Masterclass Center | `/european-rhinoplasty-masterclass-center/` | `/en/european-rhinoplasty-masterclass-center-2/` |
| Inferior nasal turbinate hypertrophy | `/inferior-nasal-turbinate-hypertrophy-2/` | `/en/inferior-nasal-turbinate-hypertrophy/` |
| Rhinoplasty surgery techniques | `/rhinoplasty-surgery-techniques-2/` | `/en/rhinoplasty-surgery-techniques/` |
| Nasal septum (Ρινικό Διάφραγμα) | `/riniko/` | — *(GR only, no EN translation)* |

→ Blog pages/posts exist, so the **Blog section is kept**. Posts stay at their current paths (GR at root `/{slug}/`, EN at `/en/{slug}/`), resolved by slug from Sanity. **Changes:** GR `chronic-sinusitis-2`, `deviated-nasal-septum-2`, `inferior-nasal-turbinate-hypertrophy-2`, `rhinoplasty-surgery-techniques-2` drop their `-2`; EN `european-rhinoplasty-masterclass-center-2` drops `-2`. All others unchanged. `riniko` (GR-only) kept.

### 2d. Doctor (`team` + about page)
- `team/dr-papakostas/` (GR, id 6191, ~18k chars rich bio). EN bio lives in page `/en/professional-profile/`. Consolidate both into the single **About** page + `doctor` schema.

### 2e. Testimonials (`testimonial`) — 10 real reviews
3 Greek (Παναγιώτης Σ., Κατερίνα Θεοδώρου, Γιώργος Γεωργίου) + 7 English (Katerina Ch., Manuella Tosunidu, Annie Liperti, Alexis Chrysaphis, Adriana Gulie, Sevil Melyayeva, "peacefuelo"). Text praises professionalism, rhinoplasty/septoplasty outcomes, calm manner. Migrate as `testimonial` content/components (not standalone URLs).

---

## 3. H1 / meta notes
- Pages are Elementor-built; clean `<h1>` is not reliably stored in content. **H1 ≈ page title** (listed above) and must be set explicitly per page in the new build.
- **SEO meta:** only the Greek homepage (id 276) has a custom AIOSEO title/description:
  - Title: `#site_title - Specialist in Rhinoplasty and Rhinosurgery`
  - Desc (EL): "Ο Δρ. Παπακώστας προσφέρει εξειδικευμένες ιατρικές υπηρεσίες Ωτορινολαρυγγολογίας…"
  - Every other page used AIOSEO template defaults → **all titles/descriptions must be authored fresh** in Phase 3 (no equity lost since none were custom).

---

## 4. Clinic info (NAP)

| Field | Value |
|---|---|
| Name | Dr Paris Papakostas — Rhinoplasty · Nose Surgery (Δρ. Πάρις Παπακώστας) |
| Address | **Λόρδου Βύρωνος 2, 1096 Λευκωσία, Κύπρος** (2 Lordou Vyronos / Lord Byron Ave, "Vyronos Building 2", 1096 Nicosia, Cyprus) |
| Phone (landline) | **+357 22 730269** |
| Phone (mobile / WhatsApp candidate) | **+357 99 623821** |
| Email | **dr.paris.papakostas@gmail.com** |
| Opening hours | **Not published anywhere in the export → OPEN QUESTION** |

### Doctor bio & credentials (from GR bio, id 6191)
- ENT specialist (Ωτορινολαρυγγολόγος), Head & Neck surgeon; sub-specialised in **Facial Plastic Surgery** and **Neurotology/Audiology**.
- Born Nicosia, 1981.
- MD, **University of Patras Medical School, 2007** ("Λίαν Καλώς" / very good).
- ENT residency in **Germany**: Charité University Hospital Berlin, Helios Hospital Berlin-Buch (largest ENT clinic in Berlin), University Hospital of Brandenburg.
- Clinical instructor in ENT at the University of Berlin (4th/5th-year students, Problem-Based Learning).
- (German-trained → supports DE/UK target markets. **Full credential list, memberships, registration numbers, years of practice → confirm with doctor for trust badges.**)

---

## 5. Media catalogue

### 5a. New office 2026 photos — **primary image source** ✅
`wetransfer_paris-papakostas-new-office-2026-by-dec_2026-10-22_1017/` — 161 files, 472 MB.
- **`…/HIGH RES/`** — 80 JPG masters, long side **3840 px**, 3.3–6 MB each. → downscale to ≤2560 px, strip EXIF, upload to Sanity. **Use these.**
- **`…/ALL edited photos/`** — 80 JPG at 2048 px = **lower-res duplicates of HIGH RES** (same shots) + `…-64.mp4` (1920×1080, 4.6 s, 21 MB office-intro clip). *Duplicates — do not upload; prefer HIGH RES.*
- **EXIF present on all 160 images → must strip on import.**

Content (verified from contact sheets):
| Category | Suggested use |
|---|---|
| Clinic branding panels — nose-profile line logo + "DR. MED. PARIS PAPAKOSTAS / RHINOPLASTY · NOSE SURGERY", charcoal panel, greenery | Logo/brand ref, About, footer |
| Interiors — white/light-grey corridor, waiting area (black leather bench), bright windows, "VYRONOS BUILDING 2" directory sign | Home, Contact, Treatment-in-Cyprus |
| ENT exam room — exam chair, equipment cabinet, plants | Procedures, About |
| Formal doctor portraits on grey (arms crossed, navy shirt) ×3 | **Hero, About (primary)** |
| Doctor in navy scrubs — leaning on reception, by exam chair/equipment | Hero alt, About, Procedures |
| Surgical-instrument close-ups (stainless ENT/rhinoplasty trays) | Procedure detail imagery, texture |
| Consultation scenes with a model patient — exam with head-mirror/loupe + headlight, hand-mirror, clinical photography, 3D facial-simulation on screen | Procedures, Treatment-in-Cyprus, Booking |

> Consultation/portrait shots show an identifiable model's face → **confirm model release** (open question).

### 5b. Before/after — patient health data ⚠️ consent-gated
`wetransfer_before-and-after-zip_2026-10-30_0830/` → `Neuer Ordner/…` — ~10 patient case folders, **31 JPG** (2580×3224 or 2580×4586) + **3 patient phone clips** (`.MOV`, 720×1280, 10 s) in "Neuer Ordner 3". **All carry EXIF.**
- Treat as **health data**: use only files the doctor confirms **in writing** have patient consent for web use (see `open-questions.md`).
- Rules: strip all EXIF/metadata, neutral file names, procedure pages only behind the "Results vary…" note, **never `/de`**, never hero/ads/social.
- Case folders: `Neuer Ordner` (3), `Neuer Ordner/Neuer Ordner` (5), `…/Neuer Ordner 2` (4), `…3` (3 MOV clips), `…4` (1), `…5` (3), `…6` (3), `…6/Neuer Ordner 8` (3), `…7` (3), `…8` (3), `…9` (3).

### 5c. Procedure animations — 3D, third-party ⚠️ rights-gated
`…/before-and-after-zip…/animations/` — 3 professional 3D animations **"by 3DMedWorld"**:
| File | Dims | Length | Size |
|---|---|---|---|
| Διαφραγματοπλαστική και Καυτηρίαση Κογχών με Laser (Septoplasty + laser turbinate) | 1920×1080 | 102 s | 383 MB |
| Structural Rhinoplasty (PORTRAIT, vertical) | 1080×1920 | 85 s | 424 MB |
| Ρινοπλαστική — Αισθητική ή λειτουργική επέμβαση (Rhinoplasty) | 1920×1080 | 90 s | 285 MB |
- **Confirm web-usage rights from 3DMedWorld** (open question).
- Re-encode with ffmpeg (H.264 MP4 + WebM, ≤1080p, no audio unless needed), poster image each, host on **Sanity file CDN**, load on click/in-view, muted + `playsinline`. These are long (85–102 s) → consider trimming; report final sizes.

### 5d. Legacy WordPress attachments
76 attachments in the WXR export (old uploads). **Use only where the new 2026 sets don't cover a need** (per brief). `./legacy/files/` FTP folder is **not present** → only the old logo/brand assets that are missing must be recovered separately (open question).

---

## 6. Forms
- No active form plugin in the plugin list (no CF7/WPForms/Gravity). The contact page is Elementor; the current contact mechanism is unclear (likely Elementor form or plain `mailto:`/phone). → **Confirm current form + recipient** (open question). New site: server-action contact form (honeypot + rate limit) → clinic email or Netlify Forms, **no medical-history fields**.

---

## 7. Redirects
Because Greek keeps its unprefixed URLs and English keeps `/en/…` (with `trailingSlash: true`), **most URLs resolve unchanged and need no redirect.** `docs/redirects.csv` lists **only the URLs that actually change** (28 rows, each → its closest new page, none to the homepage):
- **Polylang `-2` / `-en` slug cleanups:** GR `septoplasty-2`, the three long FESS/laser/navigation GR slugs, GR blog `-2` slugs; EN `services-2`, `rhinoplasty-en`, `faq-2`, `european-…-center-2`, EN `home` → `/en/`, EN `posts` (empty) → `/en/blog/`.
- **Removed / merged pages:** before/after pages → `/{service index}` (GR `/services/`, EN `/en/services/`); `team/dr-papakostas/` → `/about-the-doctor/`; individual testimonials → about page (GR `/about-the-doctor/`, EN `/en/professional-profile/`).
- Recommend also adding a blanket `/wp-content/*`, `/wp-admin`, `/wp-login.php`, `/?p=*` handling at deploy (old media URLs 404 as images now come from Sanity).
