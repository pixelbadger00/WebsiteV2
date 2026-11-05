# Design audit — drparispapakostas.com

Senior brand/UI review against the standard of premium private-clinic and
surgeon sites. Screenshots captured at 1440px and 390px (dev server, EN locale)
for home, services, procedure (Rhinoplasty), about, FAQ, blog index, blog post,
Treatment in Cyprus, contact, book. Skills used: **frontend-design** +
**impeccable** (SKILL.md design laws). No code changed in this step.

> The small dark "N" disc on the left edge of every screenshot is the Next.js
> dev-mode indicator, not part of the design.

## Verdict in one line
The **foundations are good** (Literata/Inter, calm teal-slate palette, clean
footer, solid contact form, real doctor portrait) but the site currently reads
as a **tasteful wireframe, not a premium clinic**: empty image placeholders
dominate, the richest trust content is buried as flat text, English pages leak
Greek, and every page is the same card grid. It is quiet — but not yet
confident, editorial, or distinctive.

---

## Top 10 problems, ranked by impact

### 1. Empty image placeholders everywhere → the site looks unfinished
Home "Procedures", the services index, the procedure hero, blog covers and the
Treatment grid all render **blank grey boxes with a small arc glyph**. The 80
office photos are in Sanity but **not assigned** to procedures/posts, so
`ImageBox` shows its placeholder. This single issue undercuts all the good
typography — a premium clinic is carried by photography.
**Fix:** assign real clinical/office photography to each procedure and post in
Sanity (content task); design one consistent image treatment (fixed crop,
subtle duotone toward the brand, soft corner only where it earns one). Where a
procedure truly has no photo, use an **intentional typographic/figure treatment**
(large numeral, procedure name set large on a tinted field) — never a grey box.

### 2. About page: "Dr. Dr Paris Papakostas" bug + the best trust content is buried
The H1 renders **"Dr. Dr Paris Papakostas"** — the per-locale `titlePrefix`
("Dr.") is prepended to a name that already begins with "Dr". And the page holds
the strongest material on the whole site — German training (Charité, Helios),
a **PhD from Charité**, board certifications, a full career timeline, memberships,
**"5000 rhinoplasty procedures"** — all dumped as an undifferentiated text wall
with bold-paragraph pseudo-headings and a broken-looking bulleted link list.
**Fix:** (a) fix the prefix logic (don't prepend when the name already starts
with it). (b) Move the rich bio into **structured Sanity fields** (credentials[],
memberships[], a dated timeline, headline stats) and build a real
**credentials + career-timeline section** with a hero stat band
("German-trained · PhD, Charité · 5,000+ nasal procedures"). This is the single
biggest brand-trust win.

### 3. Greek text leaks onto the English site
Procedure summaries (home, services, treatment, procedure hero) and a blog
excerpt render **in Greek on `/en`** because the English field is empty and the
code falls back to `el`. For the UK/German target audiences this reads as broken.
**Fix:** supply the missing EN (and later DE) translations (content); until then,
prefer an empty/short state over showing the wrong language for summaries and
excerpts. Flagged as a content blocker below.

