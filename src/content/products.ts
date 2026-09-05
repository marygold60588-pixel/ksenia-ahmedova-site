import type { Product } from "./types";

export const products: Product[] = [
  {
    id: "relationship-script-diagnosis",
    name: "Диагностика сценария отношений",
    kicker: "Сначала карта сценария",
    tagline: "Почему я выбираю именно таких мужчин и почему повторяю одни и те же истории",
    description:
      "За несколько дней вы увидите свой повторяющийся сценарий в отношениях: почему вас тянет к определённым мужчинам, какую роль вы занимаете рядом с ними и какую потребность пытаетесь получить через отношения.",
    result: {
      notThis: "Я больше никогда не выберу плохого мужчину.",
      butThis: "Я понимаю свой механизм.",
      before: "Почему меня опять тянет к холодным мужчинам?",
      after:
        "Я вижу, что меня цепляет не сам мужчина, а знакомое ощущение: когда любовь нужно заслужить.",
    },
    modules: [
      {
        title: "Почему мы выбираем не тех людей",
        note: "Отношения выбираются не только сознанием.",
      },
      {
        title: "Моя роль в отношениях",
        note: "Почему мы становимся не собой рядом с определёнными людьми.",
      },
      {
        title: "Что я на самом деле ищу в отношениях",
        note: "Поведение → чувство → потребность.",
      },
      {
        title: "Почему советы не помогают",
        note: "Знать головой — недостаточно.",
      },
      {
        title: "Моя карта сценария отношений",
        note: "Личный документ про себя, а не ещё одна теория.",
      },
    ],
    includes: [
      "7 дней самостоятельной работы",
      "Видеоуроки в записи",
      "Рабочая тетрадь",
      "Диагностический тест",
      "Упражнения на самоанализ",
      "Финальная карта моего сценария",
    ],
    price: 7900,
    currency: "RUB",
    cta: "Начать с диагностики",
    href: "#request",
    image: "/media/portraits/writing-notebook.png",
    status: "active",
    kind: "digital",
  },
  {
    id: "consultation",
    name: "Консультация",
    kicker: "Глубокая работа",
    tagline: "Исследование вашего сценария в живом разговоре",
    description:
      "Для тех, кто уже увидел круг — или чувствует, что одной карты мало. Не общие рекомендации. Разбор именно вашей истории.",
    result: null,
    modules: [],
    includes: [],
    price: null,
    currency: "RUB",
    cta: "Запросить консультацию",
    href: "#request",
    image: "/media/portraits/seated-olive.png",
    status: "active",
    kind: "consultation",
  },
];

export function getActiveProducts() {
  return products.filter((product) => product.status === "active");
}

export function getProduct(id: string) {
  return products.find((product) => product.id === id) ?? null;
}

export function formatPrice(amount: number | null, currency: "RUB") {
  if (amount === null) return null;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
