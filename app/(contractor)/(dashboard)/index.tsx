import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  MapPin,
  Circle,
  CheckCircle2,
  Users,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import {
  mockJobs,
  mockEstimates,
  mockProjects,
  mockBids,
  contractorStats,
} from "@src/lib/mock-data";
import { fetchEstimates } from "@src/api/data";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { useRouter } from "expo-router";
import type { Project } from "@src/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 32;

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "accepted":
      return { bg: "bg-brand-50", text: "text-brand-600" };
    case "sent":
      return { bg: "bg-gray-100", text: "text-dark" };
    default:
      return { bg: "bg-gray-100", text: "text-text-secondary" };
  }
}

const MILESTONES = [
  { id: "ms1", task: "Countertops", project: "Kitchen Remodel", client: "Michael Brown", due: "Apr 2", status: "in_progress" as const },
  { id: "ms2", task: "Tile & waterproofing", project: "Bathroom Reno", client: "Sarah Williams", due: "Apr 5", status: "in_progress" as const },
  { id: "ms3", task: "Decking boards", project: "Deck Build", client: "Robert Johnson", due: "Apr 8", status: "done" as const },
  { id: "ms4", task: "Flashings & ridge", project: "Roof Replacement", client: "Patricia Taylor", due: "Apr 12", status: "in_progress" as const },
];

const openJobs = mockJobs.filter((j) => j.status === "open" || j.status === "bidding").slice(0, 5);
const activeProjects = (mockProjects as Project[]).filter((p) => p.status === "active");

