import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Shield,
  FileText,
  ShieldCheck,
  Link,
  Bell,
  Palette,
  ChevronRight,
  ChevronLeft,
  LogOut,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

interface SettingsItem {
  label: string;
  icon: typeof User;
  description: string;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const SECTIONS: SettingsSection[] = [
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        icon: User,
        description: "Name, email, phone, photo",
      },
      {
        label: "Security",
        icon: Shield,
        description: "Password, two-factor auth",
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        label: "Licenses",
        icon: FileText,
        description: "Contractor licenses and certifications",
      },
      {
        label: "Insurance",
        icon: ShieldCheck,
        description: "Liability and workers comp",
      },
      {
        label: "Integrations",
        icon: Link,
        description: "QuickBooks, calendar sync",
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        label: "Notifications",
        icon: Bell,
        description: "Push, email, and SMS alerts",
      },
      {
        label: "Appearance",
        icon: Palette,
        description: "Theme and display settings",
      },
    ],
  },
];

export default function ContractorSettings() {
  const { logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Settings</Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} className="mt-5">
            <Text className="text-dark text-sm font-bold uppercase tracking-wide px-5 mb-2">
              {section.title}
            </Text>
            <View
              className="bg-white border border-border rounded mx-5 overflow-hidden"
              style={{ borderRadius: 4 }}
            >
              {section.items.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => router.push(`/(contractor)/settings/${item.label.toLowerCase()}` as any)}
                    className={`flex-row items-center px-4 py-4 ${
                      i < section.items.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}
                    activeOpacity={0.7}
                  >
                    <View
                      className="w-9 h-9 bg-gray-100 items-center justify-center mr-3"
                      style={{ borderRadius: 4 }}
                    >
                      <IconComponent size={18} color="#4B5563" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-dark font-medium text-base">
                        {item.label}
                      </Text>
                      <Text className="text-text-muted text-sm mt-0.5">
                        {item.description}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={BRAND.colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <View className="mx-5 mt-6">
          <TouchableOpacity
            onPress={logout}
            className="bg-white border border-border rounded flex-row items-center px-4 py-4"
            style={{ borderRadius: 4 }}
            activeOpacity={0.7}
          >
            <View
              className="w-9 h-9 bg-gray-100 items-center justify-center mr-3"
              style={{ borderRadius: 4 }}
            >
              <LogOut size={18} color="#4B5563" />
            </View>
            <Text className="text-dark font-medium text-base">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
