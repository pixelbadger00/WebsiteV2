import type { Localized } from "@/lib/i18n-content";

export type PortableText = unknown[];

export type ImageAsset = {
  url: string;
  metadata?: {
    dimensions?: { width: number; height: number };
    lqip?: string;
  };
};

export type SanityImage = {
  alt?: string;
  asset?: ImageAsset | null;
} | null;

export type Seo = {
  metaTitle?: Localized<string>;
  metaDescription?: Localized<string>;
  noIndex?: boolean;
} | null;

export type FaqItem = {
  question?: Localized<string>;
  answer?: Localized<string>;
};

export type BeforeAfterPair = {
  before?: SanityImage;
  after?: SanityImage;
  caption?: Localized<string>;
};

export type Procedure = {
  _id: string;
  name?: Localized<string>;
  slug?: Localized<{ current?: string }>;
  summary?: Localized<string>;
  heroImage?: SanityImage;
  body?: Localized<PortableText>;
  recoveryTime?: Localized<string>;
  showBeforeAfter?: { el?: boolean; en?: boolean };
  beforeAfter?: BeforeAfterPair[];
  faqs?: FaqItem[];
  seo?: Seo;
};

export type Testimonial = {
  _id: string;
  quote?: string;
  author?: string;
  language?: string;
  procedureName?: Localized<string>;
};

export type Doctor = {
  _id: string;
  name?: Localized<string>;
  shortBio?: Localized<string>;
  bio?: Localized<PortableText>;
  portrait?: SanityImage;
  credentials?: Localized<string>[];
  memberships?: Localized<string>[];
  registrationNumbers?: string[];
  timeline?: { year?: Localized<string>; label?: Localized<string> }[];
  seo?: Seo;
};

export type OpeningHours = {
  day?: string;
  opens?: string;
  closes?: string;
  closed?: boolean;
};

export type HomePage = {
  heroImage?: {
    alt?: string;
    asset?: ImageAsset | null;
    hotspot?: { x?: number; y?: number };
  } | null;
  heroEyebrow?: Localized<string>;
  heroTitle?: Localized<string>;
  heroLead?: Localized<string>;
  trustBadges?: Localized<string>[];
  proceduresTitle?: Localized<string>;
  proceduresIntro?: Localized<string>;
  proceduresCtaLabel?: Localized<string>;
  aboutEyebrow?: Localized<string>;
  aboutCtaLabel?: Localized<string>;
  reviewsEyebrow?: Localized<string>;
  reviewsTitle?: Localized<string>;
  closingCtaTitle?: Localized<string>;
  closingCtaBody?: Localized<string>;
} | null;

export type SiteSettings = {
  siteName?: Localized<string>;
  titlePrefix?: Localized<string>;
  tagline?: Localized<string>;
  contact?: {
    phone?: string;
    mobile?: string;
    whatsapp?: string;
    email?: string;
  };
  address?: Localized<string>;
  mapUrl?: string;
  openingHours?: OpeningHours[];
  germanEnabled?: boolean;
} | null;

export type Page = {
  _id: string;
  title?: Localized<string>;
  slug?: Localized<{ current?: string }>;
  heroImage?: SanityImage;
  body?: Localized<PortableText>;
  seo?: Seo;
};

export type Post = {
  _id: string;
  title?: Localized<string>;
  slug?: Localized<{ current?: string }>;
  excerpt?: Localized<string>;
  coverImage?: SanityImage;
  body?: Localized<PortableText>;
  publishedAt?: string;
  seo?: Seo;
};

export type LegalPage = {
  _id: string;
  kind?: "privacy" | "cookies" | "imprint";
  title?: Localized<string>;
  slug?: Localized<{ current?: string }>;
  body?: Localized<PortableText>;
  seo?: Seo;
};
