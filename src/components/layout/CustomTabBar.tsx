import { useState, useCallback, memo, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
} from "react-native-reanimated";
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  Users,
  Settings,
  FileText,
  Briefcase,
  Receipt,
  MessageCircle,
  ClipboardList,
  Flag,
  Brain,
} from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const TABS = [
  {
    key: "dashboard",
    label: "Home",
    icon: LayoutDashboard,
    route: "/(contractor)/(dashboard)" as const,
    match: ["/(contractor)/(dashboard)", "/(dashboard)"],
  },
  {
    key: "projects",
    label: "Projects",
    icon: FolderOpen,
    route: "/(contractor)/projects" as const,
    match: ["/(contractor)/projects", "/projects"],
  },
  {
    key: "action",
    label: "",
    icon: Plus,
    route: "/(contractor)/estimates" as const,
    match: ["/(contractor)/estimates", "/estimates"],
    isCenter: true,
  },
  {
    key: "clients",
    label: "Clients",
    icon: Users,
    route: "/(contractor)/clients" as const,
    match: ["/(contractor)/clients", "/clients"],
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    route: "/(contractor)/settings" as const,
    match: ["/(contractor)/settings", "/settings"],
  },
] as const;

const FEATURED_ACTIONS = [
  { key: "estimate", label: "New Estimate", icon: FileText, route: "/(contractor)/estimates?tab=new-estimate" },
  { key: "client", label: "New Client", icon: Users, route: "/(contractor)/clients/add" },
] as const;

const QUICK_ACTIONS = [
  { key: "ai-agent", label: "AI Agent", icon: Brain, route: "/(contractor)/ai-agent", pro: true },
  { key: "job", label: "Browse Jobs", icon: Briefcase, route: "/(contractor)/(jobs)", pro: false },
  { key: "invoice", label: "New Invoice", icon: Receipt, route: "/(contractor)/invoices", pro: false },
  { key: "message", label: "Messages", icon: MessageCircle, route: "/(contractor)/(messages)", pro: false },
  { key: "milestones", label: "Milestones", icon: Flag, route: "/(contractor)/milestones", pro: false },
] as const;

const SPRING_CONFIG = { damping: 20, stiffness: 300 };

// Extracted component so useAnimatedStyle is called at component top level
const AnimatedItem = memo(function AnimatedItem({
  sv,
  style,
  children,
}: {
  sv: SharedValue<number>;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  const animStyle = useAnimatedStyle(() => ({
    opacity: sv.value,
    transform: [{ scale: interpolate(sv.value, [0, 1], [0.96, 1]) }],
  }));
  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
});

const TOTAL_ITEMS = FEATURED_ACTIONS.length + QUICK_ACTIONS.length;

export default function CustomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);
  // Fixed count — always 7 shared values, same every render
  const item0 = useSharedValue(0);
  const item1 = useSharedValue(0);
  const item2 = useSharedValue(0);
  const item3 = useSharedValue(0);
  const item4 = useSharedValue(0);
  const item5 = useSharedValue(0);
  const item6 = useSharedValue(0);
  const itemProgress = [item0, item1, item2, item3, item4, item5, item6];

  const activeTabKey = useMemo(() => {
    for (const tab of TABS) {
      if (tab.match.some((m) => pathname.startsWith(m.replace("/(contractor)", "")))) {
        return tab.key;
      }
    }
    return null;
  }, [pathname]);

  const openMenu = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOpen(true);
    progress.value = withTiming(1, { duration: 450, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    rotation.value = withTiming(1, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    itemProgress.forEach((sv) => {
      sv.value = 0;
      sv.value = withTiming(1, { duration: 450, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    });
  }, []);

  const closeMenu = useCallback((cb?: () => void) => {
    progress.value = withTiming(0, { duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    rotation.value = withTiming(0, { duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    itemProgress.forEach((sv) => {
      sv.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    });
    setTimeout(() => {
      setOpen(false);
      cb?.();
    }, 370);
  }, []);

  const handleAction = useCallback((route: string | null) => {
    closeMenu(() => {
      if (route) router.push(route as any);
    });
  }, [closeMenu, router]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const menuStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.96, 1]) }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotation.value, [0, 1], [0, 45])}deg` }],
  }));

  return (
    <>
      {open && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeMenu()}>
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.5)" }, overlayStyle]} />
          </Pressable>

          <Animated.View
            style={[
              styles.menuContainer,
              { bottom: 56 + insets.bottom + 10 },
              menuStyle,
            ]}
            pointerEvents="box-none"
          >
            <Animated.View style={[{ marginBottom: 20 }, titleStyle]}>
              <Text style={styles.menuTitle}>Quick Actions</Text>
            </Animated.View>

            {FEATURED_ACTIONS.map((fa, fi) => {
              const FaIcon = fa.icon;
              return (
                <AnimatedItem
                  key={fa.key}
                  sv={itemProgress[fi]}
                  style={{ width: "100%", marginBottom: fi < FEATURED_ACTIONS.length - 1 ? 8 : 16 }}
                >
                  <TouchableOpacity
                    style={styles.featuredButton}
                    onPress={() => handleAction(fa.route)}
                    activeOpacity={0.8}
                  >
                    <FaIcon size={24} color="#FFFFFF" />
                    <Text style={styles.featuredButtonText}>{fa.label}</Text>
                  </TouchableOpacity>
                </AnimatedItem>
              );
            })}

            <View style={styles.grid}>
              {QUICK_ACTIONS.map((action, i) => {
                const Icon = action.icon;
                const animIdx = i + FEATURED_ACTIONS.length;
                return (
                  <AnimatedItem key={action.key} sv={itemProgress[animIdx]}>
                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => handleAction(action.route)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.actionIcon}>
                        <Icon size={30} color={BRAND.colors.dark} />
                        {action.pro && (
                          <View style={styles.proBadge}>
                            <Text style={styles.proBadgeText}>PRO</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                  </AnimatedItem>
                );
              })}
            </View>
          </Animated.View>
        </View>
      )}

      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = activeTabKey === tab.key;
            const Icon = tab.icon;

            if ("isCenter" in tab && tab.isCenter) {
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.centerButton}
                  onPress={open ? () => closeMenu() : openMenu}
                  activeOpacity={0.8}
                >
                  <Animated.View style={[styles.centerCircle, rotateStyle]}>
                    <Plus size={30} color="#FFFFFF" strokeWidth={2.5} />
                  </Animated.View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => {
                  if (active && !open) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (open) closeMenu(() => router.push(tab.route));
                  else router.push(tab.route);
                }}
                activeOpacity={0.7}
              >
                <Icon size={23} color={active ? BRAND.colors.primary : "#111318"} />
                <Text style={[styles.tabLabel, { color: active ? BRAND.colors.primary : "#111318" }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
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
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
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
  menuContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    maxWidth: 380,
  },
  actionItem: {
    width: 110,
    alignItems: "center",
    paddingVertical: 14,
  },
  actionIcon: {
    width: 72,
    height: 72,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  featuredButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  featuredButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  proBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: BRAND.colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },
});
