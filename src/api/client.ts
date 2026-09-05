/**
 * Browser client for a future backend.
 * OpenAI keys and CRM secrets must never live here.
 * Frontend → VITE_API_URL → backend → GPT / CRM.
 */

export class ApiNotConfiguredError extends Error {
  constructor() {
    super("Backend API is not configured. Set VITE_API_URL when the server is ready.");
    this.name = "ApiNotConfiguredError";
  }
}

export function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) throw new ApiNotConfiguredError();

  const response = await fetch(`${base}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
