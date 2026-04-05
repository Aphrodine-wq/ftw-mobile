import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DollarSign,
  MessageSquare,
  Star,
  CreditCard,
  CheckCheck,
  ChevronLeft,
  Bell,
} from "lucide-react-native";
import { useNotifications } from "@src/api/hooks";
import { formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";
import type { Notification as BaseNotification } from "@src/types";

type Notification = BaseNotification & { read: boolean };

const TYPE_ICONS: Record<string, { icon: typeof DollarSign; color: string; bg: string }> = {
  bid_received: { icon: DollarSign, color: "#6B7280", bg: "bg-gray-100" },
  bid_accepted: { icon: DollarSign, color: "#6B7280", bg: "bg-gray-100" },
  message: { icon: MessageSquare, color: "#6B7280", bg: "bg-gray-100" },
  review: { icon: Star, color: "#6B7280", bg: "bg-gray-100" },
  payment: { icon: CreditCard, color: "#6B7280", bg: "bg-gray-100" },
};

function getTypeConfig(type: string) {
  return TYPE_ICONS[type] || { icon: Bell, color: "#6B7280", bg: "bg-gray-100" };
}

export default function ContractorNotifications() {
  const { data: queryNotifications = [] } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>(queryNotifications as Notification[]);

  useEffect(() => {
    if (queryNotifications.length > 0) {
      setNotifications(queryNotifications as Notification[]);
    }
  }, [queryNotifications]);

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
          className="bg-white border border-border rounded p-4 mx-5 mb-3"
          style={{ borderRadius: 4 }}
          activeOpacity={0.7}
          onPress={() => markRead(item.id)}
        >
          <View className="flex-row items-start">
            {/* Icon */}
            <View
              className={`w-10 h-10 ${config.bg} items-center justify-center mr-3`}
              style={{ borderRadius: 4 }}
            >
              <IconComponent size={18} color={config.color} />
            </View>

            {/* Content */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text
                  className={`flex-1 text-base ${
                    !item.read ? "font-bold text-dark" : "font-medium text-dark"
                  }`}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {!item.read && (
                  <View
                    className="w-2.5 h-2.5 bg-brand-600 ml-2"
                    style={{ borderRadius: 4 }}
                  />
                )}
              </View>
              <Text
                className="text-text-secondary text-sm mt-0.5"
                numberOfLines={2}
              >
                {item.body}
              </Text>
              <Text className="text-text-muted text-xs mt-1.5">
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
        <Text className="text-2xl font-bold text-dark flex-1">
          Notifications
        </Text>
        {unreadCount > 0 && (
          <View
            className="bg-brand-600 px-2.5 py-0.5"
            style={{ borderRadius: 4 }}
          >
            <Text className="text-white text-xs font-bold">
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
            <Text className="text-brand-600 text-sm font-medium ml-1.5">
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
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        ListEmptyComponent={
          <View className="items-center py-12 px-5">
            <Bell size={40} color={BRAND.colors.textMuted} />
            <Text className="text-text-secondary text-base mt-3">
              No notifications yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
