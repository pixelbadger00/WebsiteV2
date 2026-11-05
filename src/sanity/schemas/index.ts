import { type SchemaTypeDefinition } from "sanity";

import { blockContent } from "./objects/blockContent";
import {
  localeString,
  localeText,
  localeBlockContent,
  localeSlug,
} from "./objects/localized";
import { seo } from "./objects/seo";
import {
  faqItem,
  openingHours,
  socialLink,
  beforeAfterPair,
  beforeAfterVisibility,
} from "./objects/shared";

import { siteSettings } from "./documents/siteSettings";
import { homePage } from "./documents/homePage";
import { page } from "./documents/page";
import { procedure } from "./documents/procedure";
import { doctor } from "./documents/doctor";
import { faq } from "./documents/faq";
import { post } from "./documents/post";
import { testimonial } from "./documents/testimonial";
import { legalPage } from "./documents/legalPage";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects (reusable)
  blockContent,
  localeString,
  localeText,
  localeBlockContent,
  localeSlug,
  seo,
  faqItem,
  openingHours,
  socialLink,
  beforeAfterPair,
  beforeAfterVisibility,
  // Documents
  siteSettings,
  homePage,
  page,
  procedure,
  doctor,
  faq,
  post,
  testimonial,
  legalPage,
];
