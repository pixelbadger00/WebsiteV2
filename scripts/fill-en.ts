/**
 * Fill missing English translations drafted faithfully from the Greek source
 * (nothing invented). All strings below are REVIEW: copy — pending the doctor's
 * sign-off. Idempotent (patch/set), writes ONLY to a non-production dataset.
 *
 * Usage:  pnpm fill:en
 *
 * Policy: the site never shows Greek on /en (see pick() in i18n-content.ts); a
 * Greek-only field with no translation is hidden. This script fills the fields
 * that were otherwise hidden on /en.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-02";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dataset =
  process.env.SANITY_MIGRATION_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "";

if (dataset === "production" || dataset === "") {
  throw new Error(`Refusing: dataset "${dataset || "unset"}" must be non-production.`);
}
if (!token || !projectId) {
  throw new Error("SANITY_API_WRITE_TOKEN and NEXT_PUBLIC_SANITY_PROJECT_ID are required.");
}

const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;

// REVIEW: copy — English drafted faithfully from the migrated Greek.
const patches = [
  {
    id: "procedure.rhinoplasty",
    set: {
      "summary.en":
        "The procedure corrects both the nasal septum, the nose's key supporting structure, and the external structures of the nose, achieving both an ideal shape and optimal nasal breathing.",
    },
  },
  {
    id: "post.deviated-nasal-septum",
    set: {
      "excerpt.en":
        "A deviated nasal septum causes one-sided or even bilateral difficulty with nasal breathing. Septoplasty is performed for purely functional reasons, to improve nasal breathing and the patient's quality of life.",
    },
  },
];

async function main(): Promise<void> {
  const mutations = patches.map((p) => ({ patch: { id: p.id, set: p.set } }));
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Filled ${patches.length} EN fields in "${dataset}" (REVIEW: copy).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
