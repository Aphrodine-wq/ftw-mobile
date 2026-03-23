import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Star, Clock, ChevronDown, ChevronUp } from "lucide-react-native";
import { mockJobs, mockBids } from "@src/lib/mock-data";
import type { MockJob, MockBid } from "@src/lib/mock-data";
import { fetchJobs } from "@src/api/data";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";

type Filter = "active" | "completed" | "all";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: "bg-green-100", text: "text-green-700" },
  bidding: { bg: "bg-blue-100", text: "text-blue-700" },
  awarded: { bg: "bg-purple-100", text: "text-purple-700" },
  in_progress: { bg: "bg-amber-100", text: "text-amber-700" },
  completed: { bg: "bg-gray-100", text: "text-gray-600" },
  cancelled: { bg: "bg-red-100", text: "text-red-700" },
};

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.open;
  const label = status.replace("_", " ");
  return (
    <View className={`${colors.bg} rounded-full px-2.5 py-0.5`}>
      <Text className={`${colors.text} text-xs font-semibold capitalize`}>
        {label}
      </Text>
    </View>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <View className="flex-row items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          color={i < full ? BRAND.colors.primary : "#D1D5DB"}
          fill={i < full ? BRAND.colors.primary : "transparent"}
        />
      ))}
      <Text className="text-xs font-medium text-dark ml-1">
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

function BidRow({
  bid,
  onAccept,
  onDecline,
}: {
  bid: MockBid;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View className="bg-surface rounded-xl p-3 mb-2">
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-sm font-semibold text-dark">
          {bid.contractor.name}
        </Text>
        <Text className="text-brand-600 font-bold text-sm">
          {formatCurrency(bid.amount)}
        </Text>
      </View>
      <RatingStars rating={bid.contractor.rating} />
      <View className="flex-row items-center mt-1.5">
        <Clock size={12} color={BRAND.colors.textSecondary} />
        <Text className="text-text-secondary text-xs ml-1">
          {bid.timeline}
        </Text>
      </View>
      <Text
        className="text-text-secondary text-xs mt-1.5"
        numberOfLines={2}
      >
        {bid.message}
      </Text>
      {bid.status === "pending" && (
        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            className="flex-1 bg-brand-600 rounded-xl py-2.5 items-center"
            activeOpacity={0.8}
            onPress={onAccept}
          >
            <Text className="text-white text-sm font-semibold">Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 border border-border rounded-xl py-2.5 items-center"
            activeOpacity={0.7}
            onPress={onDecline}
          >
            <Text className="text-dark text-sm font-medium">Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function JobRow({ job }: { job: MockJob }) {
  const [expanded, setExpanded] = useState(false);
  const [bids, setBids] = useState<MockBid[]>(
    mockBids.filter((b) => b.jobId === job.id)
  );

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
    <View className="bg-white rounded-2xl mb-3 overflow-hidden">
      <TouchableOpacity
        className="p-4"
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
      >
        <View className="flex-row items-start justify-between mb-1.5">
          <Text className="text-base font-semibold text-dark flex-1 mr-2">
            {job.title}
          </Text>
          <StatusBadge status={job.status} />
        </View>
        <Text className="text-text-secondary text-sm mb-2">
          {job.category}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-dark font-medium text-sm">
            {formatCurrency(job.budget.min)} - {formatCurrency(job.budget.max)}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-text-secondary text-sm mr-1.5">
              {job.bidCount} {job.bidCount === 1 ? "bid" : "bids"}
            </Text>
            {expanded ? (
              <ChevronUp size={16} color={BRAND.colors.textSecondary} />
            ) : (
              <ChevronDown size={16} color={BRAND.colors.textSecondary} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 border-t border-border pt-3">
          {bids.length === 0 ? (
            <Text className="text-text-secondary text-sm text-center py-3">
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

  const filteredJobs = allJobs.filter((job) => {
    if (filter === "active") {
      return ["open", "bidding", "awarded", "in_progress"].includes(job.status);
    }
    if (filter === "completed") {
      return job.status === "completed";
    }
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "all", label: "All" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-4">
        <Text className="text-2xl font-bold text-dark">My Jobs</Text>
        <Text className="text-text-secondary mt-1">
          Track your posted jobs and review bids
        </Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-5 mt-4 mb-2 gap-2">
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            className={`px-4 py-2 rounded-full ${
              filter === f.key ? "bg-dark" : "bg-white border border-border"
            }`}
            activeOpacity={0.7}
            onPress={() => setFilter(f.key)}
          >
            <Text
              className={`text-sm font-semibold ${
                filter === f.key ? "text-white" : "text-text-secondary"
              }`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Job List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <JobRow job={item} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-text-secondary text-base">
              No jobs found.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
