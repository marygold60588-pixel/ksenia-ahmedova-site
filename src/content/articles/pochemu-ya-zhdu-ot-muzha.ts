import { SITE_ORIGIN } from "@/content/articles/strah-otverzheniya";

const COVER = `${SITE_ORIGIN}/images/library/pochemu-ya-zhdu-ot-muzha.jpg`;

export const pochemuYaZhduOtMuzhaMeta = {
  path: "/pochemu-ya-zhdu-ot-muzha",
  canonical: `${SITE_ORIGIN}/pochemu-ya-zhdu-ot-muzha`,
  title: "Почему я жду от мужа обещанного и не решаю сама? | Ксения Ахмедова",
  description:
    "Почему женщина годами ждёт помощи от мужа, хотя может решить проблему самостоятельно? Психоаналитический разбор ожидания, обиды и потребности в заботе.",
  robots: "index, follow",
  ogType: "article",
  ogImage: COVER,
  published: "2026-11-22",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Почему я годами жду от мужа того, что давно могу сделать сама?",
    description:
      "Почему женщина годами ждёт помощи от мужа, хотя может решить проблему самостоятельно? Психоаналитический разбор ожидания, обиды и потребности в заботе.",
    inLanguage: "ru",
    datePublished: "2026-11-22",
    dateModified: "2026-11-22",
    mainEntityOfPage: `${SITE_ORIGIN}/pochemu-ya-zhdu-ot-muzha`,
    url: `${SITE_ORIGIN}/pochemu-ya-zhdu-ot-muzha`,
    image: COVER,
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
    keywords:
      "почему я жду от мужа, невыполненные обещания в браке, ожидание заботы, самостоятельность в отношениях, психоанализ отношений",
  },
} as const;
