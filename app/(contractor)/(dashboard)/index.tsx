import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@src/stores/auth";

export default function ContractorDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4">
        <Text className="text-2xl font-bold text-dark">
          Hey, {user?.name?.split(" ")[0] || "there"}
        </Text>
        <Text className="text-text-secondary mt-1">
          Here&apos;s your business at a glance
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl bg-brand-100 items-center justify-center mb-4">
          <Text className="text-brand-600 text-2xl">C</Text>
        </View>
        <Text className="text-lg font-semibold text-dark">
          Contractor Dashboard
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          Stats, schedule, estimates, and revenue will appear here in Phase 2.
        </Text>
      </View>
    </SafeAreaView>
  );
}
