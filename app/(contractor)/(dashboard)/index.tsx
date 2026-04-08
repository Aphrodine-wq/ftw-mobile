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
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  MapPin,
  Circle,
  CheckCircle2,
  Users,
  User,
  Star,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Briefcase,
  Calculator,
  Phone,
  FileText,
  Bell,
  MessageCircle,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import { useAppearanceStore } from "@src/stores/appearance";
import { useJobs, useEstimates, useProjects, contractorStats } from "@src/api/hooks";
import { mockBids } from "@src/lib/mock-data";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { useRouter } from "expo-router";
import type { Project } from "@src/types";
import { JobsComingIllustration } from "@src/components/domain/jobs-coming-illustration";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 32;

// Pre-computed constants — never recreated
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  accepted: { bg: "bg-brand-50", text: "text-brand-600" },
  sent: { bg: "bg-gray-100", text: "text-dark" },
  draft: { bg: "bg-gray-100", text: "text-text-secondary" },
};
const DEFAULT_STATUS_COLOR = { bg: "bg-gray-100", text: "text-text-secondary" };

const MILESTONES = [
  { id: "ms1", task: "Countertops", project: "Kitchen Remodel", client: "Michael Brown", due: "Apr 2", amount: 9625, status: "in_progress" as const },
  { id: "ms2", task: "Tile & waterproofing", project: "Bathroom Reno", client: "Sarah Williams", due: "Apr 5", amount: 6800, status: "in_progress" as const },
  { id: "ms3", task: "Decking boards", project: "Deck Build", client: "Robert Johnson", due: "Apr 8", amount: 4200, status: "done" as const },
  { id: "ms4", task: "Flashings & ridge", project: "Roof Replacement", client: "Patricia Taylor", due: "Apr 12", amount: 8500, status: "in_progress" as const },
];
const ACTIVE_MILESTONE_COUNT = MILESTONES.filter((m) => m.status === "in_progress").length;

// Static data that doesn't come from the server yet
const pendingBids = mockBids.filter((b) => b.status === "pending");

const JOB_ITEM_LAYOUT = (_data: any, index: number) => ({
  length: CARD_WIDTH + 12,
  offset: (CARD_WIDTH + 12) * index,
  index,
});

// Memoized subcomponents
const JobCardSeparator = memo(() => <View style={{ width: 12 }} />);

