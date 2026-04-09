/**
 * FTW Mobile Realtime Client
 *
 * Connects to the Spring Boot backend (ftw-realtime)
 * via STOMP/SockJS WebSocket — matching the web app's protocol.
 */
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "@src/stores/auth";

const getWsUrl = () => {
  const base = process.env.EXPO_PUBLIC_REALTIME_URL || "http://localhost:4000";
  return `${base}/ws`;
};

interface StompEvent {
  event: string;
  data: any;
}

class RealtimeClient {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private _connected = false;

  connect(token?: string) {
    if (this._connected) return;

    const authToken = token || useAuthStore.getState().token;
    if (!authToken) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(getWsUrl()) as any,
      connectHeaders: { token: authToken },
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this._connected = true;
      },
      onDisconnect: () => {
        this._connected = false;
      },
      onStompError: (frame) => {
        this._connected = false;
        console.error("[FTW Realtime] STOMP error:", frame.headers?.message);
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
    this._connected = false;
  }

  get isConnected() {
    return this._connected;
  }

  private subscribe(topic: string, callback: (event: StompEvent) => void): () => void {
    if (!this.client) this.connect();
    if (!this.client) return () => {};

    const doSubscribe = () => {
      const sub = this.client!.subscribe(topic, (msg: IMessage) => {
        try {
          const parsed = JSON.parse(msg.body) as StompEvent;
          callback(parsed);
        } catch {
          callback({ event: "message", data: JSON.parse(msg.body) });
        }
      });
      this.subscriptions.set(topic, sub);
    };

    if (this._connected) {
      doSubscribe();
    } else {
      const interval = setInterval(() => {
        if (this._connected) {
          clearInterval(interval);
          doSubscribe();
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 10000);
    }

    return () => {
      this.subscriptions.get(topic)?.unsubscribe();
      this.subscriptions.delete(topic);
    };
  }

  // --- Subscriptions ---

  joinJobFeed(callbacks: {
    onJobsList?: (jobs: any[]) => void;
    onJobPosted?: (job: any) => void;
    onJobUpdated?: (job: any) => void;
  }): () => void {
    return this.subscribe("/topic/jobs.feed", (msg) => {
      switch (msg.event) {
        case "jobs:list":
          callbacks.onJobsList?.(msg.data.jobs);
          break;
        case "job:posted":
          callbacks.onJobPosted?.(msg.data);
          break;
        case "job:updated":
          callbacks.onJobUpdated?.(msg.data);
          break;
      }
    });
  }

  joinJob(
    jobId: string,
    callbacks: {
      onJobDetails?: (data: { job: any; bids: any[] }) => void;
      onBidPlaced?: (bid: any) => void;
      onBidAccepted?: (bid: any) => void;
    },
  ): () => void {
    return this.subscribe(`/topic/job.${jobId}`, (msg) => {
      switch (msg.event) {
        case "job:details":
          callbacks.onJobDetails?.(msg.data);
          break;
        case "bid:placed":
          callbacks.onBidPlaced?.(msg.data);
          break;
        case "bid:accepted":
          callbacks.onBidAccepted?.(msg.data);
          break;
      }
    });
  }

  joinChat(
    conversationId: string,
    callbacks: {
      onMessagesList?: (messages: any[]) => void;
      onNewMessage?: (message: any) => void;
      onTyping?: (data: any) => void;
    },
  ): () => void {
    return this.subscribe(`/topic/chat.${conversationId}`, (msg) => {
      switch (msg.event) {
        case "messages:list":
          callbacks.onMessagesList?.(msg.data.messages);
          break;
        case "message:new":
          callbacks.onNewMessage?.(msg.data);
          break;
        case "typing":
          callbacks.onTyping?.(msg.data);
          break;
      }
    });
  }

  joinNotifications(
    userId: string,
    callbacks: {
      onNotification?: (payload: any) => void;
    },
  ): () => void {
    return this.subscribe(`/topic/user.${userId}`, (msg) => {
      if (msg.event === "notification") {
        callbacks.onNotification?.(msg.data);
      }
    });
  }

  joinSubJobFeed(callbacks: {
    onSubJobsList?: (subJobs: any[]) => void;
    onSubJobPosted?: (subJob: any) => void;
    onSubJobUpdated?: (subJob: any) => void;
  }): () => void {
    return this.subscribe("/topic/sub-jobs.feed", (msg) => {
      switch (msg.event) {
        case "sub-jobs:list":
          callbacks.onSubJobsList?.(msg.data.subJobs || msg.data);
          break;
        case "sub-job:posted":
          callbacks.onSubJobPosted?.(msg.data);
          break;
        case "sub-job:updated":
          callbacks.onSubJobUpdated?.(msg.data);
          break;
      }
    });
  }

  joinSubJob(
    subJobId: string,
    callbacks: {
      onSubJobDetails?: (data: { subJob: any; bids: any[] }) => void;
      onSubBidPlaced?: (bid: any) => void;
      onSubBidAccepted?: (bid: any) => void;
    },
  ): () => void {
    return this.subscribe(`/topic/sub-job.${subJobId}`, (msg) => {
      switch (msg.event) {
        case "sub-job:details":
          callbacks.onSubJobDetails?.(msg.data);
          break;
        case "sub-bid:placed":
          callbacks.onSubBidPlaced?.(msg.data);
          break;
        case "sub-bid:accepted":
          callbacks.onSubBidAccepted?.(msg.data);
          break;
      }
    });
  }

  placeSubBid(subJobId: string, attrs: { amount: number; message: string; timeline: string }) {
    this.client?.publish({
      destination: `/app/sub-job.${subJobId}.bid`,
      body: JSON.stringify(attrs),
    });
  }

  // --- Publish ---

  sendMessage(conversationId: string, body: string) {
    this.client?.publish({
      destination: `/app/chat.${conversationId}.send`,
      body: JSON.stringify({ body }),
    });
  }

  sendTyping(conversationId: string, typing: boolean) {
    this.client?.publish({
      destination: `/app/chat.${conversationId}.typing`,
      body: JSON.stringify({ typing }),
    });
  }

  placeBid(jobId: string, attrs: { amount: number; message: string; timeline: string }) {
    this.client?.publish({
      destination: `/app/job.${jobId}.bid`,
      body: JSON.stringify(attrs),
    });
  }

  postJob(attrs: {
    title: string;
    description: string;
    category: string;
    budget_min: number;
    budget_max: number;
    location: string;
  }) {
    this.client?.publish({
      destination: "/app/jobs.feed.post",
      body: JSON.stringify(attrs),
    });
  }
}

export const realtimeClient = new RealtimeClient();
