// No network calls occur in this module. AI remains disabled.
export function validatePracticeAI(input, env = process.env) {
  if (env.PRACTICE_AI_ENABLED !== "true") return { ok: false, status: 503, reason: "disabled" };
  if (!env.OPENROUTER_API_KEY) return { ok: false, status: 503, reason: "not_configured" };
  if (input?.aiConsent !== true || input?.adultConfirmed !== true) return { ok: false, status: 400, reason: "consent_required" };
  if (!input?.inquiry || typeof input.inquiry !== "object") return { ok: false, status: 400, reason: "invalid_input" };
  const fields = ["scene", "action", "wish", "fear", "response", "repeated"];
  const inquiry = Object.fromEntries(fields.map(k => [k, typeof input.inquiry[k] === "string" ? input.inquiry[k].trim().slice(0, 1200) : ""]));
  if (!inquiry.scene || !inquiry.action || !inquiry.wish) return { ok: false, status: 400, reason: "missing_answers" };
  return { ok: true, inquiry };
}
