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

export { contractorStats, homeownerStats, mockConversations, mockBids, mockMessages, mockFairRecords };
