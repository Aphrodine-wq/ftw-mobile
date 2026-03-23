import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FolderOpen,
  Star,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  DollarSign,
  CheckCircle,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import { homeownerStats } from "@src/lib/mock-data";
import { getInitials, formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";

const MENU_ITEMS = [
  { label: "My Projects", icon: FolderOpen, route: "projects" },
  { label: "Reviews", icon: Star, route: "reviews" },
  { label: "Notifications", icon: Bell, route: "notifications" },
  { label: "Settings", icon: Settings, route: "settings" },
] as const;

export default function HomeownerProfile() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="bg-white rounded-2xl p-5 mb-4 items-center">
          <View className="w-20 h-20 rounded-full bg-brand-600 items-center justify-center mb-3">
            <Text className="text-white text-2xl font-bold">
              {user ? getInitials(user.name) : "?"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-dark">{user?.name}</Text>
          <Text className="text-text-secondary mt-0.5">{user?.email}</Text>
          <View className="bg-brand-50 rounded-full px-3 py-1 mt-2">
            <Text className="text-brand-600 text-sm font-medium">
              Homeowner
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-white rounded-2xl p-4 items-center">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mb-2">
              <DollarSign size={18} color="#16A34A" />
            </View>
            <Text className="text-xl font-bold text-dark">
              {formatCurrency(homeownerStats.totalSpent)}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              Total Spent
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 items-center">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-2">
              <CheckCircle size={18} color="#2563EB" />
            </View>
            <Text className="text-xl font-bold text-dark">
              {homeownerStats.projectsCompleted}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              Projects
            </Text>
          </View>
        </View>

        {/* Menu Items */}
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
              <ChevronRight size={18} color={BRAND.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={logout}
          className="bg-white rounded-2xl flex-row items-center px-5 py-4"
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-red-500 font-medium ml-3">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
