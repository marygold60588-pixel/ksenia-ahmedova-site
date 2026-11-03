export const CONSULTATION_RELAY_URL_DEFAULT =
  "https://ksenia-ahmedova-leads-ingress.marygold60588.workers.dev";

export function telegramRelayEnv(env = process.env) {
  const url = typeof env.TELEGRAM_RELAY_URL === "string" ? env.TELEGRAM_RELAY_URL.trim() : "";
  const secret = typeof env.TELEGRAM_RELAY_SECRET === "string" ? env.TELEGRAM_RELAY_SECRET.trim() : "";
  return { url, secret };
}

export function consultationRelayEnv(env = process.env) {
  const url =
    typeof env.CONSULTATION_RELAY_URL === "string" && env.CONSULTATION_RELAY_URL.trim()
      ? env.CONSULTATION_RELAY_URL.trim()
      : CONSULTATION_RELAY_URL_DEFAULT;
  const secret =
    typeof env.CONSULTATION_RELAY_SECRET === "string" ? env.CONSULTATION_RELAY_SECRET.trim() : "";
  return { url, secret };
}

/** consultation → CONSULTATION_RELAY_*; other intents → TELEGRAM_RELAY_* (unchanged). */
export function resolveTelegramRelay(lead, env = process.env) {
  if (lead && lead.intent === "consultation") {
    const consultation = consultationRelayEnv(env);
    return {
      url: consultation.url,
      secret: consultation.secret,
      route: "consultation_ingress",
    };
  }
  const legacy = telegramRelayEnv(env);
  return { url: legacy.url, secret: legacy.secret, route: "legacy_relay" };
}
