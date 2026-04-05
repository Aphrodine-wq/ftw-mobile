import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  FolderOpen,
  ClipboardList,
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
  { label: "My Projects", icon: FolderOpen, route: "/(homeowner)/projects" },
  { label: "Post a Job", icon: ClipboardList, route: "/(homeowner)/post-job" },
  { label: "Reviews", icon: Star, route: "/(homeowner)/reviews" },
  { label: "Notifications", icon: Bell, route: "/(homeowner)/notifications" },
  { label: "Settings", icon: Settings, route: "/(homeowner)/settings" },
] as const;

const STATS = [
  { label: "Total Spent", value: formatCurrency(homeownerStats.totalSpent) },
  { label: "Projects", value: String(homeownerStats.projectsCompleted) },
  { label: "Reviews", value: "5" },
] as const;

export default function HomeownerProfile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "700" }}>
              {user ? getInitials(user.name) : "?"}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "700", color: BRAND.colors.textPrimary }}>
            {user?.name}
          </Text>
          <Text style={{ fontSize: 14, color: BRAND.colors.textSecondary, marginTop: 2 }}>
            {user?.email}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: BRAND.colors.primary }}>
              Homeowner
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {STATS.map((stat, i) => (
            <View
              key={stat.label}
              style={[
                styles.statCell,
                i < STATS.length - 1 && styles.statCellBorder,
              ]}
            >
              <Text style={{ fontSize: 20, fontWeight: "700", color: BRAND.colors.textPrimary }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 13, color: BRAND.colors.textSecondary, marginTop: 2 }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as any)}
                style={[
                  styles.menuItem,
                  i < MENU_ITEMS.length - 1 && styles.menuItemBorder,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>
                  <Icon size={18} color={BRAND.colors.textSecondary} />
                </View>
                <Text style={{ color: BRAND.colors.textPrimary, fontWeight: "500", fontSize: 15, flex: 1 }}>
                  {item.label}
                </Text>
                <ChevronRight size={18} color={BRAND.colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={logout}
          style={styles.logoutCard}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: "#FEF2F2" }]}>
            <LogOut size={18} color="#EF4444" />
          </View>
          <Text style={{ color: "#EF4444", fontWeight: "500", fontSize: 15 }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: BRAND.colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: "#FDF2F3",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  statCellBorder: {
    borderRightWidth: 1,
    borderRightColor: BRAND.colors.border,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    marginBottom: 12,
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
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoutCard: {
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
