import { Tabs, useRouter, useSegments } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle, Bell } from "lucide-react-native";
import HomeownerTabBar from "@src/components/layout/HomeownerTabBar";
import { BRAND } from "@src/lib/constants";
import { useNotificationStore } from "@src/stores/notifications";

const SHOW_FLOATING_ON = ["(dashboard)"];

const FloatingButtons = memo(function FloatingButtons({ top }: { top: number }) {
  const router = useRouter();
  const unreadNotifications = useNotificationStore((s) => s.unreadCount);

  const goNotifications = useCallback(() => {
    router.push("/(homeowner)/notifications" as any);
  }, [router]);

  const goMessages = useCallback(() => {
    router.push("/(homeowner)/(messages)" as any);
  }, [router]);

  return (
    <View style={[styles.topBar, { top }]} pointerEvents="box-none">
      <TouchableOpacity style={styles.topButton} onPress={goNotifications} activeOpacity={0.8}>
        <Bell size={22} color={BRAND.colors.textSecondary} />
        {unreadNotifications > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadNotifications}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.topButton} onPress={goMessages} activeOpacity={0.8}>
        <MessageCircle size={22} color={BRAND.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
});

export default function HomeownerLayout() {
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const showFloating = useMemo(() => {
    const filtered = segments.filter((s) => s !== "(homeowner)");
    const activeScreen = filtered[filtered.length - 1] || "";
    return SHOW_FLOATING_ON.includes(activeScreen);
  }, [segments]);

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => <HomeownerTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          lazy: false,
          freezeOnBlur: false,
        }}
      >
        <Tabs.Screen name="(dashboard)" options={{ title: "Home" }} />
        <Tabs.Screen name="(jobs)" options={{ title: "Jobs" }} />
        <Tabs.Screen name="(messages)" options={{ href: null }} />
        <Tabs.Screen name="(profile)" options={{ title: "Profile", href: null }} />
        <Tabs.Screen name="projects" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="reviews" options={{ href: null }} />
        <Tabs.Screen name="post-job" options={{ href: null }} />
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
