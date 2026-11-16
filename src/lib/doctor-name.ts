// Doctor name prefixed with the per-locale title (never hard-coded; driven by
// siteSettings.titlePrefix). Skips the prefix when the name already begins with
// it (avoids "Dr. Dr …"). Shared by the home and about pages so the title shows
// consistently wherever the doctor's name appears.
export function fullName(
  prefix: string | undefined,
  name: string | undefined,
): string {
  const n = (name ?? "").trim();
  const p = (prefix ?? "").trim();
  if (!p) {
    return n;
  }
  const bare = p.replace(/\.$/, "").toLowerCase();
  if (n.toLowerCase().startsWith(bare)) {
    return n;
  }
  return `${p} ${n}`.trim();
}