const JobCard = memo(function JobCard({ job, onPress }: { job: any; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="bg-white border border-border rounded overflow-hidden"
      style={{ width: CARD_WIDTH }}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image
        source={{ uri: job.thumbnail }}
        style={{ width: "100%", height: 150 }}
        contentFit="cover"
        recyclingKey={job.id}
        transition={200}
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
            <Text className="text-[11px] font-bold text-text-secondary uppercase">{job.category}</Text>
          </View>
          <View className="flex-row items-center">
            <Users size={13} color={BRAND.colors.textSecondary} />
            <Text className="text-sm text-text-secondary ml-1">{job.bidCount} bids</Text>
          </View>
        </View>
        <Text className="font-bold text-dark mt-1" style={{ fontSize: 17 }} numberOfLines={1}>{job.title}</Text>
        <View className="flex-row items-center mt-1">
          <MapPin size={14} color={BRAND.colors.textSecondary} />
          <Text className="text-sm text-text-secondary ml-1">{job.location}</Text>
        </View>
        <Text className="font-bold text-dark mt-2" style={{ fontSize: 20 }}>
          {formatCurrency(job.budget.min)}–{formatCurrency(job.budget.max)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default function ContractorDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fs = useAppearanceStore((s) => s.scale);
  const displayName = user?.name || "Contractor";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const { data: allJobs, refetch: refetchJobs } = useJobs();
  const { data: estimates } = useEstimates();
  const { data: allProjects, refetch: refetchProjects } = useProjects();

  // Derived data — memoized, recomputes only when source data changes
  const openJobs = useMemo(() => (allJobs || []).filter((j: any) => j.status === "open" || j.status === "bidding").slice(0, 5), [allJobs]);
  const activeProjects = useMemo(() => ((allProjects || []) as Project[]).filter((p) => p.status === "active"), [allProjects]);
  const jobMap = useMemo(() => new Map((allJobs || []).map((j: any) => [j.id, j])), [allJobs]);

  const dateStr = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }, []);

  const [activeJobIdx, setActiveJobIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refetchJobs(), refetchProjects()]).finally(() => setRefreshing(false));
  }, [refetchJobs, refetchProjects]);

  const onJobScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveJobIdx(idx);
  }, []);

  // Memoized navigation handlers
  const goJobs = useCallback(() => router.navigate("/(contractor)/(jobs)" as any), [router]);
  const goProjects = useCallback(() => router.navigate("/(contractor)/projects" as any), [router]);
  const goEstimates = useCallback(() => router.navigate("/(contractor)/estimates" as any), [router]);
  const goInvoices = useCallback(() => router.navigate("/(contractor)/invoices" as any), [router]);
  const goReviews = useCallback(() => router.navigate("/(contractor)/reviews" as any), [router]);
  const goMilestones = useCallback(() => router.navigate("/(contractor)/milestones" as any), [router]);
  const goProfile = useCallback(() => router.navigate("/(contractor)/(profile)" as any), [router]);
  const goCalculator = useCallback(() => router.push("/(contractor)/calculator" as any), [router]);
  const goVoiceAgent = useCallback(() => router.push("/(contractor)/voice-agent" as any), [router]);

  const renderJobCard = useCallback(({ item: job }: { item: any }) => (
    <JobCard job={job} onPress={() => router.push(`/(contractor)/(jobs)?jobId=${job.id}` as any)} />
  ), [router]);

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.colors.primary} />
        }
      >
        {/* Header */}
        <View className="px-4 pt-3 pb-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-dark" style={{ fontSize: 32 }}>FairTradeWorker</Text>
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={() => router.push("/(contractor)/notifications" as any)}
                className="bg-surface w-11 h-11 items-center justify-center"
                activeOpacity={0.7}
              >
                <Bell size={22} color={BRAND.colors.dark} />
                <View className="absolute" style={{ top: -2, right: -2, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.colors.primary }}>
                  <Text className="text-white" style={{ fontSize: 10, fontWeight: "800" }}>5</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(contractor)/(messages)" as any)}
                className="bg-surface w-11 h-11 items-center justify-center"
                activeOpacity={0.7}
              >
                <MessageCircle size={22} color={BRAND.colors.dark} />
                <View className="absolute" style={{ top: -2, right: -2, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.colors.primary }}>
                  <Text className="text-white" style={{ fontSize: 10, fontWeight: "800" }}>3</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(contractor)/help" as any)}
            className="self-start px-3 py-1.5 mt-2"
            style={{ borderRadius: 4, backgroundColor: BRAND.colors.primaryLight }}
            activeOpacity={0.7}
          >
            <Text className="font-bold" style={{ fontSize: 12, color: BRAND.colors.primary }}>How It Works</Text>
          </TouchableOpacity>
        </View>

        {/* Contractor Profile */}
        <TouchableOpacity className="mx-4 mb-4 bg-white border border-border rounded p-4" activeOpacity={0.7} onPress={goProfile}>
          <View className="items-center mb-3">
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" }}
              style={{ width: 64, height: 64, borderRadius: 32 }}
              contentFit="cover"
              recyclingKey="profile-avatar"
              transition={150}
            />
            <Text className="font-bold text-dark" style={{ fontSize: fs(17) }}>{displayName}</Text>
          </View>
          <View className="flex-row" style={{ gap: 8 }}>
            <TouchableOpacity className="flex-1 bg-surface p-3 items-center" activeOpacity={0.7} onPress={goInvoices}>
              <DollarSign size={16} color={BRAND.colors.primary} />
              <Text className="font-bold text-dark mt-1" style={{ fontSize: fs(17) }}>{formatCurrency(contractorStats.monthlyRevenue)}</Text>
              <Text className="text-text-secondary uppercase tracking-wide mt-0.5" style={{ fontSize: fs(10) }}>Revenue</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-surface p-3 items-center" activeOpacity={0.7} onPress={goReviews}>
              <Star size={16} color={BRAND.colors.primary} fill={BRAND.colors.primary} />
              <Text className="font-bold text-dark mt-1" style={{ fontSize: fs(17) }}>{contractorStats.avgRating}</Text>
              <Text className="text-text-secondary uppercase tracking-wide mt-0.5" style={{ fontSize: fs(10) }}>Rating</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-surface p-3 items-center" activeOpacity={0.7} onPress={goJobs}>
              <Briefcase size={16} color={BRAND.colors.primary} />
              <Text className="font-bold text-dark mt-1" style={{ fontSize: fs(17) }}>{contractorStats.completedJobs}</Text>
              <Text className="text-text-secondary uppercase tracking-wide mt-0.5" style={{ fontSize: fs(10) }}>Jobs Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Pro Tools */}
        <View className="flex-row px-4 mb-4" style={{ gap: 8 }}>
          <TouchableOpacity
            className="flex-1 bg-white border border-border rounded p-3 flex-row items-center"
            activeOpacity={0.7}
            onPress={goEstimates}
          >
            <View className="w-8 h-8 items-center justify-center mr-2" style={{ backgroundColor: BRAND.colors.primaryLight }}>
              <FileText size={16} color={BRAND.colors.primary} />
            </View>
            <Text className="font-bold text-dark" style={{ fontSize: 13 }}>New Estimate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white border border-border rounded p-3 flex-row items-center"
            activeOpacity={0.7}
            onPress={goVoiceAgent}
          >
            <View className="w-8 h-8 items-center justify-center mr-2" style={{ backgroundColor: BRAND.colors.primaryLight }}>
              <Phone size={16} color={BRAND.colors.primary} />
            </View>
            <Text className="font-bold text-dark flex-1" style={{ fontSize: 13 }}>Call Agent</Text>
            <View className="px-1.5 py-0.5" style={{ backgroundColor: BRAND.colors.primary }}>
              <Text className="text-white font-bold" style={{ fontSize: 7 }}>PRO</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Job Feed — Referral CTA */}
        <View className="mx-4 mb-4 bg-white border border-border rounded overflow-hidden">
          <View className="p-4 pb-3 flex-row items-start">
            <View className="flex-1 mr-3">
              <View className="self-start px-2.5 py-1 rounded mb-2" style={{ backgroundColor: BRAND.colors.primaryLight }}>
                <Text className="font-bold" style={{ fontSize: 11, letterSpacing: 1, color: BRAND.colors.primary }}>COMING SOON</Text>
              </View>
              <Text className="text-dark font-bold" style={{ fontSize: 20 }}>Jobs Are Headed Your Way</Text>
              <Text className="text-text-secondary mt-1.5" style={{ fontSize: 13, lineHeight: 19 }}>
                Spread the word. The more people sign up in your area, the faster work starts showing up for everyone.
              </Text>
            </View>
            <JobsComingIllustration size={110} />
          </View>
          <View className="px-4 pb-3" style={{ gap: 10 }}>
            <View>
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-dark font-bold" style={{ fontSize: 13 }}>Contractors</Text>
                <Text className="text-text-secondary font-bold" style={{ fontSize: 13 }}>3 / 50</Text>
              </View>
              <View className="bg-surface h-2.5 w-full" style={{ borderRadius: 99 }}>
                <View className="h-2.5" style={{ width: "6%", borderRadius: 99, backgroundColor: BRAND.colors.primary }} />
              </View>
            </View>
            <View>
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-dark font-bold" style={{ fontSize: 13 }}>Subcontractors</Text>
                <Text className="text-text-secondary font-bold" style={{ fontSize: 13 }}>5 / 150</Text>
              </View>
              <View className="bg-surface h-2.5 w-full" style={{ borderRadius: 99 }}>
                <View className="h-2.5" style={{ width: "3%", borderRadius: 99, backgroundColor: BRAND.colors.primary }} />
              </View>
            </View>
          </View>
          <View className="px-4 pb-4 flex-row" style={{ gap: 8 }}>
            <TouchableOpacity className="flex-1 py-3 items-center rounded" style={{ backgroundColor: BRAND.colors.primary }} activeOpacity={0.8} onPress={() => router.push("/(contractor)/referrals" as any)}>
              <Text className="text-white font-bold" style={{ fontSize: 14 }}>Invite People</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-surface py-3 items-center rounded" activeOpacity={0.7} onPress={() => router.push("/(contractor)/referrals" as any)}>
              <Text className="text-dark font-bold" style={{ fontSize: 14 }}>Share Link</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center justify-between px-4 mb-3">
              <Text className="font-bold text-dark" style={{ fontSize: fs(21) }}>Active Projects</Text>
              <TouchableOpacity className="flex-row items-center" onPress={goProjects} activeOpacity={0.7}>
                <Text className="text-sm font-bold mr-0.5" style={{ color: BRAND.colors.primary }}>All</Text>
                <ChevronRight size={16} color={BRAND.colors.primary} />
              </TouchableOpacity>
            </View>
            <View className="px-4" style={{ gap: 10 }}>
              {activeProjects.map((proj) => {
                const pct = Math.round((proj.spent / proj.budget) * 100);
                return (
                  <TouchableOpacity
                    key={proj.id}
                    className="bg-white border border-border rounded overflow-hidden"
                    activeOpacity={0.7}
                    onPress={() => router.push(`/(contractor)/projects/${proj.id}` as any)}
                  >
                    <View className="flex-row">
                      <Image
                        source={{ uri: proj.thumbnail }}
                        style={{ width: 100, height: 100 }}
                        contentFit="cover"
                        recyclingKey={`proj-${proj.id}`}
                        transition={200}
                      />
                      <View className="flex-1 p-4">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="font-bold text-dark flex-1 mr-2" style={{ fontSize: 16 }} numberOfLines={1}>{proj.name}</Text>
                          <Text className="font-bold text-text-secondary" style={{ fontSize: 14 }}>{pct}%</Text>
                        </View>
                        <Text className="text-text-secondary mb-2" style={{ fontSize: 13 }}>{proj.homeownerName}</Text>
                        <View className="bg-gray-100 h-2 w-full mb-1.5" style={{ borderRadius: 99 }}>
                          <View className="h-2" style={{ width: `${pct}%`, backgroundColor: BRAND.colors.primary, borderRadius: 99 }} />
                        </View>
                        <Text className="text-xs font-bold text-dark">{formatCurrency(proj.spent)} / {formatCurrency(proj.budget)}</Text>
                      </View>
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
            <Text className="font-bold text-dark" style={{ fontSize: fs(19) }}>Upcoming Milestones</Text>
            <View className="bg-gray-100 px-2 py-0.5">
              <Text className="text-sm font-bold text-text-secondary">{ACTIVE_MILESTONE_COUNT} active</Text>
            </View>
          </View>
          <View className="px-4" style={{ gap: 6 }}>
            {MILESTONES.map((ms) => (
              <TouchableOpacity key={ms.id} className="bg-white border border-border rounded flex-row items-center px-3 py-3" activeOpacity={0.7} onPress={goMilestones}>
                <View className="mr-3">
                  {ms.status === "done" ? (
                    <CheckCircle2 size={20} color={BRAND.colors.primary} />
                  ) : (
                    <Circle size={20} color={BRAND.colors.textSecondary} />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${ms.status === "done" ? "text-text-secondary line-through" : "text-dark"}`} numberOfLines={1}>{ms.task}</Text>
                  <Text className="text-xs text-text-secondary">{ms.project} — {ms.client}</Text>
                </View>
                <View className="items-end ml-2">
                  <Text className={`font-bold ${ms.status === "done" ? "text-text-secondary" : "text-dark"}`} style={{ fontSize: 14 }}>{formatCurrency(ms.amount)}</Text>
                  <Text className={`${ms.status === "done" ? "text-text-secondary" : "text-brand-600"} font-bold mt-0.5`} style={{ fontSize: 13 }}>{ms.status === "done" ? "Paid" : ms.due}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estimates + Quick Stats */}
        <View className="px-4 mb-4" style={{ flexDirection: "row", gap: 8 }}>
          <View className="flex-1 bg-white border border-border rounded">
            <View className="flex-row items-center justify-between px-3 pt-3 pb-1">
              <Text className="text-base font-bold text-dark">Estimates</Text>
              <TouchableOpacity className="flex-row items-center" onPress={goEstimates} activeOpacity={0.7}>
                <Text className="text-xs font-bold mr-0.5" style={{ color: BRAND.colors.primary }}>All</Text>
                <ChevronRight size={14} color={BRAND.colors.primary} />
              </TouchableOpacity>
            </View>
            <View className="px-3 pb-3">
              {estimates.slice(0, 4).map((est, i) => {
                const statusStyle = STATUS_COLORS[est.status] || DEFAULT_STATUS_COLOR;
                return (
                  <TouchableOpacity
                    key={est.id}
                    className={`flex-row items-center justify-between py-2.5 ${i < 3 ? "border-b border-border" : ""}`}
                    activeOpacity={0.7}
                    onPress={goEstimates}
                  >
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-bold text-dark" numberOfLines={1}>{est.client}</Text>
                      <Text className="text-xs text-text-secondary">{formatCurrency(est.total)}</Text>
                    </View>
                    <View className={`${statusStyle.bg} px-2 py-0.5`}>
                      <Text className={`${statusStyle.text} text-[10px] font-bold capitalize`}>{est.status}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="bg-white border border-border rounded" style={{ width: 130 }}>
            <View className="px-3 pt-3 pb-2">
              <Text className="text-base font-bold text-dark">Quick Stats</Text>
            </View>
            <View className="flex-1 px-3 pb-3 justify-evenly">
              <TouchableOpacity className="items-center py-2 border-b border-border" activeOpacity={0.7} onPress={goJobs}>
                <Text className="font-bold text-dark" style={{ fontSize: 22 }}>{contractorStats.activeJobs}</Text>
                <Text className="text-[10px] text-text-secondary mt-0.5">Active Jobs</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center py-2 border-b border-border" activeOpacity={0.7} onPress={goJobs}>
                <Text className="font-bold text-dark" style={{ fontSize: 22 }}>{contractorStats.pendingBids}</Text>
                <Text className="text-[10px] text-text-secondary mt-0.5">Pending Bids</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center py-2" activeOpacity={0.7} onPress={goJobs}>
                <Text className="font-bold text-dark" style={{ fontSize: 22 }}>{contractorStats.completedJobs}</Text>
                <Text className="text-[10px] text-text-secondary mt-0.5">Jobs Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pending Bids */}
        {pendingBids.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-lg font-bold text-dark mb-2">Pending Bids</Text>
            <View style={{ gap: 6 }}>
              {pendingBids.slice(0, 3).map((bid) => {
                const job = jobMap.get(bid.jobId);
                return (
                  <TouchableOpacity key={bid.id} className="bg-white border border-border rounded flex-row items-center p-3" activeOpacity={0.7} onPress={() => router.push(`/(contractor)/(jobs)?jobId=${bid.jobId}` as any)}>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-dark" numberOfLines={1}>{job?.title || "Job"}</Text>
                      <Text className="text-xs text-text-secondary mt-0.5">{job?.location} — {bid.timeline}</Text>
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
