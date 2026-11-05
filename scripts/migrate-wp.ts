/**
 * One-off WordPress → Sanity migration.
 *
 * Phase 2c scope: DRY-RUN ONLY. Parses the WXR export + MySQL dump and prints a
 * migration plan (target schema, locale, translation links, slug mapping,
 * images per document, Elementor/conversion concerns). It never writes to Sanity.
 *
 * Inputs (read-only, outside the repo):
 *   WP_EXPORT_PATH  absolute path to drparispapakostas.WordPress.*.xml (WXR)
 *   WP_SQL_PATH     absolute path to the MySQL dump (.sql) — for language links,
 *                   translations and AIOSEO meta that the XML lacks
 *
 * Usage:
 *   WP_EXPORT_PATH=... WP_SQL_PATH=... pnpm migrate:dry
 *
 * The real import (--write) is implemented in a later step and requires
 * SANITY_API_WRITE_TOKEN + a non-production dataset.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import { parse as parseHtml, HTMLElement, TextNode } from "node-html-parser";
import sharp from "sharp";

// ────────────────────────────────────────────────────────────── inputs ──
const WP_EXPORT_PATH = process.env.WP_EXPORT_PATH;
const WP_SQL_PATH = process.env.WP_SQL_PATH;
const WRITE = process.argv.includes("--write");

if (!WP_EXPORT_PATH || !fs.existsSync(WP_EXPORT_PATH)) {
  throw new Error("Set WP_EXPORT_PATH to the WordPress WXR .xml export.");
}
if (!WP_SQL_PATH || !fs.existsSync(WP_SQL_PATH)) {
  throw new Error("Set WP_SQL_PATH to the MySQL .sql dump.");
}
// Write mode safety: never touch production.
const WRITE_DATASET =
  process.env.SANITY_MIGRATION_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "";
if (WRITE) {
  if (WRITE_DATASET === "production" || WRITE_DATASET === "") {
    throw new Error(
      `Refusing to import: target dataset is "${WRITE_DATASET || "unset"}". Use a non-production dataset (e.g. development).`,
    );
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is required for --write.");
  }
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required for --write.");
  }
}

type Locale = "el" | "en" | "de";

// ─────────────────────────────────────────────────────────── SQL parse ──
const sql = fs.readFileSync(WP_SQL_PATH, "utf8");

function insertBlock(table: string): string {
  const start = sql.indexOf("INSERT INTO `" + table + "`");
  if (start < 0) {
    return "";
  }
  const vi = sql.indexOf(" VALUES", start);
  let end = sql.length;
  for (const marker of [
    "\nINSERT INTO ",
    "\nCREATE TABLE ",
    "\n/*!",
    "\nUNLOCK TABLES",
    "\nALTER TABLE ",
  ]) {
    const k = sql.indexOf(marker, vi);
    if (k > 0) {
      end = Math.min(end, k);
    }
  }
  return sql.slice(vi + 7, end);
}

/** Tokenise `(a,'b',NULL),(...)` rows, honouring \' escapes and NULL. */
function parseRows(block: string): (string | null)[][] {
  const rows: (string | null)[][] = [];
  let i = 0;
  const n = block.length;
  while (i < n) {
    if (block[i] !== "(") {
      i++;
      continue;
    }
    i++;
    const row: (string | null)[] = [];
    let cur = "";
    let inStr = false;
    let quoted = false; // was the current value a quoted string?
    const push = () => {
      if (quoted) {
        row.push(cur);
      } else {
        const t = cur.trim(); // bareword: strip surrounding whitespace
        row.push(t.toUpperCase() === "NULL" ? null : t);
      }
      cur = "";
      quoted = false;
    };
    while (i < n) {
      const c = block[i];
      if (inStr) {
        if (c === "\\") {
          cur += block[i + 1];
          i += 2;
          continue;
        }
        if (c === "'") {
          inStr = false;
          i++;
          continue;
        }
        cur += c;
        i++;
      } else {
        if (c === "'") {
          inStr = true;
          quoted = true;
          cur = "";
          i++;
        } else if (c === ",") {
          push();
          i++;
        } else if (c === ")") {
          push();
          i++;
          break;
        } else {
          cur += c;
          i++;
        }
      }
    }
    rows.push(row);
    while (i < n && (block[i] === "," || block[i] === " " || block[i] === "\n" || block[i] === "\r")) {
      i++;
    }
  }
  return rows;
}

