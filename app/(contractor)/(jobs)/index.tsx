import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContractorJobs() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4">
        <Text className="text-2xl font-bold text-dark">Browse Jobs</Text>
        <Text className="text-text-secondary mt-1">
          Find and bid on jobs in your area
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold text-dark">
          Job feed coming in Phase 2
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          Search, filter, and bid on jobs with real-time updates.
        </Text>
      </View>
    </SafeAreaView>
  );
}
