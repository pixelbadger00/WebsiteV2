/**
 * Set consentToDisplay = true on the migrated testimonials so the reviews
 * section renders. These are the patient / Google reviews that were already
 * PUBLICLY DISPLAYED (with names) on the original live drparispapakostas.com,
 * so re-showing them is continuity, not new exposure.
 *
 * ⚠️ CONSENT DECISION (open-questions #13): the client owns this. To hide a
 * specific review again, set its consentToDisplay back to false in Studio.
 * Non-production dataset only; idempotent.
 *
 * Usage:  pnpm enable:testimonials
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

async function q<T>(query: string): Promise<T> {
  const r = await fetch(`${base}/data/query/${dataset}?query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (await r.json()).result as T;
}

async function main(): Promise<void> {
  const ids = await q<{ _id: string }[]>(`*[_type=="testimonial"]{_id}`);
  if (ids.length === 0) {
    throw new Error("No testimonials found.");
  }
  const mutations = ids.map((t) => ({
    patch: { id: t._id, set: { consentToDisplay: true } },
  }));
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ consentToDisplay=true on ${ids.length} testimonials in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
