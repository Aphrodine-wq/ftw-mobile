import { Tabs, useRouter, usePathname, useSegments } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle, Bell } from "lucide-react-native";
import CustomTabBar from "@src/components/layout/CustomTabBar";
import { BRAND } from "@src/lib/constants";

const UNREAD_MESSAGES = 3;
const UNREAD_NOTIFICATIONS = 5;

// Only show floating buttons on dashboard
const SHOW_FLOATING_ON = ["(dashboard)"];

const FloatingButtons = memo(function FloatingButtons({ top }: { top: number }) {
  const router = useRouter();

  const goNotifications = useCallback(() => {
    router.push("/(contractor)/notifications" as any);
  }, [router]);

  const goMessages = useCallback(() => {
    router.push("/(contractor)/(messages)" as any);
  }, [router]);

  return (
    <View style={[styles.topBar, { top }]} pointerEvents="box-none">
      <TouchableOpacity style={styles.topButton} onPress={goNotifications} activeOpacity={0.8}>
        <Bell size={22} color={BRAND.colors.textSecondary} />
        {UNREAD_NOTIFICATIONS > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{UNREAD_NOTIFICATIONS}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.topButton} onPress={goMessages} activeOpacity={0.8}>
        <MessageCircle size={22} color={BRAND.colors.textSecondary} />
        {UNREAD_MESSAGES > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{UNREAD_MESSAGES}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});

export default function ContractorLayout() {
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const onMenuToggle = useCallback((open: boolean) => setMenuOpen(open), []);

  // Only show on the dashboard tab and when plus menu is closed
  const showFloating = useMemo(() => {
    if (menuOpen) return false;
    const contractorSegments = segments.filter((s) => s !== "(contractor)");
    const activeScreen = contractorSegments[contractorSegments.length - 1] || "";
    return SHOW_FLOATING_ON.includes(activeScreen);
  }, [segments, menuOpen]);

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} onMenuToggle={onMenuToggle} />}
        screenOptions={{
          headerShown: false,
          lazy: false,
          freezeOnBlur: false,
        }}
      >
        <Tabs.Screen name="(dashboard)" options={{ title: "Home" }} />
        <Tabs.Screen name="projects" options={{ title: "Projects" }} />
        <Tabs.Screen name="(jobs)" options={{ href: null }} />
        <Tabs.Screen name="(messages)" options={{ href: null }} />
        <Tabs.Screen name="(profile)" options={{ title: "Profile", href: null }} />
        <Tabs.Screen name="clients" options={{ title: "Clients" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
        <Tabs.Screen name="estimates" options={{ href: null }} />
        <Tabs.Screen name="invoices" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="records" options={{ href: null }} />
        <Tabs.Screen name="reviews" options={{ href: null }} />
        <Tabs.Screen name="milestones" options={{ href: null }} />
        <Tabs.Screen name="ai-agent" options={{ href: null }} />
        <Tabs.Screen name="pro" options={{ href: null }} />
        <Tabs.Screen name="calculator" options={{ href: null }} />
        <Tabs.Screen name="voice-agent" options={{ href: null }} />
        <Tabs.Screen name="marketplace" options={{ href: null }} />
        <Tabs.Screen name="call-estimate" options={{ href: null }} />
        <Tabs.Screen name="about-ai" options={{ href: null }} />
      </Tabs>
      {showFloating && <FloatingButtons top={insets.top} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    right: 16,
    zIndex: 100,
    flexDirection: "row",
    gap: 10,
  },
  topButton: {
    width: 46,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    backgroundColor: BRAND.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
