import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { mockSubJobs, mockSubBids } from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";

type FilterTab = "active" | "completed" | "all";

function getStatusBadge(status: string): { label: string; variant: "warning" | "success" | "neutral" | "danger" } {
  switch (status) {
    case "in_progress":
      return { label: "In Progress", variant: "warning" };
    case "completed":
      return { label: "Completed", variant: "success" };
    case "cancelled":
      return { label: "Cancelled", variant: "danger" };
    default:
      return { label: status, variant: "neutral" };
  }
}

function daysUntil(deadline: string): number {
  const diff = new Date(deadline).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function MyWorkScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("active");

  // Only show sub jobs the user has accepted bids on, or in_progress/completed
  const mySubJobs = mockSubJobs.filter((sj) => {
    const hasBid = mockSubBids.some((b) => b.subJobId === sj.id && (b.status === "accepted" || b.status === "pending"));
    return hasBid || sj.status === "in_progress" || sj.status === "completed";
  });

  const filtered = mySubJobs.filter((sj) => {
    if (activeTab === "active") return sj.status === "in_progress" || sj.status === "open";
    if (activeTab === "completed") return sj.status === "completed";
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "all", label: "All" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-3">My Work</Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 mb-3" style={{ gap: 8 }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`px-4 py-2 ${activeTab === tab.key ? "bg-dark" : "bg-white border border-border"}`}
            activeOpacity={0.7}
          >
            <Text className={`text-sm font-bold ${activeTab === tab.key ? "text-white" : "text-dark"}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-text-muted text-base">No work found</Text>
          </View>
        ) : (
          <View className="px-4" style={{ gap: 8 }}>
            {filtered.map((sj) => {
              const bid = mockSubBids.find((b) => b.subJobId === sj.id && (b.status === "accepted" || b.status === "pending"));
              const statusBadge = getStatusBadge(sj.status);
              const days = daysUntil(sj.deadline);

              return (
                <View key={sj.id} className="bg-white border border-border p-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-base font-bold text-dark flex-1 mr-2" numberOfLines={1}>{sj.title}</Text>
                    <Badge label={statusBadge.label} variant={statusBadge.variant} square />
                  </View>

                  <Text className="text-sm text-text-secondary mb-1">{sj.contractorName}</Text>
                  <Text className="text-xs text-text-muted mb-2">{sj.projectName} -- {sj.milestoneLabel}</Text>

                  <View className="flex-row items-center justify-between mb-2">
                    {bid && (
                      <Text className="text-lg font-bold text-dark">{formatCurrency(bid.amount)}</Text>
                    )}
                    <View className="flex-row items-center">
                      <Clock size={13} color={days <= 3 ? BRAND.colors.primary : BRAND.colors.textMuted} />
                      <Text className={`text-sm ml-1 font-bold ${days <= 3 ? "text-brand-600" : "text-text-muted"}`}>
                        {formatDate(sj.deadline)}
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar for active jobs */}
                  {sj.status === "in_progress" && (
                    <View className="bg-gray-100 h-2 w-full mt-1">
                      <View className="h-2" style={{ width: "45%", backgroundColor: BRAND.colors.primary }} />
                    </View>
                  )}

                  {/* Payout for completed */}
                  {sj.status === "completed" && bid && (
                    <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
                      <Text className="text-xs text-text-muted">Payout</Text>
                      <Text className="text-base font-bold text-dark">{formatCurrency(Math.round(bid.amount * 0.95))}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
