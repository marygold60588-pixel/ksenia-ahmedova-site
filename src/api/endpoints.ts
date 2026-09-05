/** Paths on the future backend. Do not call OpenAI from these routes in the browser. */
export const apiEndpoints = {
  leads: "/leads",
  agentMessage: "/agent/message",
  agentAvailability: "/agent/availability",
} as const;
