import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Construction, Bell, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { BRAND } from "@src/lib/constants";

export default function ContractorJobs() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border bg-white">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color={BRAND.colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-dark font-bold" style={{ fontSize: 16 }}>Browse Jobs</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View className="flex-1 justify-center items-center px-8">
        <View
          className="w-20 h-20 items-center justify-center mb-6"
          style={{ backgroundColor: BRAND.colors.primary, borderRadius: 4 }}
        >
          <Construction size={36} color="#FFFFFF" />
        </View>

        <Text className="text-dark font-bold text-center" style={{ fontSize: 28, lineHeight: 34 }}>
          Coming Soon
        </Text>

        <Text className="text-text-secondary text-center mt-3" style={{ fontSize: 16, lineHeight: 24 }}>
          The job feed activates once enough contractors and homeowners are in your area.
        </Text>

        <Text className="text-text-muted text-center mt-2" style={{ fontSize: 14, lineHeight: 22 }}>
          We're building the market right now. In the meantime, use ConstructionAI to generate estimates and build your FairRecord.
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(contractor)/marketplace" as any)}
          className="mt-8 py-3.5 px-8"
          style={{ backgroundColor: BRAND.colors.primary, borderRadius: 4 }}
          activeOpacity={0.7}
        >
          <Text className="text-white font-bold text-base">See How the Marketplace Works</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(contractor)/ai-agent" as any)}
          className="mt-3 py-3.5 px-8 border border-border"
          style={{ borderRadius: 4 }}
          activeOpacity={0.7}
        >
          <Text className="text-dark font-bold text-base">Try ConstructionAI</Text>
        </TouchableOpacity>

        <View className="flex-row items-center mt-8">
          <Bell size={14} color={BRAND.colors.textMuted} />
          <Text className="text-text-muted text-sm ml-2">We'll notify you when the feed goes live.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
