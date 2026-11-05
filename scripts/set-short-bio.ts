/**
 * Populate the doctor's short bio (intro lead on /about-the-doctor). Faithful to
 * the full bio; no invented facts. Non-prod, idempotent. REVIEW: copy.
 *
 * Usage:  pnpm set:short-bio
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-02";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dataset =
  process.env.SANITY_MIGRATION_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "";

if (dataset === "production" || dataset === "") {
  throw new Error(`Refusing: dataset "${dataset || "unset"}" must be non-production.`);
}
if (!token || !projectId) {
  throw new Error("SANITY_API_WRITE_TOKEN and NEXT_PUBLIC_SANITY_PROJECT_ID are required.");
}
const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;

const shortBio = {
  _type: "localeText",
  en: "An Otorhinolaryngologist with board-certified expertise in facial plastic surgery, focusing on rhinoplasty and nasal surgery. Trained in leading teaching hospitals in Germany, now practising at a private clinic in Nicosia, Cyprus.",
  el: "Ωτορινολαρυγγολόγος με πιστοποιημένη εξειδίκευση στην πλαστική χειρουργική προσώπου, με έμφαση στη ρινοπλαστική και τη ρινοχειρουργική. Εκπαιδευμένος σε κορυφαία πανεπιστημιακά νοσοκομεία της Γερμανίας, με ιδιωτικό ιατρείο στη Λευκωσία, Κύπρος.",
  de: "HNO-Arzt mit zertifizierter Expertise in der plastischen Gesichtschirurgie, mit Schwerpunkt auf Rhinoplastik und Nasenchirurgie. Ausgebildet an führenden Universitätskliniken in Deutschland, mit Praxis in Nikosia, Zypern.",
};

async function main(): Promise<void> {
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      mutations: [{ patch: { id: "doctor.paris-papakostas", set: { shortBio } } }],
    }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Set doctor.shortBio (el/en/de) in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
