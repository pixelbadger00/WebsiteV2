import { apiVersion, dataset, projectId } from "../env";

// Sanity reads go through a PLAIN fetch to the query API — deliberately NOT
// @sanity/client / next-sanity's createClient, which on Node 22.12 hits an
// undici zstd decompression bug and throws
// "SyntaxError: Unexpected non-whitespace character after JSON". Native fetch
// avoids it (the migration scripts read the same way). PUBLISHED content only.
//
// SANITY_API_READ_TOKEN is an optional, server-side (no NEXT_PUBLIC_ prefix)
// read-only token for datasets that aren't anonymously readable; with no token
// the public CDN serves reads. Next.js's fetch cache is used via the `next`
// option (tags for webhook revalidation + an hourly self-healing TTL).

const readToken = process.env.SANITY_API_READ_TOKEN;
// Public, cached CDN for anonymous reads; the live API host when a token is set.
const host = readToken ? "api.sanity.io" : "apicdn.sanity.io";

/**
 * Tagged fetch for static generation. Every frontend query goes through here.
 * `perspective=published` is re-asserted per query so drafts never surface on
 * the live site regardless of token capability.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = [],
): Promise<T> {
  const search = new URLSearchParams({ query, perspective: "published" });
  for (const [key, value] of Object.entries(params)) {
    // GROQ params are passed as $name=<JSON-encoded value> in the query string.
    search.set(`$${key}`, JSON.stringify(value));
  }
  const url = `https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}?${search.toString()}`;

  const res = await fetch(url, {
    headers: readToken ? { Authorization: `Bearer ${readToken}` } : {},
    // Revalidate hourly as a self-healing fallback; tags let a Sanity webhook
    // call revalidateTag(...) for instant updates.
    next: { tags, revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Sanity query failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}
