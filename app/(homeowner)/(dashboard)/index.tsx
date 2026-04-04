import { useState, useEffect, useMemo, memo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  DollarSign,
  Briefcase,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  ClipboardList,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import {
  mockJobs,
  mockBids,
  mockProjects,
  homeownerStats,
} from "@src/lib/mock-data";
import { fetchJobs } from "@src/api/data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral";

const STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  open: { label: "Open", variant: "success" },
  bidding: { label: "Bidding", variant: "default" },
  awarded: { label: "Awarded", variant: "warning" },
  in_progress: { label: "In Progress", variant: "warning" },
  completed: { label: "Completed", variant: "neutral" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <View className="flex-row items-center">
      <Star size={12} color={BRAND.colors.primary} fill={BRAND.colors.primary} />
      <Text style={{ color: BRAND.colors.textPrimary, fontSize: 12, fontWeight: "500", marginLeft: 2 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

export default function HomeownerDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] || "there";
  const [jobs, setJobs] = useState(mockJobs);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    fetchJobs().then(setJobs);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 800);
  }, [loadData]);

  const activeJobs = useMemo(() => jobs.filter(
    (j) => j.status === "in_progress" || j.status === "awarded"
  ), [jobs]);
  const recentBids = useMemo(() => mockBids.filter((b) => b.status === "pending").slice(0, 4), []);
  const activeProjects = useMemo(() => mockProjects.filter((p) => p.status === "active"), []);

  const today = useMemo(() => new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }), []);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C41E3A" />
        }
      >
        {/* Date Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} className="px-5 pt-4 pb-2">
          <Text style={{ fontSize: 28, fontWeight: "700", color: BRAND.colors.textPrimary }}>
            {today}
          </Text>
        </Animated.View>

        {/* Active Jobs Section */}
        {activeJobs.length > 0 && (
          <View className="px-5 mt-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ fontSize: 18, fontWeight: "700", color: BRAND.colors.textPrimary }}>
                Active Jobs
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(homeowner)/(jobs)" as any)}
                activeOpacity={0.7}
                className="flex-row items-center"
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: BRAND.colors.primary }}>
                  View All
                </Text>
                <ChevronRight size={16} color={BRAND.colors.primary} />
              </TouchableOpacity>
            </View>
            {activeJobs.map((job) => {
              const badge = STATUS_BADGE[job.status] || STATUS_BADGE.open;
              return (
                <TouchableOpacity
                  key={job.id}
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => router.push("/(homeowner)/(jobs)" as any)}
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <Text
                      style={{ fontSize: 16, fontWeight: "600", color: BRAND.colors.textPrimary, flex: 1, marginRight: 8 }}
                      numberOfLines={1}
                    >
                      {job.title}
                    </Text>
                    <Badge label={badge.label} variant={badge.variant} square />
                  </View>
                  <Text style={{ fontSize: 13, color: BRAND.colors.textMuted, marginBottom: 4 }}>
                    {job.category}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text style={{ fontSize: 14, fontWeight: "600", color: BRAND.colors.textPrimary }}>
                      {formatCurrency(job.budget.min)} - {formatCurrency(job.budget.max)}
                    </Text>
                    <View className="flex-row items-center">
                      <MapPin size={12} color={BRAND.colors.textMuted} />
                      <Text style={{ fontSize: 12, color: BRAND.colors.textMuted, marginLeft: 4 }}>
                        {job.location}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)} className="flex-row px-5 mt-5 gap-3">
          {[
            { icon: DollarSign, label: "TOTAL SPENT", value: formatCurrency(homeownerStats.totalSpent), color: "#16A34A", bg: "#F0FDF4" },
            { icon: Briefcase, label: "ACTIVE PROJECTS", value: String(homeownerStats.activeJobs), color: "#2563EB", bg: "#EFF6FF" },
            { icon: ClipboardList, label: "BIDS RECEIVED", value: String(homeownerStats.pendingBids), color: BRAND.colors.primary, bg: "#FDF2F3" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <View key={stat.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                  <Icon size={18} color={stat.color} />
                </View>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            );
          })}
        </Animated.View>

        {/* Recent Bids Section */}
        <View className="px-5 mt-6">
          <Text style={{ fontSize: 18, fontWeight: "700", color: BRAND.colors.textPrimary, marginBottom: 12 }}>
            Recent Bids
          </Text>
          {recentBids.length === 0 ? (
            <View style={styles.card}>
              <Text style={{ color: BRAND.colors.textMuted, textAlign: "center" }}>
                No bids yet. Post a job to get started.
              </Text>
            </View>
          ) : (
            recentBids.map((bid) => (
              <View key={bid.id} style={styles.card}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text style={{ fontSize: 15, fontWeight: "600", color: BRAND.colors.textPrimary }}>
                    {bid.contractor.name}
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: BRAND.colors.primary }}>
                    {formatCurrency(bid.amount)}
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <RatingStars rating={bid.contractor.rating} />
                  <Text style={{ fontSize: 12, color: BRAND.colors.textMuted, marginLeft: 8 }}>
                    {bid.contractor.jobsCompleted} jobs
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Clock size={12} color={BRAND.colors.textSecondary} />
                  <Text style={{ fontSize: 13, color: BRAND.colors.textSecondary, marginLeft: 4 }}>
                    {bid.timeline}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 13, color: BRAND.colors.textSecondary }}
                  numberOfLines={2}
                >
                  {bid.message}
                </Text>
                {bid.status === "pending" && (
                  <View className="flex-row gap-2 mt-3">
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: BRAND.colors.textPrimary, fontSize: 14, fontWeight: "500" }}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* My Projects Section */}
        {activeProjects.length > 0 && (
          <View className="px-5 mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ fontSize: 18, fontWeight: "700", color: BRAND.colors.textPrimary }}>
                My Projects
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(homeowner)/projects" as any)}
                activeOpacity={0.7}
                className="flex-row items-center"
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: BRAND.colors.primary }}>
                  View All
                </Text>
                <ChevronRight size={16} color={BRAND.colors.primary} />
              </TouchableOpacity>
            </View>
            {activeProjects.slice(0, 2).map((project) => {
              const progress = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
              return (
                <TouchableOpacity
                  key={project.id}
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => router.push("/(homeowner)/projects" as any)}
                >
                  <View className="flex-row items-start justify-between mb-1">
                    <Text style={{ fontSize: 15, fontWeight: "600", color: BRAND.colors.textPrimary, flex: 1 }}>
                      {project.name}
                    </Text>
                    <Badge label="Active" variant="success" square />
                  </View>
                  <Text style={{ fontSize: 13, color: BRAND.colors.textMuted, marginBottom: 8 }}>
                    {project.contractorName}
                  </Text>
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text style={{ fontSize: 13, color: BRAND.colors.textSecondary }}>
                      {formatCurrency(project.spent)} of {formatCurrency(project.budget)}
                    </Text>
                    <Text style={{ fontSize: 12, color: BRAND.colors.textMuted }}>
                      {Math.round(progress)}%
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    padding: 14,
    alignItems: "center",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: BRAND.colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: BRAND.colors.textPrimary,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: BRAND.colors.primary,
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: "center",
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: "center",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BRAND.colors.primary,
    borderRadius: 4,
  },
});
