import { SITE_ORIGIN } from "@/content/articles/strah-otverzheniya";

export const boyusPrositMeta = {
  path: "/boyus-prosit",
  canonical: `${SITE_ORIGIN}/boyus-prosit`,
  title: "Почему я боюсь просить: страх отказа и «я слишком»",
  description:
    "Почему я боюсь просить и боюсь попросить помощи. Страх попросить часто связан не с самой просьбой, а с тем, что отказ начинает означать про меня.",
  robots: "index, follow",
  ogType: "article",
  ogImage: `${SITE_ORIGIN}/media/portraits/gaze-sage.png`,
  published: "2026-09-12",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Почему я боюсь просить: страх отказа и «я слишком»",
    description:
      "Почему я боюсь просить и боюсь попросить помощи. Страх попросить часто связан не с самой просьбой, а с тем, что отказ начинает означать про меня.",
    inLanguage: "ru",
    datePublished: "2026-09-12",
    dateModified: "2026-09-12",
    mainEntityOfPage: `${SITE_ORIGIN}/boyus-prosit`,
    url: `${SITE_ORIGIN}/boyus-prosit`,
    image: `${SITE_ORIGIN}/media/portraits/gaze-sage.png`,
    author: {
      "@type": "Person",
      "@id": `${SITE_ORIGIN}/#person`,
      name: "Ксения Ахмедова",
      jobTitle: "врач-психотерапевт, психоаналитик",
      url: `${SITE_ORIGIN}/`,
    },
    publisher: {
      "@id": `${SITE_ORIGIN}/#person`,
    },
  },
} as const;
