import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// The site reads PUBLISHED content ONLY. `perspective: "published"` guarantees
// drafts never appear on the live site, even when the read token is able to
// read them. It never uses the write token — that belongs to scripts/
// (migrate-wp, seed-home) alone, never imported by the app or build. Reads
// happen at build time (static generation), so nothing is shipped to the
// browser. When the dataset is fully public, no token is needed at all and the
// CDN serves reads.
//
// SANITY_API_READ_TOKEN is an optional, read-only (Viewer) build-time token for
// datasets whose content is not yet anonymously readable. It has NO
// NEXT_PUBLIC_ prefix, so Next.js never inlines it into client bundles — it
// stays server-side (build-time) only.
const readToken = process.env.SANITY_API_READ_TOKEN;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // CDN for anonymous public reads; a read token (if set) bypasses the CDN.
  useCdn: !readToken,
  perspective: "published",
  token: readToken || undefined,
});

/**
 * Tagged fetch for static generation. Every frontend query goes through here,
 * and we re-assert `perspective: "published"` per query so drafts can never
 * surface on the live site regardless of client defaults. Tags let a Sanity
 * webhook later call revalidateTag(...) to refresh affected pages (Phase 3/5).
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = [],
): Promise<T> {
  return client.fetch<T>(query, params, {
    perspective: "published",
    // Revalidate hourly as a self-healing fallback. `revalidate: false` (cache
    // forever) is dangerous on Netlify: the Next Data Cache is restored across
    // builds, so any build that cached an empty result (e.g. an early build
    // against the empty `production` fallback dataset) keeps replaying those
    // empties on every later build. A finite TTL lets content recover. Tags are
    // retained so a Sanity webhook can still call revalidateTag(...) for instant
    // updates (Phase 3/5).
    next: { tags, revalidate: 3600 },
  });
}
