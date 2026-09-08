import { getApiBaseUrl, isApiConfigured } from "@/api/client";
import { apiEndpoints } from "@/api/endpoints";
import type { LeadIntent, ContactChannel } from "@/content/types";

export type LeadPayload = {
  name: string;
  contact: string;
  intent: LeadIntent;
  contactChannel: ContactChannel;
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
    if (!import.meta.env.DEV || typeof window === "undefined") {
      return { ok: false };
    }
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
    if (!isApiConfigured()) {
      return { ok: false };
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}${apiEndpoints.leads}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lead),
      });
      const data = (await response.json().catch(() => null)) as LeadResult | null;
      return { ok: response.ok && data?.ok === true };
    } catch {
      return { ok: false };
    }
  }
}

const localAdapter = new LocalLeadAdapter();
const apiAdapter = new ApiLeadAdapter();

export async function submitLead(
  input: Omit<LeadPayload, "createdAt">,
): Promise<LeadResult> {
  const lead: LeadPayload = {
    ...input,
    createdAt: new Date().toISOString(),
  };

  if (import.meta.env.DEV && !isApiConfigured()) {
    return localAdapter.send(lead);
  }

  return apiAdapter.send(lead);
}
