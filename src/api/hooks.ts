import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./client";
import {
  mockJobs,
  mockEstimates,
  mockProjects,
  mockBids,
  mockClients,
  mockInvoices,
  mockReviews,
  mockNotifications,
  mockFairRecords,
  contractorStats,
  homeownerStats,
} from "@src/lib/mock-data";

// ── Query Keys ────────────────────────────────────────────────────────

export const queryKeys = {
  jobs: ["jobs"] as const,
  job: (id: string) => ["jobs", id] as const,
  estimates: ["estimates"] as const,
  projects: ["projects"] as const,
  clients: ["clients"] as const,
  invoices: ["invoices"] as const,
  reviews: ["reviews"] as const,
  notifications: ["notifications"] as const,
  records: (contractorId?: string) => ["records", contractorId || "me"] as const,
  settings: ["settings"] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
};

// ── Fetchers with mock fallback ───────────────────────────────────────

async function fetchJobsWithFallback() {
  try {
    const data = await api.listJobs();
    if (data.jobs.length > 0) return data.jobs;
  } catch {}
  return mockJobs;
}

async function fetchEstimatesWithFallback() {
  try {
    const data = await api.listEstimates();
    if (data.estimates.length > 0) return data.estimates;
  } catch {}
  return mockEstimates;
}

async function fetchProjectsWithFallback() {
  try {
    const data = await api.listProjects();
    if (data.projects.length > 0) return data.projects;
  } catch {}
  return mockProjects;
}

async function fetchClientsWithFallback() {
  try {
    const data = await api.listClients();
    if (data.clients.length > 0) return data.clients;
  } catch {}
  return mockClients;
}

async function fetchInvoicesWithFallback() {
  try {
    const data = await api.listInvoices();
    if (data.invoices.length > 0) return data.invoices;
  } catch {}
  return mockInvoices;
}

async function fetchReviewsWithFallback() {
  try {
    const data = await api.listReviews();
    if (data.reviews.length > 0) return data.reviews;
  } catch {}
  return mockReviews;
}

async function fetchNotificationsWithFallback() {
  try {
    const data = await api.listNotifications();
    if (data.notifications.length > 0) return data.notifications;
  } catch {}
  return mockNotifications;
}

async function fetchFairRecordsWithFallback(contractorId?: string) {
  try {
    const data = await api.listFairRecords(contractorId || "me");
    if (data.records.length > 0) return data;
  } catch {}
  return {
    records: mockFairRecords,
    stats: { total: mockFairRecords.length, avg_budget_accuracy: 96.8, on_time_rate: 80.0, avg_rating: 4.9 },
  };
}

// ── Query Hooks ───────────────────────────────────────────────────────

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: fetchJobsWithFallback,
    initialData: mockJobs,
    staleTime: 1000 * 60 * 2,
  });
}

export function useEstimates() {
  return useQuery({
    queryKey: queryKeys.estimates,
    queryFn: fetchEstimatesWithFallback,
    initialData: mockEstimates,
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeleteEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: call api.deleteEstimate(id) when backend exists
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.estimates });
      const previous = queryClient.getQueryData(queryKeys.estimates);
      queryClient.setQueryData(queryKeys.estimates, (old: any[] | undefined) =>
        (old || []).filter((e: any) => e.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.estimates, context.previous);
      }
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: fetchProjectsWithFallback,
    initialData: mockProjects,
    staleTime: 1000 * 60 * 2,
  });
}

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: fetchClientsWithFallback,
    initialData: mockClients,
    staleTime: 1000 * 60 * 2,
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: fetchInvoicesWithFallback,
    initialData: mockInvoices,
    staleTime: 1000 * 60 * 2,
  });
}

export function useReviews() {
  return useQuery({
    queryKey: queryKeys.reviews,
    queryFn: fetchReviewsWithFallback,
    initialData: mockReviews,
    staleTime: 1000 * 60 * 5,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotificationsWithFallback,
    initialData: mockNotifications,
    staleTime: 1000 * 30, // 30 seconds — notifications should be fresh
  });
}

export function useFairRecords(contractorId?: string) {
  return useQuery({
    queryKey: queryKeys.records(contractorId),
    queryFn: () => fetchFairRecordsWithFallback(contractorId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: api.getSettings,
    staleTime: 1000 * 60 * 10,
  });
}

// ── Infinite Query Hooks (Pagination) ─────────────────────────────────

export function useJobsInfinite(limit = 20) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.jobs, "infinite"],
    queryFn: ({ pageParam }) => api.listJobs({ cursor: pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 2,
  });
}

export function useEstimatesInfinite(limit = 20) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.estimates, "infinite"],
    queryFn: ({ pageParam }) => api.listEstimates({ cursor: pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 2,
  });
}

export function useClientsInfinite(limit = 20) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.clients, "infinite"],
    queryFn: ({ pageParam }) => api.listClients({ cursor: pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 2,
  });
}

export function useInvoicesInfinite(limit = 20) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.invoices, "infinite"],
    queryFn: ({ pageParam }) => api.listInvoices({ cursor: pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 2,
  });
}

// ── Mutation Hooks ────────────────────────────────────────────────────

export function usePlaceBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, bid }: { jobId: string; bid: { amount: number; message: string; timeline: string } }) =>
      api.placeBid(jobId, bid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
}

export function useAcceptBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, bidId }: { jobId: string; bidId: string }) =>
      api.acceptBid(jobId, bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
}

export function usePostJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.postJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string }) =>
      api.sendMessage(conversationId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(variables.conversationId) });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}

export function useGetAIEstimate() {
  return useMutation({
    mutationFn: api.getAIEstimate,
  });
}

// ── Re-exports for backward compatibility ─────────────────────────────

export { contractorStats, homeownerStats };
