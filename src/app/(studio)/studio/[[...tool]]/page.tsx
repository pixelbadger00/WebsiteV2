"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/config";

// The embedded Sanity Studio. Rendered entirely on the client.
export const dynamic = "force-static";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
