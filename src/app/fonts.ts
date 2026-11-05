import { Source_Serif_4, Inter } from "next/font/google";

// Headings — Source Serif 4. A clean, professional text serif (refined bold)
// with greek + latin-ext subsets, so it covers Greek (default locale) and
// German ä/ö/ü/ß. On the Greek locale the headings switch to Inter (sans) via a
// --font-serif override in globals.css — the serif's Greek bold read academic.
export const headingSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext", "greek"],
  display: "swap",
  variable: "--font-heading",
});

// Body / UI — Inter. Full Greek + German coverage.
export const inter = Inter({
  subsets: ["latin", "latin-ext", "greek"],
  display: "swap",
  variable: "--font-inter",
});
