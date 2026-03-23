import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";

export default function HomeownerDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4">
        <Text className="text-2xl font-bold text-dark">
          Hey, {user?.name?.split(" ")[0] || "there"}
        </Text>
        <Text className="text-text-secondary mt-1">
          What project are you working on?
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <TouchableOpacity
          className="bg-brand-600 rounded-2xl p-6 items-center w-full"
          activeOpacity={0.8}
        >
          <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-3">
            <Plus size={24} color="white" />
          </View>
          <Text className="text-white text-lg font-semibold">Post a Job</Text>
          <Text className="text-white/80 text-center mt-1">
            Describe your project and get bids from verified contractors
          </Text>
        </TouchableOpacity>

        <Text className="text-text-muted text-center mt-6">
          Job posting wizard coming in Phase 2
        </Text>
      </View>
    </SafeAreaView>
  );
}
