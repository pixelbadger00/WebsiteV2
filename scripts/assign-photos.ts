/**
 * Assign the approved office photos to documents (see docs/photo-mapping.md).
 * Images referenced by index #N (1-based) over the assets sorted by original
 * filename. Hotspots set on the home hero + doctor portrait. Idempotent (set),
 * writes ONLY to a non-production dataset. Excludes patient/before-after photos
 * (model release pending).
 *
 * Usage:  pnpm assign:photos
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

type Hotspot = { x: number; y: number };
function imageField(assetId: string, hs?: Hotspot) {
  const f: Record<string, unknown> = {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
  };
  if (hs) {
    f.hotspot = { _type: "sanity.imageHotspot", x: hs.x, y: hs.y, height: 0.85, width: 0.85 };
    f.crop = { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 };
  }
  return f;
}

// doc id -> { field, n, hotspot? }
const ASSIGN: { id: string; field: string; n: number; hs?: Hotspot }[] = [
  { id: "homePage", field: "heroImage", n: 22, hs: { x: 0.42, y: 0.4 } },
  { id: "doctor.paris-papakostas", field: "portrait", n: 18, hs: { x: 0.5, y: 0.34 } },
  { id: "procedure.rhinoplasty", field: "heroImage", n: 25 },
  // Procedure photos below set by client request; index = position in the
  // filename-sorted asset list (NOT the file's own number).
  { id: "procedure.septoplasty", field: "heroImage", n: 43 }, // office 2026-48.jpg
  { id: "procedure.functional-endoscopic-sinus-surgery-fess", field: "heroImage", n: 46 }, // office 2026-50.jpg
  { id: "procedure.laser-reduction-of-the-inferior-nasal-turbinates", field: "heroImage", n: 62 }, // office 2026-66.jpg
  { id: "procedure.navigation-systems-in-functional-endoscopic-sinus-surgery", field: "heroImage", n: 76 }, // office 2026-79.jpg
  { id: "post.chronic-sinusitis", field: "coverImage", n: 10 },
  { id: "post.deviated-nasal-septum", field: "coverImage", n: 11 },
  { id: "post.european-rhinoplasty-masterclass-center", field: "coverImage", n: 13 },
  { id: "post.inferior-nasal-turbinate-hypertrophy", field: "coverImage", n: 9 },
  { id: "post.rhinoplasty-surgery-techniques", field: "coverImage", n: 29 },
  { id: "post.riniko", field: "coverImage", n: 30 },
];

async function q<T>(query: string): Promise<T> {
  const r = await fetch(`${base}/data/query/${dataset}?query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (await r.json()).result as T;
}

async function main(): Promise<void> {
  const assets = await q<{ _id: string }[]>(
    `*[_type=="sanity.imageAsset"] | order(originalFilename asc){_id}`,
  );
  if (assets.length < 80) {
    throw new Error(`Expected 80 assets, found ${assets.length}.`);
  }
  const idOf = (n: number) => {
    const a = assets[n - 1];
    if (!a) {
      throw new Error(`No asset at #${n}`);
    }
    return a._id;
  };

  const mutations = ASSIGN.map((a) => ({
    patch: { id: a.id, set: { [a.field]: imageField(idOf(a.n), a.hs) } },
  }));

  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Assigned ${ASSIGN.length} images (hero + portrait with hotspots) in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
