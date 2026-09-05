import { apiEndpoints } from "@/api/endpoints";
import { apiRequest, isApiConfigured } from "@/api/client";
import { getAgentAvailability, requestAgentAssist } from "@/lib/agent";
import type { AgentAvailability, AgentContext } from "@/lib/agent";

export type { AgentAvailability, AgentContext };

export { getAgentAvailability, requestAgentAssist };

/** Future chat: browser → backend `/agent/message` → OpenAI. No secrets in the client. */
export async function sendAgentMessage(message: string): Promise<{ reply: string }> {
  if (!isApiConfigured()) {
    return { reply: "" };
  }

  return apiRequest<{ reply: string }>(apiEndpoints.agentMessage, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
