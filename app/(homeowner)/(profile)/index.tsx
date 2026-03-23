import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FolderOpen,
  Star,
  Bell,
  Settings,
  LogOut,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import { getInitials } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";

const MENU_ITEMS = [
  { label: "Projects", icon: FolderOpen, route: "projects" },
  { label: "Reviews", icon: Star, route: "reviews" },
  { label: "Notifications", icon: Bell, route: "notifications" },
  { label: "Settings", icon: Settings, route: "settings" },
] as const;

export default function HomeownerProfile() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Profile header */}
        <View className="bg-white rounded-2xl p-5 mb-4 items-center">
          <View className="w-20 h-20 rounded-full bg-brand-600 items-center justify-center mb-3">
            <Text className="text-white text-2xl font-bold">
              {user ? getInitials(user.name) : "?"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-dark">{user?.name}</Text>
          <Text className="text-text-secondary">{user?.email}</Text>
          <View className="bg-brand-50 rounded-full px-3 py-1 mt-2">
            <Text className="text-brand-600 text-sm font-medium capitalize">
              {user?.role}
            </Text>
          </View>
        </View>

        {/* Menu items */}
        <View className="bg-white rounded-2xl overflow-hidden mb-4">
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.route}
              className={`flex-row items-center px-5 py-4 ${
                i < MENU_ITEMS.length - 1 ? "border-b border-border" : ""
              }`}
              activeOpacity={0.7}
            >
              <item.icon size={20} color={BRAND.colors.textSecondary} />
              <Text className="text-dark font-medium ml-3 flex-1">
                {item.label}
              </Text>
              <Text className="text-text-muted">{">"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={logout}
          className="bg-white rounded-2xl flex-row items-center px-5 py-4 mb-8"
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-red-500 font-medium ml-3">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
