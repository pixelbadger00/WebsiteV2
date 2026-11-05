import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation helpers. Link/redirect keep the user on the
// same page when switching language and respect the as-needed prefix.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
