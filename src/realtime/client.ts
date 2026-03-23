import { Socket, Channel } from "phoenix";
import { useAuthStore } from "@src/stores/auth";

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_REALTIME_URL || "http://localhost:4000";
  return url.replace(/^http/, "ws") + "/socket";
};

class RealtimeClient {
  private socket: Socket | null = null;
  private channels: Map<string, Channel> = new Map();

  connect() {
    if (this.socket?.isConnected()) return;
    const token = useAuthStore.getState().token;
    if (!token) return;

    this.socket = new Socket(getBaseUrl(), {
      params: { token },
    });
    this.socket.connect();
  }

  disconnect() {
    this.channels.forEach((ch) => ch.leave());
    this.channels.clear();
    this.socket?.disconnect();
    this.socket = null;
  }

  joinJobFeed(callbacks: {
    onJobsList?: (jobs: any[]) => void;
    onJobPosted?: (job: any) => void;
    onJobUpdated?: (job: any) => void;
  }): () => void {
    if (!this.socket) this.connect();
    if (!this.socket) return () => {};

    const channel = this.socket.channel("jobs:feed", {});
    channel.on("jobs:list", (payload: any) => callbacks.onJobsList?.(payload.jobs));
    channel.on("job:posted", (job: any) => callbacks.onJobPosted?.(job));
    channel.on("job:updated", (job: any) => callbacks.onJobUpdated?.(job));
    channel.join();
    this.channels.set("jobs:feed", channel);
    return () => { channel.leave(); this.channels.delete("jobs:feed"); };
  }

  joinChat(conversationId: string, callbacks: {
    onMessagesList?: (messages: any[]) => void;
    onNewMessage?: (message: any) => void;
  }): () => void {
    if (!this.socket) this.connect();
    if (!this.socket) return () => {};

    const topic = `chat:${conversationId}`;
    const channel = this.socket.channel(topic, {});
    channel.on("messages:list", (payload: any) => callbacks.onMessagesList?.(payload.messages));
    channel.on("message:new", (msg: any) => callbacks.onNewMessage?.(msg));
    channel.join();
    this.channels.set(topic, channel);
    return () => { channel.leave(); this.channels.delete(topic); };
  }

  sendMessage(conversationId: string, body: string) {
    const channel = this.channels.get(`chat:${conversationId}`);
    if (channel) channel.push("send_message", { body });
  }

  sendTyping(conversationId: string, typing: boolean) {
    const channel = this.channels.get(`chat:${conversationId}`);
    if (channel) channel.push("typing", { typing });
  }
}

export const realtimeClient = new RealtimeClient();
