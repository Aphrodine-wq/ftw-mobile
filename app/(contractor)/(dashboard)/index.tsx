import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Star, ChevronRight, MapPin, Circle, CheckCircle2 } from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import {
  mockJobs,
  mockEstimates,
  contractorStats,
} from "@src/lib/mock-data";
import { fetchEstimates } from "@src/api/data";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { useRouter } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COL_WIDTH = (SCREEN_WIDTH - 36) / 2; // 12px padding each side + 12px gap

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "accepted":
      return { bg: "bg-gray-100", text: "text-dark" };
    case "sent":
      return { bg: "bg-gray-100", text: "text-dark" };
    default:
      return { bg: "bg-gray-100", text: "text-text-secondary" };
  }
}

const MILESTONES = [
  { id: "ms1", task: "Countertops", project: "Kitchen Remodel", client: "Michael Brown", status: "in_progress" as const },
  { id: "ms2", task: "Tile & waterproofing", project: "Bathroom Reno", client: "Sarah Williams", status: "in_progress" as const },
  { id: "ms3", task: "Decking boards", project: "Deck Build", client: "Robert Johnson", status: "in_progress" as const },
  { id: "ms4", task: "Flashings & ridge", project: "Roof Replacement", client: "Patricia Taylor", status: "in_progress" as const },
];

export default function ContractorDashboard() {
  const router = useRouter();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const [estimates, setEstimates] = useState(mockEstimates);
  const [activeJob, setActiveJob] = useState(0);
  const featuredJob = mockJobs[activeJob];

  useEffect(() => {
    fetchEstimates().then(setEstimates);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Date Header */}
      <View className="px-4 pt-3 pb-2">
        <Text className="text-xl font-bold text-dark">{today}</Text>
      </View>

      {/* Two Column Grid — fills remaining space */}
      <View className="flex-1 px-3 pb-2" style={{ flexDirection: "row", gap: 8 }}>
          {/* Left Column */}
          <View style={{ flex: 1 }} className="gap-2">

            {/* Job Marketplace Tile */}
            <View className="bg-white border border-border" style={{ borderRadius: 0 }}>
              <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
                <Text className="text-base font-bold text-dark">Jobs</Text>
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => router.push("/(contractor)/(jobs)" as any)}
                  activeOpacity={0.7}
                >
                  <Text className="text-brand-600 text-xs font-bold mr-0.5">Browse</Text>
                  <ChevronRight size={14} color={BRAND.colors.primary} />
                </TouchableOpacity>
              </View>
              {featuredJob && (
                <TouchableOpacity activeOpacity={0.8} onPress={() => setActiveJob((activeJob + 1) % mockJobs.length)}>
                  <Image
                    source={{ uri: featuredJob.thumbnail }}
                    style={{ width: "100%", height: 140 }}
                    resizeMode="cover"
                  />
                  <View className="px-4 py-3">
                    <Text className="text-sm font-bold text-dark" numberOfLines={1}>{featuredJob.title}</Text>
                    <View className="flex-row items-center mt-1">
                      <MapPin size={11} color={BRAND.colors.textMuted} />
                      <Text className="text-xs text-text-muted ml-1">{featuredJob.location}</Text>
                    </View>
                    <Text className="text-sm font-bold text-dark mt-1">
                      {formatCurrency(featuredJob.budget.min)}–{formatCurrency(featuredJob.budget.max)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Estimate History Tile */}
            <View className="bg-white border border-border flex-1" style={{ borderRadius: 0 }}>
              <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
                <Text className="text-base font-bold text-dark">Estimates</Text>
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => router.push("/(contractor)/estimates" as any)}
                  activeOpacity={0.7}
                >
                  <Text className="text-brand-600 text-xs font-bold mr-0.5">All</Text>
                  <ChevronRight size={14} color={BRAND.colors.primary} />
                </TouchableOpacity>
              </View>
              <View className="px-4 pb-3">
                {estimates.slice(0, 3).map((est, i) => {
                  const statusStyle = getStatusColor(est.status);
                  return (
                    <View
                      key={est.id}
                      className={`flex-row items-center justify-between py-2.5 ${i < 2 ? "border-b border-border" : ""}`}
                    >
                      <View className="flex-1 mr-2">
                        <Text className="text-sm font-bold text-dark" numberOfLines={1}>{est.client}</Text>
                        <Text className="text-xs text-text-muted">{formatCurrency(est.total)}</Text>
                      </View>
                      <View className={`${statusStyle.bg} px-2 py-0.5`} style={{ borderRadius: 0 }}>
                        <Text className={`${statusStyle.text} text-[10px] font-bold capitalize`}>{est.status}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={{ flex: 1 }} className="gap-2">

            {/* Milestones Tile */}
            <View className="bg-white border border-border flex-1" style={{ borderRadius: 0 }}>
              <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
                <Text className="text-base font-bold text-dark">Milestones</Text>
                <View className="bg-gray-100 px-2 py-0.5" style={{ borderRadius: 0 }}>
                  <Text className="text-xs font-bold text-text-secondary">
                    {MILESTONES.filter(m => m.status === "in_progress").length}
                  </Text>
                </View>
              </View>
              <View className="px-4 pb-3">
                {MILESTONES.map((ms, i) => (
                  <View
                    key={ms.id}
                    className={`flex-row items-start py-2.5 ${i < MILESTONES.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <View className="mt-0.5 mr-2.5">
                      {ms.status === "done" ? (
                        <CheckCircle2 size={16} color={BRAND.colors.primary} />
                      ) : (
                        <Circle size={16} color={BRAND.colors.textMuted} />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className={`text-sm font-bold ${ms.status === "done" ? "text-text-muted" : "text-dark"}`} numberOfLines={1}>
                        {ms.task}
                      </Text>
                      <Text className="text-xs text-text-muted mt-0.5">{ms.project} — {ms.client}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Scorecard Tile */}
            <View className="bg-white border border-border p-4" style={{ borderRadius: 0 }}>
              <Text className="text-base font-bold text-dark mb-3">Scorecard</Text>
              <View className="items-center pb-3 border-b border-border">
                <Text className="text-xs text-text-muted">Revenue</Text>
                <Text className="text-2xl font-bold text-dark mt-1">
                  {formatCurrency(contractorStats.monthlyRevenue)}
                </Text>
                <Text className="text-xs text-text-muted mt-2">Rating</Text>
                <Text className="text-2xl font-bold text-dark mt-1">{contractorStats.avgRating}</Text>
              </View>
              <View className="flex-row pt-3">
                <View className="flex-1 items-center">
                  <Text className="text-sm font-bold text-dark">{contractorStats.winRate}%</Text>
                  <Text className="text-[10px] text-text-muted mt-0.5">Win Rate</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-sm font-bold text-dark">{contractorStats.pendingBids}</Text>
                  <Text className="text-[10px] text-text-muted mt-0.5">Pending</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-sm font-bold text-dark">{contractorStats.completedJobs}</Text>
                  <Text className="text-[10px] text-text-muted mt-0.5">Done</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}
