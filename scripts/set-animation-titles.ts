/**
 * Doctor feedback (requiredChanged.docx, 2026-11-16), items 11 / 16 / 18 —
 * replace the "3D simulation" video label with the doctor's exact per-procedure
 * caption: "Επέμβαση <procedure> σε τρισδιάστατη απεικόνιση". Sets the (now
 * localeString) `title` on every animation of each procedure, by _key, so the
 * video files / posters are untouched. Non-prod, idempotent. REVIEW: copy.
 *
 * Usage: node --env-file=.env.local --import tsx scripts/set-animation-titles.ts
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

type LocaleString = { _type: "localeString"; el: string; en: string; de: string };
const ls = (el: string, en: string, de: string): LocaleString => ({ _type: "localeString", el, en, de });

const LABELS: Record<string, LocaleString> = {
  "procedure.rhinoplasty": ls(
    "Επέμβαση διαφραγματορινοπλαστικής σε τρισδιάστατη απεικόνιση",
    "Septorhinoplasty in 3D imaging",
    "Septorhinoplastik in 3D-Darstellung",
  ),
  "procedure.septoplasty": ls(
    "Επέμβαση διαφραγματοπλαστικής σε τρισδιάστατη απεικόνιση",
    "Septoplasty in 3D imaging",
    "Septumplastik in 3D-Darstellung",
  ),
  "procedure.laser-reduction-of-the-inferior-nasal-turbinates": ls(
    "Καυτηρίαση ρινικών κόγχων σε τρισδιάστατη απεικόνιση",
    "Turbinate cauterisation in 3D imaging",
    "Muschelkaustik in 3D-Darstellung",
  ),
};

async function query<T>(groq: string): Promise<T> {
  const res = await fetch(`${base}/data/query/${dataset}?query=${encodeURIComponent(groq)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return ((await res.json()) as { result: T }).result;
}

async function main(): Promise<void> {
  const ids = Object.keys(LABELS);
  const procs = await query<Array<{ _id: string; keys: string[] }>>(
    `*[_id in ${JSON.stringify(ids)}]{_id, "keys": animations[]._key}`,
  );

  const mutations: unknown[] = [];
  let count = 0;
  for (const proc of procs ?? []) {
    const label = LABELS[proc._id];
    for (const key of proc.keys ?? []) {
      if (!key) {
        continue;
      }
      mutations.push({
        patch: { id: proc._id, set: { [`animations[_key=="${key}"].title`]: label } },
      });
      count++;
    }
  }

  if (mutations.length === 0) {
    console.log("⚠ No animations found to label. (Are the video clips attached?)");
    return;
  }

  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Set per-procedure 3D-imaging video labels on ${count} animation(s) in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
