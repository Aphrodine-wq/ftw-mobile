import { useEffect, useRef } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
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
  const segments = useSegments();
  const { isAuthenticated, isHydrated, user, hydrate } = useAuthStore();
  const pushRegistered = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Register for push notifications once authenticated
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || pushRegistered.current) return;

    pushRegistered.current = true;
    registerForPushNotifications();

    // Handle notification taps — navigate to notifications screen
    const subscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === "bid_received" || data?.type === "bid_accepted") {
        if (user?.role === "homeowner") {
          router.push("/(homeowner)/notifications" as any);
        } else {
          router.push("/(contractor)/notifications" as any);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuth = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuth) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuth) {
      // Route to the correct role tab
      if (user?.role === "homeowner") {
        router.replace("/(homeowner)/(dashboard)");
      } else {
        router.replace("/(contractor)/(dashboard)");
      }
    }
  }, [isAuthenticated, isHydrated, segments, user, router]);

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
