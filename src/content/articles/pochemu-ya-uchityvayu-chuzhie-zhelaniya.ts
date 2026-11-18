import { SITE_ORIGIN } from "@/content/articles/strah-otverzheniya";

const COVER = `${SITE_ORIGIN}/media/portraits/zadumchivaya-passazhirka.jpg`;

export const pochemuYaUchityvayuChuzhieZhelaniyaMeta = {
  path: "/pochemu-ya-uchityvayu-chuzhie-zhelaniya",
  canonical: `${SITE_ORIGIN}/pochemu-ya-uchityvayu-chuzhie-zhelaniya`,
  title: "Почему я учитываю чужие желания, а мои не замечают | Ксения Ахмедова",
  description:
    "Почему мы уступаем близким, отказываемся от собственных желаний, а затем испытываем обиду и раздражение. Психоаналитический взгляд на отношения.",
  robots: "index, follow",
  ogType: "article",
  ogImage: COVER,
  published: "2026-11-18",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Почему я всегда учитываю чужие желания, а мои никто не замечает?",
    description:
      "Почему мы уступаем близким, отказываемся от собственных желаний, а затем испытываем обиду и раздражение. Психоаналитический взгляд на отношения.",
    inLanguage: "ru",
    datePublished: "2026-11-18",
    dateModified: "2026-11-18",
    mainEntityOfPage: `${SITE_ORIGIN}/pochemu-ya-uchityvayu-chuzhie-zhelaniya`,
    url: `${SITE_ORIGIN}/pochemu-ya-uchityvayu-chuzhie-zhelaniya`,
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
      "почему я отказываюсь от своих желаний, почему я постоянно уступаю близким, страх чужого недовольства, подавление собственных желаний, обида в отношениях",
  },
} as const;
