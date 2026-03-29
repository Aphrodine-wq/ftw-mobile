import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, FileText, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { fetchEstimates } from "@src/api/data";
import { mockEstimates, type MockEstimate } from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";

type EstimateStatus = MockEstimate["status"];

function getStatusVariant(
  status: EstimateStatus,
): "neutral" | "default" | "success" | "danger" {
  switch (status) {
    case "draft":
      return "neutral";
    case "sent":
      return "default";
    case "accepted":
      return "success";
    case "declined":
      return "danger";
  }
}

function getStatusLabel(status: EstimateStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function EstimatesScreen() {
  const router = useRouter();
  const [estimates, setEstimates] = useState<MockEstimate[]>(mockEstimates);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchEstimates();
    setEstimates(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Summary stats
  const totalEstimates = estimates.length;
  const pendingValue = estimates
    .filter((e) => e.status === "sent" || e.status === "draft")
    .reduce((sum, e) => sum + e.total, 0);
  const acceptedValue = estimates
    .filter((e) => e.status === "accepted")
    .reduce((sum, e) => sum + e.total, 0);

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="mr-3"
          >
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Estimates</Text>
        </View>
        <TouchableOpacity
          className="bg-brand-600 p-2.5"
          style={{ borderRadius: 0 }}
          activeOpacity={0.7}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View
        className="flex-row mx-5 mt-4 bg-white border border-border overflow-hidden"
        style={{ borderRadius: 0 }}
      >
        <View className="flex-1 items-center py-4 border-r border-border">
          <Text className="text-2xl font-bold text-dark">{totalEstimates}</Text>
          <Text className="text-text-secondary text-sm mt-0.5">Total</Text>
        </View>
        <View className="flex-1 items-center py-4 border-r border-border">
          <Text className="text-2xl font-bold text-dark">
            {formatCurrency(pendingValue)}
          </Text>
          <Text className="text-text-secondary text-sm mt-0.5">Pending</Text>
        </View>
        <View className="flex-1 items-center py-4">
          <Text className="text-2xl font-bold text-dark">
            {formatCurrency(acceptedValue)}
          </Text>
          <Text className="text-text-secondary text-sm mt-0.5">Accepted</Text>
        </View>
      </View>
    </View>
  );

  const renderEstimate = ({ item }: { item: MockEstimate }) => (
    <TouchableOpacity
      className="bg-white border border-border mx-5 mb-3 p-4 flex-row items-center"
      style={{ borderRadius: 0 }}
      activeOpacity={0.7}
    >
      <View
        className="w-10 h-10 bg-gray-100 items-center justify-center mr-3"
        style={{ borderRadius: 0 }}
      >
        <FileText size={20} color="#4B5563" />
      </View>
      <View className="flex-1">
        <Text className="text-dark font-semibold" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-text-secondary text-sm mt-0.5">
          {item.client}
        </Text>
      </View>
      <View className="items-end ml-3">
        <Text className="text-dark font-bold">
          {formatCurrency(item.total)}
        </Text>
        <View className="mt-1">
          <Badge
            label={getStatusLabel(item.status)}
            variant={getStatusVariant(item.status)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <FlatList
        data={estimates}
        keyExtractor={(item) => item.id}
        renderItem={renderEstimate}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={{ paddingBottom: 16 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <FileText size={48} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-base mt-4">
              No estimates yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
