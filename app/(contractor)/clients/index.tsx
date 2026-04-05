import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  Phone,
  Mail,
  FolderOpen,
  ChevronLeft,
  Plus,
  ChevronRight,
  Users,
  DollarSign,
  MessageCircle,
} from "lucide-react-native";
import { mockClients } from "@src/lib/mock-data";
import { useClients } from "@src/api/hooks";
import { formatCurrency, getInitials } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { useRouter } from "expo-router";
import { Badge } from "@src/components/ui/badge";

type Client = (typeof mockClients)[number];

export default function ContractorClients() {
  const router = useRouter();
  const { data: clients = mockClients, refetch, isRefetching } = useClients();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const sorted = [...clients].sort((a, b) => a.name.localeCompare(b.name));
    return sorted.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [clients, search]);

  const totalRevenue = useMemo(() => clients.reduce((sum, c) => sum + c.totalSpent, 0), [clients]);
  const activeCount = useMemo(() => clients.filter((c) => c.status === "active").length, [clients]);

  const renderClient = useCallback(
    ({ item }: { item: Client }) => (
      <TouchableOpacity
        className="bg-white border border-border mx-4 mb-3"
        style={{ borderRadius: 4 }}
        activeOpacity={0.7}
        onPress={() => router.push(`/(contractor)/clients/${item.id}` as any)}
      >
        {/* Client Info */}
        <View className="p-4 flex-row items-center">
          <Image
            source={{ uri: item.avatar }}
            style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
            contentFit="cover"
            recyclingKey={`client-${item.id}`}
            transition={150}
          />
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-dark font-bold" style={{ fontSize: 16 }}>{item.name}</Text>
              {item.status === "active" && (
                <View className="ml-2">
                  <Badge label="Active" variant="success" square />
                </View>
              )}
            </View>
            <Text className="text-text-muted mt-0.5" style={{ fontSize: 13 }}>{item.lastProject}</Text>
          </View>
          <View className="items-end">
            <Text className="text-dark font-bold" style={{ fontSize: 16 }}>{formatCurrency(item.totalSpent)}</Text>
            <Text className="text-text-muted" style={{ fontSize: 11 }}>{item.projectCount} {item.projectCount === 1 ? "project" : "projects"}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row border-t border-border">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 border-r border-border"
            activeOpacity={0.7}
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
          >
            <Phone size={14} color={BRAND.colors.textSecondary} />
            <Text className="text-text-secondary font-medium ml-1.5" style={{ fontSize: 13 }}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 border-r border-border"
            activeOpacity={0.7}
            onPress={() => Linking.openURL(`mailto:${item.email}`)}
          >
            <Mail size={14} color={BRAND.colors.textSecondary} />
            <Text className="text-text-secondary font-medium ml-1.5" style={{ fontSize: 13 }}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3"
            activeOpacity={0.7}
            onPress={() => router.push(`/(contractor)/clients/${item.id}` as any)}
          >
            <ChevronRight size={14} color={BRAND.colors.textSecondary} />
            <Text className="text-text-secondary font-medium ml-1.5" style={{ fontSize: 13 }}>Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [router],
  );

  const renderHeader = useCallback(() => (
    <View>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <ChevronLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text className="text-dark font-bold flex-1" style={{ fontSize: 22 }}>Clients</Text>
        <TouchableOpacity
          onPress={() => router.push("/(contractor)/clients/add" as any)}
          className="bg-brand-600 p-2.5"
          style={{ borderRadius: 4 }}
          activeOpacity={0.7}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 8 }} />
    </View>
  ), [clients.length, activeCount, totalRevenue, search, router]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderClient}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        ListEmptyComponent={
          <View className="items-center py-12 px-5">
            <Users size={40} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted mt-3" style={{ fontSize: 15 }}>No clients found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
