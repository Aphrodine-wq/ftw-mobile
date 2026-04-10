import { useState, useEffect, useCallback, useRef } from "react";
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
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId || !isAuthenticated) return;

    realtimeClient.connect();
    const leave = realtimeClient.joinChat(conversationId, {
      onMessagesList: (list) => { setMessages(list); setLoading(false); },
      onNewMessage: (msg) => setMessages((prev) => [...prev, msg]),
      onTyping: (data) => {
        if (data.typing) {
          setTypingUser(data.userName || data.userId || "Someone");
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
        } else {
          setTypingUser(null);
        }
      },
    });
    return () => {
      leave();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, isAuthenticated]);

  const sendMessage = useCallback((body: string) => {
    if (conversationId) realtimeClient.sendMessage(conversationId, body);
  }, [conversationId]);

  const sendTyping = useCallback((typing: boolean) => {
    if (conversationId) realtimeClient.sendTyping(conversationId, typing);
  }, [conversationId]);

  return { messages, loading, sendMessage, sendTyping, typingUser };
}

export function useRealtimeSubJobs() {
  const [subJobs, setSubJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }

    // Seed from REST API, then overlay realtime updates
    import("@src/api/data").then(({ fetchSubJobs }) =>
      fetchSubJobs().then((list) => { setSubJobs(list); setLoading(false); })
    );

    realtimeClient.connect();
    const leave = realtimeClient.joinSubJobFeed({
      onSubJobsList: (list) => { setSubJobs(list); setLoading(false); },
      onSubJobPosted: (job) => setSubJobs((prev) => [job, ...prev]),
      onSubJobUpdated: (updated) => setSubJobs((prev) => prev.map((j) => j.id === updated.id ? updated : j)),
    });
    return leave;
  }, [isAuthenticated]);

  return { subJobs, loading };
}

export function useRealtimeMySubJobs() {
  const [subJobs, setSubJobs] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }

    // Seed from REST API
    Promise.all([
      import("@src/api/data").then(({ fetchMySubJobs }) => fetchMySubJobs()),
      import("@src/api/data").then(({ fetchSubBidsForUser }) => fetchSubBidsForUser()),
    ]).then(([sjList, bidList]) => {
      setSubJobs(sjList);
      setBids(bidList);
      setLoading(false);
    });

    return () => {};
  }, [isAuthenticated]);

  return { subJobs, bids, loading };
}

export function useSubContractorStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }

    import("@src/api/data").then(({ fetchSubContractorStats }) =>
      fetchSubContractorStats().then((data) => { setStats(data); setLoading(false); })
    );
  }, [isAuthenticated]);

  return { stats, loading };
}

export function useRealtimeInvoices(userId: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [invoiceEvents, setInvoiceEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    realtimeClient.connect();
    const leave = realtimeClient.joinInvoiceFeed(userId, {
      onInvoiceCreated: (invoice) =>
        setInvoiceEvents((prev) => [{ type: "created", invoice, ts: Date.now() }, ...prev]),
      onInvoiceUpdated: (invoice) =>
        setInvoiceEvents((prev) => [{ type: "updated", invoice, ts: Date.now() }, ...prev]),
      onPaymentReceived: (data) =>
        setInvoiceEvents((prev) => [{ type: "payment", ...data, ts: Date.now() }, ...prev]),
      onQbSynced: (data) =>
        setInvoiceEvents((prev) => [{ type: "qb_synced", ...data, ts: Date.now() }, ...prev]),
    });
    return leave;
  }, [userId, isAuthenticated]);

  return { invoiceEvents };
}

export function useRealtimePayouts(userId: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    realtimeClient.connect();
    const leave = realtimeClient.joinPayoutFeed(userId, {
      onPayoutCreated: (payout) => setPayouts((prev) => [payout, ...prev]),
      onPayoutUpdated: (updated) =>
        setPayouts((prev) => prev.map((p) => (p.id === updated.id ? updated : p))),
      onPayoutCompleted: (completed) =>
        setPayouts((prev) => prev.map((p) => (p.id === completed.id ? completed : p))),
    });
    return leave;
  }, [userId, isAuthenticated]);

  return { payouts };
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
