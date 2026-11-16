/**
 * Doctor feedback (requiredChanged.docx, English 3a) — set the Rhinoplasty
 * procedure hero image to "Paris papacostas new office 2026-53.jpg" (Photo 6-53).
 * Processed like the migration (auto-rotate, ≤2560px long side, EXIF stripped,
 * jpeg q82), uploaded to Sanity, then procedure.rhinoplasty.heroImage is patched
 * to reference it. Non-prod guarded. Idempotent — Sanity assets are content-
 * addressed, so re-uploading the same bytes reuses the same asset id.
 *
 * Usage:
 *   RHINO_IMAGE_SRC="/absolute/path/to/2026-53.jpg" \
 *     node --env-file=.env.local --import tsx scripts/set-rhinoplasty-image.ts
 */
import fs from "node:fs";
import sharp from "sharp";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-02";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dataset =
  process.env.SANITY_MIGRATION_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "";
const src = process.env.RHINO_IMAGE_SRC;

if (dataset === "production" || dataset === "") {
  throw new Error(`Refusing: dataset "${dataset || "unset"}" must be non-production.`);
}
if (!token || !projectId) {
  throw new Error("SANITY_API_WRITE_TOKEN and NEXT_PUBLIC_SANITY_PROJECT_ID are required.");
}
if (!src || !fs.existsSync(src)) {
  throw new Error(`Set RHINO_IMAGE_SRC to an existing image file (got "${src ?? "unset"}").`);
}
const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;
const PROCEDURE_ID = "procedure.rhinoplasty";

async function main(): Promise<void> {
  const filename = src!.split("/").pop() || "rhinoplasty-hero.jpg";
  const buf = await sharp(src!)
    .rotate()
    .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();

  const up = await fetch(
    `${base}/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`,
    {
      method: "POST",
      headers: { "Content-Type": "image/jpeg", Authorization: `Bearer ${token}` },
      body: new Uint8Array(buf),
    },
  );
  if (!up.ok) {
    throw new Error(`asset upload failed: ${up.status} ${await up.text()}`);
  }
  const assetId = ((await up.json()) as { document: { _id: string } }).document._id;
  console.log(`✓ uploaded ${filename} → ${assetId}`);

  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      mutations: [
        {
          patch: {
            id: PROCEDURE_ID,
            set: {
              heroImage: { _type: "image", asset: { _type: "reference", _ref: assetId } },
            },
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ ${PROCEDURE_ID}.heroImage set in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
