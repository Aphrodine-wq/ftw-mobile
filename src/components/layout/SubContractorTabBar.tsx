import { useState, useCallback, memo, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
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
  Briefcase,
  Plus,
  ClipboardList,
  User,
  MessageCircle,
  Settings,
  Search,
  FileText,
} from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const TABS = [
  {
    key: "dashboard",
    label: "Home",
    icon: LayoutDashboard,
    route: "/(subcontractor)/(dashboard)" as const,
    match: ["/(subcontractor)/(dashboard)", "/(dashboard)"],
  },
  {
    key: "work",
    label: "Sub Jobs",
    icon: Briefcase,
    route: "/(subcontractor)/work" as const,
    match: ["/(subcontractor)/work", "/work"],
  },
  {
    key: "action",
    label: "",
    icon: Plus,
    route: "/(subcontractor)/work" as const,
    match: [],
    isCenter: true,
  },
  {
    key: "my-work",
    label: "My Work",
    icon: ClipboardList,
    route: "/(subcontractor)/my-work" as const,
    match: ["/(subcontractor)/my-work", "/my-work"],
  },
  {
    key: "profile",
    label: "Profile",
    icon: User,
    route: "/(subcontractor)/(profile)" as const,
    match: ["/(subcontractor)/(profile)", "/(profile)"],
  },
] as const;

const FEATURED_ACTIONS = [
  { key: "bid", label: "Place Bid", icon: FileText, route: "/(subcontractor)/work" },
] as const;

const QUICK_ACTIONS = [
  { key: "browse", label: "Browse Work", icon: Search, route: "/(subcontractor)/work" },
  { key: "my-bids", label: "My Bids", icon: ClipboardList, route: "/(subcontractor)/my-work" },
  { key: "messages", label: "Messages", icon: MessageCircle, route: "/(subcontractor)/(dashboard)" },
  { key: "settings", label: "Settings", icon: Settings, route: "/(subcontractor)/(profile)" },
] as const;

const SPRING_CONFIG = { damping: 20, stiffness: 300 };

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

const SC_ROUTE_TO_KEY: Record<string, string> = {
  "(dashboard)": "dashboard",
  work: "work",
  "my-work": "my-work",
};

export default function SubContractorTabBar(props: any) {
  const tabNavigation = props?.navigation;
  const tabState = props?.state;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);
  // 5 items: 1 featured + 4 quick
  const item0 = useSharedValue(0);
  const item1 = useSharedValue(0);
  const item2 = useSharedValue(0);
  const item3 = useSharedValue(0);
  const item4 = useSharedValue(0);
  const itemProgress = useMemo(() => [item0, item1, item2, item3, item4], [item0, item1, item2, item3, item4]);

  const activeTabKey = useMemo(() => {
    if (tabState) {
      const activeRoute = tabState.routes[tabState.index];
      return SC_ROUTE_TO_KEY[activeRoute?.name] || null;
    }
    return null;
  }, [tabState?.index]);

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

  const centerScale = useSharedValue(1);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: centerScale.value },
      { rotate: `${interpolate(rotation.value, [0, 1], [0, 45])}deg` },
    ],
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
                    <FaIcon size={30} color="#FFFFFF" />
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
                        <Icon size={36} color={BRAND.colors.dark} />
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
                <Pressable
                  key={tab.key}
                  style={styles.centerButton}
                  onPressIn={() => {
                    centerScale.value = withTiming(0.9, { duration: 120, easing: Easing.out(Easing.ease) });
                  }}
                  onPressOut={() => {
                    centerScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
                  }}
                  onPress={open ? () => closeMenu() : openMenu}
                >
                  <Animated.View style={[styles.centerCircle, rotateStyle]}>
                    <Plus size={38} color="#FFFFFF" strokeWidth={3} />
                  </Animated.View>
                </Pressable>
              );
            }

            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => {
                  if (active && !open) return;
                  const go = () => {
                    if (tabNavigation) {
                      const routeName = tab.route.replace("/(subcontractor)/", "").replace("/(subcontractor)", "(dashboard)");
                      tabNavigation.navigate(routeName);
                    } else {
                      router.push(tab.route as any);
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  };
                  if (open) closeMenu(go);
                  else go();
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
    fontSize: 16,
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
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
