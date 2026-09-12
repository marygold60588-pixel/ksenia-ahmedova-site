import { SITE_ORIGIN } from "@/content/articles/strah-otverzheniya";

export const UNLOCK_KEY = "akhmedova.kogda-govoryat-net";
export const NOTES_KEY = "akhmedova.kogda-govoryat-net.notes";

export const kogdaGovoryatNetMeta = {
  path: "/kogda-govoryat-net",
  canonical: `${SITE_ORIGIN}/kogda-govoryat-net`,
  title: "Когда мне говорят «нет»: карта реакции на отказ",
  description:
    "Короткий рабочий материал Ксении Ахмедовой: как отличить факт отказа от переживания отвержения и заметить свой автоматизм — замереть, угодить или исчезнуть.",
  robots: "index, follow",
  ogType: "website",
  ogImage: `${SITE_ORIGIN}/media/portraits/gaze-sage.png`,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Когда мне говорят «нет»",
    headline: "Когда мне говорят «нет»: карта реакции на отказ",
    description:
      "Короткий рабочий материал: как отличить факт отказа от переживания отвержения и заметить свой автоматизм.",
    inLanguage: "ru",
    url: `${SITE_ORIGIN}/kogda-govoryat-net`,
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    author: { "@id": `${SITE_ORIGIN}/#person` },
  },
} as const;

export const reactions = [
  {
    id: "freeze",
    title: "Замереть",
    hint: "Не попросить, промолчать, не проявляться.",
  },
  {
    id: "please",
    title: "Угодить",
    hint: "Согласиться, сказать «ну ладно», стать удобнее, отказаться от своего.",
  },
  {
    id: "leave",
    title: "Исчезнуть первым",
    hint: "Отстраниться, уйти, сделать вид, что мне это вообще не нужно.",
  },
  {
    id: "other",
    title: "Иначе",
    hint: "",
  },
] as const;
