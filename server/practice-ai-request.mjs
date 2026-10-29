// Pure request builder. This file does not make network requests.
export function buildPracticeRequest(inquiry, model) {
  const instruction = [
    "Ты помощник для самостоятельной психологической рефлексии взрослого.",
    "Используй только конкретные факты из ответов. Предложи одну осторожную",
    "психодинамическую гипотезу о желании, страхе и возможной защитной функции.",
    "Проверь альтернативное объяснение. Не ставь диагноз и не утверждай",
    "неизвестные факты о прошлом. Не обвиняй человека. Если есть угроза или",
    "насилие, воздержись от конфронтации. Ответь по-русски до 110 слов."
  ].join(" ");
  return {
    model,
    temperature: 0.3,
    max_tokens: 320,
    provider: { zdr: true, data_collection: "deny", allow_fallbacks: false },
    messages: [
      { role: "system", content: instruction },
      { role: "user", content: JSON.stringify(inquiry) }
    ]
  };
}
