import { Stack, useRouter, usePathname } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle, Bell } from "lucide-react-native";
import HomeownerTabBar from "@src/components/layout/HomeownerTabBar";
import { BRAND } from "@src/lib/constants";

const UNREAD_MESSAGES = 2;
const UNREAD_NOTIFICATIONS = 3;

const HIDE_FLOATING_ON = ["/projects", "/settings", "/reviews", "/notifications", "/messages", "/post-job"];

export default function HomeownerLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const showFloating = !HIDE_FLOATING_ON.some((p) => pathname.includes(p));

  return (
    <View style={{ flex: 1 }}>
      {/* Top floating buttons */}
      {showFloating && (
        <View style={[styles.topBar, { top: insets.top }]}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => router.push("/(homeowner)/(messages)" as any)}
            activeOpacity={0.8}
          >
            <MessageCircle size={18} color={BRAND.colors.primary} />
            {UNREAD_MESSAGES > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{UNREAD_MESSAGES}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => router.push("/(homeowner)/notifications" as any)}
            activeOpacity={0.8}
          >
            <Bell size={18} color={BRAND.colors.primary} />
            {UNREAD_NOTIFICATIONS > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{UNREAD_NOTIFICATIONS}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      >
        <Stack.Screen name="(dashboard)" />
        <Stack.Screen name="(jobs)" />
        <Stack.Screen name="(messages)" />
        <Stack.Screen name="(profile)" />
        <Stack.Screen name="projects" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="reviews" />
        <Stack.Screen name="post-job" />
      </Stack>
      <HomeownerTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    right: 16,
    zIndex: 100,
    flexDirection: "row",
    gap: 8,
  },
  topButton: {
    width: 38,
    height: 38,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    backgroundColor: BRAND.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
