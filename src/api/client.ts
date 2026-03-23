import { API_BASE } from "@src/lib/constants";
import { useAuthStore } from "@src/stores/auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || `API error: ${res.status}`, res.status);
  }

  return res.json();
}

export async function listJobs(): Promise<any[]> {
  const data = await apiFetch<{ jobs: any[] }>("/api/jobs");
  return data.jobs;
}

export async function listEstimates(): Promise<any[]> {
  const data = await apiFetch<{ estimates: any[] }>("/api/estimates");
  return data.estimates;
}

export async function listInvoices(): Promise<any[]> {
  const data = await apiFetch<{ invoices: any[] }>("/api/invoices");
  return data.invoices;
}

export async function listProjects(): Promise<any[]> {
  const data = await apiFetch<{ projects: any[] }>("/api/projects");
  return data.projects;
}

export async function listClients(): Promise<any[]> {
  const data = await apiFetch<{ clients: any[] }>("/api/clients");
  return data.clients;
}

export async function listNotifications(): Promise<any[]> {
  const data = await apiFetch<{ notifications: any[] }>("/api/notifications");
  return data.notifications;
}
