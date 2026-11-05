/**
 * Seed the `homePage` singleton with the editorial copy that previously lived in
 * messages/*.json (Fix: home copy moves to Sanity; messages keep only UI strings).
 *
 * Idempotent: stable _id "homePage" via createOrReplace, re-runnable. Writes ONLY
 * to a non-production dataset (asserts dataset !== "production"), using the
 * MIGRATION-ONLY write token — the site/build never use this token.
 *
 * Usage:  pnpm seed:home     (node --env-file=.env.local scripts/seed-home.ts)
 *
 * All copy below is newly composed marketing copy → REVIEW: copy.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-02";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dataset =
  process.env.SANITY_MIGRATION_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "";

if (dataset === "production" || dataset === "") {
  throw new Error(
    `Refusing to seed: target dataset is "${dataset || "unset"}". Use a non-production dataset (e.g. development).`,
  );
}
if (!token) {
  throw new Error("SANITY_API_WRITE_TOKEN is required to seed (migration-only token).");
}
if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required to seed.");
}

const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;

type Loc = { _type?: "localeString"; el?: string; en?: string; de?: string };
const loc = (el: string, en: string, de: string): Loc => ({ el, en, de });
const badge = (el: string, en: string, de: string, key: string): Loc => ({
  _type: "localeString",
  _key: key,
  el,
  en,
  de,
} as Loc & { _key: string });

// Hero photo to use until the client assigns a dedicated hero in Studio.
const HERO_FILENAME = "Paris papacostas new office 2026-30.jpg";

async function query<T>(groq: string): Promise<T> {
  const res = await fetch(
    `${base}/data/query/${dataset}?query=${encodeURIComponent(groq)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    throw new Error(`query failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).result as T;
}

async function mutate(mutations: Record<string, unknown>[]): Promise<void> {
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
}

async function main(): Promise<void> {
  // Resolve the hero asset id by original filename (uploaded during migration).
  const assetId = await query<string | null>(
    `*[_type=="sanity.imageAsset" && originalFilename==${JSON.stringify(HERO_FILENAME)}][0]._id`,
  );
  if (!assetId) {
    console.warn(`⚠ hero asset "${HERO_FILENAME}" not found — seeding without heroImage.`);
  }

  // REVIEW: copy — all strings below are newly composed marketing copy.
  const doc: Record<string, unknown> = {
    _id: "homePage",
    _type: "homePage",
    ...(assetId
      ? {
          heroImage: {
            _type: "image",
            asset: { _type: "reference", _ref: assetId },
            // Hotspot drives the hero cover-crop focal point (no object-position in code).
            hotspot: { _type: "sanity.imageHotspot", x: 0.35, y: 0.32, height: 0.8, width: 0.8 },
          },
        }
      : {}),
    heroEyebrow: loc(
      "Ρινοπλαστική · Χειρουργική Μύτης & Παραρρινίων · Λευκωσία, Κύπρος",
      "Rhinoplasty · Nose & Sinus Surgery · Nicosia, Cyprus",
      "Rhinoplastik · Nasen- & Nebenhöhlenchirurgie · Nikosia, Zypern",
    ),
    heroTitle: loc(
      "Εξειδικευμένη φροντίδα για τη μύτη που αναπνέετε και ζείτε.",
      "Specialist care for the nose you breathe and live with.",
      "Für Ästhetik, Atmung und Nasengröße.",
    ),
    heroLead: loc(
      "ΩΡΛ χειρουργός εκπαιδευμένος στη Γερμανία, που συνδυάζει τη λειτουργική ρινοχειρουργική με την πλαστική χειρουργική προσώπου σε ιδιωτικό ιατρείο στη Λευκωσία.",
      "German-trained ENT surgeon combining functional nasal surgery and facial-plastic expertise at a private clinic in Nicosia, Cyprus.",
      "In Deutschland ausgebildeter HNO-Chirurg, der funktionelle Nasenchirurgie mit ästhetischer Gesichtschirurgie in einer Praxis in Nikosia, Zypern verbindet.",
    ),
    trustBadges: [
      badge("MD, Πανεπιστήμιο Πατρών", "MD, University of Patras", "MD, Universität Patras", "b1"),
      badge(
        "Εκπαίδευση στη Γερμανία (Charité, Helios Βερολίνο)",
        "Trained in Germany (Charité, Helios Berlin)",
        "Facharztausbildung in Deutschland (Charité, Helios Berlin)",
        "b2",
      ),
      badge(
        "Πλαστική προσώπου & νευροωτολογία",
        "Facial plastic surgery & neurotology",
        "Gesichtsplastische Chirurgie & Neurotologie",
        "b3",
      ),
      badge("Λευκωσία, Κύπρος", "Nicosia, Cyprus", "Nikosia, Zypern", "b4"),
    ],
    proceduresTitle: loc(
      "Με επίκεντρο τη μύτη — λειτουργία και αισθητική.",
      "Focused on the nose — function and form.",
      "Im Fokus: die Nase — Funktion und Ästhetik.",
    ),
    proceduresIntro: loc(
      "Κάθε επέμβαση απαιτεί συμβουλευτική επίσκεψη. Κάθε χειρουργείο έχει κινδύνους και χρόνο ανάρρωσης· οι επιλογές σας εξηγούνται πλήρως πριν από κάθε απόφαση.",
      "Every procedure requires an in-person consultation. All surgery carries risks and needs recovery time; your options are explained in full before any decision.",
      "Jeder Eingriff erfordert eine persönliche Beratung. Jede Operation birgt Risiken und benötigt Erholungszeit; Ihre Möglichkeiten werden vor jeder Entscheidung ausführlich erklärt.",
    ),
    proceduresCtaLabel: loc("Δείτε τις επεμβάσεις", "Explore procedures", "Eingriffe ansehen"),
    aboutEyebrow: loc("Ο γιατρός", "About the doctor", "Der Arzt"),
    aboutCtaLabel: loc(
      "Διαβάστε το πλήρες βιογραφικό",
      "Read the full profile",
      "Vollständiges Profil lesen",
    ),
    reviewsEyebrow: loc("Με τα λόγια τους", "In their words", "Stimmen"),
    reviewsTitle: loc(
      "Ασθενείς από την Κύπρο και το εξωτερικό",
      "Patients from Cyprus and abroad",
      "Patientinnen und Patienten aus Zypern und dem Ausland",
    ),
    closingCtaTitle: loc("Έτοιμοι να το συζητήσουμε;", "Ready to talk it through?", "Bereit für ein Gespräch?"),
    closingCtaBody: loc(
      "Κλείστε ραντεβού στο ιατρείο της Λευκωσίας, στα ελληνικά, αγγλικά ή γερμανικά. Δεν συλλέγουμε ιατρικό ιστορικό online — μόνο όσα χρειάζονται για το ραντεβού σας.",
      "Book a consultation at the Nicosia clinic, in Greek, English or German. No medical history is collected online — only what we need to arrange your visit.",
      "Vereinbaren Sie einen Beratungstermin in der Praxis in Nikosia — auf Griechisch, Englisch oder Deutsch. Online erfragen wir keine Krankengeschichte, sondern nur das Nötigste für Ihren Termin.",
    ),
  };

  await mutate([{ createOrReplace: doc }]);
  console.log(`✓ Seeded homePage into "${dataset}"${assetId ? " (with hero image)" : ""}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
