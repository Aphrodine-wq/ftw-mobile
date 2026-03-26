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
    const jobs = await api.listJobs();
    if (jobs.length > 0) return jobs;
  } catch {}
  return mockJobs;
}

export async function fetchEstimates() {
  try {
    const estimates = await api.listEstimates();
    if (estimates.length > 0) return estimates;
  } catch {}
  return mockEstimates;
}

export async function fetchProjects() {
  try {
    const projects = await api.listProjects();
    if (projects.length > 0) return projects;
  } catch {}
  return mockProjects;
}

export async function fetchInvoices() {
  try {
    const invoices = await api.listInvoices();
    if (invoices.length > 0) return invoices;
  } catch {}
  return mockInvoices;
}

export async function fetchClients() {
  try {
    const clients = await api.listClients();
    if (clients.length > 0) return clients;
  } catch {}
  return mockClients;
}

export async function fetchReviews() {
  try {
    const reviews = await api.listReviews();
    if (reviews.length > 0) return reviews;
  } catch {}
  return mockReviews;
}

export async function fetchNotifications() {
  try {
    const notifs = await api.listNotifications();
    if (notifs.length > 0) return notifs;
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
