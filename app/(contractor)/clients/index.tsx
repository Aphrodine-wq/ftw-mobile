import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  Phone,
  Mail,
  FolderOpen,
  ChevronLeft,
} from "lucide-react-native";
import { fetchClients } from "@src/api/data";
import { mockClients } from "@src/lib/mock-data";
import { formatCurrency, getInitials } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

type Client = (typeof mockClients)[number];

export default function ContractorClients() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClients().then((data) => setClients(data as Client[]));
  }, []);

  const sorted = [...clients].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const filtered = sorted.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderClient = useCallback(
    ({ item }: { item: Client }) => (
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mx-5 mb-3"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 rounded-full bg-brand-600 items-center justify-center mr-3">
            <Text className="text-white font-bold text-base">
              {getInitials(item.name)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-dark font-semibold text-base">
              {item.name}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <FolderOpen size={12} color={BRAND.colors.textMuted} />
              <Text className="text-text-secondary text-sm ml-1">
                {item.projectCount} {item.projectCount === 1 ? "project" : "projects"}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-dark font-bold text-base">
              {formatCurrency(item.totalSpent)}
            </Text>
            <Text className="text-text-muted text-xs mt-0.5">
              total spent
            </Text>
          </View>
        </View>

        <View className="border-t border-border pt-3 flex-row">
          <View className="flex-row items-center flex-1">
            <Mail size={14} color={BRAND.colors.textSecondary} />
            <Text className="text-text-secondary text-sm ml-1.5" numberOfLines={1}>
              {item.email}
            </Text>
          </View>
          <View className="flex-row items-center ml-4">
            <Phone size={14} color={BRAND.colors.textSecondary} />
            <Text className="text-text-secondary text-sm ml-1.5">
              {item.phone}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    []
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
        <Text className="text-2xl font-bold text-dark flex-1">Clients</Text>
        <View className="bg-brand-50 rounded-full px-3 py-1">
          <Text className="text-brand-600 text-sm font-medium">
            {filtered.length}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View className="px-5 mt-3 mb-4">
        <View className="bg-white rounded-xl flex-row items-center px-4 py-3 border border-border">
          <Search size={18} color={BRAND.colors.textMuted} />
          <TextInput
            className="flex-1 ml-3 text-dark text-base"
            placeholder="Search clients..."
            placeholderTextColor={BRAND.colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Client List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderClient}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-12 px-5">
            <Text className="text-text-secondary text-base">
              No clients found.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
