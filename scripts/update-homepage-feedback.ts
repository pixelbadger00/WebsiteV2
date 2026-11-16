/**
 * Doctor feedback (requiredChanged.docx, 2026-11-16) — homepage.
 *  - trustBadges[2] (the "Focus" credential): "Facial plastic surgery &
 *    neurotology" → "Rhinoplasty and Nose Surgery" (el "Ρινοπλαστική &
 *    ρινοχειρουργική", de "Rhinoplastik & Nasenchirurgie"). Removes neurotology
 *    as a listed focus (item 5) and applies item 35 (EN landing).
 *  - trustBadges[1] (Training): surface the Charité doctorate (item 6).
 *  - heroTitle.el / heroLead.el / heroEyebrow.el: "Ρινοχειρουργική" not
 *    "Χειρουργική μύτης"; "χειρουργό ΩΡΛ" not "ΩΡΛ χειρουργό"; "Χειρουργός ΩΡΛ
 *    εξειδικευμένος στη Γερμανία" (items 2–4).
 * Non-prod, idempotent. REVIEW: copy.
 *
 * Usage: node --env-file=.env.local --import tsx scripts/update-homepage-feedback.ts
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

type LocaleString = { _type?: string; _key?: string; el?: string; en?: string; de?: string };

async function query<T>(groq: string): Promise<T> {
  const res = await fetch(`${base}/data/query/${dataset}?query=${encodeURIComponent(groq)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return ((await res.json()) as { result: T }).result;
}

async function main(): Promise<void> {
  const home = await query<{ trustBadges?: LocaleString[] }>(
    `*[_id=="homePage"][0]{trustBadges}`,
  );
  const badges = [...(home?.trustBadges ?? [])];
  if (badges.length !== 4) {
    throw new Error(`Expected 4 trust badges, found ${badges.length}. Aborting to avoid mis-edit.`);
  }

  // [1] Training → add Charité doctorate
  badges[1] = {
    ...badges[1],
    el: "Ειδίκευση & διδακτορικό, Charité Βερολίνο",
    en: "Specialty training & doctorate, Charité Berlin",
    de: "Facharztausbildung & Promotion, Charité Berlin",
  };
  // [2] Focus → Rhinoplasty and Nose Surgery (drops neurotology)
  badges[2] = {
    ...badges[2],
    el: "Ρινοπλαστική & ρινοχειρουργική",
    en: "Rhinoplasty and Nose Surgery",
    de: "Rhinoplastik & Nasenchirurgie",
  };

  const set: Record<string, unknown> = {
    trustBadges: badges,
    "heroTitle.el":
      "Λειτουργική και αισθητική ρινοχειρουργική, από εξειδικευμένο χειρουργό ΩΡΛ.",
    "heroLead.el":
      "Χειρουργός ΩΡΛ εξειδικευμένος στη Γερμανία, που συνδυάζει τη λειτουργική ρινοχειρουργική με την πλαστική χειρουργική προσώπου σε ιδιωτικό ιατρείο στη Λευκωσία.",
    "heroEyebrow.el": "Ρινοπλαστική · Ρινοχειρουργική & Παραρρινίων · Λευκωσία, Κύπρος",
  };

  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations: [{ patch: { id: "homePage", set } }] }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Homepage trust badges + EL hero copy updated in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
