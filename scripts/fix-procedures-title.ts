/**
 * Replace the em dash in homePage.proceduresTitle (el/en/de) — it violated the
 * project's no-em-dash copy rule. Idempotent (set to fixed strings), non-prod only.
 *
 * Usage:  node --env-file=.env.local node_modules/.bin/tsx scripts/fix-procedures-title.ts
 *   (or add an alias in package.json)
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

// REVIEW: copy — em dash removed per project copy rule; wording unchanged in meaning.
const proceduresTitle = {
  el: "Με επίκεντρο τη μύτη: λειτουργία και αισθητική.",
  en: "Focused on the nose: function and form.",
  de: "Die Nase im Fokus: Funktion und Ästhetik.",
};

async function main(): Promise<void> {
  const mutations = [
    {
      patch: {
        id: "homePage",
        set: {
          "proceduresTitle.el": proceduresTitle.el,
          "proceduresTitle.en": proceduresTitle.en,
          "proceduresTitle.de": proceduresTitle.de,
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
  console.log(`✓ Updated homePage.proceduresTitle (el/en/de) in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
