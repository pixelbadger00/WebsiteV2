/**
 * Doctor feedback (requiredChanged.docx, 2026-11-16) — precise text fixes.
 * Non-prod only, idempotent (safe to re-run). REVIEW: medical copy.
 *
 *  1. siteSettings.titlePrefix → "Dr. med." (el/de), "Dr." (en). The doctor
 *     confirmed "Dr. med." in writing, so it is no longer unconfirmed.
 *  2. doctor.name → strip the baked-in "Δρ./Dr" prefix so titlePrefix adds it
 *     once (avoids "Dr. med. Δρ. …"): el "Πάρις Παπακώστας", en/de "Paris
 *     Papakostas".
 *  3. procedure.septoplasty: name.el "Πλαστική Διαφράγματος" → "Διαφραγματοπλαστική";
 *     summary.el "ελεύθερη ρινική ροή" → "ελεύθερη ρινική αναπνοή".
 *  4. procedure.rhinoplasty body.el: "ρινοδιαφραγματοπλαστική" →
 *     "διαφραγματορινοπλαστική"; add a full stop to the Primary-Rhinoplasty
 *     tagline; "μοσχευμάτων από τον χόνδρο του αυτιού ή του πλευρού" →
 *     "μοσχευμάτων ωτικού ή πλευρικού χόνδρου".
 *  5. procedure.laser…: strip leftover "(test)" from name.en.
 *
 * Usage:  node --env-file=.env.local --import tsx scripts/apply-feedback-text-fixes.ts
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

type Span = { _type: string; _key?: string; text?: string; marks?: string[] };
type Block = { _type: string; _key?: string; style?: string; children?: Span[] };

async function query<T>(groq: string): Promise<T> {
  const res = await fetch(`${base}/data/query/${dataset}?query=${encodeURIComponent(groq)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await res.json()) as { result: T };
  return json.result;
}

async function mutate(mutations: unknown[]): Promise<void> {
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
}

function fixRhinoBodyEl(blocks: Block[]): Block[] {
  const spanReplacements: [string, string][] = [
    ["ρινοδιαφραγματοπλαστική", "διαφραγματορινοπλαστική"],
    [
      "μοσχευμάτων από τον χόνδρο του αυτιού ή του πλευρού",
      "μοσχευμάτων ωτικού ή πλευρικού χόνδρου",
    ],
  ];
  const taglineNoStop = "Προγραμματίζοντας τη ρινοπλαστική σας με εξειδίκευση και ακρίβεια";

  return blocks.map((block) => {
    if (block._type !== "block" || !block.children) {
      return block;
    }
    const children = block.children.map((span) => {
      let text = span.text ?? "";
      for (const [a, b] of spanReplacements) {
        text = text.split(a).join(b);
      }
      return { ...span, text };
    });
    const full = children.map((c) => c.text ?? "").join("").trim();
    const last = children[children.length - 1];
    if (full === taglineNoStop && last) {
      last.text = (last.text ?? "") + ".";
    }
    return { ...block, children };
  });
}

async function main(): Promise<void> {
  const rhino = await query<{ body?: { el?: Block[] } }>(
    `*[_id=="procedure.rhinoplasty"][0]{body}`,
  );
  const septo = await query<{ summary?: { el?: string } }>(
    `*[_id=="procedure.septoplasty"][0]{summary}`,
  );

  const mutations: unknown[] = [];

  // 1. siteSettings.titlePrefix (leave en = "Dr.")
  mutations.push({
    patch: {
      id: "siteSettings",
      set: { "titlePrefix.el": "Dr. med.", "titlePrefix.de": "Dr. med." },
    },
  });

  // 2. doctor.name — strip baked-in prefix
  mutations.push({
    patch: {
      id: "doctor.paris-papakostas",
      set: {
        "name.el": "Πάρις Παπακώστας",
        "name.en": "Paris Papakostas",
        "name.de": "Paris Papakostas",
      },
    },
  });

  // 3. septoplasty name + summary
  const septoSummaryEl = (septo?.summary?.el ?? "").replace(
    "ελεύθερη ρινική ροή",
    "ελεύθερη ρινική αναπνοή",
  );
  mutations.push({
    patch: {
      id: "procedure.septoplasty",
      set: {
        "name.el": "Διαφραγματοπλαστική",
        ...(septoSummaryEl ? { "summary.el": septoSummaryEl } : {}),
      },
    },
  });

  // 4. rhinoplasty body.el text fixes
  if (rhino?.body?.el) {
    mutations.push({
      patch: {
        id: "procedure.rhinoplasty",
        set: { "body.el": fixRhinoBodyEl(rhino.body.el) },
      },
    });
  }

  // 5. laser name.en cleanup
  mutations.push({
    patch: {
      id: "procedure.laser-reduction-of-the-inferior-nasal-turbinates",
      set: { "name.en": "Laser reduction of the inferior nasal turbinates" },
    },
  });

  await mutate(mutations);
  console.log(`✓ Text fixes applied to "${dataset}" (${mutations.length} patches).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
