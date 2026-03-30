import { useState, useEffect, useCallback } from "react";
import { realtimeClient } from "./client";
import { useAuthStore } from "@src/stores/auth";

export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }

    realtimeClient.connect();
    const leave = realtimeClient.joinJobFeed({
      onJobsList: (list) => { setJobs(list); setLoading(false); },
      onJobPosted: (job) => setJobs((prev) => [job, ...prev]),
      onJobUpdated: (updated) => setJobs((prev) => prev.map((j) => j.id === updated.id ? updated : j)),
    });
    return leave;
  }, [isAuthenticated]);

  return { jobs, loading };
}

export function useRealtimeBids(jobId: string | null) {
  const [bids, setBids] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!jobId || !isAuthenticated) return;

    realtimeClient.connect();
    const leave = realtimeClient.joinJob(jobId, {
      onJobDetails: (data) => { setJob(data.job); setBids(data.bids); setLoading(false); },
      onBidPlaced: (bid) => setBids((prev) => [...prev, bid]),
      onBidAccepted: (bid) => setBids((prev) => prev.map((b) => b.id === bid.id ? bid : b)),
    });
    return leave;
  }, [jobId, isAuthenticated]);

  return { job, bids, loading };
}

export function useRealtimeChat(conversationId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!conversationId || !isAuthenticated) return;

    realtimeClient.connect();
    const leave = realtimeClient.joinChat(conversationId, {
      onMessagesList: (list) => { setMessages(list); setLoading(false); },
      onNewMessage: (msg) => setMessages((prev) => [...prev, msg]),
    });
    return leave;
  }, [conversationId, isAuthenticated]);

  const sendMessage = useCallback((body: string) => {
    if (conversationId) realtimeClient.sendMessage(conversationId, body);
  }, [conversationId]);

  const sendTyping = useCallback((typing: boolean) => {
    if (conversationId) realtimeClient.sendTyping(conversationId, typing);
  }, [conversationId]);

  return { messages, loading, sendMessage, sendTyping };
}

export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    realtimeClient.connect();
    const leave = realtimeClient.joinNotifications(userId, {
      onNotification: (payload) => setNotifications((prev) => [payload, ...prev]),
    });
    return leave;
  }, [userId, isAuthenticated]);

  return { notifications };
}
