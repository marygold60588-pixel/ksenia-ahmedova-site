export type LeadIntent = "diagnosis" | "consultation" | "gift";

export type ProductStatus = "active" | "hidden" | "coming_soon";

export type ProductKind = "digital" | "consultation";

export type Product = {
  id: string;
  name: string;
  kicker: string;
  tagline: string;
  description: string;
  result: {
    notThis: string;
    butThis: string;
    before: string;
    after: string;
  } | null;
  modules: { title: string; note: string }[];
  includes: string[];
  price: number | null;
  currency: "RUB";
  cta: string;
  href: string;
  image: string;
  status: ProductStatus;
  kind: ProductKind;
};

export type Gift = {
  id: string;
  title: string;
  description: string;
  format: string;
};

export type SiteContent = {
  identity: {
    givenName: string;
    familyName: string;
    fullName: string;
    role: string;
    method: string;
  };
  nav: { label: string; href: string }[];
  hero: {
    lineOne: string;
    lineTwo: string;
    lineThree: string;
    lead: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    image: string;
    imageAlt: string;
    mobileVideo: string;
  };
  turn: {
    kicker: string;
    title: string;
    lead: string;
    shift: string;
    phrases: string[];
    image: string;
    imageAlt: string;
  };
  expert: {
    kicker: string;
    title: string;
    name: string;
    credentials: string[];
    statement: string;
    forWhom: string;
    image: string;
    imageAlt: string;
    video: string;
  };
  gift: {
    kicker: string;
    title: string;
    lead: string;
    cta: string;
    hint: string;
    item: Gift;
  };
  voices: {
    kicker: string;
    title: string;
  };
  consultation: {
    kicker: string;
    title: string;
    lead: string;
    closing: string;
    cta: string;
    image: string;
    imageAlt: string;
  };
  form: {
    kicker: string;
    title: string;
    lead: string;
    nameLabel: string;
    contactLabel: string;
    contactHint: string;
    intentLabel: string;
    messageLabel: string;
    submit: string;
    success: string;
    intents: { value: LeadIntent; label: string }[];
  };
  footer: {
    note: string;
  };
};
