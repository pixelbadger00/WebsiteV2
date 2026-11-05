import type { Metadata, Viewport } from "next";
import {
  metadata as studioMetadata,
  viewport as studioViewport,
} from "next-sanity/studio";

// Keep the Studio out of search engines (also blocked in robots.txt in Phase 3).
export const metadata: Metadata = {
  ...studioMetadata,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { ...studioViewport };

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
