/**
 * Doctor feedback (2026-11-16) — update the English clinic address to include
 * the office number + "Lefkosia", matching the Google Maps place query.
 * EL address left unchanged (only the EN string was specified). Non-prod.
 *
 * Usage: node --env-file=.env.local --import tsx scripts/set-clinic-address.ts
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

async function main(): Promise<void> {
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      mutations: [
        {
          patch: {
            id: "siteSettings",
            set: {
              "address.en": "Lordou Vyronos 2-Γραφείο 001, Nicosia, Lefkosia 1096, Cyprus",
            },
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ siteSettings.address.en updated in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
