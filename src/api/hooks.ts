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
  mockConversations,
  mockPayouts,
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
  invoice: (id: string) => ["invoices", id] as const,
  reviews: ["reviews"] as const,
  contractorReviews: (id: string) => ["reviews", "contractor", id] as const,
  notifications: ["notifications"] as const,
  conversations: ["conversations"] as const,
  records: (contractorId?: string) => ["records", contractorId || "me"] as const,
  settings: ["settings"] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
  verification: ["verification"] as const,
  qbStatus: ["quickbooks", "status"] as const,
  qbInvoice: (invoiceId: string) => ["quickbooks", "invoice", invoiceId] as const,
  payouts: ["payouts"] as const,
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

// ── Conversations ────────────────────────────────────────────────────

async function fetchConversationsWithFallback() {
  try {
    const data = await api.listConversations();
    if (data.conversations.length > 0) return data.conversations;
  } catch {}
  return mockConversations;
}

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: fetchConversationsWithFallback,
    initialData: mockConversations,
    staleTime: 1000 * 30,
  });
}

// ── Contractor Reviews ──────────────────────────────────────────────

export function useContractorReviews(contractorId: string) {
  return useQuery({
    queryKey: queryKeys.contractorReviews(contractorId),
    queryFn: async () => {
      try {
        const data = await api.listContractorReviews(contractorId);
        if (data.reviews.length > 0) return data;
      } catch {}
      return { reviews: mockReviews, stats: { avg_rating: 4.8, count: mockReviews.length } };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
    },
  });
}

// ── Verification / Onboarding ───────────────────────────────────────

export function useVerificationStatus() {
  return useQuery({
    queryKey: queryKeys.verification,
    queryFn: async () => {
      try {
        return await api.getVerificationStatus();
      } catch {}
      return {
        step: "pending",
        businessVerified: false,
        licenseVerified: false,
        insuranceVerified: false,
        overallStatus: "incomplete",
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ step, data }: { step: string; data: Record<string, unknown> }) =>
      api.submitVerification(step, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification });
    },
  });
}

export function useUploadLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.uploadLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification });
    },
  });
}

export function useUploadInsurance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.uploadInsurance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification });
    },
  });
}

// ── Invoice Mutations ──────────────────────────────────────────────────

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Parameters<typeof api.updateInvoice>[1] }) =>
      api.updateInvoice(id, attrs),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(variables.id) });
    },
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.invoice(id),
    queryFn: async () => {
      const data = await api.getInvoice(id);
      return data.invoice;
    },
    staleTime: 1000 * 60,
    enabled: !!id,
  });
}

// ── QuickBooks ────────────────────────────────────────────────────────

export function useQbStatus() {
  return useQuery({
    queryKey: queryKeys.qbStatus,
    queryFn: async () => {
      try {
        return await api.getQbStatus();
      } catch {
        return { connected: false };
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useDisconnectQb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.disconnectQb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.qbStatus });
    },
  });
}

export function useSyncInvoiceToQb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => api.syncInvoiceToQb(invoiceId),
    onSuccess: (_data, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(invoiceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.qbInvoice(invoiceId) });
    },
  });
}

export function useRecordQbPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, amount }: { invoiceId: string; amount?: number }) =>
      api.recordQbPayment(invoiceId, amount),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(variables.invoiceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.qbInvoice(variables.invoiceId) });
    },
  });
}

export function useQbInvoice(invoiceId: string) {
  return useQuery({
    queryKey: queryKeys.qbInvoice(invoiceId),
    queryFn: () => api.getQbInvoice(invoiceId),
    staleTime: 1000 * 60 * 2,
    enabled: !!invoiceId,
  });
}

// ── Payouts ─────────────────────────────────────────────────────────

async function fetchPayoutsWithFallback() {
  try {
    const data = await api.listPayouts();
    if (data.payouts.length > 0) return data.payouts;
  } catch {}
  return mockPayouts;
}

export function usePayouts() {
  return useQuery({
    queryKey: queryKeys.payouts,
    queryFn: fetchPayoutsWithFallback,
    initialData: mockPayouts,
    staleTime: 1000 * 60 * 2,
  });
}

// ── Project Mutations ──────────────────────────────────────────────────

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createProject>[0]) => api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useCreateExpense(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createExpense>[1]) => api.createExpense(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

// ── Re-exports for backward compatibility ─────────────────────────────

export { contractorStats, homeownerStats };
