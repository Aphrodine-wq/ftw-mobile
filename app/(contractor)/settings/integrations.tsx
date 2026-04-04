import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, BookOpen, Calendar, CreditCard, Camera } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof BookOpen;
  connected: boolean;
}

const INITIAL: Integration[] = [
  { id: "qb", name: "QuickBooks", description: "Invoicing, payments, and bookkeeping", icon: BookOpen, connected: true },
  { id: "cal", name: "Calendar Sync", description: "Sync project schedules to your calendar", icon: Calendar, connected: false },
  { id: "stripe", name: "Stripe", description: "Accept card payments from clients", icon: CreditCard, connected: false },
  { id: "cc", name: "CompanyCam", description: "Job site photos and documentation", icon: Camera, connected: false },
];

export default function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL);

  const toggle = (id: string) => {
    setIntegrations(integrations.map((i) =>
      i.id === id ? { ...i, connected: !i.connected } : i
    ));
  };

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

        {/* Integration Cards */}
        {integrations.map((item) => {
          const IconComponent = item.icon;
          return (
            <View key={item.id}
              className="bg-white border border-border rounded mx-5 mb-3 p-4 flex-row items-center"
              style={{ borderRadius: 4 }}>
              <View className="w-10 h-10 bg-gray-100 items-center justify-center mr-3"
                style={{ borderRadius: 4 }}>
                <IconComponent size={20} color={BRAND.colors.textSecondary} />
              </View>
              <View className="flex-1 mr-3">
                <Text className="text-dark font-semibold text-base">{item.name}</Text>
                <Text className="text-text-muted text-sm mt-0.5">{item.description}</Text>
              </View>
              <TouchableOpacity
                onPress={() => toggle(item.id)}
                className="px-4 py-2"
                style={{
                  borderRadius: 4,
                  backgroundColor: item.connected ? BRAND.colors.bgSoft : BRAND.colors.primary,
                }}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: item.connected ? BRAND.colors.textSecondary : "#FFFFFF",
                  fontWeight: "600",
                  fontSize: 13,
                }}>
                  {item.connected ? "Disconnect" : "Connect"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
