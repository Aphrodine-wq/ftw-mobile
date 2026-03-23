import { listJobs, listEstimates, listProjects, listClients, listNotifications, listInvoices } from "./client";
import { mockJobs, mockEstimates, mockConversations, contractorStats, homeownerStats } from "@src/lib/mock-data";

export async function fetchJobs() {
  try { return await listJobs(); } catch { return mockJobs; }
}

export async function fetchEstimates() {
  try { return await listEstimates(); } catch { return mockEstimates; }
}

export async function fetchProjects() {
  try { return await listProjects(); } catch { return []; }
}

export async function fetchClients() {
  try { return await listClients(); } catch { return []; }
}

export async function fetchNotifications() {
  try { return await listNotifications(); } catch { return []; }
}

export async function fetchInvoices() {
  try { return await listInvoices(); } catch { return []; }
}

// Re-export stats (no API for aggregate stats yet)
export { contractorStats, homeownerStats, mockConversations };
