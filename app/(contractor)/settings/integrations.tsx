import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, BookOpen, Calendar, CreditCard, Camera, CheckCircle2, ExternalLink } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";
import { useQbStatus, useDisconnectQb } from "@src/api/hooks";
import { getQbOAuthUrl } from "@src/api/client";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof BookOpen;
  available: boolean;
}

const OTHER_INTEGRATIONS: Integration[] = [
  { id: "cal", name: "Calendar Sync", description: "Sync project schedules to your calendar", icon: Calendar, available: false },
  { id: "stripe", name: "Stripe", description: "Accept card payments from clients", icon: CreditCard, available: false },
  { id: "cc", name: "CompanyCam", description: "Job site photos and documentation", icon: Camera, available: false },
];

export default function IntegrationsSettings() {
  const { data: qbStatus, isLoading: qbLoading } = useQbStatus();
  const disconnectMutation = useDisconnectQb();

  const qbConnected = qbStatus?.connected ?? false;

  const handleQbConnect = useCallback(() => {
    const url = getQbOAuthUrl();
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open QuickBooks authorization page");
    });
  }, []);

  const handleQbDisconnect = useCallback(() => {
    Alert.alert(
      "Disconnect QuickBooks",
      "This will remove your QuickBooks connection. Existing synced invoices will remain in QuickBooks but new syncs will stop.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => disconnectMutation.mutate(),
        },
      ],
    );
  }, [disconnectMutation]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Integrations</Text>
        </View>

        <Text className="text-text-muted text-sm px-5 mt-2 mb-4">
          Connect third-party services to streamline your workflow.
        </Text>

        {/* QuickBooks Card */}
        <View
          className="bg-white border border-border mx-5 mb-3 p-4"
          style={{ borderRadius: 4 }}
        >
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 bg-gray-100 items-center justify-center mr-3" style={{ borderRadius: 4 }}>
              <BookOpen size={20} color={BRAND.colors.textSecondary} />
            </View>
            <View className="flex-1 mr-3">
              <Text className="text-dark font-semibold text-base">QuickBooks</Text>
              <Text className="text-text-muted text-sm mt-0.5">Invoicing, payments, and bookkeeping</Text>
            </View>
            {qbLoading ? (
              <ActivityIndicator size="small" color={BRAND.colors.textMuted} />
            ) : qbConnected ? (
              <View className="flex-row items-center">
                <CheckCircle2 size={16} color="#059669" />
                <Text className="text-green-700 font-semibold text-xs ml-1">Connected</Text>
              </View>
            ) : null}
          </View>

          {qbConnected && qbStatus?.company_name && (
            <View className="bg-surface p-3 mb-3" style={{ borderRadius: 4 }}>
              <Text className="text-text-muted text-xs uppercase tracking-wide font-bold">Company</Text>
              <Text className="text-dark font-semibold text-sm mt-0.5">{qbStatus.company_name}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={qbConnected ? handleQbDisconnect : handleQbConnect}
            className="py-2.5 items-center"
            style={{
              borderRadius: 4,
              backgroundColor: qbConnected ? BRAND.colors.bgSoft : BRAND.colors.primary,
            }}
            activeOpacity={0.7}
            disabled={disconnectMutation.isPending}
          >
            {disconnectMutation.isPending ? (
              <ActivityIndicator size="small" color={BRAND.colors.textSecondary} />
            ) : (
              <View className="flex-row items-center">
                {!qbConnected && <ExternalLink size={14} color="#FFFFFF" style={{ marginRight: 6 }} />}
                <Text style={{
                  color: qbConnected ? BRAND.colors.textSecondary : "#FFFFFF",
                  fontWeight: "600",
                  fontSize: 13,
                }}>
                  {qbConnected ? "Disconnect" : "Connect QuickBooks"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Other Integrations */}
        {OTHER_INTEGRATIONS.map((item) => {
          const IconComponent = item.icon;
          return (
            <View key={item.id}
              className="bg-white border border-border mx-5 mb-3 p-4 flex-row items-center"
              style={{ borderRadius: 4, opacity: 0.6 }}>
              <View className="w-10 h-10 bg-gray-100 items-center justify-center mr-3"
                style={{ borderRadius: 4 }}>
                <IconComponent size={20} color={BRAND.colors.textSecondary} />
              </View>
              <View className="flex-1 mr-3">
                <Text className="text-dark font-semibold text-base">{item.name}</Text>
                <Text className="text-text-muted text-sm mt-0.5">{item.description}</Text>
              </View>
              <View className="px-3 py-1.5 bg-surface" style={{ borderRadius: 4 }}>
                <Text className="text-text-muted font-semibold text-xs">Coming Soon</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
