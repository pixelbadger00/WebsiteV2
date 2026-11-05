// Non-destructive cleanup for migrated Portable Text (the doctor bio came from
// WordPress HTML full of tab/newline artifacts, split headings and an
// unconfirmed "5000 procedures" stat). Applied at render time, so the stored
// content is never mutated.

type Span = { _type?: string; _key?: string; marks?: string[]; text?: string };
type MarkDef = { _key?: string; _type?: string; href?: string };
type Block = {
  _type?: string;
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: Span[];
  markDefs?: MarkDef[];
  [k: string]: unknown;
};

const clean = (s: string): string => s.replace(/\s+/g, " ").trim();
const blockText = (b: Block): string => (b.children ?? []).map((c) => c.text ?? "").join("");
const isHeading = (b: Block): boolean =>
  b._type === "block" && /^h[1-6]$/.test(b.style ?? "") && !b.listItem;

export function normalizeBio(value: unknown): Block[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  let out = (value as Block[]).map((b) => {
    if (b._type !== "block" || !Array.isArray(b.children)) {
      return b;
    }
    // Drop dead links (migration left "#" / empty hrefs) → render as plain text.
    const markDefs = b.markDefs ?? [];
    const dead = new Set(
      markDefs.filter((m) => m._type === "link" && (!m.href || m.href === "#")).map((m) => m._key),
    );
    const children = b.children
      .map((c) => {
        if (c._type !== "span") {
          return c;
        }
        const raw = c.text ?? "";
        const cleaned = clean(raw);
        // Whitespace-only spans were separators — keep one space, don't drop them.
        const text = cleaned === "" && raw.length > 0 ? " " : cleaned;
        const marks = (c.marks ?? []).filter((m) => !dead.has(m));
        return { ...c, text, marks };
      })
      .filter((c) => !(c._type === "span" && c.text === ""));
    const keptDefs = markDefs.filter((m) => !dead.has(m._key));
    return { ...b, children, ...(b.markDefs !== undefined ? { markDefs: keptDefs } : {}) };
  });

  // Drop the unconfirmed "5000 … procedures" figure and any now-empty blocks.
  out = out.filter((b) => {
    if (b._type !== "block") {
      return true;
    }
    const txt = blockText(b).trim();
    if (!txt) {
      return false;
    }
    return !/\b5[.,]?000\b/.test(txt);
  });

  // Merge consecutive headings of the same level (migration split some in two).
  const merged: Block[] = [];
  for (const b of out) {
    const prev = merged[merged.length - 1];
    if (prev && isHeading(b) && isHeading(prev) && prev.style === b.style) {
      merged[merged.length - 1] = {
        ...prev,
        children: [
          {
            _type: "span",
            _key: prev.children?.[0]?._key ?? `${prev._key ?? "m"}-m`,
            marks: [],
            text: clean(`${blockText(prev)} ${blockText(b)}`),
          },
        ],
      };
    } else {
      merged.push(b);
    }
  }
  return merged;
}
