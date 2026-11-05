/**
 * Doctor timeline tidy-up (dev dataset, idempotent):
 *  - remove the "Returned to Cyprus" (t3) milestone
 *  - make `year` localized and set the private-clinic entry to an ongoing range
 *    (2018–present / 2018–σήμερα / 2018–heute)
 *  - convert the other years to localeString so pick() works per locale
 * REVIEW: copy.
 *
 * Usage:  pnpm fix:timeline
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
const id = "doctor.paris-papakostas";
const L = (el: string, en: string, de: string) => ({ _type: "localeString", el, en, de });

async function main(): Promise<void> {
  const mutations = [
    {
      patch: {
        id,
        set: {
          'timeline[_key=="t1"].year': L("2007", "2007", "2007"),
          'timeline[_key=="t2"].year': L("2009–2017", "2009–2017", "2009–2017"),
          'timeline[_key=="t4"].year': L("2018–σήμερα", "2018–present", "2018–heute"),
        },
      },
    },
    { patch: { id, unset: ['timeline[_key=="t3"]'] } },
  ];
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Timeline updated (removed t3, localized years) in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
