/**
 * Doctor feedback follow-up (2026-11-16) — set blog post cover images from the
 * AI-generated set (one per post). Processed like the migration (resize ≤2000px,
 * EXIF stripped, jpeg q85), uploaded to Sanity; each post's coverImage is patched.
 * Non-prod guarded. Idempotent — content-addressed assets reuse the same id.
 *
 * Source dir defaults to ~/Downloads; override with POST_COVERS_DIR.
 * Usage: node --env-file=.env.local --import tsx scripts/set-post-covers.ts
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

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
const dir = process.env.POST_COVERS_DIR || path.join(os.homedir(), "Downloads");

// post id → source filename
const COVERS: Record<string, string> = {
  "post.rhinoplasty-surgery-techniques": "Porcelain Nasal Study with Teal Ribbon.png",
  "post.deviated-nasal-septum": "Serene Ivory Profile in Warm Light.png",
  "post.european-rhinoplasty-masterclass-center": "Refined Clinical Study Still Life.png",
  "post.inferior-nasal-turbinate-hypertrophy": "Serene profile with softened sinus light.png",
  "post.chronic-sinusitis": "Ceramic profile in Mediterranean light(1).png",
};

async function uploadImage(file: string): Promise<string> {
  const buf = await sharp(file)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  const filename = path.basename(file).replace(/\.png$/i, ".jpg");
  const res = await fetch(
    `${base}/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`,
    {
      method: "POST",
      headers: { "Content-Type": "image/jpeg", Authorization: `Bearer ${token}` },
      body: new Uint8Array(buf),
    },
  );
  if (!res.ok) {
    throw new Error(`asset upload failed (${filename}): ${res.status} ${await res.text()}`);
  }
  return ((await res.json()) as { document: { _id: string } }).document._id;
}

async function main(): Promise<void> {
  const mutations: unknown[] = [];
  for (const [postId, filename] of Object.entries(COVERS)) {
    const file = path.join(dir, filename);
    if (!fs.existsSync(file)) {
      throw new Error(`Missing cover image: ${file}`);
    }
    const assetId = await uploadImage(file);
    console.log(`✓ ${filename} → ${assetId}`);
    mutations.push({
      patch: {
        id: postId,
        set: { coverImage: { _type: "image", asset: { _type: "reference", _ref: assetId } } },
      },
    });
  }

  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ ${mutations.length} post cover images set in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
