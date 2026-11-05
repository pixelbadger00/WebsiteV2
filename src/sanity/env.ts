// Sanity project configuration from env. Fallbacks keep the build green before
// the real project exists; replace by setting the env vars (see .env.example).
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-02";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder";

export const isSanityConfigured = projectId !== "placeholder";
