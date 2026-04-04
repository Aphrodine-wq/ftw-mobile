import { useState, useEffect, useMemo, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  MapPin,
} from "lucide-react-native";
import { mockJobs, mockBids } from "@src/lib/mock-data";
import type { MockJob, MockBid } from "@src/lib/mock-data";
import { fetchJobs } from "@src/api/data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import { router } from "expo-router";

type Filter = "active" | "completed" | "all";
type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral";

const STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  open: { label: "Open", variant: "success" },
  bidding: { label: "Bidding", variant: "default" },
  awarded: { label: "Awarded", variant: "warning" },
  in_progress: { label: "In Progress", variant: "warning" },
  completed: { label: "Completed", variant: "neutral" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

const jobKeyExtractor = (item: MockJob) => item.id;

const RatingStars = memo(function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <View className="flex-row items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          color={i < full ? BRAND.colors.primary : BRAND.colors.border}
          fill={i < full ? BRAND.colors.primary : "transparent"}
        />
      ))}
      <Text style={{ fontSize: 12, fontWeight: "500", color: BRAND.colors.textPrimary, marginLeft: 4 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
});

const BidRow = memo(function BidRow({
  bid,
  onAccept,
  onDecline,
}: {
  bid: MockBid;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={s.bidCard}>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text style={{ fontSize: 14, fontWeight: "600", color: BRAND.colors.textPrimary }}>
          {bid.contractor.name}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "700", color: BRAND.colors.primary }}>
          {formatCurrency(bid.amount)}
        </Text>
      </View>
      <RatingStars rating={bid.contractor.rating} />
      <View className="flex-row items-center mt-1.5">
        <Clock size={12} color={BRAND.colors.textSecondary} />
        <Text style={{ fontSize: 12, color: BRAND.colors.textSecondary, marginLeft: 4 }}>
          {bid.timeline}
        </Text>
      </View>
      <Text
        style={{ fontSize: 12, color: BRAND.colors.textSecondary, marginTop: 6 }}
        numberOfLines={2}
      >
        {bid.message}
      </Text>
      {bid.status === "pending" && (
        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            style={s.acceptBtn}
            activeOpacity={0.8}
            onPress={onAccept}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.declineBtn}
            activeOpacity={0.7}
            onPress={onDecline}
          >
            <Text style={{ color: BRAND.colors.textPrimary, fontSize: 13, fontWeight: "500" }}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

function JobRow({ job }: { job: MockJob }) {
  const [expanded, setExpanded] = useState(false);
  const [bids, setBids] = useState<MockBid[]>(
    mockBids.filter((b) => b.jobId === job.id)
  );
  const badge = STATUS_BADGE[job.status] || STATUS_BADGE.open;

  const handleAccept = (bid: MockBid) => {
    Alert.alert(
      "Accept Bid",
      `Accept ${bid.contractor.name}'s bid of ${formatCurrency(bid.amount)} for "${job.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          style: "default",
          onPress: () => {
            setBids((prev) =>
              prev.map((b) =>
                b.id === bid.id
                  ? { ...b, status: "accepted" as const }
                  : b.id !== bid.id
                    ? { ...b, status: "rejected" as const }
                    : b
              )
            );
          },
        },
      ]
    );
  };

  const handleDecline = (bid: MockBid) => {
    setBids((prev) =>
      prev.map((b) =>
        b.id === bid.id ? { ...b, status: "rejected" as const } : b
      )
    );
  };

  return (
    <View style={s.jobCard}>
      <TouchableOpacity
        style={{ padding: 16 }}
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
      >
        <View className="flex-row items-start justify-between mb-1.5">
          <Text
            style={{ fontSize: 16, fontWeight: "600", color: BRAND.colors.textPrimary, flex: 1, marginRight: 8 }}
            numberOfLines={1}
          >
            {job.title}
          </Text>
          <Badge label={badge.label} variant={badge.variant} square />
        </View>

        {/* Category tag */}
        <View style={s.categoryTag}>
          <Text style={{ fontSize: 11, fontWeight: "600", color: BRAND.colors.textSecondary }}>
            {job.category}
          </Text>
        </View>

        {/* Budget */}
        <Text style={{ fontSize: 15, fontWeight: "600", color: BRAND.colors.textPrimary, marginTop: 8 }}>
          {formatCurrency(job.budget.min)} - {formatCurrency(job.budget.max)}
        </Text>

        {/* Location */}
        <View className="flex-row items-center mt-2">
          <MapPin size={13} color={BRAND.colors.textMuted} />
          <Text style={{ fontSize: 13, color: BRAND.colors.textMuted, marginLeft: 4 }}>
            {job.location}
          </Text>
        </View>

        {/* Bottom row */}
        <View className="flex-row items-center justify-between mt-3">
          <Text style={{ fontSize: 12, color: BRAND.colors.textMuted }}>
            {job.bidCount} {job.bidCount === 1 ? "bid" : "bids"} -- Posted {formatDate(job.postedDate)}
          </Text>
          {expanded ? (
            <ChevronUp size={16} color={BRAND.colors.textSecondary} />
          ) : (
            <ChevronDown size={16} color={BRAND.colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={s.bidsContainer}>
          {bids.length === 0 ? (
            <Text style={{ color: BRAND.colors.textMuted, fontSize: 14, textAlign: "center", paddingVertical: 12 }}>
              No bids yet. Contractors are reviewing your job.
            </Text>
          ) : (
            bids.map((bid) => (
              <BidRow
                key={bid.id}
                bid={bid}
                onAccept={() => handleAccept(bid)}
                onDecline={() => handleDecline(bid)}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

export default function HomeownerJobs() {
  const [filter, setFilter] = useState<Filter>("active");
  const [allJobs, setAllJobs] = useState<MockJob[]>(mockJobs);

  useEffect(() => {
    fetchJobs().then(setAllJobs);
  }, []);

  const filteredJobs = useMemo(() => allJobs.filter((job) => {
    if (filter === "active") {
      return ["open", "bidding", "awarded", "in_progress"].includes(job.status);
    }
    if (filter === "completed") {
      return job.status === "completed";
    }
    return true;
  }), [allJobs, filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "all", label: "All" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "700", color: BRAND.colors.textPrimary }}>
          My Jobs
        </Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-5 mt-3 mb-2 gap-2">
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              s.filterPill,
              filter === f.key ? s.filterPillActive : s.filterPillInactive,
            ]}
            activeOpacity={0.7}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: filter === f.key ? "#FFFFFF" : BRAND.colors.textSecondary,
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Job List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={jobKeyExtractor}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        renderItem={({ item }) => <JobRow job={item} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text style={{ color: BRAND.colors.textMuted, fontSize: 15 }}>
              No jobs found.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: BRAND.colors.bgSoft,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  bidsContainer: {
    borderTopWidth: 1,
    borderTopColor: BRAND.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bidCard: {
    backgroundColor: BRAND.colors.bgSoft,
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
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
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  filterPillActive: {
    backgroundColor: BRAND.colors.dark,
  },
  filterPillInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
  },
});
