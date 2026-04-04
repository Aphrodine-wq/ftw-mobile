import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Shield,
  MapPin,
  Home,
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
    title: "Property",
    items: [
      {
        label: "Address",
        icon: MapPin,
        description: "Primary property address",
      },
      {
        label: "Property Type",
        icon: Home,
        description: "Single family, condo, multi-unit",
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

export default function HomeownerSettings() {
  const { logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
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
          <Text style={{ fontSize: 24, fontWeight: "700", color: BRAND.colors.textPrimary }}>
            Settings
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} className="mt-5">
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.sectionCard}>
              {section.items.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      s.menuItem,
                      i < section.items.length - 1 && s.menuItemBorder,
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={s.iconBox}>
                      <IconComponent
                        size={18}
                        color={BRAND.colors.textSecondary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: BRAND.colors.textPrimary, fontWeight: "500", fontSize: 15 }}>
                        {item.label}
                      </Text>
                      <Text style={{ color: BRAND.colors.textMuted, fontSize: 13, marginTop: 2 }}>
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
        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <TouchableOpacity
            onPress={logout}
            style={s.logoutBtn}
            activeOpacity={0.7}
          >
            <View style={[s.iconBox, { backgroundColor: "#FEF2F2" }]}>
              <LogOut size={18} color="#EF4444" />
            </View>
            <Text style={{ color: "#EF4444", fontWeight: "500", fontSize: 15 }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoutBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
