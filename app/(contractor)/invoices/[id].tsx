import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Receipt,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  DollarSign,
  RefreshCw,
  ExternalLink,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useInvoice,
  useQbStatus,
  useSyncInvoiceToQb,
  useRecordQbPayment,
  useUpdateInvoice,
} from "@src/api/hooks";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import type { Invoice } from "@src/types";

function getStatusVariant(status: string): "neutral" | "default" | "success" | "danger" {
  switch (status) {
    case "draft": return "neutral";
    case "sent": return "default";
    case "paid": return "success";
    case "overdue": return "danger";
    case "cancelled": return "neutral";
    default: return "neutral";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "paid": return { Icon: CheckCircle2, color: "#059669" };
    case "overdue": return { Icon: AlertTriangle, color: "#DC2626" };
    case "sent": return { Icon: Send, color: BRAND.colors.primary };
    case "draft": return { Icon: Clock, color: BRAND.colors.textMuted };
    default: return { Icon: Receipt, color: BRAND.colors.textMuted };
  }
}

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(id);
  const { data: qbStatus } = useQbStatus();
  const syncToQb = useSyncInvoiceToQb();
  const recordPayment = useRecordQbPayment();
  const updateInvoice = useUpdateInvoice();

  const qbConnected = qbStatus?.connected ?? false;
  const inv = invoice as Invoice | undefined;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={BRAND.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!inv) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-5 pt-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Invoice</Text>
        </View>
        <View className="items-center justify-center flex-1">
          <Receipt size={48} color={BRAND.colors.textMuted} />
          <Text className="text-text-muted text-base mt-4">Invoice not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { Icon: StatusIcon, color: statusColor } = getStatusIcon(inv.status);
  const isSynced = !!inv.qbInvoiceId;
  const canSync = qbConnected && !isSynced && inv.status !== "cancelled";
  const canRecordPayment = qbConnected && isSynced && inv.status !== "paid" && inv.status !== "cancelled";
  const canMarkSent = inv.status === "draft";

  function handleSyncToQb() {
    syncToQb.mutate(inv!.id, {
      onSuccess: () => {
        Alert.alert("Synced", "Invoice synced to QuickBooks successfully.");
      },
      onError: (err) => {
        Alert.alert("Sync Failed", err.message || "Could not sync invoice to QuickBooks.");
      },
    });
  }

  function handleRecordPayment() {
    Alert.alert(
      "Record Payment",
      `Record full payment of ${formatCurrency(inv!.amount)} for this invoice?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Record Payment",
          onPress: () => {
            recordPayment.mutate(
              { invoiceId: inv!.id },
              {
                onSuccess: () => {
                  Alert.alert("Payment Recorded", "Invoice marked as paid in QuickBooks.");
                },
                onError: (err) => {
                  Alert.alert("Error", err.message || "Failed to record payment.");
                },
              },
            );
          },
        },
      ],
    );
  }

  function handleMarkSent() {
    updateInvoice.mutate(
      { id: inv!.id, attrs: { status: "sent" } },
      {
        onSuccess: () => {
          Alert.alert("Invoice Sent", "Invoice status updated to sent.");
        },
        onError: (err) => {
          Alert.alert("Error", err.message || "Failed to update invoice.");
        },
      },
    );
  }

  const anyPending = syncToQb.isPending || recordPayment.isPending || updateInvoice.isPending;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-dark">Invoice</Text>
            {inv.invoiceNumber && (
              <Text className="text-text-muted text-sm">#{inv.invoiceNumber}</Text>
            )}
          </View>
          <Badge label={inv.status.charAt(0).toUpperCase() + inv.status.slice(1)} variant={getStatusVariant(inv.status)} />
        </View>

        {/* Amount Card */}
        <View className="bg-dark mx-5 mt-4 p-5" style={{ borderRadius: 4 }}>
          <Text className="text-white/60 text-xs uppercase tracking-wide mb-1">Total Amount</Text>
          <Text className="text-white text-3xl font-bold">{formatCurrency(inv.amount)}</Text>
          <View className="flex-row items-center mt-3 pt-3 border-t border-white/20">
            <StatusIcon size={16} color={statusColor} />
            <Text className="text-white/80 text-sm ml-2">
              {inv.status === "paid" && inv.paidAt
                ? `Paid on ${formatDate(inv.paidAt)}`
                : `Due ${formatDate(inv.dueDate)}`}
            </Text>
          </View>
        </View>

        {/* Description */}
        {(inv.description || inv.notes) && (
          <View className="bg-white border border-border mx-5 mt-3 p-4" style={{ borderRadius: 4 }}>
            <Text className="text-text-muted text-xs uppercase tracking-wide font-bold mb-1">Description</Text>
            <Text className="text-dark text-sm">{inv.description || inv.notes}</Text>
          </View>
        )}

        {/* QuickBooks Status */}
        <View className="bg-white border border-border mx-5 mt-3 p-4" style={{ borderRadius: 4 }}>
          <View className="flex-row items-center mb-3">
            <BookOpen size={18} color={BRAND.colors.textSecondary} />
            <Text className="text-dark font-bold text-base ml-2">QuickBooks</Text>
          </View>

          {!qbConnected ? (
            <View className="bg-surface p-3" style={{ borderRadius: 4 }}>
              <Text className="text-text-muted text-sm">
                QuickBooks not connected. Connect in Settings to sync invoices and record payments.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(contractor)/settings/integrations" as any)}
                className="flex-row items-center mt-2"
                activeOpacity={0.7}
              >
                <ExternalLink size={14} color={BRAND.colors.primary} />
                <Text className="text-brand-600 font-semibold text-sm ml-1">Connect QuickBooks</Text>
              </TouchableOpacity>
            </View>
          ) : isSynced ? (
            <View>
              <View className="flex-row items-center bg-green-50 p-3" style={{ borderRadius: 4 }}>
                <CheckCircle2 size={16} color="#059669" />
                <Text className="text-green-800 font-semibold text-sm ml-2">Synced to QuickBooks</Text>
              </View>
              <View className="flex-row mt-2" style={{ gap: 12 }}>
                <View className="flex-1">
                  <Text className="text-text-muted text-xs">QB Invoice ID</Text>
                  <Text className="text-dark font-medium text-sm mt-0.5">{inv.qbInvoiceId}</Text>
                </View>
                {inv.qbSyncedAt && (
                  <View className="flex-1">
                    <Text className="text-text-muted text-xs">Synced</Text>
                    <Text className="text-dark font-medium text-sm mt-0.5">{formatDate(inv.qbSyncedAt)}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View className="bg-surface p-3" style={{ borderRadius: 4 }}>
              <Text className="text-text-muted text-sm">Not yet synced to QuickBooks.</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="mx-5 mt-4" style={{ gap: 10 }}>
          {canMarkSent && (
            <TouchableOpacity
              onPress={handleMarkSent}
              className="bg-dark py-3.5 flex-row items-center justify-center"
              style={{ borderRadius: 4 }}
              activeOpacity={0.8}
              disabled={anyPending}
            >
              {updateInvoice.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={16} color="#FFFFFF" />
                  <Text className="text-white font-bold text-sm ml-2">Mark as Sent</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {canSync && (
            <TouchableOpacity
              onPress={handleSyncToQb}
              className="bg-brand-600 py-3.5 flex-row items-center justify-center"
              style={{ borderRadius: 4 }}
              activeOpacity={0.8}
              disabled={anyPending}
            >
              {syncToQb.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <RefreshCw size={16} color="#FFFFFF" />
                  <Text className="text-white font-bold text-sm ml-2">Sync to QuickBooks</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {canRecordPayment && (
            <TouchableOpacity
              onPress={handleRecordPayment}
              className="py-3.5 flex-row items-center justify-center"
              style={{ borderRadius: 4, backgroundColor: "#059669" }}
              activeOpacity={0.8}
              disabled={anyPending}
            >
              {recordPayment.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <DollarSign size={16} color="#FFFFFF" />
                  <Text className="text-white font-bold text-sm ml-2">Record Payment</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {inv.status === "paid" && (
            <View className="bg-green-50 py-3.5 flex-row items-center justify-center" style={{ borderRadius: 4 }}>
              <CheckCircle2 size={16} color="#059669" />
              <Text className="text-green-800 font-bold text-sm ml-2">Paid in Full</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
