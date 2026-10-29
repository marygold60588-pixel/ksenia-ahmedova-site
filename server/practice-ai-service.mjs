import { validatePracticeAI } from "./practice-ai.mjs";
import { buildPracticeRequest } from "./practice-ai-request.mjs";

// No caller should enable this until legal/privacy review and owner approval.
export async function handleAIRequest(payload, env = process.env, transport = fetch) {
  const validation = validatePracticeAI(payload, env);
  if (!validation.ok) return { status: validation.status, body: { ok: false, reason: validation.reason } };
  const model = env.PRACTICE_AI_MODEL;
  if (!model) return { status: 503, body: { ok: false, reason: "model_not_approved" } };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await transport("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: "Bearer " + env.OPENROUTER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(buildPracticeRequest(validation.inquiry, model))
    });
    if (!response.ok) return { status: 502, body: { ok: false, reason: "provider_unavailable" } };
    const result = await response.json();
    const answer = result?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || answer.trim().length < 30 || answer.length > 2500) {
      return { status: 502, body: { ok: false, reason: "invalid_response" } };
    }
    return { status: 200, body: { ok: true, interpretation: answer.trim() } };
  } catch {
    return { status: 502, body: { ok: false, reason: "provider_unavailable" } };
  } finally {
    clearTimeout(timeout);
  }
}
