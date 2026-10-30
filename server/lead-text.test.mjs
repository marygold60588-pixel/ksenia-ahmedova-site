import assert from "node:assert/strict";
import test from "node:test";
import { formatLeadText } from "./lead-text.mjs";

test("personal review telegram text omits psychological answers", () => {
  const text = formatLeadText({
    name: "Тест",
    contact: "@test_user",
    contactChannel: "telegram",
    intent: "personal_review",
    message: "не должно попасть в уведомление",
    source: "practice-self-refusal",
    createdAt: "2026-10-30T12:00:00.000Z",
  });

  assert.match(text, /Новая заявка — личный письменный разбор/);
  assert.match(text, /Имя: Тест/);
  assert.match(text, /Контакт: @test_user/);
  assert.match(text, /Источник: практика «Не отказываться от себя»/);
  assert.match(text, /Дата:/);
  assert.doesNotMatch(text, /не должно попасть/);
  assert.doesNotMatch(text, /Сообщение:/);
});

test("regular lead text stays unchanged in shape", () => {
  const text = formatLeadText({
    name: "Анна",
    contact: "anna@example.com",
    contactChannel: "email",
    intent: "diagnosis",
    message: "Вопрос",
    source: "site-form",
    createdAt: "2026-10-30T12:00:00.000Z",
  });
  assert.match(text, /Новая заявка с сайта/);
  assert.match(text, /Запрос: Диагностика сценария/);
  assert.match(text, /Сообщение: Вопрос/);
});
