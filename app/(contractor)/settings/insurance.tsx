import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Upload } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

interface Policy {
  provider: string;
  policyNumber: string;
  coverage: string;
  expiration: string;
}

function PolicySection({ title, policy, onChange }: {
  title: string; policy: Policy; onChange: (p: Policy) => void;
}) {
  const field = (label: string, key: keyof Policy, placeholder: string) => (
    <View className="mb-3">
      <Text className="text-text-secondary text-sm mb-1">{label}</Text>
      <TextInput className="border border-border px-3 py-2.5 text-dark text-base"
        style={{ borderRadius: 4 }} value={policy[key]}
        onChangeText={(v) => onChange({ ...policy, [key]: v })}
        placeholder={placeholder} placeholderTextColor={BRAND.colors.textMuted} />
    </View>
  );

  return (
    <View className="bg-white border border-border rounded mx-5 mt-4 p-4" style={{ borderRadius: 4 }}>
      <Text className="text-dark font-bold text-base mb-3">{title}</Text>
      {field("Insurance Provider", "provider", "e.g. State Farm")}
      {field("Policy Number", "policyNumber", "Policy number")}
      <View className="flex-row">
        <View className="flex-1 mr-2">
          {field("Coverage Amount", "coverage", "$1,000,000")}
        </View>
        <View className="flex-1 ml-2">
          {field("Expiration", "expiration", "YYYY-MM-DD")}
        </View>
      </View>
    </View>
  );
}

export default function InsuranceSettings() {
  const [liability, setLiability] = useState<Policy>({
    provider: "State Farm", policyNumber: "GL-2025-889012",
    coverage: "$2,000,000", expiration: "2027-01-15",
  });
  const [workersComp, setWorkersComp] = useState<Policy>({
    provider: "Hartford", policyNumber: "WC-2025-334567",
    coverage: "$1,000,000", expiration: "2026-11-30",
  });
  const [uploadProof, setUploadProof] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Insurance</Text>
        </View>

        <PolicySection title="General Liability" policy={liability} onChange={setLiability} />
        <PolicySection title="Workers Compensation" policy={workersComp} onChange={setWorkersComp} />

        {/* Upload Toggle */}
        <View className="bg-white border border-border rounded mx-5 mt-4 px-4 py-4 flex-row items-center justify-between"
          style={{ borderRadius: 4 }}>
          <View className="flex-row items-center flex-1 mr-4">
            <Upload size={18} color={BRAND.colors.textSecondary} />
            <Text className="text-dark font-medium text-base ml-3">Upload Proof of Insurance</Text>
          </View>
          <Switch value={uploadProof} onValueChange={setUploadProof}
            trackColor={{ false: BRAND.colors.border, true: BRAND.colors.primary }} />
        </View>

        {/* Save */}
        <View className="px-5 mt-6">
          <TouchableOpacity className="py-4 items-center"
            style={{ borderRadius: 4, backgroundColor: BRAND.colors.primary }} activeOpacity={0.7}>
            <Text className="text-white font-bold text-base">Save Insurance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
