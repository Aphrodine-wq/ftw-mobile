import { Stack, useRouter } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle, Bell } from "lucide-react-native";
import CustomTabBar from "@src/components/layout/CustomTabBar";
import { BRAND } from "@src/lib/constants";

const UNREAD_MESSAGES = 3;
const UNREAD_NOTIFICATIONS = 5;

export default function ContractorLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      {/* Top floating buttons */}
      <View style={[styles.topBar, { top: insets.top }]}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => router.push("/(contractor)/(messages)" as any)}
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
          onPress={() => router.push("/(contractor)/notifications" as any)}
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

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      >
        <Stack.Screen name="(dashboard)" />
        <Stack.Screen name="projects" />
        <Stack.Screen name="estimates" />
        <Stack.Screen name="(messages)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="(jobs)" />
        <Stack.Screen name="(profile)" />
        <Stack.Screen name="clients" />
        <Stack.Screen name="invoices" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="records" />
        <Stack.Screen name="reviews" />
      </Stack>
      <CustomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    right: 12,
    zIndex: 100,
    flexDirection: "row",
    gap: 6,
  },
  topButton: {
    width: 38,
    height: 38,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
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
    borderRadius: 0,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