// term_id -> slug
const termSlug = new Map<string, string>();
for (const r of parseRows(insertBlock("yby_terms"))) {
  if (r[0] && r[2] != null) {
    termSlug.set(String(r[0]), String(r[2]));
  }
}

// language taxonomy: ttid -> locale ; collect post_translations descriptions
const langTtid = new Map<string, Locale>();
const translationDescriptions: string[] = [];
for (const r of parseRows(insertBlock("yby_term_taxonomy"))) {
  const [ttid, termId, taxonomy, description] = r;
  if (taxonomy === "language" && termId != null) {
    const slug = termSlug.get(String(termId));
    if (slug === "el" || slug === "en" || slug === "de") {
      langTtid.set(String(ttid), slug);
    }
  } else if (taxonomy === "post_translations" && description) {
    translationDescriptions.push(String(description));
  }
}

// post_id -> locale
const postLocale = new Map<string, Locale>();
for (const r of parseRows(insertBlock("yby_term_relationships"))) {
  const [objectId, ttid] = r;
  if (objectId != null && ttid != null && langTtid.has(String(ttid))) {
    postLocale.set(String(objectId), langTtid.get(String(ttid))!);
  }
}

// translation groups: { el: id, en: id, ... }
const groupByPost = new Map<string, Partial<Record<Locale, string>>>();
for (const desc of translationDescriptions) {
  const group: Partial<Record<Locale, string>> = {};
  const re = /s:2:\\?"([a-z]{2})\\?";i:(\d+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(desc)) !== null) {
    const loc = m[1] as Locale;
    if (loc === "el" || loc === "en" || loc === "de") {
      group[loc] = m[2];
    }
  }
  for (const id of Object.values(group)) {
    groupByPost.set(id!, group);
  }
}

// AIOSEO per-post title/description (columns: id, post_id, title, description, ...)
const aioseo = new Map<string, { title: string | null; description: string | null }>();
for (const r of parseRows(insertBlock("yby_aioseo_posts"))) {
  if (r[1] != null) {
    aioseo.set(String(r[1]), { title: r[2] ?? null, description: r[3] ?? null });
  }
}

// ─────────────────────────────────────────────────────────── XML parse ──
const parser = new XMLParser({
  ignoreAttributes: true,
  trimValues: false,
  processEntities: true,
  parseTagValue: false,
});
const xml = parser.parse(fs.readFileSync(WP_EXPORT_PATH, "utf8"));
const rawItems: Record<string, unknown>[] = ([] as Record<string, unknown>[]).concat(
  xml?.rss?.channel?.item ?? [],
);

type Meta = Record<string, string>;
type Item = {
  id: string;
  type: string;
  status: string;
  title: string;
  link: string;
  slug: string;
  parent: string;
  contentHtml: string;
  excerptHtml: string;
  date: string;
  meta: Meta;
  attachmentUrl?: string;
};

function asString(v: unknown): string {
  if (v == null) {
    return "";
  }
  if (typeof v === "object") {
    // CDATA or nested — try common shapes
    const o = v as Record<string, unknown>;
    if (typeof o["#text"] === "string") {
      return o["#text"];
    }
    return "";
  }
  return String(v);
}

const items: Item[] = rawItems.map((it) => {
  const metaRaw = it["wp:postmeta"];
  const metaArr = Array.isArray(metaRaw) ? metaRaw : metaRaw ? [metaRaw] : [];
  const meta: Meta = {};
  for (const pm of metaArr as Record<string, unknown>[]) {
    const k = asString(pm["wp:meta_key"]);
    if (k) {
      meta[k] = asString(pm["wp:meta_value"]);
    }
  }
  return {
    id: asString(it["wp:post_id"]),
    type: asString(it["wp:post_type"]),
    status: asString(it["wp:status"]),
    title: asString(it["title"]).trim(),
    link: asString(it["link"]).trim(),
    slug: asString(it["wp:post_name"]),
    parent: asString(it["wp:post_parent"]),
    contentHtml: asString(it["content:encoded"]),
    excerptHtml: asString(it["excerpt:encoded"]),
    date: asString(it["wp:post_date_gmt"]) || asString(it["wp:post_date"]),
    meta,
    attachmentUrl: asString(it["wp:attachment_url"]) || undefined,
  };
});

