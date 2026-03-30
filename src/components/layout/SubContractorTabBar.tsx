import { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Pressable,
  Animated,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  ClipboardList,
  User,
  X,
  MessageCircle,
  Settings,
  Search,
  FileText,
} from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

export default function SubContractorTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef([...FEATURED_ACTIONS, ...QUICK_ACTIONS].map(() => new Animated.Value(0))).current;

  const isActive = (tab: (typeof TABS)[number]) => {
    return tab.match.some((m) => pathname.startsWith(m.replace("/(subcontractor)", "")));
  };

  const openMenu = () => {
    setOpen(true);
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 65, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    itemAnims.forEach((anim, i) => {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        delay: 40 * i,
        useNativeDriver: true,
      }).start();
    });
  };

  const closeMenu = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setOpen(false);
      cb?.();
    });
  };

  const handleAction = (route: string | null) => {
    closeMenu(() => {
      if (route) router.push(route as any);
    });
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <>
      {/* Overlay + Menu */}
      {open && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeMenu()}>
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.5)", opacity: overlayAnim }]} />
          </Pressable>

          <Animated.View
            style={[
              styles.menuContainer,
              { bottom: 56 + insets.bottom + 10, opacity: scaleAnim },
            ]}
            pointerEvents="box-none"
          >
            <Animated.View style={{
              transform: [{ scale: scaleAnim }, { translateY: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              marginBottom: 20,
            }}>
              <Text style={styles.menuTitle}>Quick Actions</Text>
            </Animated.View>

            {/* Featured Actions */}
            {FEATURED_ACTIONS.map((fa, fi) => {
              const FaIcon = fa.icon;
              return (
                <Animated.View key={fa.key} style={{
                  width: "100%",
                  transform: [
                    { scale: itemAnims[fi] || itemAnims[0] },
                    { translateY: (itemAnims[fi] || itemAnims[0]).interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                  ],
                  opacity: itemAnims[fi] || itemAnims[0],
                  marginBottom: fi < FEATURED_ACTIONS.length - 1 ? 8 : 16,
                }}>
                  <TouchableOpacity
                    style={styles.featuredButton}
                    onPress={() => handleAction(fa.route)}
                    activeOpacity={0.8}
                  >
                    <FaIcon size={24} color="#FFFFFF" />
                    <Text style={styles.featuredButtonText}>{fa.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {/* Grid */}
            <View style={styles.grid}>
              {QUICK_ACTIONS.map((action, i) => {
                const Icon = action.icon;
                const animIdx = i + FEATURED_ACTIONS.length;
                return (
                  <Animated.View
                    key={action.key}
                    style={{
                      transform: [
                        { scale: itemAnims[animIdx] || itemAnims[0] },
                        { translateY: (itemAnims[animIdx] || itemAnims[0]).interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                      ],
                      opacity: itemAnims[animIdx] || itemAnims[0],
                    }}
                  >
                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => handleAction(action.route)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.actionIcon}>
                        <Icon size={30} color={BRAND.colors.dark} />
                      </View>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        </View>
      )}

      {/* Tab Bar */}
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;

            if ("isCenter" in tab && tab.isCenter) {
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.centerButton}
                  onPress={open ? () => closeMenu() : openMenu}
                  activeOpacity={0.8}
                >
                  <Animated.View style={[styles.centerCircle, { transform: [{ rotate: rotation }] }]}>
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
});