### 4. Every page is the same card grid → templated, monotonous
Home, services, treatment and blog all use the **identical 3-up card grid** with
one border-radius and the same soft grey shadow (an impeccable "identical card
grids" ban; a frontend-design default tell).
**Fix:** vary layout per page — editorial asymmetry, one **featured** procedure
with a large image beside a quiet list, alternating image/text rows, generous
and *varied* vertical rhythm. Let each page have its own structure.

### 5. Long-form pages are walls of text with no hierarchy or imagery
The Rhinoplasty body and the About bio are dense paragraphs where section titles
are just **bold inline text** ("Septorhinoplasty", "Primary Rhinoplasty",
"Career", "Subspecialties"), with no figures, pull quotes, measured measure, or
in-page navigation. The procedure hero image is an empty box.
**Fix:** true `h2/h3` hierarchy, 65–75ch measure, figures/pull-quotes breaking
the text, an in-page section nav (sticky on desktop) for long procedure pages,
and the FAQ accordion surfaced on the procedure itself.

### 6. No testimonials, thin on-page proof
Testimonials are consent-gated and **none are approved**, so there is zero social
proof anywhere. Premium clinics lead with proof.
**Fix:** approve/collect consented testimonials (content); add a trust band
(German training, board certifications, procedure count, hospital names as text
marks) and place credentials near the primary CTAs.

### 7. The hero is the weakest first impression it could be
The hero photo is an **empty office** (desk + plant, no people); the H1 wraps
awkwardly ("…breathe and live / with."); trust badges are tiny and joined with
middle dots ("A · B · C" — a flagged tell); the two CTAs sit at equal weight.
**Fix:** a stronger hero image (the doctor, or an intentional clinical/architectural
frame), confident H1 typesetting with a controlled wrap and refined scale, a clean
trust **row** (not ·-chained), and clear primary/secondary CTA hierarchy. (Hero
H1 + image must stay first-paint for LCP — no entrance fade on them.)

### 8. "Treatment in Cyprus" is mostly "to be confirmed" + empty cards
A key SEO/conversion page opens with the literal text **"to be confirmed"** under
the H1, then the same empty procedure grid, then address + "to be confirmed"
hours. It looks unfinished.
**Fix:** real editorial content (why Cyprus, what to expect, the journey — client
copy or `REVIEW: copy`), a proper hero, a **static map image** of the clinic, a
refined procedures list (not empty cards), and clear next steps.

### 9. AI-slop typographic tells throughout
ALL-CAPS tracked eyebrows everywhere ("ABOUT THE DOCTOR", "RHINOPLASTY", "CALL",
"WHATSAPP"); middle-dot meta strings; a "→" appended to most links; em dashes in
copy; one radius + one shadow on every card. These are exactly the generated-page
tells both skills call out.
**Fix:** eyebrows as small-caps or a quiet colored label (not tracked all-caps);
drop the ·-chains; remove trailing arrows (or make them a hover-only affordance);
replace em dashes with commas/colons; vary radius and elevation by hierarchy.

### 10. Interactive + edge states are flat; FAQ is one 26-row wall
Hover/focus/active states are minimal; the FAQ is **26 identical accordion rows**
with no grouping or intro, and a few rows are parse artifacts, not questions
("General Anesthesia", "Modern medicine offers tools… :"). Blog/empty/loading
states are plain.
**Fix:** refined states (card lift + image scale on hover, button press, animated
link underline, brand-colored focus ring); **group the FAQ** into categories
(candidacy, surgery, anaesthesia, recovery, results) with a short intro and clean
up the mis-parsed rows; give empty/loading states intent.

---

## Compliance flags found during the audit (for the medical-copy review)
These are the doctor's existing migrated copy, not changes I would make silently:
- FAQ/Rhinoplasty copy uses **"painless"** ("impressively painless", "pain is
  practically absent") and **"safe … informed decisions"** — the brief bans
  "safe/painless/guaranteed/risk-free". Flag for his review/rewording.
- Rhinoplasty body says **"Browse through before-and-after photos of real
  patients"** — no before/after is actually shown, but the sentence invites it;
  reword (and it must never appear on `/de`).
Consultation/risks/recovery notes and the Cyprus location are present and clear.

## Compliance copy rewrites (REVIEW: copy — pending the doctor's sign-off)
Proposed compliant rewording of the flagged migrated phrases (no "safe /
painless / guaranteed / risk-free"; no before/after invitation; these will be
written to the Sanity bodies in the content pass, each marked `REVIEW: copy`):
- **"impressively painless" / "pain is practically absent"** (Rhinoplasty body;
  FAQ "Is rhinoplasty painful?") → *"Most patients report only mild discomfort in
  the first few days, well managed with simple pain relief. Experiences vary, and
  every procedure is discussed at consultation."*
- **"safe and informed decisions"** (FAQ closing line) → *"tools that help
  patients make well-informed decisions together with their surgeon."*
- **"Browse through before-and-after photos of real patients…"** (Rhinoplasty
  body) → remove the sentence; replace with *"Your options and realistic
  expectations are discussed in person at consultation."* (No before/after is
  shown; never on `/de`.)
All three keep the required consultation / risks / recovery framing and the
Cyprus location.

## Content blockers (design can't fully land without these)
1. **Photos** assigned to procedures + posts in Sanity (biggest lever).
2. **EN/DE translations** for procedure summaries, bodies and post excerpts.
3. **Consented testimonials** to enable the proof sections.
4. **Structured About data** (credentials, memberships, timeline, stat) so the
   credentials section isn't buried in prose. Fix the double-"Dr" prefix in code.
5. Treatment-in-Cyprus editorial copy + a static map image.

---

## Motion plan (subtle, purposeful, perf-safe)

**Mechanism.** One pair of small client wrappers, pages stay Server Components:
- `<Reveal>` — fade + slide-up (16–20px, ~0.5s, ease-out-quint), `whileInView`,
  `once: true`. For secondary section content only.
- `<Stagger>` — same, for grid/list children (60–80ms step).
Built on **Motion** (`motion/react`) with **LazyMotion + `domAnimation` + the
`m` component** to keep the bundle small. `<MotionConfig reducedMotion="user">`
at the root; each wrapper also checks `useReducedMotion` → renders instant, no
transform, under prefers-reduced-motion.

**What animates**
- Section headings, text blocks, cards, and non-hero images: reveal on scroll.
- Card grids: staggered reveal; **hover** = 2–4px lift + image scale 1.03 +
  border/shadow shift (transform/opacity only).
- Non-hero images: gentle scale 1.04 → 1 with opacity on first in-view.
- Menu open/close: smooth slide + fade (keep the existing focus trap/Esc).
- Accordions (FAQ + procedure FAQ): height expand/collapse + chevron rotate
  (contained, not page-level layout shift).
- Buttons: subtle press/tint; links: underline grows from the start on hover.

**What never animates**
- **Hero H1 and hero image** — they are the LCP; visible on first paint, never
  start at opacity 0. At most, the hero's trust row/CTAs get a tiny delayed fade.
- No parallax on mobile, no scroll-jacking, no autoplay. Animate only transform
  and opacity. CLS must stay < 0.05.

**Page transitions:** only a near-free crossfade, and only if it costs nothing in
JS/perf — otherwise skipped. Decided during implementation.

**JS cost:** LazyMotion + `domAnimation` with `m` is the small Motion footprint
(~15–20 KB gz feature bundle, well inside the ~150 KB first-load ceiling). Exact
number reported after install, in step 1.

---

## Suggested implementation order (each step stops for review)
1. **Foundations** — tokens/type scale, buttons/links, section spacing, eyebrows,
   header/footer polish, the `<Reveal>`/`<Stagger>` motion wrappers + MotionConfig.
2. **Home** — hero, varied sections, trust band, real photos, reveals.
3. **Procedure + services** — editorial long-form, in-page nav, featured layout.
4. **About + FAQ + Treatment** — credentials/timeline, grouped FAQ, real Treatment.
5. **Blog, contact, book, legal, 404** — states, warmth, consistency.
