import type { LeadIntent } from "@/content/types";

export type AgentContext = {
  intent?: LeadIntent;
  section?: string;
};

export type AgentAvailability = {
  available: false;
  reason: "not-connected";
};

/**
 * Reserved integration surface for a future bot / AI-agent.
 * UI can call this without knowing the transport.
 */
export async function getAgentAvailability(): Promise<AgentAvailability> {
  return { available: false, reason: "not-connected" };
}

export async function requestAgentAssist(
  _context: AgentContext,
): Promise<AgentAvailability> {
  return getAgentAvailability();
}
