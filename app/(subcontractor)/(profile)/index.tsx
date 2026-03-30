import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Briefcase,
  Search,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import { getInitials, formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { subContractorStats } from "@src/lib/mock-data";

const MENU_ITEMS = [
  { label: "My Work", icon: Briefcase, route: "/(subcontractor)/my-work" },
  { label: "Browse Sub Jobs", icon: Search, route: "/(subcontractor)/work" },
  { label: "Settings", icon: Settings, route: "/(subcontractor)/(profile)" },
] as const;

const STATS = [
  { label: "Revenue", value: formatCurrency(subContractorStats.monthlyRevenue) },
  { label: "Rating", value: String(subContractorStats.avgRating) },
  { label: "Jobs Done", value: String(subContractorStats.completedSubJobs) },
] as const;

export default function SubContractorProfile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Profile header */}
        <View className="bg-white border border-border mx-5 mt-4 p-5 items-center">
          <View
            className="w-20 h-20 bg-dark items-center justify-center mb-3"
            style={{ borderRadius: 0 }}
          >
            <Text className="text-white text-2xl font-bold">
              {user ? getInitials(user.name) : "?"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-dark">{user?.name}</Text>
          <Text className="text-text-secondary mt-0.5">{user?.email}</Text>
          <View className="bg-brand-50 px-3 py-1 mt-2" style={{ borderRadius: 0 }}>
            <Text className="text-brand-600 text-sm font-medium">SubContractor</Text>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row mx-5 mt-3 bg-white border border-border overflow-hidden">
          {STATS.map((stat, i) => (
            <View
              key={stat.label}
              className={`flex-1 items-center py-4 ${
                i < STATS.length - 1 ? "border-r border-border" : ""
              }`}
            >
              <Text className="text-xl font-bold text-dark">{stat.value}</Text>
              <Text className="text-text-secondary text-sm mt-0.5">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu items */}
        <View className="bg-white border border-border mx-5 mt-4 overflow-hidden">
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => router.push(item.route as any)}
              className={`flex-row items-center px-5 py-4 ${
                i < MENU_ITEMS.length - 1 ? "border-b border-border" : ""
              }`}
              activeOpacity={0.7}
            >
              <item.icon size={20} color={BRAND.colors.textSecondary} />
              <Text className="text-dark font-medium ml-3 flex-1">{item.label}</Text>
              <ChevronRight size={18} color={BRAND.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={logout}
          className="bg-white border border-border mx-5 mt-4 flex-row items-center px-5 py-4"
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-red-500 font-medium ml-3">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
