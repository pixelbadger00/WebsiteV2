// Builds the hero image src/srcSet. In production the hero is served SAME-ORIGIN
// through Netlify's Image CDN (/.netlify/images) with the Sanity URL as source,
// removing the cross-origin cost on the LCP image (Lighthouse Lantern penalises
// it). Locally (/.netlify/images doesn't exist) it falls back to the Sanity CDN.
// All other images keep using the Sanity CDN loader. Rendered as a plain server
// <img> so it adds no client JS; the hotspot crop stays as CSS object-position.
const WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048] as const;
const QUALITY = 60;
const USE_NETLIFY = process.env.NODE_ENV === "production";

function at(base: string, w: number): string {
  if (USE_NETLIFY) {
    const p = new URLSearchParams({ url: base, w: String(w), q: String(QUALITY) });
    return `/.netlify/images?${p.toString()}`;
  }
  return `${base}?auto=format&fit=max&w=${w}&q=${QUALITY}`;
}

export function heroImageSources(base: string): { src: string; srcSet: string } {
  return {
    src: at(base, 1200),
    srcSet: WIDTHS.map((w) => `${at(base, w)} ${w}w`).join(", "),
  };
}
