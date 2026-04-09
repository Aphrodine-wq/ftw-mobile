import { useState, useCallback, useEffect } from "react";
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
  CheckCheck,
  ChevronLeft,
  Bell,
  Briefcase,
} from "lucide-react-native";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@src/api/hooks";
import { useRealtimeNotifications } from "@src/realtime/hooks";
import { useAuthStore } from "@src/stores/auth";
import { useNotificationStore } from "@src/stores/notifications";
import { formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";
import type { Notification as BaseNotification } from "@src/types";

type Notification = BaseNotification & { read: boolean };

const TYPE_ICONS: Record<string, { icon: typeof DollarSign; color: string; bg: string }> = {
  bid_accepted: { icon: DollarSign, color: "#059669", bg: "#ECFDF5" },
  message: { icon: MessageSquare, color: "#2563EB", bg: "#EFF6FF" },
  work_assigned: { icon: Briefcase, color: "#7C3AED", bg: "#F5F3FF" },
  payment: { icon: DollarSign, color: "#D97706", bg: "#FFFBEB" },
};

function getTypeConfig(type: string) {
  return TYPE_ICONS[type] || { icon: Bell, color: BRAND.colors.textSecondary, bg: "#F3F4F6" };
}

export default function SubContractorNotifications() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: queryNotifications = [] } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>(queryNotifications as Notification[]);
  const { notifications: realtimeNotifications } = useRealtimeNotifications(userId || null);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (queryNotifications.length > 0) {
      setNotifications(queryNotifications as Notification[]);
    }
  }, [queryNotifications]);

  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newOnes = realtimeNotifications
          .filter((n: any) => !existingIds.has(n.id))
          .map((n: any) => ({ ...n, read: false }));
        return [...newOnes, ...prev];
      });
    }
  }, [realtimeNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setUnreadCount(unreadCount);
  }, [unreadCount, setUnreadCount]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllReadMutation.mutate();
  }, [markAllReadMutation]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    markReadMutation.mutate(id);
  }, [markReadMutation]);

  const renderNotification = useCallback(
    ({ item }: { item: Notification }) => {
      const config = getTypeConfig(item.type);
      const IconComponent = config.icon;

      return (
        <TouchableOpacity
          style={st.card}
          activeOpacity={0.7}
          onPress={() => markRead(item.id)}
        >
          <View className="flex-row items-start">
            <View style={[st.iconBox, { backgroundColor: config.bg }]}>
              <IconComponent size={18} color={config.color} />
            </View>
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
                {!item.read && <View style={st.unreadDot} />}
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
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <ChevronLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "700", color: BRAND.colors.textPrimary, flex: 1 }}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <View style={st.countBadge}>
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {unreadCount > 0 && (
        <View className="px-5 mt-2 mb-1">
          <TouchableOpacity className="flex-row items-center self-end py-2" activeOpacity={0.7} onPress={markAllRead}>
            <CheckCheck size={16} color={BRAND.colors.primary} />
            <Text style={{ color: BRAND.colors.primary, fontSize: 13, fontWeight: "600", marginLeft: 6 }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
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

const st = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: BRAND.colors.border, borderRadius: 4, padding: 16, marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 4, alignItems: "center", justifyContent: "center", marginRight: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563EB", marginLeft: 8 },
  countBadge: { backgroundColor: BRAND.colors.primary, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
});
