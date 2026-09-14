import { SITE_ORIGIN } from "@/content/articles/strah-otverzheniya";

export const posleOtkazaHochuIscheznutMeta = {
  path: "/posle-otkaza-hochu-ischeznut",
  canonical: `${SITE_ORIGIN}/posle-otkaza-hochu-ischeznut`,
  title: "Почему после отказа хочется исчезнуть: холод, «мне не надо» и дистанция",
  description:
    "Почему после отказа хочется исчезнуть, закрыться или уйти первым. Часто это не равнодушие, а способ не встретить следующее «нет».",
  robots: "index, follow",
  ogType: "article",
  ogImage: `${SITE_ORIGIN}/media/portraits/gaze-sage.png`,
  published: "2026-09-14",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Почему после отказа хочется исчезнуть: холод, «мне не надо» и дистанция",
    description:
      "Почему после отказа хочется исчезнуть, закрыться или уйти первым. Часто это не равнодушие, а способ не встретить следующее «нет».",
    inLanguage: "ru",
    datePublished: "2026-09-14",
    dateModified: "2026-09-14",
    mainEntityOfPage: `${SITE_ORIGIN}/posle-otkaza-hochu-ischeznut`,
    url: `${SITE_ORIGIN}/posle-otkaza-hochu-ischeznut`,
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
