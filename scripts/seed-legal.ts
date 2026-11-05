/**
 * Seed the three legalPage singletons (privacy / cookies / imprint) with STUB
 * content. All copy here is placeholder pending legal review → REVIEW: copy.
 * It must be reviewed and completed by the client/lawyer before launch.
 *
 * Idempotent: stable _ids (legal.privacy / legal.cookies / legal.imprint) via
 * createOrReplace, re-runnable. Writes ONLY to a non-production dataset
 * (asserts dataset !== "production") with the MIGRATION-ONLY write token.
 *
 * Usage:  pnpm seed:legal
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

type Loc = { el?: string; en?: string; de?: string };

// Build localeBlockContent: each locale is an array of simple paragraph blocks.
function body(paras: Loc[]): Record<string, unknown> {
  const build = (locale: keyof Loc) =>
    paras
      .map((p, i) => {
        const text = p[locale];
        if (!text) {
          return null;
        }
        return {
          _type: "block",
          _key: `b${i}`,
          style: "normal",
          markDefs: [],
          children: [{ _type: "span", _key: `s${i}`, text, marks: [] }],
        };
      })
      .filter(Boolean);
  return { el: build("el"), en: build("en"), de: build("de") };
}

function slug(el: string, en: string, de: string): Record<string, unknown> {
  return {
    el: { _type: "slug", current: el },
    en: { _type: "slug", current: en },
    de: { _type: "slug", current: de },
  };
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

// REVIEW: copy — placeholder legal copy, pending legal review before launch.
const docs: Record<string, unknown>[] = [
  {
    _id: "legal.privacy",
    _type: "legalPage",
    kind: "privacy",
    title: { el: "Πολιτική Απορρήτου", en: "Privacy Policy", de: "Datenschutzerklärung" },
    slug: slug("privacy", "privacy", "datenschutz"),
    body: body([
      {
        el: "Προσωρινό κείμενο — η παρούσα πολιτική απορρήτου θα οριστικοποιηθεί μετά από νομικό έλεγχο πριν τη δημοσίευση.",
        en: "Placeholder — this privacy policy will be finalised following legal review before launch.",
        de: "Platzhalter — diese Datenschutzerklärung wird vor der Veröffentlichung nach rechtlicher Prüfung fertiggestellt.",
      },
      {
        el: "Θα περιγράφει ποια προσωπικά δεδομένα συλλέγει το ιατρείο (π.χ. στοιχεία φόρμας επικοινωνίας), τη νομική βάση, τον χρόνο διατήρησης και τα δικαιώματά σας βάσει του GDPR.",
        en: "It will describe what personal data the clinic collects (e.g. contact-form details), the legal basis, retention period, and your rights under the GDPR.",
        de: "Sie wird beschreiben, welche personenbezogenen Daten die Praxis erhebt (z. B. Angaben aus dem Kontaktformular), die Rechtsgrundlage, die Speicherdauer und Ihre Rechte nach der DSGVO.",
      },
      {
        el: "Μέσω αυτού του ιστότοπου δεν συλλέγεται ιατρικό ιστορικό.",
        en: "No medical history is collected through this website.",
        de: "Über diese Website wird keine Krankengeschichte erfasst.",
      },
    ]),
  },
  {
    _id: "legal.cookies",
    _type: "legalPage",
    kind: "cookies",
    title: { el: "Πολιτική Cookies", en: "Cookie Policy", de: "Cookie-Richtlinie" },
    slug: slug("cookies", "cookies", "cookie-richtlinie"),
    body: body([
      {
        el: "Προσωρινό κείμενο — η παρούσα πολιτική cookies θα οριστικοποιηθεί πριν τη δημοσίευση.",
        en: "Placeholder — this cookie policy will be finalised before launch.",
        de: "Platzhalter — diese Cookie-Richtlinie wird vor der Veröffentlichung fertiggestellt.",
      },
      {
        el: "Τα cookies ανάλυσης και marketing φορτώνονται μόνο μετά από συγκατάθεση (Consent Mode v2).",
        en: "Analytics and marketing cookies load only after consent (Consent Mode v2).",
        de: "Analyse- und Marketing-Cookies werden erst nach Einwilligung geladen (Consent Mode v2).",
      },
    ]),
  },
  {
    _id: "legal.imprint",
    _type: "legalPage",
    kind: "imprint",
    title: { el: "Στοιχεία ιατρείου", en: "Imprint", de: "Impressum" },
    slug: slug("imprint", "imprint", "impressum"),
    body: body([
      {
        el: "Προσωρινό κείμενο — τα στοιχεία θα οριστικοποιηθούν μετά από νομικό έλεγχο.",
        en: "Placeholder imprint — details to be finalised after legal review.",
        de: "Platzhalter-Impressum — Angaben werden nach rechtlicher Prüfung fertiggestellt.",
      },
      {
        el: "Δρ. Πάρις Παπακώστας, Λόρδου Βύρωνος 2, 1096 Λευκωσία, Κύπρος.",
        en: "Dr Paris Papakostas, Lordou Vyronos 2, 1096 Nicosia, Cyprus.",
        de: "Dr Paris Papakostas, Lordou Vyronos 2, 1096 Nikosia, Zypern.",
      },
      {
        el: "Υπεύθυνος περιεχομένου, αριθμός εγγραφής και στοιχεία ΦΠΑ: υπό επιβεβαίωση.",
        en: "Responsible for content, professional registration number and VAT details: to be confirmed.",
        de: "Verantwortlich für den Inhalt, Berufsregisternummer und USt-Angaben: wird bestätigt.",
      },
    ]),
  },
];

async function main(): Promise<void> {
  await mutate(docs.map((doc) => ({ createOrReplace: doc })));
  console.log(`✓ Seeded ${docs.length} legalPage stubs into "${dataset}" (REVIEW: copy).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
