import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Plus,
  Briefcase,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  Star,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import { mockJobs, mockBids, homeownerStats } from "@src/lib/mock-data";
import { fetchJobs } from "@src/api/data";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";

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
  return (
    <View className="flex-row items-center">
      <Star size={12} color={BRAND.colors.primary} fill={BRAND.colors.primary} />
      <Text className="text-xs font-medium text-dark ml-0.5">
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

  useEffect(() => {
    fetchJobs().then(setJobs);
  }, []);

  const myJobs = jobs.slice(0, 3);
  const recentBids = mockBids.filter((b) =>
    myJobs.some((j) => j.id === b.jobId)
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-dark">
            Welcome, {firstName}
          </Text>
          <Text className="text-text-secondary mt-1">{today}</Text>
        </View>

        {/* Post a Job CTA */}
        <View className="px-5 mt-3">
          <TouchableOpacity
            className="bg-brand-600 rounded-2xl p-5 flex-row items-center"
            activeOpacity={0.8}
            onPress={() => router.push("/(homeowner)/post-job" as any)}
          >
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
              <Plus size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">
                Post a New Job
              </Text>
              <Text className="text-white/80 text-sm mt-0.5">
                Get bids from verified contractors
              </Text>
            </View>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stat Cards */}
        <View className="flex-row px-5 mt-5 gap-3">
          <View className="flex-1 bg-white rounded-2xl p-4 items-center">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-2">
              <Briefcase size={18} color="#2563EB" />
            </View>
            <Text className="text-2xl font-bold text-dark">
              {homeownerStats.activeJobs}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              Active Jobs
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 items-center">
            <View className="w-10 h-10 rounded-full bg-brand-100 items-center justify-center mb-2">
              <MessageSquare size={18} color={BRAND.colors.primary} />
            </View>
            <Text className="text-2xl font-bold text-dark">
              {homeownerStats.pendingBids}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              Incoming Bids
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 items-center">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mb-2">
              <CheckCircle size={18} color="#16A34A" />
            </View>
            <Text className="text-2xl font-bold text-dark">
              {homeownerStats.projectsCompleted}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              Completed
            </Text>
          </View>
        </View>

        {/* Your Active Jobs */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">
            Your Active Jobs
          </Text>
          {myJobs.map((job) => (
            <View
              key={job.id}
              className="bg-white rounded-2xl p-4 mb-3"
            >
              <View className="flex-row items-start justify-between mb-2">
                <Text className="text-base font-semibold text-dark flex-1 mr-2">
                  {job.title}
                </Text>
                <StatusBadge status={job.status} />
              </View>
              <Text className="text-text-secondary text-sm mb-3">
                {job.category}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-dark font-medium text-sm">
                  {formatCurrency(job.budget.min)} - {formatCurrency(job.budget.max)}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {job.bidCount} {job.bidCount === 1 ? "bid" : "bids"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Bids */}
        <View className="px-5 mt-4 mb-8">
          <Text className="text-lg font-bold text-dark mb-3">
            Recent Bids
          </Text>
          {recentBids.length === 0 ? (
            <View className="bg-white rounded-2xl p-5 items-center">
              <Text className="text-text-secondary">
                No bids yet. Post a job to get started.
              </Text>
            </View>
          ) : (
            recentBids.map((bid) => (
              <View
                key={bid.id}
                className="bg-white rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-semibold text-dark">
                    {bid.contractor.name}
                  </Text>
                  <Text className="text-brand-600 font-bold text-base">
                    {formatCurrency(bid.amount)}
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <RatingStars rating={bid.contractor.rating} />
                  <Text className="text-text-muted text-xs ml-2">
                    {bid.contractor.jobsCompleted} jobs completed
                  </Text>
                </View>
                <Text
                  className="text-text-secondary text-sm"
                  numberOfLines={2}
                >
                  {bid.message}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
