import { Redirect } from "expo-router";
import { useAuthStore } from "@src/stores/auth";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role === "homeowner") {
    return <Redirect href="/(homeowner)/(dashboard)" />;
  }

  return <Redirect href="/(contractor)/(dashboard)" />;
}
