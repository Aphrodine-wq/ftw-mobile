import { useState, useEffect, useCallback } from "react";
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
  FolderOpen,
  CheckCheck,
  ChevronLeft,
  Bell,
} from "lucide-react-native";
import { fetchNotifications } from "@src/api/data";
import { mockNotifications } from "@src/lib/mock-data";
import { formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

type Notification = (typeof mockNotifications)[number] & { read: boolean };

const TYPE_ICONS: Record<string, { icon: typeof DollarSign; color: string; bg: string }> = {
  bid_received: { icon: DollarSign, color: "#059669", bg: "bg-emerald-50" },
  message: { icon: MessageSquare, color: "#2563EB", bg: "bg-blue-50" },
  project_update: { icon: FolderOpen, color: "#7C3AED", bg: "bg-purple-50" },
};

function getTypeConfig(type: string) {
  return TYPE_ICONS[type] || { icon: Bell, color: BRAND.colors.textSecondary, bg: "bg-gray-100" };
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
          className="bg-white rounded-2xl p-4 mx-5 mb-3"
          activeOpacity={0.7}
          onPress={() => markRead(item.id)}
        >
          <View className="flex-row items-start">
            {/* Icon */}
            <View
              className={`w-10 h-10 rounded-xl ${config.bg} items-center justify-center mr-3`}
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
                  <View className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-2" />
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
          <View className="bg-brand-600 rounded-full px-2.5 py-0.5">
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
