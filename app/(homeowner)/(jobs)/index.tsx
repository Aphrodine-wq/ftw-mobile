import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeownerJobs() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4">
        <Text className="text-2xl font-bold text-dark">My Jobs</Text>
        <Text className="text-text-secondary mt-1">
          Track your posted jobs and review bids
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold text-dark">
          Job management coming in Phase 2
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          View bids, accept contractors, track progress.
        </Text>
      </View>
    </SafeAreaView>
  );
}
