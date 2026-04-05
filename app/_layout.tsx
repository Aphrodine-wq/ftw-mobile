import { useEffect, useRef } from "react";
import { Slot, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { setupOnlineManager, asyncStoragePersister } from "@src/api/offline";
import { useAuthStore } from "@src/stores/auth";
import {
  registerForPushNotifications,
  addNotificationResponseListener,
} from "@src/lib/push-notifications";
import { ToastProvider } from "@src/components/ui/toast";
import "../global.css";

// Wire NetInfo into React Query's online manager
setupOnlineManager();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes before refetch
      gcTime: 1000 * 60 * 10, // 10 minutes in cache
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AuthGate() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const userRole = useAuthStore((s) => s.user?.role);
  const hydrate = useAuthStore((s) => s.hydrate);
  const pushRegistered = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Register for push notifications once authenticated
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || pushRegistered.current) return;

    pushRegistered.current = true;
    registerForPushNotifications();

    const subscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === "bid_received" || data?.type === "bid_accepted") {
        if (userRole === "homeowner") {
          router.push("/(homeowner)/notifications" as any);
        } else if (userRole === "subcontractor") {
          router.push("/(subcontractor)/(dashboard)" as any);
        } else {
          router.push("/(contractor)/notifications" as any);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isHydrated, isAuthenticated, userRole, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}>
        <ToastProvider>
          <AuthGate />
        </ToastProvider>
      </PersistQueryClientProvider>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}
