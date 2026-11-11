import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

// ─────────────────────────────────────────────────────────────────────────────
// On-demand ISR: Sanity publish → instant refresh (no 1h wait).
//
// A Sanity webhook POSTs here on every publish. We verify the request came from
// Sanity (HMAC signature over the raw body, using SANITY_REVALIDATE_SECRET) and
// then drop the Next.js Data Cache for the affected content via revalidateTag().
//
// Our queries tag their fetches by document _type (see src/sanity/queries.ts),
// so for content documents the cache tag IS the _type. Publishing one procedure
// calls revalidateTag("procedure"), which refreshes every page that reads
// procedures (home, /services, and each /service/<slug>) in one go.
//
// This does NOT replace the hourly `revalidate: 3600` fallback in
// src/sanity/lib/client.ts — that stays as a safety net so content still
// self-heals if a webhook ever fails to fire.
// ─────────────────────────────────────────────────────────────────────────────

// Node runtime: parseBody needs Node crypto for signature verification.
export const runtime = "nodejs";

// Document _type → cache tag. Most tags equal the _type; assets are the one
// exception (queried under the "asset" tag).
const TYPE_TAGS = new Set([
  "siteSettings",
  "homePage",
  "procedure",
  "doctor",
  "testimonial",
  "post",
  "legalPage",
  "page",
]);

type WebhookBody = {
  _type?: string;
};

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not configured." },
      { status: 500 },
    );
  }

  let isValidSignature: boolean | null;
  let body: WebhookBody | null;
  try {
    ({ isValidSignature, body } = await parseBody<WebhookBody>(req, secret));
  } catch {
    return NextResponse.json({ message: "Could not parse request body." }, { status: 400 });
  }

  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  }

  const type = body?._type;
  if (!type) {
    return NextResponse.json({ message: "Bad request: missing _type." }, { status: 400 });
  }

  let tag: string | null = null;
  if (TYPE_TAGS.has(type)) {
    tag = type;
  } else if (type === "sanity.imageAsset" || type === "sanity.fileAsset") {
    tag = "asset";
  }

  if (!tag) {
    // Unknown type: acknowledge with 200 so Sanity doesn't keep retrying, but
    // report that nothing was revalidated.
    return NextResponse.json({ revalidated: false, type, message: "No cache tag for this type." });
  }

  // `{ expire: 0 }`: don't serve stale — the next request for this tag does a
  // blocking refetch, so an editor who reloads right after publishing sees the
  // change immediately (vs. "max", which would serve stale content once more).
  revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: true, tag, type, now: Date.now() });
}

// Lightweight health check: confirms the route is deployed and whether the
// secret is configured — without ever exposing the secret's value.
export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(process.env.SANITY_REVALIDATE_SECRET),
  });
}
