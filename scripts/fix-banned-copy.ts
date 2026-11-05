/**
 * Remove banned marketing wording from migrated medical copy, per CLAUDE.md
 * compliance rule: no "safe / painless / guaranteed / risk-free" copy anywhere
 * (HWG §11 spirit). Faithful, non-destructive string replacements on span text;
 * each affected localeBlockContent array is re-set whole. Idempotent (re-running
 * finds nothing left to replace). Non-prod guarded. REVIEW: medical copy.
 *
 * Tiers (cumulative):
 *   (default)        TIER 1 — unambiguous: painless / ανώδυνη / χωρίς πόνο
 *   --efficacy       TIER 2 — "safe/safest/safety" as a claim about the
 *                             procedure or technology (+ εξαιρετικά ασφαλής)
 *   --all-safe       TIER 3 — remaining benign "safe/ασφαλής" reassurance uses
 *
 * Greek "εξασφαλίζω / διασφαλίζω" (to ensure) is a different word and is NOT
 * touched by any tier.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/fix-banned-copy.ts            # tier1
 *   node --env-file=.env.local --import tsx scripts/fix-banned-copy.ts --efficacy # tier1+2
 *   node --env-file=.env.local --import tsx scripts/fix-banned-copy.ts --all-safe # tier1+2+3
 *   add --dry to preview without writing.
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

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry");
const tier2 = args.has("--efficacy") || args.has("--all-safe");
const tier3 = args.has("--all-safe");
const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;

type R = { from: string; to: string };

// TIER 1 — unambiguous banned terms (painless / ανώδυνη / χωρίς πόνο).
const tier1: R[] = [
  {
    from: "Rhinoplasty is a procedure that most patients describe as surprisingly painless. Thanks to modern anesthesia and advanced surgical techniques, pain is practically absent.",
    to: "Rhinoplasty is a procedure that most patients find far more comfortable than they expect. With modern anaesthesia and current surgical techniques, significant pain is uncommon.",
  },
  {
    from: "These are easily removed after a few days without pain or discomfort.",
    to: "These are easily removed after a few days, usually with minimal discomfort.",
  },
  {
    from: "Laser cauterization of the inferior nasal turbinates is a short and painless procedure aimed at",
    to: "Laser cauterization of the inferior nasal turbinates is a short procedure aimed at",
  },
  {
    from: "The procedure is painless, and in the vast majority of cases",
    to: "The procedure usually causes only minimal discomfort, and in the vast majority of cases",
  },
  {
    from: "περιγράφουν ως εντυπωσιακά ανώδυνη. Χάρη στη σύγχρονη αναισθησία και τις εξελιγμένες τεχνικές, ο πόνος πρακτικά απουσιάζει.",
    to: "περιγράφουν ως πολύ πιο άνετη απ’ ό,τι περίμεναν. Χάρη στη σύγχρονη αναισθησία και τις εξελιγμένες τεχνικές, ο έντονος πόνος είναι ασυνήθης.",
  },
  {
    from: "αφαιρούνται εύκολα μετά από λίγες ημέρες χωρίς πόνο ή δυσφορία.",
    to: "αφαιρούνται εύκολα μετά από λίγες ημέρες, συνήθως με ελάχιστη ενόχληση.",
  },
  {
    from: "με laser είναι μια σύντομη και ανώδυνη επέμβαση",
    to: "με laser είναι μια σύντομη επέμβαση",
  },
  {
    from: "στις καθημερινές του δραστηριότητες χωρίς πόνο.",
    to: "στις καθημερινές του δραστηριότητες με ελάχιστη ενόχληση.",
  },
  {
    from: "Η διαδικασία είναι ανώδυνη και στην τεράστια πλειοψηφία",
    to: "Η διαδικασία συνήθως προκαλεί ελάχιστη ενόχληση και στην τεράστια πλειοψηφία",
  },
];

// TIER 2 — "safe/safest/safety" as a claim about the procedure/technology.
const tier2Reps: R[] = [
  {
    from: "Septoplasty is a short and safe surgical procedure performed to correct",
    to: "Septoplasty is a short, well-established surgical procedure performed to correct",
  },
  {
    from: "είναι μια σύντομη και ασφαλής χειρουργική επέμβαση που πραγματοποιείται",
    to: "είναι μια σύντομη, καθιερωμένη χειρουργική επέμβαση που πραγματοποιείται",
  },
  {
    from: "represents one of the most advanced and safest developments in nasal and sinus surgery",
    to: "represents one of the most advanced developments in nasal and sinus surgery",
  },
  {
    from: "αποτελεί μία από τις πιο σύγχρονες και ασφαλείς εξελίξεις στη χειρουργική",
    to: "αποτελεί μία από τις πιο σύγχρονες εξελίξεις στη χειρουργική",
  },
  {
    from: "Navigation technology enhances the safety, accuracy, and effectiveness of endoscopic sinus surgery",
    to: "Navigation technology enhances the precision, accuracy, and effectiveness of endoscopic sinus surgery",
  },
  {
    from: "providing maximum precision and safety.",
    to: "providing a high degree of precision and control.",
  },
  {
    from: "achieving a natural and harmonious result, with safety and respect for nasal function.",
    to: "achieving a natural and harmonious result, with care and respect for nasal function.",
  },
  {
    from: "today anesthesia is considered extremely safe thanks to modern equipment and strict medical standards",
    to: "today anesthesia is administered under modern equipment and strict medical standards",
  },
  {
    from: "η αναισθησία θεωρείται εξαιρετικά ασφαλής χάρη στον σύγχρονο εξοπλισμό και τις αυστηρές ιατρικές προδιαγραφές",
    to: "η αναισθησία χορηγείται με σύγχρονο εξοπλισμό και αυστηρές ιατρικές προδιαγραφές",
  },
];

// TIER 3 — remaining benign reassurance uses of "safe/ασφαλής".
const tier3Reps: R[] = [
  {
    from: "communication with the surgeon help the patient feel safe and well-prepared",
    to: "communication with the surgeon help the patient feel reassured and well-prepared",
  },
  {
    from: "βοηθούν τον ασθενή να αισθανθεί ασφαλής και προετοιμασμένος",
    to: "βοηθούν τον ασθενή να νιώσει σιγουριά και ετοιμότητα",
  },
  {
    from: "with a shared goal: the safe and smooth completion of the operation",
    to: "with a shared goal: the smooth and well-coordinated completion of the operation",
  },
  {
    from: "με κοινό στόχο την ασφαλή και ομαλή ολοκλήρωση της επέμβασης",
    to: "με κοινό στόχο την ομαλή και άρτια συντονισμένη ολοκλήρωση της επέμβασης",
  },
  {
    from: "personalized instructions for a safe and comfortable return to normal activities",
    to: "personalized instructions for a comfortable and well-supported return to normal activities",
  },
  {
    from: "tools that help patients make safe and informed decisions",
    to: "tools that help patients make well-informed decisions",
  },
  {
    from: "Η σύγχρονη ιατρική προσφέρει εργαλεία που βοηθούν στην ασφαλή λήψη απόφασης:",
    to: "Η σύγχρονη ιατρική προσφέρει εργαλεία που βοηθούν στην τεκμηριωμένη λήψη απόφασης:",
  },
  {
    from: "Below are essential guidelines to help ensure a safe and smooth recovery:",
    to: "Below are essential guidelines to support a smooth recovery:",
  },
  {
    from: "Ακολουθούν βασικές οδηγίες για την ασφαλή και ομαλή ανάρρωση σας:",
    to: "Ακολουθούν βασικές οδηγίες για την ομαλή ανάρρωσή σας:",
  },
];

const reps: R[] = [...tier1, ...(tier2 ? tier2Reps : []), ...(tier3 ? tier3Reps : [])];

// Which documents each replacement might touch (keeps the query small + explicit).
const DOC_IDS = [
  "page.faq",
  "page.instructions",
  "post.rhinoplasty-surgery-techniques",
  "procedure.rhinoplasty",
  "procedure.septoplasty",
  "procedure.laser-reduction-of-the-inferior-nasal-turbinates",
  "procedure.functional-endoscopic-sinus-surgery-fess",
  "procedure.navigation-systems-in-functional-endoscopic-sinus-surgery",
];

type Span = { _type?: string; text?: string; [k: string]: unknown };
type Block = { children?: Span[]; [k: string]: unknown };
type Localized = { el?: Block[]; en?: Block[]; de?: Block[]; [k: string]: unknown };
type Doc = { _id: string; _type: string; [field: string]: unknown };

function applyToString(s: string, counts: Map<string, number>): string {
  let out = s;
  for (const r of reps) {
    if (out.includes(r.from)) {
      const n = out.split(r.from).length - 1;
      counts.set(r.from, (counts.get(r.from) ?? 0) + n);
      out = out.split(r.from).join(r.to);
    }
  }
  return out;
}

async function main(): Promise<void> {
  const groq = encodeURIComponent(`*[_id in $ids]`);
  const params = encodeURIComponent(JSON.stringify(DOC_IDS));
  const res = await fetch(`${base}/data/query/${dataset}?query=${groq}&$ids=${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`query failed: ${res.status} ${await res.text()}`);
  }
  const { result } = (await res.json()) as { result: Doc[] };

  const counts = new Map<string, number>();
  const mutations: unknown[] = [];

  for (const doc of result) {
    for (const [field, val] of Object.entries(doc)) {
      if (field.startsWith("_") || val == null || typeof val !== "object") {
        continue;
      }
      const loc = val as Localized;
      if (!("el" in loc || "en" in loc || "de" in loc)) {
        continue;
      }
      const setForDoc: Record<string, Block[]> = {};
      for (const locale of ["el", "en", "de"] as const) {
        const blocks = loc[locale];
        if (!Array.isArray(blocks)) {
          continue;
        }
        let changed = false;
        const next = blocks.map((b) => {
          if (!Array.isArray(b.children)) {
            return b;
          }
          const children = b.children.map((c) => {
            if (typeof c.text !== "string") {
              return c;
            }
            const nt = applyToString(c.text, counts);
            if (nt !== c.text) {
              changed = true;
              return { ...c, text: nt };
            }
            return c;
          });
          return { ...b, children };
        });
        if (changed) {
          setForDoc[`${field}.${locale}`] = next;
        }
      }
      if (Object.keys(setForDoc).length) {
        mutations.push({ patch: { id: doc._id, set: setForDoc } });
      }
    }
  }

  // report
  console.log(`Tiers: 1${tier2 ? "+2" : ""}${tier3 ? "+3" : ""}  dataset="${dataset}"  ${dryRun ? "(dry run)" : ""}`);
  let applied = 0;
  for (const r of reps) {
    const n = counts.get(r.from) ?? 0;
    applied += n;
    const flag = n === 0 ? "  (no match)" : "";
    console.log(`  ${n}×${flag}  ${r.from.slice(0, 58)}…`);
  }
  console.log(`\n${applied} replacement(s) across ${mutations.length} field-set(s).`);

  if (dryRun) {
    console.log("Dry run — nothing written.");
    return;
  }
  if (!mutations.length) {
    console.log("Nothing to write.");
    return;
  }
  const w = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!w.ok) {
    throw new Error(`mutate failed: ${w.status} ${await w.text()}`);
  }
  console.log(`✓ Written to "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
