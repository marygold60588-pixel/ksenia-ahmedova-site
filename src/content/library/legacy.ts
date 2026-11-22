export type LegacyCatalogItem = {
  href: string;
  title: string;
  description: string;
  cluster: string;
  clusterLabel: string;
  image?: string;
  imageAlt?: string;
  date?: string;
  source: "legacy";
};

export const LEGACY_CLUSTER_LABELS = {
  rejection: "Страх отвержения и отказа",
  asking: "Просьбы и границы",
  desires: "Желания и уступчивость",
  relationships: "Сценарии отношений",
} as const;

export const legacyArticles: LegacyCatalogItem[] = [
  {
    href: "/pochemu-ya-zhdu-ot-muzha",
    title: "Почему я годами жду от мужа того, что давно могу сделать сама?",
    description:
      "Почему женщина годами ждёт помощи от мужа, хотя может решить проблему самостоятельно? Психоаналитический разбор ожидания, обиды и потребности в заботе.",
    cluster: "desires",
    clusterLabel: LEGACY_CLUSTER_LABELS.desires,
    image: "/images/library/pochemu-ya-zhdu-ot-muzha.jpg",
    imageAlt:
      "Женщина в роскошной ванной рядом с золотым полотенцесушителем и открытым участком с проводами.",
    date: "2026-11-22",
    source: "legacy",
  },
  {
    href: "/pochemu-ya-uchityvayu-chuzhie-zhelaniya",
    title: "Почему я всегда учитываю чужие желания, а мои никто не замечает?",
    description:
      "Почему мы уступаем близким, отказываемся от собственных желаний, а затем испытываем обиду и раздражение.",
    cluster: "desires",
    clusterLabel: LEGACY_CLUSTER_LABELS.desires,
    image: "/media/portraits/zadumchivaya-passazhirka.jpg",
    imageAlt:
      "Элегантная женщина испытывает недовольство в отношениях, несмотря на внешнее благополучие.",
    date: "2026-11-18",
    source: "legacy",
  },
  {
    href: "/strah-otverzheniya",
    title: "Страх отвержения: почему отказ ощущается как «меня нет»",
    description: "Когда чужое «нет» переживается как угроза собственной ценности.",
    cluster: "rejection",
    clusterLabel: LEGACY_CLUSTER_LABELS.rejection,
    image: "/images/library/strah-otverzheniya.jpg",
    imageAlt: "Обложка статьи о страхе отвержения",
    date: "2026-09-11",
    source: "legacy",
  },
  {
    href: "/boyus-prosit",
    title: "Почему я боюсь просить",
    description: "Почему простая просьба может ощущаться как опасность и что стоит за этим страхом.",
    cluster: "asking",
    clusterLabel: LEGACY_CLUSTER_LABELS.asking,
    image: "/images/library/boyus-prosit.jpg",
    imageAlt: "Обложка статьи о страхе просить",
    date: "2026-09-12",
    source: "legacy",
  },
  {
    href: "/strah-otkaza-i-ugozhdenie",
    title: "Почему я соглашаюсь, хотя не хочу",
    description: "О привычке говорить «да» раньше, чем удаётся услышать собственное желание.",
    cluster: "asking",
    clusterLabel: LEGACY_CLUSTER_LABELS.asking,
    image: "/images/library/strah-otkaza-i-ugozhdenie.jpg",
    imageAlt: "Обложка статьи о согласии вопреки желанию",
    date: "2026-09-13",
    source: "legacy",
  },
  {
    href: "/posle-otkaza-hochu-ischeznut",
    title: "Почему после отказа хочется исчезнуть",
    description:
      "Почему после отказа хочется отступить, замолчать и отказаться от того, что было важно.",
    cluster: "rejection",
    clusterLabel: LEGACY_CLUSTER_LABELS.rejection,
    image: "/images/library/posle-otkaza-hochu-ischeznut.jpg",
    imageAlt: "Обложка статьи о желании исчезнуть после отказа",
    date: "2026-09-14",
    source: "legacy",
  },
];
