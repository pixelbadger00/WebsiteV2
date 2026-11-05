// Next.js 16 proxy (formerly middleware.ts). next-intl's middleware handler
// works unchanged here — the request/response signature is identical.
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run on all paths except API routes, Next internals, the embedded Sanity
  // Studio (/studio), and files with an extension (static assets).
  matcher: "/((?!api|_next|_vercel|studio|.*\\..*).*)",
};
