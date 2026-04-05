import { API_BASE } from "@src/lib/constants";
import { useAuthStore } from "@src/stores/auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Prevent multiple simultaneous refresh attempts
let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  const { token } = useAuthStore.getState();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newToken = data.token as string;

    // Update store with new token
    useAuthStore.setState({ token: newToken });
    return newToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { _retried?: boolean }
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // 401 — attempt silent token refresh, retry once
  if (res.status === 401 && !options?._retried && token) {
    // Deduplicate concurrent refresh calls
    if (!refreshPromise) {
      refreshPromise = refreshToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      // Retry with new token
      return apiFetch<T>(path, { ...options, _retried: true });
    }

    // Refresh failed — clear auth, force re-login
    useAuthStore.getState().logout();
    throw new ApiError("Session expired", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || `API error: ${res.status}`, res.status);
  }

  return res.json();
}

// Jobs
export async function listJobs(params?: { cursor?: string; limit?: number }): Promise<{ jobs: any[]; nextCursor?: string }> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch(`/api/jobs${qs ? `?${qs}` : ""}`);
}

export async function getJob(id: string): Promise<{ job: any; bids: any[] }> {
  return apiFetch(`/api/jobs/${id}`);
}

export async function postJob(attrs: {
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  location: string;
  latitude?: number;
  longitude?: number;
}): Promise<any> {
  const data = await apiFetch<{ job: any }>("/api/jobs", {
    method: "POST",
    body: JSON.stringify({ job: attrs }),
  });
  return data.job;
}

// Push token management
export async function registerPushToken(token: string, platform: string): Promise<any> {
  return apiFetch("/api/push/register", {
    method: "POST",
    body: JSON.stringify({ token, platform }),
  });
}

export async function unregisterPushToken(token: string): Promise<any> {
  return apiFetch("/api/push/unregister", {
    method: "DELETE",
    body: JSON.stringify({ token }),
  });
}

export async function placeBid(
  jobId: string,
  bid: { amount: number; message: string; timeline: string }
): Promise<any> {
  const data = await apiFetch<{ bid: any }>(`/api/jobs/${jobId}/bids`, {
    method: "POST",
    body: JSON.stringify({ bid }),
  });
  return data.bid;
}

export async function acceptBid(jobId: string, bidId: string): Promise<any> {
  const data = await apiFetch<{ bid: any }>(
    `/api/jobs/${jobId}/bids/${bidId}/accept`,
    { method: "POST" }
  );
  return data.bid;
}

// Estimates
export async function listEstimates(params?: { cursor?: string; limit?: number }): Promise<{ estimates: any[]; nextCursor?: string }> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch(`/api/estimates${qs ? `?${qs}` : ""}`);
}

// Invoices
export async function listInvoices(params?: { cursor?: string; limit?: number }): Promise<{ invoices: any[]; nextCursor?: string }> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch(`/api/invoices${qs ? `?${qs}` : ""}`);
}

// Projects
export async function listProjects(): Promise<{ projects: any[] }> {
  return apiFetch("/api/projects");
}

// Clients
export async function listClients(params?: { cursor?: string; limit?: number }): Promise<{ clients: any[]; nextCursor?: string }> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch(`/api/clients${qs ? `?${qs}` : ""}`);
}

// Reviews
export async function listReviews(): Promise<{ reviews: any[] }> {
  return apiFetch("/api/reviews");
}

// Notifications
export async function listNotifications(): Promise<{ notifications: any[] }> {
  return apiFetch("/api/notifications");
}

export async function markNotificationRead(id: string): Promise<any> {
  return apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
}

export async function markAllNotificationsRead(): Promise<any> {
  return apiFetch("/api/notifications/read-all", { method: "POST" });
}

// FairRecords
export async function listFairRecords(contractorId: string): Promise<{ records: any[]; stats: any }> {
  return apiFetch(`/api/contractors/${contractorId}/records`);
}

export async function getPublicRecord(publicId: string): Promise<any> {
  const data = await apiFetch<{ record: any }>(`/api/records/${publicId}`);
  return data.record;
}

// Verification
export async function getVerificationStatus(): Promise<any> {
  return apiFetch("/api/contractor/verification");
}

export async function submitVerification(step: string, data: Record<string, unknown>): Promise<any> {
  return apiFetch(`/api/contractor/verification/${step}`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

// Chat
export async function listMessages(conversationId: string): Promise<any[]> {
  const data = await apiFetch<{ messages: any[] }>(`/api/chat/${conversationId}`);
  return data.messages;
}

export async function sendMessage(conversationId: string, body: string): Promise<any> {
  const data = await apiFetch<{ message: any }>(`/api/chat/${conversationId}`, {
    method: "POST",
    body: JSON.stringify({ message: { body } }),
  });
  return data.message;
}

// AI
export async function getAIEstimate(description: string): Promise<{ estimate: any; raw: string | null }> {
  return apiFetch("/api/ai/estimate", {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}

// Settings
export async function getSettings(): Promise<any> {
  const data = await apiFetch<{ settings: any }>("/api/settings");
  return data.settings;
}

export async function updateSettings(settings: Record<string, any>): Promise<any> {
  const data = await apiFetch<{ settings: any }>("/api/settings", {
    method: "PUT",
    body: JSON.stringify({ settings }),
  });
  return data.settings;
}
