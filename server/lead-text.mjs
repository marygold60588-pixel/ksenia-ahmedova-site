const SITE_URL = "https://ksenia-ahmedova.ru/";

const INTENTS = {
  diagnosis: "Диагностика сценария",
  consultation: "Консультация",
  gift: "Гайд",
};

const CHANNELS = {
  telegram: "Telegram",
  max: "MAX",
  email: "Email",
};

export function channelLabel(channel) {
  return CHANNELS[channel] || channel || "не указан";
}

export function formatLeadText(lead) {
  const source = lead.createdAt ? new Date(lead.createdAt) : new Date();
  const when = Number.isNaN(source.getTime())
    ? new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })
    : source.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

  return [
    "Новая заявка с сайта",
    "",
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    `Связь: ${channelLabel(lead.contactChannel)}`,
    `Запрос: ${INTENTS[lead.intent] || lead.intent || "не указан"}`,
    `Сообщение: ${lead.message || "не указано"}`,
    "",
    `Страница: ${SITE_URL}`,
    `Дата/время: ${when}`,
  ].join("\n");
}
