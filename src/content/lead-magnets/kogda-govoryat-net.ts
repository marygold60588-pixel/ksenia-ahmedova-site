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

export const automations = [
  {
    id: "freeze",
    title: "Замереть",
    text: "Молчите. Не просите. Не проявляетесь. Лучше не двигаться, чем снова получить это ощущение.",
  },
  {
    id: "please",
    title: "Угодить",
    text: "Говорите «ну ладно», когда хочется сказать «нет». Соглашаетесь на неудобное, становитесь гибким и «нормальным» — лишь бы не потерять контакт.",
  },
  {
    id: "leave",
    title: "Исчезнуть первым",
    text: "Уходите в работу, в холод, в «я и так справлюсь». Делаете вид, что никто не нужен. Так тоже можно защищаться: не подпускать, чтобы не отказали.",
  },
] as const;
