import { useEffect, useRef } from "react";
import { Slot, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@src/stores/auth";
import {
  registerForPushNotifications,
  addNotificationResponseListener,
} from "@src/lib/push-notifications";
import "../global.css";

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

  // No navigation here — index.tsx handles all redirects via <Redirect>
  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthGate />
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}
