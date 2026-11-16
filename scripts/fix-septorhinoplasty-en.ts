/**
 * Doctor feedback (requiredChanged.docx, 2026-11-16), item 37 — replace the
 * first sentence of the Septorhinoplasty paragraph (Rhinoplasty body, EN) with
 * the doctor's supplied sentence. Non-prod, idempotent. REVIEW: medical copy.
 *
 * Usage: node --env-file=.env.local --import tsx scripts/fix-septorhinoplasty-en.ts
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

const OLD =
  "This procedure focuses on correcting the nasal septum, the central supporting structure of the nose, to ensure both an ideal shape and optimal breathing function.";
const NEW =
  "Septorhinoplasty combines the correction of nasal septal abnormalities with the reshaping of the external nose, aiming to improve nasal breathing while achieving a harmonious, natural-looking aesthetic result.";

type Span = { _type: string; _key?: string; text?: string; marks?: string[] };
type Block = { _type: string; _key?: string; style?: string; children?: Span[] };

async function main(): Promise<void> {
  const r = await fetch(
    `${base}/data/query/${dataset}?query=${encodeURIComponent('*[_id=="procedure.rhinoplasty"][0]{"en":body.en}')}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const en = (((await r.json()) as { result: { en?: Block[] } }).result?.en ?? []) as Block[];
  let hit = false;
  const next = en.map((b) => {
    if (b._type !== "block" || !b.children || b.children.length === 0) {
      return b;
    }
    // Join spans so a sentence split across span boundaries still matches; on a
    // hit, collapse to a single span (these blocks are plain, no inline marks).
    const full = b.children.map((s) => s.text ?? "").join("");
    if (!full.includes(OLD)) {
      return b;
    }
    hit = true;
    const first = b.children[0];
    return {
      ...b,
      children: [{ _type: "span", _key: first?._key ?? "s0", text: full.replace(OLD, NEW), marks: [] }],
    };
  });
  if (!hit) {
    console.log("⚠ Target sentence not found (already replaced?). No change.");
    return;
  }
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations: [{ patch: { id: "procedure.rhinoplasty", set: { "body.en": next } } }] }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Septorhinoplasty EN sentence replaced in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
