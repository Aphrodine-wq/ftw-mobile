import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

type Theme = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";

function OptionGroup<T extends string>({ label, options, selected, onSelect }: {
  label: string; options: { value: T; label: string }[];
  selected: T; onSelect: (v: T) => void;
}) {
  return (
    <View className="mb-5">
      <Text className="text-text-secondary text-sm font-medium mb-2">{label}</Text>
      <View className="flex-row">
        {options.map((opt) => {
          const active = opt.value === selected;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              className="flex-1 py-3 items-center mr-2 last:mr-0"
              style={{
                borderRadius: 4,
                backgroundColor: active ? BRAND.colors.dark : "#FFFFFF",
                borderWidth: 1,
                borderColor: active ? BRAND.colors.dark : BRAND.colors.border,
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: active ? "#FFFFFF" : BRAND.colors.textPrimary,
                fontWeight: "600",
                fontSize: 14,
              }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function AppearanceSettings() {
  const [theme, setTheme] = useState<Theme>("light");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [compact, setCompact] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Appearance</Text>
        </View>

        {/* Options */}
        <View className="px-5 mt-6">
          <OptionGroup<Theme>
            label="Theme"
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
            selected={theme}
            onSelect={setTheme}
          />

          <OptionGroup<FontSize>
            label="Font Size"
            options={[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
            selected={fontSize}
            onSelect={setFontSize}
          />

          {/* Compact Mode */}
          <View className="bg-white border border-border rounded px-4 py-4 flex-row items-center justify-between"
            style={{ borderRadius: 4 }}>
            <View className="flex-1 mr-4">
              <Text className="text-dark font-medium text-base">Compact Mode</Text>
              <Text className="text-text-muted text-sm mt-0.5">
                Reduce spacing and padding throughout the app
              </Text>
            </View>
            <Switch value={compact} onValueChange={setCompact}
              trackColor={{ false: BRAND.colors.border, true: BRAND.colors.primary }} />
          </View>
        </View>

        {/* Apply */}
        <View className="px-5 mt-6">
          <TouchableOpacity className="py-4 items-center"
            style={{ borderRadius: 4, backgroundColor: BRAND.colors.primary }} activeOpacity={0.7}>
            <Text className="text-white font-bold text-base">Apply Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
