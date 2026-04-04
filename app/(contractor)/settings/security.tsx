import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

function PasswordField({ label, value, onChangeText }: {
  label: string; value: string; onChangeText: (t: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View className="mb-4">
      <Text className="text-text-secondary text-sm font-medium mb-1.5">{label}</Text>
      <View className="bg-white border border-border rounded flex-row items-center px-4" style={{ borderRadius: 4 }}>
        <TextInput
          className="flex-1 py-3 text-dark text-base"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          placeholder="Enter password"
          placeholderTextColor={BRAND.colors.textMuted}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setVisible(!visible)} activeOpacity={0.7}>
          {visible
            ? <EyeOff size={18} color={BRAND.colors.textMuted} />
            : <Eye size={18} color={BRAND.colors.textMuted} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SecuritySettings() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Security</Text>
        </View>

        {/* Password Section */}
        <View className="px-5 mt-6">
          <Text className="text-dark text-sm font-bold uppercase tracking-wide mb-3">
            Change Password
          </Text>
          <PasswordField label="Current Password" value={current} onChangeText={setCurrent} />
          <PasswordField label="New Password" value={newPass} onChangeText={setNewPass} />
          <PasswordField label="Confirm New Password" value={confirm} onChangeText={setConfirm} />
        </View>

        {/* Two-Factor */}
        <View className="px-5 mt-6">
          <Text className="text-dark text-sm font-bold uppercase tracking-wide mb-3">
            Two-Factor Authentication
          </Text>
          <View className="bg-white border border-border rounded px-4 py-4 flex-row items-center justify-between"
            style={{ borderRadius: 4 }}>
            <View className="flex-1 mr-4">
              <Text className="text-dark font-medium text-base">Enable 2FA</Text>
              <Text className="text-text-muted text-sm mt-0.5">
                Add an extra layer of security to your account
              </Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: BRAND.colors.border, true: BRAND.colors.primary }}
            />
          </View>
        </View>

        {/* Save */}
        <View className="px-5 mt-6">
          <TouchableOpacity
            className="py-4 items-center"
            style={{ borderRadius: 4, backgroundColor: BRAND.colors.primary }}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-base">Update Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