// attachment id -> url
const attachmentUrl = new Map<string, string>();
for (const it of items) {
  if (it.type === "attachment" && it.attachmentUrl) {
    attachmentUrl.set(it.id, it.attachmentUrl);
  }
}

// ──────────────────────────────────────────────────────── mapping rules ──
const SCHEMA_FOR: Record<string, string | null> = {
  page: "page",
  service: "procedure",
  post: "post",
  team: "doctor",
  testimonial: "testimonial",
};

// Pages that are not standalone Sanity `page` docs.
const SPECIAL_PAGE: Record<string, string> = {
  "home-page-01": "→ home route (/[locale]); content seeds siteSettings/home",
  home: "→ home route (/en)",
  "before-after-2": "→ removed; content merges into procedure galleries",
  "before-after": "→ removed (empty EN placeholder)",
  blog: "→ blog index route",
  posts: "→ blog index route (empty EN placeholder)",
  services: "→ procedures index route",
  "services-2": "→ procedures index route",
};

function newSlug(slug: string): string {
  return slug.replace(/-2$/, "").replace(/-en$/, "");
}

const locale = (id: string): Locale | "?" => postLocale.get(id) ?? "?";

function partner(id: string): string {
  const g = groupByPost.get(id);
  if (!g) {
    return "—";
  }
  return (["el", "en", "de"] as Locale[])
    .filter((l) => g[l] && g[l] !== id)
    .map((l) => `${l}:${g[l]}`)
    .join(" ") || "—";
}

function countMatches(s: string, re: RegExp): number {
  return (s.match(re) ?? []).length;
}

