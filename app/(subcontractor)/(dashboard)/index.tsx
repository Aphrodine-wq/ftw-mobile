import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  MapPin,
  Star,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  Briefcase,
  FileText,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  mockSubJobs,
  mockSubBids,
  subContractorStats,
} from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 32;

const openSubJobs = mockSubJobs.filter((sj) => sj.status === "open");
const activeSubJobs = mockSubJobs.filter((sj) => sj.status === "in_progress");
const pendingBids = mockSubBids.filter((b) => b.status === "pending");

function daysUntil(deadline: string): number {
  const diff = new Date(deadline).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getUrgencyVariant(urgency: string): "danger" | "warning" | "neutral" {
  if (urgency === "high") return "danger";
  if (urgency === "medium") return "warning";
  return "neutral";
}

function getPaymentPathLabel(path: string): string {
  return path === "contractor_escrow" ? "GC Escrow" : "Pass-through";
}

export default function SubContractorDashboard() {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIdx(idx);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-3 pb-4">
          <Text className="font-bold text-dark" style={{ fontSize: 28 }}>{dateStr}</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row px-4 mb-4" style={{ gap: 8 }}>
          <View className="flex-1 bg-white border border-border rounded p-4">
            <View className="flex-row items-center mb-2">
              <DollarSign size={16} color={BRAND.colors.primary} />
              <Text className="text-xs text-text-muted ml-1 uppercase tracking-wide">Revenue</Text>
            </View>
            <Text className="text-2xl font-bold text-dark">
              {formatCurrency(subContractorStats.monthlyRevenue)}
            </Text>
          </View>
          <View className="flex-1 bg-white border border-border rounded p-4 items-center">
            <View className="flex-row items-center mb-2">
              <Star size={16} color={BRAND.colors.primary} fill={BRAND.colors.primary} />
              <Text className="text-xs text-text-muted ml-1 uppercase tracking-wide">Rating</Text>
            </View>
            <Text className="font-bold text-dark" style={{ fontSize: 36 }}>{subContractorStats.avgRating}</Text>
          </View>
          <View className="flex-1 bg-white border border-border rounded p-4 items-center">
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color={BRAND.colors.primary} />
              <Text className="text-xs text-text-muted ml-1 uppercase tracking-wide">Win Rate</Text>
            </View>
            <Text className="font-bold text-dark" style={{ fontSize: 36 }}>{subContractorStats.winRate}%</Text>
          </View>
        </View>

        {/* Quick Glance */}
        <View className="flex-row px-4 mb-4" style={{ gap: 8 }}>
          <TouchableOpacity
            className="flex-1 bg-white border border-border rounded p-4 flex-row items-center"
            onPress={() => router.push("/(subcontractor)/my-work" as any)}
            activeOpacity={0.7}
          >
            <Briefcase size={20} color={BRAND.colors.primary} />
            <View className="ml-3">
              <Text className="font-bold text-dark" style={{ fontSize: 22 }}>{subContractorStats.activeSubJobs}</Text>
              <Text className="text-xs text-text-muted">Active Sub Jobs</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white border border-border rounded p-4 flex-row items-center"
            onPress={() => router.push("/(subcontractor)/my-work" as any)}
            activeOpacity={0.7}
          >
            <FileText size={20} color={BRAND.colors.primary} />
            <View className="ml-3">
              <Text className="font-bold text-dark" style={{ fontSize: 22 }}>{subContractorStats.pendingBids}</Text>
              <Text className="text-xs text-text-muted">Pending Bids</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Available Sub Jobs Carousel */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between px-4 mb-2">
            <Text className="text-lg font-bold text-dark">Available Sub Jobs</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push("/(subcontractor)/work" as any)}
              activeOpacity={0.7}
            >
              <Text className="text-brand-600 text-sm font-bold mr-0.5">Browse All</Text>
              <ChevronRight size={16} color={BRAND.colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={openSubJobs}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            snapToInterval={CARD_WIDTH + 12}
            decelerationRate="fast"
            renderItem={({ item: sj }) => {
              const days = daysUntil(sj.deadline);
              return (
                <View
                  className="bg-white border border-border rounded overflow-hidden"
                  style={{ width: CARD_WIDTH }}
                >
                  <View className="p-4">
                    {/* Top row: category + urgency */}
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="bg-gray-100 px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-text-secondary uppercase">{sj.category}</Text>
                      </View>
                      {sj.urgency === "high" && (
                        <View className="flex-row items-center">
                          <AlertCircle size={12} color={BRAND.colors.primary} />
                          <Text className="text-[10px] font-bold text-brand-600 ml-1 uppercase">Urgent</Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-base font-bold text-dark mb-1" numberOfLines={1}>{sj.title}</Text>

                    {/* GC + rating */}
                    <View className="flex-row items-center mb-2">
                      <Text className="text-sm text-text-secondary">{sj.contractorName}</Text>
                      <View className="flex-row items-center ml-2">
                        <Star size={12} color={BRAND.colors.primary} fill={BRAND.colors.primary} />
                        <Text className="text-xs text-text-muted ml-0.5">{sj.contractorRating}</Text>
                      </View>
                    </View>

                    {/* Budget */}
                    <Text className="text-lg font-bold text-dark mb-2">
                      {formatCurrency(sj.budgetMin)}-{formatCurrency(sj.budgetMax)}
                    </Text>

                    {/* Skills */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                      <View className="flex-row" style={{ gap: 6 }}>
                        {sj.skills.map((skill) => (
                          <View key={skill} className="bg-gray-100 px-2 py-0.5">
                            <Text className="text-[10px] font-bold text-text-secondary">{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>

                    {/* Bottom row */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <MapPin size={13} color={BRAND.colors.textMuted} />
                        <Text className="text-sm text-text-muted ml-1">{sj.location}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Clock size={13} color={days <= 3 ? BRAND.colors.primary : BRAND.colors.textMuted} />
                        <Text
                          className={`text-sm ml-1 font-bold ${days <= 3 ? "text-brand-600" : "text-text-muted"}`}
                        >
                          {days}d left
                        </Text>
                      </View>
                    </View>

                    {/* Payment path */}
                    <View className="mt-2">
                      <Badge
                        label={getPaymentPathLabel(sj.paymentPath)}
                        variant="neutral"
                        square
                      />
                    </View>
                  </View>
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
          />
          {/* Pagination Dots */}
          <View className="flex-row items-center justify-center mt-3" style={{ gap: 6 }}>
            {openSubJobs.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === activeIdx ? 20 : 6,
                  height: 6,
                  backgroundColor: i === activeIdx ? BRAND.colors.primary : BRAND.colors.border,
                }}
              />
            ))}
          </View>
        </View>

        {/* My Active Work */}
        {activeSubJobs.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center justify-between px-4 mb-2">
              <Text className="text-lg font-bold text-dark">My Active Work</Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push("/(subcontractor)/my-work" as any)}
                activeOpacity={0.7}
              >
                <Text className="text-brand-600 text-sm font-bold mr-0.5">All</Text>
                <ChevronRight size={16} color={BRAND.colors.primary} />
              </TouchableOpacity>
            </View>
            <View className="px-4" style={{ gap: 6 }}>
              {activeSubJobs.map((sj) => {
                const bid = mockSubBids.find((b) => b.subJobId === sj.id && b.status === "accepted");
                return (
                  <View key={sj.id} className="bg-white border border-border rounded p-4">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-base font-bold text-dark flex-1 mr-2" numberOfLines={1}>{sj.title}</Text>
                      <Badge label="In Progress" variant="warning" square />
                    </View>
                    <Text className="text-sm text-text-secondary mb-2">{sj.contractorName} -- {sj.projectName}</Text>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs text-text-muted">{sj.milestoneLabel}</Text>
                      {bid && <Text className="text-base font-bold text-dark">{formatCurrency(bid.amount)}</Text>}
                    </View>
                    {/* Progress bar */}
                    <View className="bg-gray-100 h-2 w-full mt-2">
                      <View className="h-2" style={{ width: "45%", backgroundColor: BRAND.colors.primary }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Pending Bids */}
        {pendingBids.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-lg font-bold text-dark mb-2">Pending Bids</Text>
            <View style={{ gap: 6 }}>
              {pendingBids.map((bid) => {
                const sj = mockSubJobs.find((j) => j.id === bid.subJobId);
                return (
                  <View key={bid.id} className="bg-white border border-border rounded flex-row items-center p-3">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-dark" numberOfLines={1}>{sj?.title || "Sub Job"}</Text>
                      <Text className="text-xs text-text-muted mt-0.5">{sj?.location} -- {bid.timeline}</Text>
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
