import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, MapPin, Users, ChevronDown, ChevronUp } from "lucide-react-native";
import { mockJobs, type MockJob } from "@src/lib/mock-data";
import { fetchJobs } from "@src/api/data";
import { formatCurrency } from "@src/lib/utils";
import { BRAND, JOB_CATEGORIES } from "@src/lib/constants";

function getUrgencyDot(urgency: MockJob["urgency"]): string {
  switch (urgency) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-amber-500";
    case "low":
      return "bg-emerald-500";
  }
}

function getUrgencyLabel(urgency: MockJob["urgency"]): string {
  switch (urgency) {
    case "high":
      return "Urgent";
    case "medium":
      return "Normal";
    case "low":
      return "Flexible";
  }
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ContractorJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<MockJob[]>(mockJobs);

  useEffect(() => {
    fetchJobs().then(setJobs);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !activeCategory || job.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleExpand = useCallback((jobId: string) => {
    setExpandedJob((prev) => (prev === jobId ? null : jobId));
  }, []);

  const renderJob = useCallback(
    ({ item }: { item: MockJob }) => {
      const isExpanded = expandedJob === item.id;

      return (
        <TouchableOpacity
          className="bg-white rounded-2xl mx-5 mb-3 overflow-hidden"
          activeOpacity={0.7}
          onPress={() => toggleExpand(item.id)}
        >
          <View className="p-4">
            {/* Top row: category + urgency */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-brand-50 rounded-full px-3 py-1">
                <Text className="text-brand-600 text-xs font-medium">
                  {item.category}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full ${getUrgencyDot(item.urgency)} mr-1.5`}
                />
                <Text className="text-text-muted text-xs">
                  {getUrgencyLabel(item.urgency)}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text className="text-dark font-semibold text-base mb-1">
              {item.title}
            </Text>

            {/* Location */}
            <View className="flex-row items-center mb-2">
              <MapPin size={14} color={BRAND.colors.textMuted} />
              <Text className="text-text-secondary text-sm ml-1">
                {item.location}
              </Text>
            </View>

            {/* Budget + bids + date row */}
            <View className="flex-row items-center justify-between">
              <Text className="text-dark font-bold">
                {formatCurrency(item.budget.min)} -{" "}
                {formatCurrency(item.budget.max)}
              </Text>
              <View className="flex-row items-center">
                <Users size={14} color={BRAND.colors.textMuted} />
                <Text className="text-text-muted text-xs ml-1 mr-3">
                  {item.bidCount} bids
                </Text>
                <Text className="text-text-muted text-xs">
                  {formatShortDate(item.postedDate)}
                </Text>
              </View>
            </View>

            {/* Expand indicator */}
            <View className="items-center mt-2">
              {isExpanded ? (
                <ChevronUp size={16} color={BRAND.colors.textMuted} />
              ) : (
                <ChevronDown size={16} color={BRAND.colors.textMuted} />
              )}
            </View>
          </View>

          {/* Expanded details */}
          {isExpanded && (
            <View className="px-4 pb-4 border-t border-border pt-3">
              <Text className="text-text-secondary text-sm leading-5 mb-3">
                {item.description}
              </Text>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-text-secondary text-sm">
                  Posted by{" "}
                  <Text className="text-dark font-medium">
                    {item.postedBy}
                  </Text>
                </Text>
                <View
                  className={`rounded-full px-2.5 py-0.5 ${
                    item.status === "open"
                      ? "bg-emerald-50"
                      : item.status === "bidding"
                      ? "bg-blue-50"
                      : item.status === "in_progress"
                      ? "bg-amber-50"
                      : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium capitalize ${
                      item.status === "open"
                        ? "text-emerald-700"
                        : item.status === "bidding"
                        ? "text-blue-700"
                        : item.status === "in_progress"
                        ? "text-amber-700"
                        : "text-gray-600"
                    }`}
                  >
                    {item.status.replace("_", " ")}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="bg-brand-600 rounded-xl py-3 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold">Place Bid</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [expandedJob, toggleExpand]
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-dark">Browse Jobs</Text>
        <Text className="text-text-secondary mt-1">
          Find and bid on jobs in your area
        </Text>
      </View>

      {/* Search bar */}
      <View className="px-5 mt-2 mb-3">
        <View className="bg-white rounded-xl flex-row items-center px-4 py-3 border border-border">
          <Search size={18} color={BRAND.colors.textMuted} />
          <TextInput
            className="flex-1 ml-3 text-dark text-base"
            placeholder="Search jobs, categories, locations..."
            placeholderTextColor={BRAND.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Category pills */}
      <View className="mb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          <TouchableOpacity
            className={`rounded-full px-4 py-2 border ${
              activeCategory === null
                ? "bg-brand-600 border-brand-600"
                : "bg-white border-border"
            }`}
            activeOpacity={0.7}
            onPress={() => setActiveCategory(null)}
          >
            <Text
              className={`text-sm font-medium ${
                activeCategory === null ? "text-white" : "text-dark"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          {JOB_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`rounded-full px-4 py-2 border ${
                activeCategory === cat
                  ? "bg-brand-600 border-brand-600"
                  : "bg-white border-border"
              }`}
              activeOpacity={0.7}
              onPress={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
            >
              <Text
                className={`text-sm font-medium ${
                  activeCategory === cat ? "text-white" : "text-dark"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Job list */}
      <FlatList
        data={filteredJobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-6">
            <Text className="text-lg font-semibold text-dark mb-2">
              No jobs found
            </Text>
            <Text className="text-text-secondary text-center">
              Try adjusting your search or category filter.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
