/**
 * Two small home-copy fixes (dev dataset, idempotent):
 *  1. trustBadge b2 → institution-led wording. The "Training" credential now
 *     carries a category label in the UI, so the value no longer needs the
 *     "Trained in…" verb (removes the label/value echo). Fact unchanged.
 *  2. closingCtaBody → remove the em dash (project copy rule).
 * REVIEW: copy.
 *
 * Usage:  pnpm polish:home-copy
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

const badge2 = {
  el: "Charité & Helios Βερολίνο, Γερμανία",
  en: "Charité & Helios Berlin, Germany",
  de: "Charité & Helios Berlin, Deutschland",
};
const closingCtaBody = {
  el: "Κλείστε ραντεβού στο ιατρείο της Λευκωσίας, στα ελληνικά, αγγλικά ή γερμανικά. Δεν συλλέγουμε ιατρικό ιστορικό online, παρά μόνο όσα χρειάζονται για το ραντεβού σας.",
  en: "Book a consultation at the Nicosia clinic, in Greek, English or German. No medical history is collected online; only what we need to arrange your visit.",
  de: "Vereinbaren Sie einen Beratungstermin in der Praxis in Nikosia, auf Griechisch, Englisch oder Deutsch. Online erfragen wir keine Krankengeschichte, sondern nur das Nötigste für Ihren Termin.",
};

async function main(): Promise<void> {
  const mutations = [
    {
      patch: {
        id: "homePage",
        set: {
          'trustBadges[_key=="b2"].el': badge2.el,
          'trustBadges[_key=="b2"].en': badge2.en,
          'trustBadges[_key=="b2"].de': badge2.de,
          "closingCtaBody.el": closingCtaBody.el,
          "closingCtaBody.en": closingCtaBody.en,
          "closingCtaBody.de": closingCtaBody.de,
        },
      },
    },
  ];
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Updated trustBadge b2 + closingCtaBody (el/en/de) in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
