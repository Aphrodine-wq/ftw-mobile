import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Camera } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

function Field({ label, value, onChangeText, placeholder, keyboardType }: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: "default" | "email-address" | "phone-pad";
}) {
  return (
    <View className="mb-4">
      <Text className="text-text-secondary text-sm font-medium mb-1.5">{label}</Text>
      <TextInput
        className="bg-white border border-border px-4 py-3 text-dark text-base"
        style={{ borderRadius: 0 }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={BRAND.colors.textMuted}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={label === "Email" ? "none" : "words"}
      />
    </View>
  );
}

export default function ProfileSettings() {
  const [name, setName] = useState("James Walton");
  const [email, setEmail] = useState("james@fairtradeworker.com");
  const [phone, setPhone] = useState("(601) 555-0142");
  const [company, setCompany] = useState("Walton Construction LLC");
  const [license, setLicense] = useState("GC-2024-08812");

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Profile</Text>
        </View>

        {/* Avatar */}
        <View className="items-center mt-6 mb-6">
          <View className="w-24 h-24 bg-gray-200 items-center justify-center" style={{ borderRadius: 0 }}>
            <Text className="text-gray-500 font-bold text-2xl">JW</Text>
          </View>
          <TouchableOpacity className="flex-row items-center mt-3" activeOpacity={0.7}>
            <Camera size={16} color={BRAND.colors.primary} />
            <Text className="text-brand-600 font-medium text-sm ml-1.5">Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View className="px-5">
          <Field label="Full Name" value={name} onChangeText={setName} />
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label="Company Name" value={company} onChangeText={setCompany} />
          <Field label="License Number" value={license} onChangeText={setLicense} />
        </View>

        {/* Save */}
        <View className="px-5 mt-6">
          <TouchableOpacity
            className="py-4 items-center"
            style={{ borderRadius: 0, backgroundColor: BRAND.colors.primary }}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-base">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
