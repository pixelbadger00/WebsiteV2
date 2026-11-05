/**
 * Replace the home hero headline (homePage.heroTitle) with a sharper,
 * on-topic line: functional + aesthetic nose surgery by a specialist ENT.
 * Non-prod guarded, idempotent (createOrReplace-style set). REVIEW: copy.
 *
 * Usage:  node --env-file=.env.local --import tsx scripts/set-hero-title.ts
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

// REVIEW: copy — new hero headline, pending sign-off.
const heroTitle = {
  _type: "localeString",
  el: "Λειτουργική και αισθητική χειρουργική μύτης, από εξειδικευμένο ΩΡΛ χειρουργό.",
  en: "Functional and aesthetic nose surgery, by a specialist ENT surgeon.",
  de: "Funktionelle und ästhetische Nasenchirurgie, von einem Facharzt für HNO.",
};

async function main(): Promise<void> {
  const mutations = [{ patch: { id: "homePage", set: { heroTitle } } }];
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ heroTitle updated (el/en/de) in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
