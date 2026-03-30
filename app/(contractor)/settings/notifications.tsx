import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

interface Toggle {
  key: string;
  label: string;
  description: string;
}

const ALERTS: Toggle[] = [
  { key: "push", label: "Push Notifications", description: "Receive alerts on your device" },
  { key: "email", label: "Email Notifications", description: "Get updates in your inbox" },
  { key: "sms", label: "SMS Notifications", description: "Text message alerts" },
  { key: "newBid", label: "New Bid Alerts", description: "When a new bid is placed on your job" },
  { key: "payment", label: "Payment Received", description: "When a payment clears" },
  { key: "project", label: "Project Updates", description: "Status changes and milestones" },
];

const MARKETING: Toggle[] = [
  { key: "marketing", label: "Marketing Emails", description: "Tips, promotions, and news" },
];

function ToggleRow({ item, value, onToggle }: {
  item: Toggle; value: boolean; onToggle: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border">
      <View className="flex-1 mr-4">
        <Text className="text-dark font-medium text-base">{item.label}</Text>
        <Text className="text-text-muted text-sm mt-0.5">{item.description}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle}
        trackColor={{ false: BRAND.colors.border, true: BRAND.colors.primary }} />
    </View>
  );
}

export default function NotificationSettings() {
  const [values, setValues] = useState<Record<string, boolean>>({
    push: true, email: true, sms: false, newBid: true,
    payment: true, project: true, marketing: false,
  });

  const toggle = (key: string) => setValues({ ...values, [key]: !values[key] });

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Notifications</Text>
        </View>

        {/* Alerts Section */}
        <View className="mt-5">
          <Text className="text-dark text-sm font-bold uppercase tracking-wide px-5 mb-2">Alerts</Text>
          <View className="bg-white border border-border mx-5" style={{ borderRadius: 0 }}>
            {ALERTS.map((item) => (
              <ToggleRow key={item.key} item={item} value={values[item.key] ?? false}
                onToggle={() => toggle(item.key)} />
            ))}
          </View>
        </View>

        {/* Marketing Section */}
        <View className="mt-5">
          <Text className="text-dark text-sm font-bold uppercase tracking-wide px-5 mb-2">Marketing</Text>
          <View className="bg-white border border-border mx-5" style={{ borderRadius: 0 }}>
            {MARKETING.map((item) => (
              <ToggleRow key={item.key} item={item} value={values[item.key] ?? false}
                onToggle={() => toggle(item.key)} />
            ))}
          </View>
        </View>

        {/* Save */}
        <View className="px-5 mt-6">
          <TouchableOpacity className="py-4 items-center"
            style={{ borderRadius: 0, backgroundColor: BRAND.colors.primary }} activeOpacity={0.7}>
            <Text className="text-white font-bold text-base">Save Preferences</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
