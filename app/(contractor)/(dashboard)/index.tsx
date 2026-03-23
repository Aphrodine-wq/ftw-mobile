import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Briefcase,
  Clock,
  DollarSign,
  TrendingUp,
  ChevronRight,
  FileText,
  Search,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import {
  mockJobs,
  mockEstimates,
  contractorStats,
} from "@src/lib/mock-data";
import { fetchJobs, fetchEstimates } from "@src/api/data";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";

const STAT_CARDS = [
  {
    label: "Active Jobs",
    value: String(contractorStats.activeJobs),
    icon: Briefcase,
    color: BRAND.colors.primary,
    bg: "bg-brand-50",
  },
  {
    label: "Pending Bids",
    value: String(contractorStats.pendingBids),
    icon: Clock,
    color: "#D97706",
    bg: "bg-amber-50",
  },
  {
    label: "Revenue",
    value: "$47,250",
    icon: DollarSign,
    color: "#059669",
    bg: "bg-emerald-50",
  },
  {
    label: "Win Rate",
    value: "68%",
    icon: TrendingUp,
    color: "#2563EB",
    bg: "bg-blue-50",
  },
] as const;

function getStatusColor(status: string): {
  bg: string;
  text: string;
} {
  switch (status) {
    case "accepted":
      return { bg: "bg-emerald-50", text: "text-emerald-700" };
    case "sent":
      return { bg: "bg-blue-50", text: "text-blue-700" };
    case "draft":
      return { bg: "bg-gray-100", text: "text-gray-600" };
    case "declined":
      return { bg: "bg-red-50", text: "text-red-700" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600" };
  }
}

export default function ContractorDashboard() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const [jobs, setJobs] = useState(mockJobs);
  const [estimates, setEstimates] = useState(mockEstimates);

  useEffect(() => {
    fetchJobs().then(setJobs);
    fetchEstimates().then(setEstimates);
  }, []);

  const recentJobs = jobs.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-dark">
            Hey, {firstName}
          </Text>
          <Text className="text-text-secondary mt-1">{today}</Text>
        </View>

        {/* Stat Cards — 2x2 grid */}
        <View className="px-5 mt-4 flex-row flex-wrap justify-between">
          {STAT_CARDS.map((stat) => (
            <View
              key={stat.label}
              className="bg-white rounded-2xl p-4 mb-3"
              style={{ width: (Dimensions.get("window").width - 52) / 2 }}
            >
              <View
                className={`w-10 h-10 rounded-xl ${stat.bg} items-center justify-center mb-3`}
              >
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text className="text-2xl font-bold text-dark">{stat.value}</Text>
              <Text className="text-text-secondary text-sm mt-1">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Jobs */}
        <View className="mt-4">
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-dark">Recent Jobs</Text>
            <TouchableOpacity
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <Text className="text-brand-600 text-sm font-medium mr-1">
                View All
              </Text>
              <ChevronRight size={16} color={BRAND.colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {recentJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                className="bg-white rounded-2xl p-4"
                style={{ width: 260 }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="bg-brand-50 rounded-full px-3 py-1">
                    <Text className="text-brand-600 text-xs font-medium">
                      {job.category}
                    </Text>
                  </View>
                  <View
                    className={`w-2 h-2 rounded-full ${
                      job.urgency === "high"
                        ? "bg-red-500"
                        : job.urgency === "medium"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </View>
                <Text
                  className="text-dark font-semibold text-base mb-1"
                  numberOfLines={1}
                >
                  {job.title}
                </Text>
                <Text className="text-text-secondary text-sm mb-2">
                  {job.location}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-dark font-bold">
                    {formatCurrency(job.budget.min)} -{" "}
                    {formatCurrency(job.budget.max)}
                  </Text>
                  <Text className="text-text-muted text-xs">
                    {job.bidCount} bids
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Estimates */}
        <View className="mt-6 px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-dark">
              Recent Estimates
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <Text className="text-brand-600 text-sm font-medium mr-1">
                View All
              </Text>
              <ChevronRight size={16} color={BRAND.colors.primary} />
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl overflow-hidden">
            {estimates.map((estimate, i) => {
              const statusStyle = getStatusColor(estimate.status);
              return (
                <TouchableOpacity
                  key={estimate.id}
                  className={`flex-row items-center px-4 py-3 ${
                    i < estimates.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="flex-1">
                    <Text
                      className="text-dark font-medium"
                      numberOfLines={1}
                    >
                      {estimate.title}
                    </Text>
                    <Text className="text-text-secondary text-sm mt-0.5">
                      {estimate.client}
                    </Text>
                  </View>
                  <View className="items-end ml-3">
                    <Text className="text-dark font-semibold">
                      {formatCurrency(estimate.total)}
                    </Text>
                    <View
                      className={`${statusStyle.bg} rounded-full px-2 py-0.5 mt-1`}
                    >
                      <Text
                        className={`${statusStyle.text} text-xs font-medium capitalize`}
                      >
                        {estimate.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 mt-6 mb-8 flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-brand-600 rounded-2xl py-4 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <FileText size={18} color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">New Estimate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl py-4 flex-row items-center justify-center border border-border"
            activeOpacity={0.7}
          >
            <Search size={18} color={BRAND.colors.dark} />
            <Text className="text-dark font-semibold ml-2">Browse Jobs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
