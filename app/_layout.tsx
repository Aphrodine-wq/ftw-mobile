import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@src/stores/auth";
import "../global.css";

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isHydrated, user, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
