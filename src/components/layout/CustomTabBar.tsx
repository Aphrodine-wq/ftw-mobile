import { View, TouchableOpacity, StyleSheet } from "react-native";
import { usePathname, useRouter } from "expo-router";
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  Plus,
  Users,
  Receipt,
  Settings,
} from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  {
    key: "dashboard",
    icon: LayoutDashboard,
    route: "/(contractor)/(dashboard)" as const,
    match: ["/(contractor)/(dashboard)", "/(dashboard)"],
  },
  {
    key: "jobs",
    icon: Briefcase,
    route: "/(contractor)/(jobs)" as const,
    match: ["/(contractor)/(jobs)", "/(jobs)"],
  },
  {
    key: "projects",
    icon: FolderOpen,
    route: "/(contractor)/projects" as const,
    match: ["/(contractor)/projects", "/projects"],
  },
  {
    key: "estimates",
    icon: Plus,
    route: "/(contractor)/estimates" as const,
    match: ["/(contractor)/estimates", "/estimates"],
    isCenter: true,
  },
  {
    key: "clients",
    icon: Users,
    route: "/(contractor)/clients" as const,
    match: ["/(contractor)/clients", "/clients"],
  },
  {
    key: "invoices",
    icon: Receipt,
    route: "/(contractor)/invoices" as const,
    match: ["/(contractor)/invoices", "/invoices"],
  },
  {
    key: "settings",
    icon: Settings,
    route: "/(contractor)/settings" as const,
    match: ["/(contractor)/settings", "/settings"],
  },
] as const;

export default function CustomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isActive = (tab: (typeof TABS)[number]) => {
    return tab.match.some((m) => pathname.startsWith(m.replace("/(contractor)", "")));
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Tab bar */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.centerButton}
                onPress={() => router.push(tab.route)}
                activeOpacity={0.8}
              >
                <View style={styles.centerCircle}>
                  <Icon size={30} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => router.push(tab.route)}
              activeOpacity={0.7}
            >
              <Icon
                size={21}
                color={active ? BRAND.colors.primary : BRAND.colors.textMuted}
              />
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: active ? BRAND.colors.primary : "transparent",
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: BRAND.colors.border,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 56,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  centerButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BRAND.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
