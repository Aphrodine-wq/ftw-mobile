import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DollarSign,
  MessageSquare,
  FolderOpen,
  CheckCheck,
  ChevronLeft,
  Bell,
  Star,
} from "lucide-react-native";
import { fetchNotifications } from "@src/api/data";
import { mockNotifications } from "@src/lib/mock-data";
import { formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

type Notification = (typeof mockNotifications)[number] & { read: boolean };

const TYPE_ICONS: Record<string, { icon: typeof DollarSign; color: string; bg: string }> = {
  bid_received: { icon: DollarSign, color: "#059669", bg: "#ECFDF5" },
  message: { icon: MessageSquare, color: "#2563EB", bg: "#EFF6FF" },
  project_update: { icon: FolderOpen, color: "#7C3AED", bg: "#F5F3FF" },
  bid_accepted: { icon: DollarSign, color: "#059669", bg: "#ECFDF5" },
  payment: { icon: DollarSign, color: "#D97706", bg: "#FFFBEB" },
  review: { icon: Star, color: "#D97706", bg: "#FFFBEB" },
};

function getTypeConfig(type: string) {
  return TYPE_ICONS[type] || { icon: Bell, color: BRAND.colors.textSecondary, bg: "#F3F4F6" };
}

export default function HomeownerNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications as Notification[]
  );

  useEffect(() => {
    fetchNotifications().then((data) =>
      setNotifications(data as Notification[])
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = useCallback(
    ({ item }: { item: Notification }) => {
      const config = getTypeConfig(item.type);
      const IconComponent = config.icon;

      return (
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.7}
          onPress={() => markRead(item.id)}
        >
          <View className="flex-row items-start">
            {/* Icon */}
            <View style={[s.iconBox, { backgroundColor: config.bg }]}>
              <IconComponent size={18} color={config.color} />
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <View className="flex-row items-center">
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: item.read ? "500" : "700",
                    color: BRAND.colors.textPrimary,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {!item.read && <View style={s.unreadDot} />}
              </View>
              <Text
                style={{ fontSize: 13, color: BRAND.colors.textSecondary, marginTop: 2 }}
                numberOfLines={2}
              >
                {item.body}
              </Text>
              <Text style={{ fontSize: 12, color: BRAND.colors.textMuted, marginTop: 6 }}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [markRead]
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "700", color: BRAND.colors.textPrimary, flex: 1 }}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <View style={s.countBadge}>
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
              {unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Mark All Read */}
      {unreadCount > 0 && (
        <View className="px-5 mt-2 mb-1">
          <TouchableOpacity
            className="flex-row items-center self-end py-2"
            activeOpacity={0.7}
            onPress={markAllRead}
          >
            <CheckCheck size={16} color={BRAND.colors.primary} />
            <Text style={{ color: BRAND.colors.primary, fontSize: 13, fontWeight: "600", marginLeft: 6 }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 90 }}
        ListEmptyComponent={
          <View className="items-center py-12 px-5">
            <Bell size={40} color={BRAND.colors.textMuted} />
            <Text style={{ color: BRAND.colors.textSecondary, fontSize: 15, marginTop: 12 }}>
              No notifications yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: BRAND.colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
