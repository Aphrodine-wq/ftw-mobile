import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Phone, Clock, Send, Download, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BRAND } from "@src/lib/constants";
import { formatCurrency } from "@src/lib/utils";
import { mockAiEstimate } from "@src/lib/mock-data";
import { AiEstimateCard } from "@src/components/domain/ai-estimate-card";
import { useCallEstimateStore } from "@src/stores/call-estimates";

export default function CallEstimateDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const estimate = useCallEstimateStore((s) => s.estimates.find((e) => e.id === id));
  const removeEstimate = useCallEstimateStore((s) => s.remove);

  const callInfo = estimate || { title: "Estimate", calledAt: "", duration: "" };

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
          <TouchableOpacity
            className="border border-red-200 bg-red-50 py-4 flex-row items-center justify-center"
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert(
                "Delete Estimate",
                "This will permanently remove this call estimate. Are you sure?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      if (id) removeEstimate(id);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      router.back();
                    },
                  },
                ],
              );
            }}
          >
            <Trash2 size={18} color="#DC2626" />
            <Text className="font-bold ml-2" style={{ fontSize: 16, color: "#DC2626" }}>Delete Estimate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
