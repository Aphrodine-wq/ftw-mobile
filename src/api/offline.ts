import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

// ── Online Manager ────────────────────────────────────────────────────
// React Query will pause mutations when offline and replay when back online

export function setupOnlineManager() {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });
}

// ── Persister ─────────────────────────────────────────────────────────
// Persists the query cache to AsyncStorage so data survives app restarts

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "ftw-query-cache",
  throttleTime: 1000, // Don't write more than once per second
});

// ── Network Status Hook ───────────────────────────────────────────────

export function isOnline(): boolean {
  return onlineManager.isOnline();
}

// ── Mutation Queue ────────────────────────────────────────────────────
// Pending mutations are automatically persisted by React Query's
// mutation cache when using persistQueryClient. Mutations made while
// offline will be paused and retried when the device reconnects.
//
// For critical mutations (bids, payments), we also store them in
// AsyncStorage as a safety net.

const PENDING_MUTATIONS_KEY = "ftw-pending-mutations";

interface PendingMutation {
  id: string;
  type: "bid" | "message" | "job" | "estimate";
  payload: Record<string, unknown>;
  createdAt: number;
}

export async function queueMutation(mutation: Omit<PendingMutation, "id" | "createdAt">) {
  const existing = await getPendingMutations();
  const entry: PendingMutation = {
    ...mutation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  existing.push(entry);
  await AsyncStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(existing));
  return entry;
}

export async function getPendingMutations(): Promise<PendingMutation[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_MUTATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function removePendingMutation(id: string) {
  const existing = await getPendingMutations();
  const filtered = existing.filter((m) => m.id !== id);
  await AsyncStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(filtered));
}

export async function clearPendingMutations() {
  await AsyncStorage.removeItem(PENDING_MUTATIONS_KEY);
}
