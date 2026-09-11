export const SITE_ORIGIN = "https://ksenia-ahmedova.ru";

export const strahOtverzheniyaMeta = {
  path: "/strah-otverzheniya",
  canonical: `${SITE_ORIGIN}/strah-otverzheniya`,
  title: "Страх отвержения: почему отказ ощущается как «меня нет»",
  description:
    "Чем страх отказа отличается от страха отвержения. Почему можно понимать, что ничего страшного не случилось, и всё равно реагировать стыдом, тревогой или желанием исчезнуть.",
  robots: "index, follow",
  ogType: "article",
  ogImage: `${SITE_ORIGIN}/media/portraits/gaze-sage.png`,
  published: "2026-09-11",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Страх отвержения: почему отказ ощущается как «меня нет»",
    description:
      "Чем страх отказа отличается от страха отвержения. Почему можно понимать, что ничего страшного не случилось, и всё равно реагировать стыдом, тревогой или желанием исчезнуть.",
    inLanguage: "ru",
    datePublished: "2026-09-11",
    dateModified: "2026-09-11",
    mainEntityOfPage: `${SITE_ORIGIN}/strah-otverzheniya`,
    url: `${SITE_ORIGIN}/strah-otverzheniya`,
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
