import { useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
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
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 32;

// Pre-computed at module level
const openSubJobs = mockSubJobs.filter((sj) => sj.status === "open");
const activeSubJobs = mockSubJobs.filter((sj) => sj.status === "in_progress");
const pendingBids = mockSubBids.filter((b) => b.status === "pending");
const subJobMap = new Map(mockSubJobs.map((sj) => [sj.id, sj]));
const acceptedBidMap = new Map(
  mockSubBids.filter((b) => b.status === "accepted").map((b) => [b.subJobId, b])
);

function daysUntil(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getPaymentPathLabel(path: string): string {
  return path === "contractor_escrow" ? "GC Escrow" : "Pass-through";
}

const SUB_JOB_ITEM_LAYOUT = (_data: any, index: number) => ({
  length: CARD_WIDTH + 12,
  offset: (CARD_WIDTH + 12) * index,
  index,
});

const SubJobSeparator = memo(() => <View style={{ width: 12 }} />);

const SubJobCard = memo(function SubJobCard({ sj }: { sj: typeof openSubJobs[0] }) {
  const days = daysUntil(sj.deadline);
  return (
    <View className="bg-white border border-border rounded overflow-hidden" style={{ width: CARD_WIDTH }}>
      <View className="p-4">
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

        <View className="flex-row items-center mb-2">
          <Text className="text-sm text-text-secondary">{sj.contractorName}</Text>
          <View className="flex-row items-center ml-2">
            <Star size={12} color={BRAND.colors.primary} fill={BRAND.colors.primary} />
            <Text className="text-xs text-text-muted ml-0.5">{sj.contractorRating}</Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-dark mb-2">
          {formatCurrency(sj.budgetMin)}-{formatCurrency(sj.budgetMax)}
        </Text>

        {/* Skills — plain View instead of ScrollView to avoid FlatList nesting */}
        <View className="flex-row flex-wrap mb-2" style={{ gap: 6 }}>
          {sj.skills.map((skill) => (
            <View key={skill} className="bg-gray-100 px-2 py-0.5">
              <Text className="text-[10px] font-bold text-text-secondary">{skill}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MapPin size={13} color={BRAND.colors.textMuted} />
            <Text className="text-sm text-text-muted ml-1">{sj.location}</Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={13} color={days <= 3 ? BRAND.colors.primary : BRAND.colors.textMuted} />
            <Text className={`text-sm ml-1 font-bold ${days <= 3 ? "text-brand-600" : "text-text-muted"}`}>
              {days}d left
            </Text>
          </View>
        </View>

        <View className="mt-2">
          <Badge label={getPaymentPathLabel(sj.paymentPath)} variant="neutral" square />
        </View>
      </View>
    </View>
  );
});

export default function SubContractorDashboard() {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 200);
  }, []);

  const dateStr = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIdx(idx);
  }, []);

  // Memoized nav handlers
  const goMyWork = useCallback(() => router.navigate("/(subcontractor)/my-work" as any), [router]);
  const goBrowse = useCallback(() => router.navigate("/(subcontractor)/work" as any), [router]);

  const renderSubJobCard = useCallback(({ item }: { item: typeof openSubJobs[0] }) => (
    <SubJobCard sj={item} />
  ), []);

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C41E3A" />
        }
      >
        {/* Header */}
        <View className="px-4 pt-3 pb-4">
          <Text className="font-bold text-dark" style={{ fontSize: 29 }}>{dateStr}</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row px-4 mb-4" style={{ gap: 8 }}>
          <View className="flex-1 bg-white border border-border rounded p-4">
            <View className="flex-row items-center mb-2">
              <DollarSign size={16} color={BRAND.colors.primary} />
              <Text className="text-xs text-text-muted ml-1 uppercase tracking-wide">Revenue</Text>
            </View>
            <Text className="text-2xl font-bold text-dark">{formatCurrency(subContractorStats.monthlyRevenue)}</Text>
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
          <TouchableOpacity className="flex-1 bg-white border border-border rounded p-4 flex-row items-center" onPress={goMyWork} activeOpacity={0.7}>
            <Briefcase size={20} color={BRAND.colors.primary} />
            <View className="ml-3">
              <Text className="font-bold text-dark" style={{ fontSize: 22 }}>{subContractorStats.activeSubJobs}</Text>
              <Text className="text-xs text-text-muted">Active Sub Jobs</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white border border-border rounded p-4 flex-row items-center" onPress={goMyWork} activeOpacity={0.7}>
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
            <Text className="font-bold text-dark" style={{ fontSize: 19 }}>Available Sub Jobs</Text>
            <TouchableOpacity className="flex-row items-center" onPress={goBrowse} activeOpacity={0.7}>
              <Text className="text-brand-600 text-sm font-bold mr-0.5">Browse All</Text>
              <ChevronRight size={16} color={BRAND.colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={openSubJobs}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={32}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={SubJobSeparator}
            snapToInterval={CARD_WIDTH + 12}
            decelerationRate="fast"
            removeClippedSubviews
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            getItemLayout={SUB_JOB_ITEM_LAYOUT}
            renderItem={renderSubJobCard}
            keyExtractor={keyExtractor}
          />
          <View className="flex-row items-center justify-center mt-3" style={{ gap: 6 }}>
            {openSubJobs.map((sj, i) => (
              <View
                key={sj.id}
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
              <Text className="font-bold text-dark" style={{ fontSize: 19 }}>My Active Work</Text>
              <TouchableOpacity className="flex-row items-center" onPress={goMyWork} activeOpacity={0.7}>
                <Text className="text-brand-600 text-sm font-bold mr-0.5">All</Text>
                <ChevronRight size={16} color={BRAND.colors.primary} />
              </TouchableOpacity>
            </View>
            <View className="px-4" style={{ gap: 6 }}>
              {activeSubJobs.map((sj) => {
                const bid = acceptedBidMap.get(sj.id);
                return (
                  <TouchableOpacity key={sj.id} className="bg-white border border-border rounded p-4" activeOpacity={0.7} onPress={goMyWork}>
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-base font-bold text-dark flex-1 mr-2" numberOfLines={1}>{sj.title}</Text>
                      <Badge label="In Progress" variant="warning" square />
                    </View>
                    <Text className="text-sm text-text-secondary mb-2">{sj.contractorName} -- {sj.projectName}</Text>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs text-text-muted">{sj.milestoneLabel}</Text>
                      {bid && <Text className="text-base font-bold text-dark">{formatCurrency(bid.amount)}</Text>}
                    </View>
                    <View className="bg-gray-100 h-2 w-full mt-2">
                      <View className="h-2" style={{ width: "45%", backgroundColor: BRAND.colors.primary }} />
                    </View>
                  </TouchableOpacity>
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
                const sj = subJobMap.get(bid.subJobId);
                return (
                  <TouchableOpacity key={bid.id} className="bg-white border border-border rounded flex-row items-center p-3" activeOpacity={0.7} onPress={goMyWork}>
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
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
