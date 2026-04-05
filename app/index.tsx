import { Redirect } from "expo-router";
import { useAuthStore } from "@src/stores/auth";
import { View, ActivityIndicator, Text } from "react-native";
import { useEffect, useState } from "react";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const [timedOut, setTimedOut] = useState(false);

  // hydrate() is called in _layout.tsx AuthGate; only set a timeout fallback here
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // If hydration is stuck, force to login
  if (timedOut && !isHydrated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FDFBF8" }}>
        <ActivityIndicator size="large" color="#C41E3A" />
        <Text style={{ marginTop: 12, fontSize: 14, color: "#4B5563" }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user?.role === "homeowner") {
    return <Redirect href="/(homeowner)/(dashboard)" />;
  }

  if (user?.role === "subcontractor") {
    return <Redirect href="/(subcontractor)/(dashboard)" />;
  }

  return <Redirect href="/(contractor)/(dashboard)" />;
}
