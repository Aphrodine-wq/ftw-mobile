import { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePayouts, useQbStatus } from "@src/api/hooks";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import type { Payout } from "@src/types";

function getStatusConfig(status: Payout["status"]) {
  switch (status) {
    case "completed":
      return { Icon: CheckCircle2, color: "#059669", variant: "success" as const, label: "Completed" };
    case "processing":
      return { Icon: Loader, color: "#D97706", variant: "default" as const, label: "Processing" };
    case "pending":
    case "pending_manual":
      return { Icon: Clock, color: BRAND.colors.textMuted, variant: "neutral" as const, label: "Pending" };
    case "failed":
      return { Icon: AlertTriangle, color: "#DC2626", variant: "danger" as const, label: "Failed" };
  }
}

export default function PayoutsScreen() {
  const router = useRouter();
  const { data: payouts = [], refetch, isRefetching } = usePayouts();
  const { data: qbStatus } = useQbStatus();

  const qbConnected = qbStatus?.connected ?? false;

  const totalEarned = useMemo(
    () => payouts.filter((p: Payout) => p.status === "completed").reduce((sum: number, p: Payout) => sum + p.netAmount, 0),
    [payouts],
  );
  const totalFees = useMemo(
    () => payouts.filter((p: Payout) => p.status === "completed").reduce((sum: number, p: Payout) => sum + p.platformFee, 0),
    [payouts],
  );
  const pendingAmount = useMemo(
    () => payouts.filter((p: Payout) => p.status === "pending" || p.status === "processing").reduce((sum: number, p: Payout) => sum + p.netAmount, 0),
    [payouts],
  );

  const renderHeader = () => (
    <View>
      {/* Title */}
      <View className="px-5 pt-4 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-dark">Payouts</Text>
      </View>

      {/* QB Connection Banner */}
      {!qbConnected && (
        <TouchableOpacity
          onPress={() => router.push("/(contractor)/settings/integrations" as any)}
          className="mx-5 mt-3 bg-yellow-50 border border-yellow-200 p-3 flex-row items-center"
          style={{ borderRadius: 4 }}
          activeOpacity={0.7}
        >
          <AlertTriangle size={16} color="#D97706" />
          <Text className="text-yellow-800 text-sm font-medium ml-2 flex-1">
            Connect QuickBooks to enable automatic payouts.
          </Text>
        </TouchableOpacity>
      )}

      {/* Stats */}
      <View className="flex-row mx-5 mt-4 bg-white border border-border overflow-hidden" style={{ borderRadius: 4 }}>
        <View className="flex-1 items-center py-4 border-r border-border">
          <Text className="text-xl font-bold text-dark">{formatCurrency(totalEarned)}</Text>
          <Text className="text-text-secondary text-sm mt-0.5">Net Earned</Text>
        </View>
        <View className="flex-1 items-center py-4 border-r border-border">
          <Text className="text-xl font-bold text-dark">{formatCurrency(totalFees)}</Text>
          <Text className="text-text-secondary text-sm mt-0.5">Platform Fees</Text>
        </View>
        <View className="flex-1 items-center py-4">
          <Text className="text-xl font-bold text-dark">{formatCurrency(pendingAmount)}</Text>
          <Text className="text-text-secondary text-sm mt-0.5">Pending</Text>
        </View>
      </View>

      {/* Fee notice */}
      <View className="mx-5 mt-3 mb-4 bg-surface p-3" style={{ borderRadius: 4 }}>
        <Text className="text-text-muted text-xs">
          FairTradeWorker charges a 5% platform fee on completed payouts. This covers payment processing, escrow, and dispute resolution.
        </Text>
      </View>
    </View>
  );

  const renderPayout = ({ item }: { item: Payout }) => {
    const config = getStatusConfig(item.status);

    return (
      <View
        className="bg-white border border-border mx-5 mb-3 p-4"
        style={{ borderRadius: 4 }}
      >
        <View className="flex-row items-start">
          <View className="w-10 h-10 bg-gray-100 items-center justify-center mr-3" style={{ borderRadius: 4 }}>
            <DollarSign size={20} color={BRAND.colors.textSecondary} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-dark font-bold text-base">
                {formatCurrency(item.netAmount)}
              </Text>
              <Badge label={config.label} variant={config.variant} />
            </View>
            <Text className="text-text-muted text-xs mt-0.5">
              {item.processedAt ? `Paid ${formatDate(item.processedAt)}` : `Created ${formatDate(item.createdAt)}`}
            </Text>
          </View>
        </View>

        {/* Breakdown */}
        <View className="flex-row mt-3 pt-3 border-t border-border">
          <View className="flex-1">
            <Text className="text-text-muted text-xs">Gross</Text>
            <Text className="text-dark font-semibold text-sm mt-0.5">{formatCurrency(item.amount)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-muted text-xs">Fee (5%)</Text>
            <Text className="text-dark font-semibold text-sm mt-0.5">-{formatCurrency(item.platformFee)}</Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-text-muted text-xs">Net</Text>
            <Text className="text-dark font-bold text-sm mt-0.5">{formatCurrency(item.netAmount)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <FlatList
        data={payouts}
        keyExtractor={(item: Payout) => item.id}
        renderItem={renderPayout}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={{ paddingBottom: 8 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <DollarSign size={48} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-base mt-4">No payouts yet</Text>
            <Text className="text-text-muted text-sm mt-1 text-center">
              Payouts appear here when homeowners pay for completed milestones.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
