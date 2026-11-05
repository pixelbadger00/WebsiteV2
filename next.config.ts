import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this project. Without it, Next infers
  // the root from the nearest lockfile and picks up a stray ~/yarn.lock in the
  // home directory, which emits a root-inference warning.
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  // Match the old WordPress URLs, which all carried a trailing slash.
  trailingSlash: true,
  images: {
    // Serve/resize images via the Sanity CDN with a custom loader (keeps
    // Netlify's image-optimization bandwidth out of the picture).
    loader: "custom",
    loaderFile: "./src/sanity/lib/imageLoader.ts",
  },
};

// This project lives under ~/Desktop, which macOS syncs to iCloud Drive. iCloud
// constantly evicts/renames the thousands of files Turbopack writes to the dev
// cache, deleting `.next/dev` out from under the running server (restart loop +
// manifest ENOENT 500s). iCloud never syncs paths ending in `.nosync`, so in dev
// we write the cache to `.next.nosync` instead. It stays INSIDE the project tree
// so Node still resolves node_modules. Production/CI builds keep the default
// `.next` (Netlify is unaffected).
export default (phase: string) => {
  // `NEXT_DIST_DIR` lets you build into a non-iCloud dir locally
  // (`NEXT_DIST_DIR=.next.nosync pnpm build`). Netlify never sets it, so CI
  // builds keep the default `.next` (its publish dir).
  const distDir =
    process.env.NEXT_DIST_DIR ??
    (phase === PHASE_DEVELOPMENT_SERVER ? ".next.nosync" : undefined);
  const config: NextConfig = distDir ? { ...nextConfig, distDir } : nextConfig;
  return withNextIntl(config);
};
