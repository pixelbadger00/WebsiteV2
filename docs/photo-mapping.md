# Photo mapping proposal — 80 office photos → pages

Proposal only. **Nothing is written to Sanity until you approve this.** Images
are referenced by the index `#N` shown on the contact sheets (sheet-1…4) and the
grouped proposal sheet (`photo-map.png`), all in `/tmp/dpp-screens/`. `★` = main
image for the page; the rest are supporting.

## Compliance filter applied (important)
Of the 80 photos, **~34 show the female patient/model** (examination, hand-mirror,
standing portraits, and on-screen facial imaging that reads as **before/after /
simulation**: #41–44, #46–55, #57–65, #68–79). These are **excluded from this
proposal** because:
- **model release** is an open question (open-questions),
- the **on-screen before/after facial comparisons** fall under the before/after
  rules (never in hero/ads/social, **never on `/de`**, consent required).

So the proposal uses **only consent-safe photos**: doctor solo (portraits,
scrubs, at-desk, in empty exam rooms), empty clinic interiors, instrument
close-ups, branding/signage, and the Nicosia building exterior. When releases
exist, the patient/consultation set can be reviewed for About/Treatment.

## Proposed mapping (main ★ + supporting)
| Page | Main ★ | Supporting | Rationale |
|---|---|---|---|
| Home — hero | **#3** | #21, #22 (alt) | Premium reception interior with space for the H1. Alt: doctor in scrubs. |
| Home — about block | **#18** | — | Clean headshot portrait. |
| About — doctor | **#19** | #13, #22, #67 | Portrait lead; at-desk, scrubs, working for the body. |
| Rhinoplasty | **#25** | #29, #33 | Doctor (scrubs) in exam room + instrument close-ups. |
| Septoplasty | **#26** | #30, #37 | " |
| FESS | **#27** | #31, #38, #10 | " + equipment room. |
| Laser turbinate reduction | **#28** | #32, #39 | " |
| Navigation in FESS | **#11** | #35, #40, #10 | Equipment-rich exam room + instruments. |
| Post · Chronic sinusitis | **#10** | #31 | Consultation room + instruments. |
| Post · Deviated nasal septum | **#11** | #33 | Exam room + instruments. |
| Post · European Rhinoplasty Masterclass | **#22** | #2, #56 | Training/professional → doctor + branding. |
| Post · Inferior turbinate hypertrophy | **#9** | #32 | Exam room + instruments. |
| Post · Rhinoplasty surgery techniques | **#29** | #36, #16 | Technical → instruments + doctor. |
| Post · Ρινικό Διάφραγμα (riniko, EL-only) | **#30** | — | Instruments. Hidden on `/en`. |
| Treatment in Cyprus | **#4** | #45, #6, #3 | Clinic interior + **Nicosia building signage** (location) + reception. |

Supporting images are for later editorial use (section figures, galleries) in
Steps 2–5; each page gets its hero/card image from the main `★`.

## After approval — write plan
A script (`scripts/assign-photos.ts`, write token, asserts non-prod dataset)
will, idempotently:
1. Set each procedure/post/page/doctor/homePage **main image** to the mapped
   asset reference (hero/cover/portrait fields).
2. Set **hotspots** on the hero (home) and portrait (About + home-about) images:
   portraits focus on the face (~x 0.5, y 0.33); the hero interior centres on the
   focal third. Supporting images are stored in a gallery field (added in a later
   step) or left for manual placement.
3. Print a confirmation table; re-runnable (stable refs).

Tell me to proceed (or adjust any `★`), and I'll run the write + hotspots.
