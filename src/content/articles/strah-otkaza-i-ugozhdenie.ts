import { SITE_ORIGIN } from "@/content/articles/strah-otverzheniya";

export const strahOtkazaIUgozhdenieMeta = {
  path: "/strah-otkaza-i-ugozhdenie",
  canonical: `${SITE_ORIGIN}/strah-otkaza-i-ugozhdenie`,
  title: "Почему я соглашаюсь, хотя не хочу: страх отказа и угождение",
  description:
    "Почему я соглашаюсь, хотя не хочу, и боюсь сказать нет. Часто это не про «неумение ставить границы», а про страх, что своё «нет» испортит отношение.",
  robots: "index, follow",
  ogType: "article",
  ogImage: `${SITE_ORIGIN}/media/portraits/gaze-sage.png`,
  published: "2026-09-13",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Почему я соглашаюсь, хотя не хочу: страх отказа и угождение",
    description:
      "Почему я соглашаюсь, хотя не хочу, и боюсь сказать нет. Часто это не про «неумение ставить границы», а про страх, что своё «нет» испортит отношение.",
    inLanguage: "ru",
    datePublished: "2026-09-13",
    dateModified: "2026-09-13",
    mainEntityOfPage: `${SITE_ORIGIN}/strah-otkaza-i-ugozhdenie`,
    url: `${SITE_ORIGIN}/strah-otkaza-i-ugozhdenie`,
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
