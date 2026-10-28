// Validate inputs before any external AI request. Never log inquiry text.
export function validatePracticeAI(input, env = process.env) {
  if (env.PRACTICE_AI_ENABLED !== "true") return { ok: false, status: 503, reason: "disabled" };
  if (!env.OPENROUTER_API_KEY) return { ok: false, status: 503, reason: "not_configured" };
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, status: 400, reason: "invalid_input" };
  if (input.aiConsent !== true || input.adultConfirmed !== true) return { ok: false, status: 400, reason: "consent_required" };
  if (!input.inquiry || typeof input.inquiry !== "object" || Array.isArray(input.inquiry)) return { ok: false, status: 400, reason: "invalid_input" };
  const fields = ["scene", "action", "wish", "fear", "response", "repeated"];
  const inquiry = {};
  for (const key of fields) {
    const value = input.inquiry[key];
    if (value != null && typeof value !== "string") return { ok: false, status: 400, reason: "invalid_field" };
    if (typeof value === "string" && value.length > 1200) return { ok: false, status: 413, reason: "field_too_large" };
    inquiry[key] = (value || "").trim();
  }
  if (!inquiry.scene || !inquiry.action || !inquiry.wish) return { ok: false, status: 400, reason: "missing_answers" };
  return { ok: true, inquiry };
}
