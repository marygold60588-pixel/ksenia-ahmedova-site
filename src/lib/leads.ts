import { apiEndpoints } from "@/api/endpoints";
import { apiRequest, isApiConfigured } from "@/api/client";
import type { LeadIntent } from "@/content/types";

export type LeadPayload = {
  name: string;
  contact: string;
  intent: LeadIntent;
  message?: string;
  source: "site-form" | "paper-card" | "agent";
  createdAt: string;
};

export type LeadResult = {
  ok: boolean;
};

export interface LeadAdapter {
  id: string;
  send(lead: LeadPayload): Promise<LeadResult>;
}

class LocalLeadAdapter implements LeadAdapter {
  id = "local";
  private storageKey = "akhmedova.leads";

  async send(lead: LeadPayload): Promise<LeadResult> {
    if (typeof window === "undefined") return { ok: true };
    const existing = this.read();
    existing.push(lead);
    window.localStorage.setItem(this.storageKey, JSON.stringify(existing));
    return { ok: true };
  }

  read(): LeadPayload[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as LeadPayload[]) : [];
    } catch {
      return [];
    }
  }
}

class ApiLeadAdapter implements LeadAdapter {
  id = "api";

  async send(lead: LeadPayload): Promise<LeadResult> {
    await apiRequest(apiEndpoints.leads, {
      method: "POST",
      body: JSON.stringify(lead),
    });
    return { ok: true };
  }
}

/**
 * Local storage until VITE_API_URL points at the future backend.
 * Telegram, CRM, and GPT stay on that server — not in the browser.
 */
const adapters: LeadAdapter[] = isApiConfigured()
  ? [new ApiLeadAdapter()]
  : [new LocalLeadAdapter()];

export async function submitLead(
  input: Omit<LeadPayload, "createdAt">,
): Promise<LeadResult> {
  const lead: LeadPayload = {
    ...input,
    createdAt: new Date().toISOString(),
  };

  const results = await Promise.all(adapters.map((adapter) => adapter.send(lead)));
  return { ok: results.every((result) => result.ok) };
}
