/**
 * One-time migration: split the FAQ "huge text block" (page.faq.body, ~69
 * migrated WordPress blocks) into individual, editable `faq` documents.
 *
 * The old body stored every Q&A in one rich-text field; the live page guessed
 * the Q/A boundaries with a fragile parser. This extracts each question into
 * its own document (question + answer + order) so editors can add / edit /
 * reorder them separately in the Studio ("Συχνές Ερωτήσεις → Ερωτήσεις").
 *
 * What it does, in order:
 *   1. Reads page.faq.body (el / en / de).
 *   2. Backs the raw body up to the scratchpad / cwd (JSON) — nothing is lost.
 *   3. Parses the 24 numbered questions (which align 1:1 across el/en/de) plus
 *      the trailing "What is 3D simulation?" question → 25 entries.
 *      (The malformed bullet-intro fragments — "3D outcome simulation:",
 *      "Transparency and documentation:" — are NOT questions and are skipped;
 *      their substance is covered by the "What is 3D simulation?" answer.)
 *   4. createOrReplace faq docs with stable ids `faq.q1`..`faq.q25` (idempotent).
 *   5. Unsets page.faq.body (the blob) so the Studio page settings are clean.
 *      Re-running after this is a safe no-op (empty body → nothing to migrate).
 *
 * Writes ONLY to a non-production dataset (asserts dataset !== "production").
 *
 * Usage:  pnpm migrate:faq
 */
import { writeFileSync } from "node:fs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-02";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dataset =
  process.env.SANITY_MIGRATION_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "";

if (dataset === "production" || dataset === "") {
  throw new Error(
    `Refusing to migrate: target dataset is "${dataset || "unset"}". Use a non-production dataset (e.g. development).`,
  );
}
if (!token) {
  throw new Error("SANITY_API_WRITE_TOKEN is required (migration-only token).");
}
if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required.");
}

const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;
const LOCALES = ["el", "en", "de"] as const;
type Loc = (typeof LOCALES)[number];

type Span = { _type?: string; text?: string };
type Block = { _type?: string; children?: Span[] };
type Pair = { num: number | null; question: string; answer: string };

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

// Same boundary logic the old frontend parser used: one block = one Q&A, the
// first non-empty span (minus a leading "N.") is the question, the rest the answer.
function parse(blocks: unknown): Pair[] {
  if (!Array.isArray(blocks)) {
    return [];
  }
  const out: Pair[] = [];
  for (const b of blocks as Block[]) {
    if (b._type !== "block") {
      continue;
    }
    const parts = (b.children ?? []).map((c) => norm(c.text ?? "")).filter(Boolean);
    const first = parts[0];
    if (!first || parts.length < 2) {
      continue;
    }
    const m = first.match(/^\s*(\d+)[.)]\s*/);
    const question = first.replace(/^\s*\d+[.)]\s*/, "").trim();
    const answer = parts.slice(1).join(" ").trim();
    if (question && answer) {
      out.push({ num: m ? parseInt(m[1] ?? "", 10) : null, question, answer });
    }
  }
  return out;
}

// The trailing "What is 3D simulation?" question (unnumbered in the blob).
const SIM_RE = {
  el: /τι\s+είναι\s+η\s+τρισδιάστατη\s+προσομοίωση/i,
  en: /what\s+is\s+3d\s+simulation/i,
  de: /was\s+ist\s+die\s+3d-simulation/i,
};
function findSimQuestion(pairs: Pair[], loc: Loc): Pair | undefined {
  return pairs.find((p) => p.num === null && SIM_RE[loc].test(p.question));
}

// Wrap a plain-text answer into a single localeBlockContent paragraph.
function answerBlocks(text: string, key: string) {
  return [
    {
      _type: "block",
      _key: `${key}-b0`,
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `${key}-s0`, text, marks: [] }],
    },
  ];
}

async function groq<T>(query: string): Promise<T> {
  const res = await fetch(`${base}/data/query/${dataset}?query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Query failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).result as T;
}

async function mutate(mutations: unknown[]): Promise<void> {
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`Mutation failed: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  const body = await groq<Record<Loc, unknown> | null>(`*[_id=="page.faq"][0].body`);
  if (!body) {
    console.log("page.faq has no body — nothing to migrate (already done?). Exiting.");
    return;
  }

  // 1. Back up the raw body before touching anything.
  const backupPath = `${process.env.TMPDIR ?? "."}/faq-body-backup-${Date.now()}.json`;
  writeFileSync(backupPath, JSON.stringify(body, null, 2), "utf8");
  console.log(`Backed up raw FAQ body → ${backupPath}`);

  // 2. Parse each locale and align by question number.
  const parsed: Record<Loc, Pair[]> = {
    el: parse(body.el),
    en: parse(body.en),
    de: parse(body.de),
  };
  const byNum = (pairs: Pair[]) => {
    const m: Record<number, Pair> = {};
    for (const p of pairs) {
      if (p.num != null) {
        m[p.num] = p;
      }
    }
    return m;
  };
  const maps = { el: byNum(parsed.el), en: byNum(parsed.en), de: byNum(parsed.de) };

  const numbers = [...new Set(parsed.el.map((p) => p.num).filter((n): n is number => n != null))].sort(
    (a, b) => a - b,
  );
  if (numbers.length < 20) {
    throw new Error(`Only parsed ${numbers.length} numbered questions — aborting (expected ~24).`);
  }

  // 3. Build the faq documents. Order = question number; the 3D-simulation
  //    question goes last (max + 1).
  const docs: Record<string, unknown>[] = [];
  for (const n of numbers) {
    const id = `faq.q${n}`;
    const question: Record<string, string> = {};
    const answer: Record<string, unknown> = {};
    for (const loc of LOCALES) {
      const p = maps[loc][n];
      if (p) {
        question[loc] = p.question;
        answer[loc] = answerBlocks(p.answer, `${id}-${loc}`);
      }
    }
    docs.push({ _id: id, _type: "faq", question, answer, order: n });
  }

  const lastNumber = numbers[numbers.length - 1] ?? 0;
  const simN = lastNumber + 1;
  const simId = `faq.q${simN}`;
  const simQuestion: Record<string, string> = {};
  const simAnswer: Record<string, unknown> = {};
  for (const loc of LOCALES) {
    const p = findSimQuestion(parsed[loc], loc);
    if (p) {
      simQuestion[loc] = p.question;
      simAnswer[loc] = answerBlocks(p.answer, `${simId}-${loc}`);
    }
  }
  if (Object.keys(simQuestion).length > 0) {
    docs.push({ _id: simId, _type: "faq", question: simQuestion, answer: simAnswer, order: simN });
  }

  const maxOrder = Object.keys(simQuestion).length > 0 ? simN : lastNumber;
  console.log(`Prepared ${docs.length} faq documents (orders 1..${maxOrder}).`);

  // 4. Write the faq docs (createOrReplace → idempotent).
  await mutate(docs.map((d) => ({ createOrReplace: d })));
  console.log(`Wrote ${docs.length} faq documents.`);

  // 5. Clear the old blob from page.faq.body. Patch the published doc, and the
  //    draft too if one exists (a bare patch on a missing doc errors the batch).
  await mutate([{ patch: { id: "page.faq", unset: ["body"] } }]);
  const draftExists = await groq<string | null>(`*[_id=="drafts.page.faq"][0]._id`);
  if (draftExists) {
    await mutate([{ patch: { id: "drafts.page.faq", unset: ["body"] } }]);
  }
  console.log("Cleared page.faq.body (blob removed; backup kept above).");
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
