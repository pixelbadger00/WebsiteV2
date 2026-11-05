/**
 * Validate the redirect map against a running local production build.
 *
 *   pnpm build
 *   pnpm start &            # next start, serves http://localhost:3000
 *   pnpm check:redirects    # (set CHECK_BASE_URL to override the origin)
 *
 * For every row in docs/redirects.csv it confirms:
 *   • the CSV and public/_redirects agree (same target for each old URL),
 *   • the target is NOT itself an old URL (no redirect chains),
 *   • the target returns 200 on the live build (no 404s).
 *
 * Note: `next start` does not process Netlify's _redirects file, so the 301
 * itself is exercised by Netlify in production, not here. This checks that the
 * map is correct and that every destination is a live page — which is what
 * "no chains, no 404s" needs. A table is printed; exit code is non-zero on any
 * failure.
 */
import fs from "node:fs";
import path from "node:path";

const BASE = (process.env.CHECK_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const ROOT = path.resolve(import.meta.dirname, "..");

type Row = { from: string; to: string };

function pathOf(u: string): string {
  try {
    return new URL(u).pathname;
  } catch {
    return u;
  }
}

function parseCsv(): Row[] {
  const text = fs.readFileSync(path.join(ROOT, "docs/redirects.csv"), "utf8");
  return text
    .split("\n")
    .slice(1) // header
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const cols = l.split(",");
      return { from: pathOf(cols[0] ?? ""), to: pathOf(cols[1] ?? "") };
    });
}

function parseRedirectsFile(): Map<string, string> {
  const text = fs.readFileSync(path.join(ROOT, "public/_redirects"), "utf8");
  const map = new Map<string, string>();
  for (const line of text.split("\n")) {
    const l = line.trim();
    if (!l || l.startsWith("#")) {
      continue;
    }
    const [from, to] = l.split(/\s+/);
    if (from && to) {
      map.set(from, to);
    }
  }
  return map;
}

async function statusOf(p: string): Promise<number> {
  try {
    const res = await fetch(`${BASE}${p}`, { redirect: "manual" });
    return res.status;
  } catch {
    return 0;
  }
}

async function main(): Promise<void> {
  const rows = parseCsv();
  const fileMap = parseRedirectsFile();
  const fromSet = new Set(rows.map((r) => r.from));

  // Pre-flight: the base server must be up.
  const home = await statusOf("/");
  if (home === 0) {
    console.error(`✗ No server at ${BASE}. Run \`pnpm build && pnpm start\` first.`);
    process.exit(1);
  }

  type Result = { from: string; to: string; code: number; verdict: string; ok: boolean };
  const results: Result[] = [];

  for (const row of rows) {
    const reasons: string[] = [];

    // CSV ↔ _redirects consistency.
    const fileTo = fileMap.get(row.from);
    if (fileTo === undefined) {
      reasons.push("missing in _redirects");
    } else if (fileTo !== row.to) {
      reasons.push(`_redirects target differs (${fileTo})`);
    }

    // No chains: the target must not itself be an old URL.
    if (fromSet.has(row.to)) {
      reasons.push("CHAIN: target is also redirected");
    }

    // Target must be a live 200.
    const code = await statusOf(row.to);
    if (code !== 200) {
      reasons.push(`target ${code === 0 ? "unreachable" : code}`);
    }

    const ok = reasons.length === 0;
    results.push({
      from: row.from,
      to: row.to,
      code,
      verdict: ok ? "OK" : reasons.join("; "),
      ok,
    });
  }

  // Print table.
  const wFrom = Math.max(...results.map((r) => r.from.length), 8);
  const wTo = Math.max(...results.map((r) => r.to.length), 6);
  const line = (a: string, b: string, c: string, d: string) =>
    `${a.padEnd(wFrom)}  ${b.padEnd(wTo)}  ${c.padEnd(4)}  ${d}`;
  console.log(line("OLD URL", "TARGET", "HTTP", "VERDICT"));
  console.log("-".repeat(wFrom + wTo + 14));
  for (const r of results) {
    console.log(line(r.from, r.to, String(r.code), r.ok ? "✓ OK" : `✗ ${r.verdict}`));
  }

  const failures = results.filter((r) => !r.ok);
  console.log(
    `\n${results.length - failures.length}/${results.length} OK` +
      (failures.length ? `, ${failures.length} FAILED` : ""),
  );
  if (failures.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
