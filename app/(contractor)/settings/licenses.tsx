import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Plus, Trash2 } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

interface License {
  id: string;
  type: string;
  number: string;
  state: string;
  expiration: string;
}

const INITIAL: License[] = [
  { id: "1", type: "General Contractor", number: "GC-2024-08812", state: "Mississippi", expiration: "2026-12-31" },
  { id: "2", type: "Electrical", number: "EL-2025-04410", state: "Mississippi", expiration: "2027-06-15" },
];

export default function LicensesSettings() {
  const [licenses, setLicenses] = useState<License[]>(INITIAL);

  const addLicense = () => {
    setLicenses([...licenses, {
      id: Date.now().toString(), type: "", number: "", state: "", expiration: "",
    }]);
  };

  const update = (id: string, field: keyof License, value: string) => {
    setLicenses(licenses.map((l) => l.id === id ? { ...l, [field]: value } : l));
  };

  const remove = (id: string) => {
    setLicenses(licenses.filter((l) => l.id !== id));
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
          <Text className="text-2xl font-bold text-dark flex-1">Licenses</Text>
          <TouchableOpacity onPress={addLicense} className="bg-white border border-border p-2"
            style={{ borderRadius: 0 }} activeOpacity={0.7}>
            <Plus size={20} color={BRAND.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* License Cards */}
        {licenses.map((lic) => (
          <View key={lic.id} className="bg-white border border-border mx-5 mt-4 p-4"
            style={{ borderRadius: 0 }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-dark font-bold text-base">
                {lic.type || "New License"}
              </Text>
              <TouchableOpacity onPress={() => remove(lic.id)} activeOpacity={0.7}>
                <Trash2 size={18} color={BRAND.colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View className="mb-3">
              <Text className="text-text-secondary text-sm mb-1">Type</Text>
              <TextInput className="border border-border px-3 py-2.5 text-dark text-base"
                style={{ borderRadius: 0 }} value={lic.type}
                onChangeText={(v) => update(lic.id, "type", v)}
                placeholder="e.g. General Contractor" placeholderTextColor={BRAND.colors.textMuted} />
            </View>
            <View className="mb-3">
              <Text className="text-text-secondary text-sm mb-1">License Number</Text>
              <TextInput className="border border-border px-3 py-2.5 text-dark text-base"
                style={{ borderRadius: 0 }} value={lic.number}
                onChangeText={(v) => update(lic.id, "number", v)}
                placeholder="License number" placeholderTextColor={BRAND.colors.textMuted} />
            </View>
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Text className="text-text-secondary text-sm mb-1">State</Text>
                <TextInput className="border border-border px-3 py-2.5 text-dark text-base"
                  style={{ borderRadius: 0 }} value={lic.state}
                  onChangeText={(v) => update(lic.id, "state", v)}
                  placeholder="State" placeholderTextColor={BRAND.colors.textMuted} />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-text-secondary text-sm mb-1">Expiration</Text>
                <TextInput className="border border-border px-3 py-2.5 text-dark text-base"
                  style={{ borderRadius: 0 }} value={lic.expiration}
                  onChangeText={(v) => update(lic.id, "expiration", v)}
                  placeholder="YYYY-MM-DD" placeholderTextColor={BRAND.colors.textMuted} />
              </View>
            </View>
          </View>
        ))}

        {/* Save */}
        <View className="px-5 mt-6">
          <TouchableOpacity className="py-4 items-center"
            style={{ borderRadius: 0, backgroundColor: BRAND.colors.primary }} activeOpacity={0.7}>
            <Text className="text-white font-bold text-base">Save Licenses</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