function elementorConcerns(it: Item): string[] {
  const c: string[] = [];
  if (it.meta["_elementor_edit_mode"] === "builder" || "_elementor_data" in it.meta) {
    c.push("Elementor builder (convert _elementor_data layout → portable text)");
  }
  const shortcodes = countMatches(it.contentHtml, /\[[a-z][a-z0-9_-]*/gi);
  if (shortcodes > 0) {
    c.push(`${shortcodes} shortcode(s)`);
  }
  if (/\[rev_slider|revslider/i.test(it.contentHtml)) {
    c.push("Slider Revolution shortcode (no equivalent — rebuild/omit)");
  }
  if (/\[contact-form|wpforms|gravityform/i.test(it.contentHtml)) {
    c.push("form shortcode (replace with new contact form)");
  }
  if (/\[gallery|\[elementor-template/i.test(it.contentHtml)) {
    c.push("gallery/template shortcode (manual)");
  }
  return c;
}

function inlineImages(html: string): number {
  return countMatches(html, /<img\b/gi);
}

// ────────────────────────────────────────────────────────────── report ──
const out: string[] = [];
const log = (s = "") => out.push(s);

const published = items.filter(
  (i) => i.status === "publish" && i.type in SCHEMA_FOR,
);
const byType = (t: string) => published.filter((i) => i.type === t);

log("# WordPress → Sanity migration — DRY RUN (no data written)");
log("");
log(`Export : ${WP_EXPORT_PATH}`);
log(`DB dump: ${WP_SQL_PATH}`);
log(`API version target: ${process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-02"}`);
log("");
log("## 1. Totals");
const typeCounts: Record<string, number> = {};
for (const it of items) {
  typeCounts[it.type] = (typeCounts[it.type] ?? 0) + 1;
}
log(
  "Items by type: " +
    Object.entries(typeCounts)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join(", "),
);
log(
  `Published mapped content: ${published.length} ` +
    `(page=${byType("page").length}, service=${byType("service").length}, ` +
    `post=${byType("post").length}, team=${byType("team").length}, testimonial=${byType("testimonial").length})`,
);
log(`Attachments (media): ${attachmentUrl.size}`);
log(
  `Languages: ${new Set([...postLocale.values()]).size} in use; ` +
    `posts with a locale: ${postLocale.size}; translation groups: ${translationDescriptions.length}`,
);
log("");

function section(type: string, schema: string, title: string) {
  const rows = byType(type).sort((a, b) => locale(a.id).localeCompare(locale(b.id)));
  log(`## ${title} → \`${schema}\` (${rows.length})`);
  for (const it of rows) {
    const special = SPECIAL_PAGE[it.slug];
    const slugOut = special ? special : `slug: \`${it.slug}\` → \`${newSlug(it.slug)}\``;
    const thumb = it.meta["_thumbnail_id"];
    const featured = thumb && attachmentUrl.has(thumb) ? attachmentUrl.get(thumb)! : null;
    const imgs = inlineImages(it.contentHtml);
    const seoMeta = aioseo.get(it.id);
    const hasSeo = seoMeta && (seoMeta.title || seoMeta.description);
    const concerns = elementorConcerns(it);
    log(
      `- [${locale(it.id)}] #${it.id} "${it.title}" — partner ${partner(it.id)}`,
    );
    log(`    ${slugOut}`);
    log(
      `    content: ${it.contentHtml.length} chars, ${imgs} inline <img>, ` +
        `featured: ${featured ? featured.split("/").pop() : "none"}, ` +
        `SEO: ${hasSeo ? "custom (AIOSEO)" : "none → compose fresh"}`,
    );
    if (concerns.length) {
      log(`    ⚠ ${concerns.join("; ")}`);
    }
  }
  log("");
}

section("service", "procedure", "2. Procedures");
section("post", "post", "3. Blog posts");
section("page", "page / (routes)", "4. Pages");
section("team", "doctor", "5. Doctor");

// Testimonials → testimonial (single-language, not localized)
const testimonials = byType("testimonial");
log(`## 6. Testimonials → \`testimonial\` (${testimonials.length})`);
log(
  "Single-language reviews: quote ← excerpt/content, author ← title, language ← post locale, " +
    "consentToDisplay ← confirm per review (open-questions #13).",
);
for (const it of testimonials) {
  log(`- [${locale(it.id)}] #${it.id} author "${it.title}"`);
}
log("");

// siteSettings / fresh content
log("## 7. siteSettings & fresh content (composed, not 1:1 migrated)");
log("- siteSettings: NAP from the contact page + DB options; germanEnabled=false;");
log("  titlePrefix per locale (de empty — open-questions #7a); hours MISSING (open-questions #4).");
log("- Legal pages (privacy/cookies/imprint): DO NOT EXIST in WP → create fresh as `legalPage`.");
log("- Treatment-in-Cyprus & Book pages: new, not in WP.");
log("- German (de): all localized fields imported EMPTY and flagged for translation.");
log("");

// Images
log("## 8. Images");
log(`- WP attachments available: ${attachmentUrl.size}. Featured images map via _thumbnail_id.`);
log("- PRIMARY source is the 2026 office photo set (not in WP) — hero/about/procedure");
log("  images must be assigned MANUALLY per document (filenames are sequential, not semantic).");
log("- Before/after: consent-gated (open-questions #1), never on /de. 3D animations: rights-gated (#3).");
log("- All imported images: strip EXIF, ≤2560px long side, upload to Sanity; CDN handles the rest.");
log("");

// Elementor global concerns
const withElementor = published.filter(
  (i) => i.meta["_elementor_edit_mode"] === "builder" || "_elementor_data" in i.meta,
);
log("## 9. Conversion concerns (Elementor & friends)");
log(`- Elementor-built docs: ${withElementor.length}/${published.length}.`);
log("  content:encoded holds usable HTML, but layout widgets live in _elementor_data —");
log("  convert HTML → Portable Text (@sanity/block-tools), drop builder-only widgets.");
log("- Slider Revolution, forms and gallery shortcodes have no 1:1 Sanity equivalent (rebuilt natively).");
log("- All migrated copy is tagged `// REVIEW: copy` for the doctor to approve; medical copy we");
log("  rewrite is additionally flagged `// REVIEW: medical copy`.");
log("");
log("## 10. Next step");
log("- Confirm slug map in docs/redirects.csv (matches this report).");
log("- Provide SANITY_API_WRITE_TOKEN + a `development` dataset; then re-run with --write");
log("  (imports el/en, leaves de empty) into development for review before production.");

console.log(out.join("\n"));

if (WRITE) {
  await runImport();
}

// ───────────────────────────────────────────────── write-mode helpers ──
type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type MarkDef = { _key: string; _type: "link"; href: string };
type Block = {
  _type: "block";
  _key: string;
  style: string;
  listItem?: string;
  level?: number;
  markDefs: MarkDef[];
  children: Span[];
};

function key(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

function stripShortcodes(html: string): string {
  return html.replace(/\[[^\]]*\]/g, " ");
}

function collectSpans(
  node: HTMLElement,
  marks: string[],
  markDefs: MarkDef[],
  acc: Span[],
): void {
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const text = (child as TextNode).text;
      if (text) {
        acc.push({ _type: "span", _key: key(), text, marks: [...marks] });
      }
      continue;
    }
    if (child.nodeType !== 1) {
      continue;
    }
    const el = child as HTMLElement;
    const tag = (el.tagName ?? "").toLowerCase();
    if (tag === "br") {
      acc.push({ _type: "span", _key: key(), text: "\n", marks: [...marks] });
      continue;
    }
    if (tag === "a") {
      const href = el.getAttribute("href") ?? "";
      const md: MarkDef = { _key: key(), _type: "link", href };
      markDefs.push(md);
      collectSpans(el, [...marks, md._key], markDefs, acc);
      continue;
    }
    const next = [...marks];
    if (tag === "strong" || tag === "b") {
      next.push("strong");
    } else if (tag === "em" || tag === "i") {
      next.push("em");
    }
    collectSpans(el, next, markDefs, acc);
  }
}

function blockFrom(el: HTMLElement, style: string, listItem?: string): Block | null {
  const markDefs: MarkDef[] = [];
  const children: Span[] = [];
  collectSpans(el, [], markDefs, children);
  if (!children.some((s) => s.text.trim())) {
    return null;
  }
  const b: Block = { _type: "block", _key: key(), style, markDefs, children };
  if (listItem) {
    b.listItem = listItem;
    b.level = 1;
  }
  return b;
}

function htmlToBlocks(html: string): Block[] {
  if (!html || !html.trim()) {
    return [];
  }
  const root = parseHtml(stripShortcodes(html));
  const blocks: Block[] = [];
  const push = (b: Block | null) => {
    if (b) {
      blocks.push(b);
    }
  };
  for (const node of root.childNodes) {
    if (node.nodeType === 3) {
      const t = (node as TextNode).text;
      if (t.trim()) {
        blocks.push({
          _type: "block",
          _key: key(),
          style: "normal",
          markDefs: [],
          children: [{ _type: "span", _key: key(), text: t.trim(), marks: [] }],
        });
      }
      continue;
    }
    if (node.nodeType !== 1) {
      continue;
    }
    const el = node as HTMLElement;
    const tag = (el.tagName ?? "").toLowerCase();
    if (tag === "h1" || tag === "h2") {
      push(blockFrom(el, "h2"));
    } else if (tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
      push(blockFrom(el, "h3"));
    } else if (tag === "blockquote") {
      push(blockFrom(el, "blockquote"));
    } else if (tag === "ul" || tag === "ol") {
      const li = tag === "ul" ? "bullet" : "number";
      for (const c of el.childNodes) {
        if (c.nodeType === 1 && (c as HTMLElement).tagName?.toLowerCase() === "li") {
          push(blockFrom(c as HTMLElement, "normal", li));
        }
      }
    } else {
      push(blockFrom(el, "normal"));
    }
  }
  return blocks;
}

function plainText(html: string): string {
  if (!html) {
    return "";
  }
  return (parseHtml(stripShortcodes(html)).text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function loc(el?: string, en?: string): Record<string, string> | undefined {
  const o: Record<string, string> = {};
  if (el && el.trim()) {
    o.el = el.trim();
  }
  if (en && en.trim()) {
    o.en = en.trim();
  }
  return Object.keys(o).length ? o : undefined;
}

function locBlocks(el?: Block[], en?: Block[]): Record<string, Block[]> | undefined {
  const o: Record<string, Block[]> = {};
  if (el && el.length) {
    o.el = el;
  }
  if (en && en.length) {
    o.en = en;
  }
  return Object.keys(o).length ? o : undefined;
}

function slugLoc(elSlug?: string, enSlug?: string): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  if (elSlug) {
    o.el = { _type: "slug", current: elSlug };
  }
  if (enSlug) {
    o.en = { _type: "slug", current: enSlug };
  }
  return o;
}

function isoDate(wp: string): string | undefined {
  if (!wp || wp.startsWith("0000")) {
    return undefined;
  }
  const d = new Date(wp.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

async function runImport(): Promise<void> {
  // Minimal Sanity HTTP client via built-in fetch (avoids the SDK's undici dep,
  // which needs a zstd-capable Node). Token is read from env, never logged.
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-02";
  const token = process.env.SANITY_API_WRITE_TOKEN!;
  const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;

  async function mutate(mutations: Record<string, unknown>[]): Promise<void> {
    const res = await fetch(`${base}/data/mutate/${WRITE_DATASET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mutations }),
    });
    if (!res.ok) {
      throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
    }
  }

  async function uploadImage(buf: Buffer, filename: string): Promise<void> {
    const res = await fetch(
      `${base}/assets/images/${WRITE_DATASET}?filename=${encodeURIComponent(filename)}`,
      {
        method: "POST",
        headers: { "Content-Type": "image/jpeg", Authorization: `Bearer ${token}` },
        body: new Uint8Array(buf),
      },
    );
    if (!res.ok) {
      throw new Error(`asset upload failed (${filename}): ${res.status}`);
    }
  }

  const byId = new Map(items.map((i) => [i.id, i]));
  const get = (id: string) => byId.get(id);
  const lang = (id: string): "el" | "en" => (locale(id) === "en" ? "en" : "el");

  const created: string[] = [];
  const skippedNote: string[] = [];

  // Group content items by translation group (canonical = el id).
  function pairs(type: string): Map<string, { el?: Item; en?: Item }> {
    const map = new Map<string, { el?: Item; en?: Item }>();
    for (const it of items.filter((i) => i.type === type && i.status === "publish")) {
      const g = groupByPost.get(it.id);
      const canon = g ? g.el ?? g.en ?? it.id : it.id;
      const entry = map.get(canon) ?? {};
      entry[lang(it.id)] = it;
      map.set(canon, entry);
    }
    return map;
  }

  async function put(doc: Record<string, unknown>): Promise<void> {
    await mutate([{ createOrReplace: doc }]);
    created.push(String(doc._id));
  }

  // 1 — Office photos → Sanity assets (EXIF stripped, ≤2560px). Dedup by hash.
  const dir = process.env.OFFICE_PHOTOS_DIR;
  let assetCount = 0;
  if (dir && fs.existsSync(dir)) {
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.jpe?g$/i.test(f) && !f.startsWith("."))
      .sort();
    for (const f of files) {
      const buf = await sharp(path.join(dir, f))
        .rotate()
        .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer();
      await uploadImage(buf, f);
      assetCount++;
    }
  } else {
    skippedNote.push("Office photos: OFFICE_PHOTOS_DIR not found — none uploaded.");
  }

  // 2 — siteSettings (composed from NAP/options; de title empty; hours missing)
  await put({
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: { el: "Δρ. Πάρις Παπακώστας", en: "Dr Paris Papakostas" },
    titlePrefix: { el: "Δρ.", en: "Dr." },
    tagline: {
      el: "Ρινοπλαστική & Χειρουργική Μύτης",
      en: "Rhinoplasty & Nose Surgery",
    },
    contact: {
      phone: "+357 22 730269",
      mobile: "+357 99 623821",
      whatsapp: "35799623821",
      email: "dr.paris.papakostas@gmail.com",
    },
    address: {
      el: "Λόρδου Βύρωνος 2, 1096 Λευκωσία, Κύπρος",
      en: "Lordou Vyronos 2, 1096 Nicosia, Cyprus",
    },
    mapUrl:
      "https://maps.google.com/?q=Lordou+Vyronos+2,+1096+Nicosia,+Cyprus",
    germanEnabled: false,
  });

  // 3 — Procedures
  const PROCEDURE_ORDER: Record<string, number> = {
    rhinoplasty: 1,
    septoplasty: 2,
    "functional-endoscopic-sinus-surgery-fess": 3,
    "laser-reduction-of-the-inferior-nasal-turbinates": 4,
    "navigation-systems-in-functional-endoscopic-sinus-surgery": 5,
  };
  for (const [, pair] of pairs("service")) {
    const el = pair.el;
    const en = pair.en;
    const baseSlug = newSlug((el?.slug || en?.slug || "procedure").toString());
    await put({
      _id: `procedure.${baseSlug}`,
      _type: "procedure",
      name: loc(el?.title, en?.title),
      slug: slugLoc(el ? newSlug(el.slug) : undefined, en ? newSlug(en.slug) : undefined),
      order: PROCEDURE_ORDER[baseSlug] ?? 99,
      summary: loc(plainText(el?.excerptHtml ?? ""), plainText(en?.excerptHtml ?? "")),
      body: locBlocks(
        el ? htmlToBlocks(el.contentHtml) : undefined,
        en ? htmlToBlocks(en.contentHtml) : undefined,
      ),
      showBeforeAfter: { el: false, en: false },
    });
  }

  // 4 — Blog posts
  for (const [, pair] of pairs("post")) {
    const el = pair.el;
    const en = pair.en;
    const baseSlug = newSlug((el?.slug || en?.slug || "post").toString());
    await put({
      _id: `post.${baseSlug}`,
      _type: "post",
      title: loc(el?.title, en?.title),
      slug: slugLoc(el ? newSlug(el.slug) : undefined, en ? newSlug(en.slug) : undefined),
      excerpt: loc(plainText(el?.excerptHtml ?? ""), plainText(en?.excerptHtml ?? "")),
      body: locBlocks(
        el ? htmlToBlocks(el.contentHtml) : undefined,
        en ? htmlToBlocks(en.contentHtml) : undefined,
      ),
      publishedAt: isoDate(el?.date ?? en?.date ?? ""),
    });
  }

  // 5 — Doctor (team bio el + professional-profile en)
  const team = get("6191");
  const aboutEn = get("7258");
  await put({
    _id: "doctor.paris-papakostas",
    _type: "doctor",
    name: { el: "Δρ. Πάρις Παπακώστας", en: "Dr Paris Papakostas" },
    bio: locBlocks(
      team ? htmlToBlocks(team.contentHtml) : undefined,
      aboutEn ? htmlToBlocks(aboutEn.contentHtml) : undefined,
    ),
  });

  // 6 — Pages kept as `page` docs
  const pageDefs: { k: string; elId: string; enId: string; elSlug: string; enSlug: string }[] = [
    { k: "faq", elId: "1952", enId: "7223", elSlug: "faq", enSlug: "faq" },
    { k: "contact", elId: "1990", enId: "7129", elSlug: "contact-us", enSlug: "contact" },
    { k: "instructions", elId: "6706", enId: "7213", elSlug: "instructions", enSlug: "post-surgery-guide" },
  ];
  for (const p of pageDefs) {
    const el = get(p.elId);
    const en = get(p.enId);
    await put({
      _id: `page.${p.k}`,
      _type: "page",
      title: loc(el?.title, en?.title),
      slug: slugLoc(p.elSlug, p.enSlug),
      body: locBlocks(
        el ? htmlToBlocks(el.contentHtml) : undefined,
        en ? htmlToBlocks(en.contentHtml) : undefined,
      ),
    });
  }

  // 7 — Testimonials (single-language)
  let tOrder = 0;
  for (const it of items.filter((i) => i.type === "testimonial" && i.status === "publish")) {
    await put({
      _id: `testimonial.${it.id}`,
      _type: "testimonial",
      quote: plainText(it.excerptHtml || it.contentHtml) || it.title,
      author: it.title,
      language: lang(it.id),
      consentToDisplay: false,
      order: tOrder++,
    });
  }

  // ── results report (no secrets) ──
  const rep: string[] = [];
  rep.push("\n\n=== IMPORT RESULTS (dataset: " + WRITE_DATASET + ") ===");
  rep.push(`Office photos uploaded/deduped: ${assetCount}`);
  rep.push(`Documents created/replaced: ${created.length}`);
  for (const id of created) {
    rep.push(`  + ${id}`);
  }
  rep.push("Skipped (by design):");
  rep.push("  - before/after photos & patient clips (consent pending)");
  rep.push("  - 3D animations (rights unconfirmed)");
  rep.push("  - German (de) fields left empty (awaiting translation)");
  rep.push("  - WP legacy attachments (office photo set is the approved source)");
  for (const s of skippedNote) {
    rep.push(`  - ${s}`);
  }
  rep.push("Re-run safe: stable _ids (createOrReplace) + hash-deduped assets.");
  console.log(rep.join("\n"));
}
