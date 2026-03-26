import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Receipt } from "lucide-react-native";
import { useRouter } from "expo-router";
import { fetchInvoices } from "@src/api/data";
import { mockInvoices } from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import type { Invoice } from "@src/types";

type InvoiceFilter = "all" | "sent" | "paid" | "overdue";

const FILTERS: { key: InvoiceFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
];

function getStatusVariant(
  status: Invoice["status"],
): "neutral" | "default" | "success" | "danger" {
  switch (status) {
    case "draft":
      return "neutral";
    case "sent":
      return "default";
    case "paid":
      return "success";
    case "overdue":
      return "danger";
  }
}

function getStatusLabel(status: Invoice["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function InvoicesScreen() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [activeFilter, setActiveFilter] = useState<InvoiceFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchInvoices();
    setInvoices(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filtered =
    activeFilter === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === activeFilter);

  // Summary stats
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const outstanding = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="mr-3"
        >
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-dark">Invoices</Text>
      </View>

      {/* Summary Stats */}
      <View className="flex-row mx-5 mt-4 bg-white rounded-2xl overflow-hidden">
        <View className="flex-1 items-center py-4 border-r border-border">
          <Text className="text-xl font-bold text-dark">
            {formatCurrency(totalInvoiced)}
          </Text>
          <Text className="text-text-secondary text-sm mt-0.5">Invoiced</Text>
        </View>
        <View className="flex-1 items-center py-4 border-r border-border">
          <Text className="text-xl font-bold text-emerald-600">
            {formatCurrency(totalPaid)}
          </Text>
          <Text className="text-text-secondary text-sm mt-0.5">Paid</Text>
        </View>
        <View className="flex-1 items-center py-4">
          <Text className="text-xl font-bold text-amber-600">
            {formatCurrency(outstanding)}
          </Text>
          <Text className="text-text-secondary text-sm mt-0.5">
            Outstanding
          </Text>
        </View>
      </View>

      {/* Filter Pills */}
      <View className="flex-row px-5 mt-4 mb-2 gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full ${
                isActive ? "bg-dark" : "bg-white"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? "text-white" : "text-text-secondary"
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mx-5 mb-3 p-4 flex-row items-center"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-xl bg-brand-50 items-center justify-center mr-3">
        <Receipt size={20} color={BRAND.colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-dark font-semibold" numberOfLines={1}>
          {item.description}
        </Text>
        <Text className="text-text-muted text-sm mt-0.5">
          {item.status === "paid" && item.paidAt
            ? `Paid ${formatDate(item.paidAt)}`
            : `Due ${formatDate(item.dueDate)}`}
        </Text>
      </View>
      <View className="items-end ml-3">
        <Text className="text-dark font-bold">
          {formatCurrency(item.amount)}
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
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={{ paddingBottom: 8 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <Receipt size={48} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-base mt-4">
              No invoices found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
