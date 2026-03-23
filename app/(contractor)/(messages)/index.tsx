import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContractorMessages() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4">
        <Text className="text-2xl font-bold text-dark">Messages</Text>
        <Text className="text-text-secondary mt-1">
          Chat with homeowners
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold text-dark">
          Real-time chat coming in Phase 2
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          WebSocket-powered messaging with typing indicators.
        </Text>
      </View>
    </SafeAreaView>
  );
}
