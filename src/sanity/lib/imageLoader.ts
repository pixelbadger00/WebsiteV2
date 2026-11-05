import type { ImageLoaderProps } from "next/image";

/**
 * Custom next/image loader for Sanity's image CDN. Keeps Netlify bandwidth low
 * by letting Sanity resize/convert (AVIF/WebP) instead of Netlify's optimizer.
 * `src` must be the base Sanity image URL (from urlForImage(...).url()).
 */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  return url.toString();
}
