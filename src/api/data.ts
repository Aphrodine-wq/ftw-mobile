import * as api from "./client";
import {
  mockJobs,
  mockEstimates,
  mockConversations,
  mockMessages,
  mockBids,
  mockFairRecords,
  mockReviews,
  mockNotifications,
  mockProjects,
  mockClients,
  mockInvoices,
  contractorStats,
  homeownerStats,
  mockSubJobs,
  mockSubBids,
  subContractorStats,
} from "@src/lib/mock-data";

export async function fetchJobs() {
  try {
    const data = await api.listJobs();
    if (data.jobs.length > 0) return data.jobs;
  } catch {}
  return mockJobs;
}

export async function fetchEstimates() {
  try {
    const data = await api.listEstimates();
    if (data.estimates.length > 0) return data.estimates;
  } catch {}
  return mockEstimates;
}

export async function fetchProjects() {
  try {
    const data = await api.listProjects();
    if (data.projects.length > 0) return data.projects;
  } catch {}
  return mockProjects;
}

export async function fetchInvoices() {
  try {
    const data = await api.listInvoices();
    if (data.invoices.length > 0) return data.invoices;
  } catch {}
  return mockInvoices;
}

export async function fetchClients() {
  try {
    const data = await api.listClients();
    if (data.clients.length > 0) return data.clients;
  } catch {}
  return mockClients;
}

export async function fetchReviews() {
  try {
    const data = await api.listReviews();
    if (data.reviews.length > 0) return data.reviews;
  } catch {}
  return mockReviews;
}

export async function fetchNotifications() {
  try {
    const data = await api.listNotifications();
    if (data.notifications.length > 0) return data.notifications;
  } catch {}
  return mockNotifications;
}

export async function fetchFairRecords(contractorId?: string) {
  try {
    const data = await api.listFairRecords(contractorId || "me");
    if (data.records.length > 0) return data;
  } catch {}
  return {
    records: mockFairRecords,
    stats: { total: mockFairRecords.length, avg_budget_accuracy: 96.8, on_time_rate: 80.0, avg_rating: 4.9 },
  };
}

export async function fetchSubJobs() {
  try {
    const data = await api.listSubJobs();
    if (data.sub_jobs.length > 0) return data.sub_jobs;
  } catch {}
  return mockSubJobs;
}

export async function fetchMySubJobs() {
  try {
    const data = await api.listMySubJobs();
    if (data.sub_jobs.length > 0) return data.sub_jobs;
  } catch {}
  return mockSubJobs.filter((sj) => sj.status === "in_progress" || sj.status === "completed");
}

export async function fetchSubContractorStats() {
  try {
    const data = await api.getSubContractorStats();
    if (data) return data;
  } catch {}
  return subContractorStats;
}

export async function fetchSubBidsForUser() {
  // No dedicated endpoint yet — derive from mySubJobs or fall back to mock
  try {
    const data = await api.listMySubJobs();
    if (data.sub_jobs.length > 0) {
      // Flatten bids from sub jobs if backend returns them nested
      const bids: any[] = [];
      for (const sj of data.sub_jobs) {
        if (sj.bids) bids.push(...sj.bids);
      }
      if (bids.length > 0) return bids;
    }
  } catch {}
  return mockSubBids;
}

export { contractorStats, homeownerStats, mockConversations, mockBids, mockMessages, mockFairRecords };
