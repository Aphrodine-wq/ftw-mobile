import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Check } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";
import {
  useAppearanceStore,
  type FontSize,
} from "@src/stores/appearance";

const FONT_OPTIONS: { value: FontSize; label: string; preview: number }[] = [
  { value: "small", label: "Small", preview: 13 },
  { value: "medium", label: "Medium", preview: 15 },
  { value: "large", label: "Large", preview: 18 },
];

export default function AppearanceSettings() {
  const fontSize = useAppearanceStore((s) => s.fontSize);
  const compact = useAppearanceStore((s) => s.compact);
  const setFontSize = useAppearanceStore((s) => s.setFontSize);
  const setCompact = useAppearanceStore((s) => s.setCompact);
  const scale = useAppearanceStore((s) => s.scale);

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

        {/* Font Size */}
        <View className="px-5 mt-6 mb-5">
          <Text className="text-text-secondary font-bold mb-3" style={{ fontSize: 13 }}>FONT SIZE</Text>
          <View className="bg-white border border-border rounded overflow-hidden" style={{ borderRadius: 4 }}>
            {FONT_OPTIONS.map((opt, i) => {
              const active = opt.value === fontSize;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setFontSize(opt.value)}
                  className={`flex-row items-center px-4 py-4 ${i < FONT_OPTIONS.length - 1 ? "border-b border-border" : ""}`}
                  activeOpacity={0.7}
                >
                  <View className="flex-1">
                    <Text className="text-dark font-bold" style={{ fontSize: opt.preview }}>{opt.label}</Text>
                    <Text className="text-text-secondary mt-0.5" style={{ fontSize: opt.preview - 2 }}>
                      Preview text at this size
                    </Text>
                  </View>
                  {active && (
                    <View className="bg-brand-600 w-6 h-6 items-center justify-center" style={{ borderRadius: 12 }}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Live Preview */}
        <View className="px-5 mb-5">
          <Text className="text-text-secondary font-bold mb-3" style={{ fontSize: 13 }}>PREVIEW</Text>
          <View className="bg-white border border-border rounded p-4" style={{ borderRadius: 4 }}>
            <Text className="text-dark font-bold" style={{ fontSize: scale(20) }}>Kitchen Remodel</Text>
            <Text className="text-text-secondary mt-1" style={{ fontSize: scale(14) }}>Michael Brown</Text>
            <Text className="text-text-secondary mt-1" style={{ fontSize: scale(12) }}>
              Full gut renovation with custom cabinetry, quartz countertops, and new appliances.
            </Text>
            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
              <Text className="text-text-secondary font-bold" style={{ fontSize: scale(11) }}>Budget</Text>
              <Text className="text-dark font-bold" style={{ fontSize: scale(16) }}>$38,500</Text>
            </View>
          </View>
        </View>

        {/* Compact Mode */}
        <View className="px-5 mb-5">
          <View className="bg-white border border-border rounded px-4 py-4 flex-row items-center justify-between"
            style={{ borderRadius: 4 }}>
            <View className="flex-1 mr-4">
              <Text className="text-dark font-bold text-base">Compact Mode</Text>
              <Text className="text-text-secondary text-sm mt-0.5">
                Reduce spacing throughout the app
              </Text>
            </View>
            <Switch value={compact} onValueChange={setCompact}
              trackColor={{ false: BRAND.colors.border, true: BRAND.colors.primary }} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
