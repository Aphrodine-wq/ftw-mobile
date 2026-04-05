import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Phone, Clock, Send, Download } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BRAND } from "@src/lib/constants";
import { formatCurrency } from "@src/lib/utils";
import { mockAiEstimate } from "@src/lib/mock-data";
import { AiEstimateCard } from "@src/components/domain/ai-estimate-card";

// In production, this would fetch the estimate by ID from the API
// For now, we use mock data with the title/price from the call
const MOCK_CALL_ESTIMATES: Record<string, { title: string; calledAt: string; duration: string }> = {
  "ce1": { title: "Kitchen Remodel — 200 sq ft", calledAt: "Today, 2:15 PM", duration: "1:42" },
  "ce2": { title: "Roof Replacement — 2,400 sq ft", calledAt: "Yesterday, 10:30 AM", duration: "0:58" },
  "ce3": { title: "Bathroom Tile — 80 sq ft", calledAt: "Mar 28, 4:45 PM", duration: "1:15" },
};

export default function CallEstimateDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const callInfo = MOCK_CALL_ESTIMATES[id || "ce1"] || MOCK_CALL_ESTIMATES["ce1"];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white border-b border-border flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ position: "absolute", left: 16, zIndex: 1 }}>
          <ArrowLeft size={24} color={BRAND.colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-dark font-bold" style={{ fontSize: 17 }}>Call Estimate</Text>
        </View>
        <View style={{ width: 24, position: "absolute", right: 16 }} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Call Info */}
        <View className="mx-4 mt-4 bg-white border border-border p-4 flex-row items-center">
          <View className="w-10 h-10 bg-brand-50 items-center justify-center mr-3">
            <Phone size={20} color={BRAND.colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{callInfo.title}</Text>
            <View className="flex-row items-center mt-0.5">
              <Clock size={11} color={BRAND.colors.textMuted} />
              <Text className="text-text-muted ml-1" style={{ fontSize: 12 }}>{callInfo.calledAt} — {callInfo.duration} call</Text>
            </View>
          </View>
        </View>

        {/* Full Estimate Card */}
        <View className="mx-4 mt-3">
          <AiEstimateCard
            estimate={{
              ...mockAiEstimate,
              jobTitle: callInfo.title,
            }}
          />
        </View>

        {/* Actions */}
        <View className="px-4 mt-4" style={{ gap: 8 }}>
          <TouchableOpacity className="bg-brand-600 py-4 flex-row items-center justify-center" activeOpacity={0.8}>
            <Send size={18} color="#FFFFFF" />
            <Text className="text-white font-bold ml-2" style={{ fontSize: 16 }}>Send to Client</Text>
          </TouchableOpacity>
          <TouchableOpacity className="border border-border bg-white py-4 flex-row items-center justify-center" activeOpacity={0.7}>
            <Download size={18} color={BRAND.colors.textPrimary} />
            <Text className="text-dark font-bold ml-2" style={{ fontSize: 16 }}>Export PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