export default function ContractorDashboard() {
  const router = useRouter();

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const [estimates, setEstimates] = useState(mockEstimates);
  const [activeJobIdx, setActiveJobIdx] = useState(0);

  useEffect(() => {
    fetchEstimates().then(setEstimates);
  }, []);

  const onJobScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveJobIdx(idx);
  };

  const pendingBids = mockBids.filter((b) => b.status === "pending");

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-3 pb-4">
          <Text className="font-bold text-dark" style={{ fontSize: 28 }}>{dateStr}</Text>
        </View>

        {/* Job Feed — Horizontal Carousel */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between px-4 mb-2">
            <Text className="text-lg font-bold text-dark">New Jobs</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push("/(contractor)/(jobs)" as any)}
              activeOpacity={0.7}
            >
              <Text className="text-brand-600 text-sm font-bold mr-0.5">Browse All</Text>
              <ChevronRight size={16} color={BRAND.colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={openJobs}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onJobScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            snapToInterval={CARD_WIDTH + 12}
            decelerationRate="fast"
            renderItem={({ item: job }) => (
              <View
                className="bg-white border border-border rounded overflow-hidden"
                style={{ width: CARD_WIDTH }}
              >
                <Image
                  source={{ uri: job.thumbnail }}
                  style={{ width: "100%", height: 160 }}
                  resizeMode="cover"
                />
                {job.urgency === "high" && (
                  <View className="absolute top-3 left-3 bg-white border border-border rounded flex-row items-center px-2 py-1">
                    <AlertCircle size={12} color={BRAND.colors.primary} />
                    <Text className="text-[10px] font-bold text-brand-600 ml-1 uppercase">Urgent</Text>
                  </View>
                )}
                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="bg-gray-100 px-2 py-0.5">
                      <Text className="text-[10px] font-bold text-text-secondary uppercase">
                        {job.category}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Users size={12} color={BRAND.colors.textMuted} />
                      <Text className="text-xs text-text-muted ml-1">{job.bidCount} bids</Text>
                    </View>
                  </View>
                  <Text className="text-base font-bold text-dark mt-1" numberOfLines={1}>
                    {job.title}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <MapPin size={13} color={BRAND.colors.textMuted} />
                    <Text className="text-sm text-text-muted ml-1">{job.location}</Text>
                  </View>
                  <Text className="text-lg font-bold text-dark mt-2">
                    {formatCurrency(job.budget.min)}–{formatCurrency(job.budget.max)}
                  </Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
          {/* Pagination Dots */}
          <View className="flex-row items-center justify-center mt-3" style={{ gap: 6 }}>
            {openJobs.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === activeJobIdx ? 20 : 6,
                  height: 6,
                  backgroundColor: i === activeJobIdx ? BRAND.colors.primary : BRAND.colors.border,
                }}
              />
            ))}
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row px-4 mb-4" style={{ gap: 8 }}>
          <View className="flex-1 bg-white border border-border rounded p-4">
            <View className="flex-row items-center mb-2">
              <DollarSign size={16} color={BRAND.colors.primary} />
              <Text className="text-xs text-text-muted ml-1 uppercase tracking-wide">Revenue</Text>
            </View>
            <Text className="text-2xl font-bold text-dark">
              {formatCurrency(contractorStats.monthlyRevenue)}
            </Text>
          </View>
          <View className="flex-1 bg-white border border-border rounded p-4 items-center">
            <View className="flex-row items-center mb-2">
              <Star size={16} color={BRAND.colors.primary} fill={BRAND.colors.primary} />
              <Text className="text-xs text-text-muted ml-1 uppercase tracking-wide">Rating</Text>
            </View>
            <Text className="font-bold text-dark" style={{ fontSize: 36 }}>{contractorStats.avgRating}</Text>
          </View>
          <View className="flex-1 bg-white border border-border rounded p-4 items-center">
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color={BRAND.colors.primary} />
              <Text className="text-xs text-text-muted ml-1 uppercase tracking-wide">Win Rate</Text>
            </View>
            <Text className="font-bold text-dark" style={{ fontSize: 36 }}>{contractorStats.winRate}%</Text>
          </View>
        </View>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center justify-between px-4 mb-2">
              <Text className="text-lg font-bold text-dark">Active Projects</Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push("/(contractor)/projects" as any)}
                activeOpacity={0.7}
              >
                <Text className="text-brand-600 text-sm font-bold mr-0.5">All</Text>
                <ChevronRight size={16} color={BRAND.colors.primary} />
              </TouchableOpacity>
            </View>
            <View className="px-4" style={{ gap: 8 }}>
              {activeProjects.map((proj) => {
                const pct = Math.round((proj.spent / proj.budget) * 100);
                return (
                  <TouchableOpacity
                    key={proj.id}
                    className="bg-white border border-border rounded p-4"
                    activeOpacity={0.7}
                    onPress={() => router.push(`/(contractor)/projects/${proj.id}` as any)}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-base font-bold text-dark flex-1 mr-2" numberOfLines={1}>
                        {proj.name}
                      </Text>
                      <Text className="text-sm text-text-muted">{pct}%</Text>
                    </View>
                    <View className="bg-gray-100 h-2 w-full mb-2">
                      <View
                        className="h-2"
                        style={{ width: `${pct}%`, backgroundColor: BRAND.colors.primary }}
                      />
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-text-muted">{proj.homeownerName}</Text>
                      <Text className="text-xs font-bold text-dark">
                        {formatCurrency(proj.spent)} / {formatCurrency(proj.budget)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Milestones */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between px-4 mb-2">
            <Text className="text-lg font-bold text-dark">Milestones</Text>
            <View className="bg-gray-100 px-2 py-0.5">
              <Text className="text-sm font-bold text-text-secondary">
                {MILESTONES.filter((m) => m.status === "in_progress").length} active
              </Text>
            </View>
          </View>
          <View className="px-4" style={{ gap: 6 }}>
            {MILESTONES.map((ms) => (
              <View key={ms.id} className="bg-white border border-border rounded flex-row items-center px-3 py-3">
                <View className="mr-3">
                  {ms.status === "done" ? (
                    <CheckCircle2 size={20} color={BRAND.colors.primary} />
                  ) : (
                    <Circle size={20} color={BRAND.colors.textMuted} />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm font-bold ${ms.status === "done" ? "text-text-muted line-through" : "text-dark"}`}
                    numberOfLines={1}
                  >
                    {ms.task}
                  </Text>
                  <Text className="text-xs text-text-muted">{ms.project} — {ms.client}</Text>
                </View>
                <View className="items-end ml-2">
                  <Text className={`text-xs font-bold ${ms.status === "done" ? "text-text-muted" : "text-brand-600"}`}>
                    {ms.status === "done" ? "Done" : ms.due}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Estimates + Quick Stats Row */}
        <View className="px-4 mb-4" style={{ flexDirection: "row", gap: 8 }}>
          {/* Estimates */}
          <View className="flex-1 bg-white border border-border rounded">
            <View className="flex-row items-center justify-between px-3 pt-3 pb-1">
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
            <View className="px-3 pb-3">
              {estimates.slice(0, 4).map((est, i) => {
                const statusStyle = getStatusColor(est.status);
                return (
                  <View
                    key={est.id}
                    className={`flex-row items-center justify-between py-2.5 ${i < 3 ? "border-b border-border" : ""}`}
                  >
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-bold text-dark" numberOfLines={1}>{est.client}</Text>
                      <Text className="text-xs text-text-muted">{formatCurrency(est.total)}</Text>
                    </View>
                    <View className={`${statusStyle.bg} px-2 py-0.5`}>
                      <Text className={`${statusStyle.text} text-[10px] font-bold capitalize`}>{est.status}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quick Stats */}
          <View className="bg-white border border-border rounded" style={{ width: 130 }}>
            <View className="px-3 pt-3 pb-2">
              <Text className="text-base font-bold text-dark">Quick Stats</Text>
            </View>
            <View className="flex-1 px-3 pb-3 justify-evenly">
              <View className="items-center py-2 border-b border-border">
                <Text className="font-bold text-dark" style={{ fontSize: 22 }}>{contractorStats.activeJobs}</Text>
                <Text className="text-[10px] text-text-muted mt-0.5">Active Jobs</Text>
              </View>
              <View className="items-center py-2 border-b border-border">
                <Text className="font-bold text-dark" style={{ fontSize: 22 }}>{contractorStats.pendingBids}</Text>
                <Text className="text-[10px] text-text-muted mt-0.5">Pending Bids</Text>
              </View>
              <View className="items-center py-2">
                <Text className="font-bold text-dark" style={{ fontSize: 22 }}>{contractorStats.completedJobs}</Text>
                <Text className="text-[10px] text-text-muted mt-0.5">Jobs Done</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pending Bids */}
        {pendingBids.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-lg font-bold text-dark mb-2">Pending Bids</Text>
            <View style={{ gap: 6 }}>
              {pendingBids.slice(0, 3).map((bid) => {
                const job = mockJobs.find((j) => j.id === bid.jobId);
                return (
                  <View key={bid.id} className="bg-white border border-border rounded flex-row items-center p-3">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-dark" numberOfLines={1}>{job?.title || "Job"}</Text>
                      <Text className="text-xs text-text-muted mt-0.5">{job?.location} — {bid.timeline}</Text>
                    </View>
                    <View className="items-end ml-2">
                      <Text className="text-base font-bold text-dark">{formatCurrency(bid.amount)}</Text>
                      <View className="bg-gray-100 px-2 py-0.5 mt-0.5">
                        <Text className="text-[10px] font-bold text-text-secondary capitalize">{bid.status}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
