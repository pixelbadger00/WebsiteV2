/**
 * Populate the home-page section copy that used to be hard-coded in
 * messages/*.json so it becomes editable in Studio ("Αρχική σελίδα"):
 *   - Procedures eyebrow + "all procedures" link label
 *   - Articles section eyebrow + title
 *   - Treatment-in-Cyprus eyebrow + title + body + button label
 *
 * Values mirror the current messages so the live site is unchanged (the home
 * page falls back to messages when a field is empty — this just fills them in).
 *
 * Idempotent: patch/set on the `homePage` singleton, re-runnable. Writes ONLY
 * to a non-production dataset (asserts dataset !== "production").
 *
 * Usage:  pnpm seed:home-sections
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
    `Refusing to seed: target dataset is "${dataset || "unset"}". Use a non-production dataset.`,
  );
}
if (!token) {
  throw new Error("SANITY_API_WRITE_TOKEN is required to seed.");
}
if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required to seed.");
}

const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;

type Loc = { el: string; en: string; de: string };
const L = (el: string, en: string, de: string): Loc => ({ el, en, de });

// Mirrors messages/{el,en,de}.json (read 2026-11-23).
const fields: Record<string, Loc> = {
  proceduresEyebrow: L("Επεμβάσεις", "Procedures", "Eingriffe"),
  proceduresCtaLabel: L("Όλες οι επεμβάσεις", "All procedures", "Alle Eingriffe"),
  blogEyebrow: L("Ενημέρωση", "Updates", "Aktuelles"),
  blogTitle: L("Άρθρα και ειδήσεις", "Articles & news", "Artikel & Neuigkeiten"),
  treatmentEyebrow: L("Θεραπεία στην Κύπρο", "Treatment in Cyprus", "Behandlung in Zypern"),
  treatmentTitle: L(
    "Σχεδιάζοντας την επίσκεψή σας στη Λευκωσία",
    "Planning your visit to Nicosia",
    "Ihren Besuch in Nikosia planen",
  ),
  treatmentBody: L(
    "Ασθενείς επισκέπτονται το ιατρείο από όλη την Κύπρο, το Ηνωμένο Βασίλειο και τη Γερμανία. Οι συμβουλευτικές επισκέψεις και οι επεμβάσεις γίνονται στη Λευκωσία, στα ελληνικά, αγγλικά ή γερμανικά.",
    "Patients travel to the clinic from across Cyprus, the United Kingdom and Germany. Consultations and procedures take place in Nicosia, in Greek, English or German.",
    "Patientinnen und Patienten kommen aus ganz Zypern, dem Vereinigten Königreich und Deutschland. Beratung und Eingriffe finden in Nikosia statt, auf Griechisch, Englisch oder Deutsch.",
  ),
  treatmentCtaLabel: L("Σχεδιάστε την επίσκεψή σας", "Plan your visit", "Besuch planen"),
};

async function exists(id: string): Promise<boolean> {
  const res = await fetch(
    `${base}/data/query/${dataset}?query=${encodeURIComponent(`defined(*[_id=="${id}"][0]._id)`)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return (await res.json()).result === true;
}

async function patch(id: string): Promise<void> {
  const set: Record<string, Loc> = {};
  for (const [k, v] of Object.entries(fields)) {
    set[k] = v;
  }
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations: [{ patch: { id, set } }] }),
  });
  if (!res.ok) {
    throw new Error(`Patch ${id} failed: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  await patch("homePage");
  console.log(`Seeded ${Object.keys(fields).length} home-page section fields.`);
  if (await exists("drafts.homePage")) {
    await patch("drafts.homePage");
    console.log("Also patched drafts.homePage.");
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
