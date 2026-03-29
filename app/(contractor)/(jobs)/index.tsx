import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, MapPin, Users, DollarSign, Clock, Send } from "lucide-react-native";
import { mockJobs, type MockJob } from "@src/lib/mock-data";
import { fetchJobs } from "@src/api/data";
import * as api from "@src/api/client";
import { useRealtimeJobs } from "@src/realtime/hooks";
import { formatCurrency } from "@src/lib/utils";
import { BRAND, JOB_CATEGORIES } from "@src/lib/constants";

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

function BidForm({ jobId, budget }: { jobId: string; budget: { min: number; max: number } }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [timeline, setTimeline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount) return;
    setSubmitting(true);
    try {
      await api.placeBid(jobId, {
        amount: parseFloat(amount) * 100,
        message,
        timeline,
      });
      Alert.alert("Bid Placed", "Your bid has been submitted.");
      setAmount("");
      setMessage("");
      setTimeline("");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to place bid");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="bg-gray-50 p-4 mt-2" style={{ borderRadius: 0 }}>
      <Text className="text-sm font-bold text-dark mb-3">Your Bid</Text>

      <View className="flex-row items-center bg-white border border-border px-3 py-2.5 mb-2" style={{ borderRadius: 0 }}>
        <DollarSign size={16} color={BRAND.colors.textMuted} />
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder={`${formatCurrency(budget.min)} - ${formatCurrency(budget.max)}`}
          placeholderTextColor={BRAND.colors.textMuted}
          keyboardType="numeric"
          className="flex-1 ml-2 text-dark"
        />
      </View>

      <View className="flex-row items-center bg-white border border-border px-3 py-2.5 mb-2" style={{ borderRadius: 0 }}>
        <Clock size={16} color={BRAND.colors.textMuted} />
        <TextInput
          value={timeline}
          onChangeText={setTimeline}
          placeholder="e.g. 3-4 weeks"
          placeholderTextColor={BRAND.colors.textMuted}
          className="flex-1 ml-2 text-dark"
        />
      </View>

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Why you're the right contractor for this job..."
        placeholderTextColor={BRAND.colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="bg-white border border-border px-3 py-2.5 text-dark mb-3 min-h-[70px]"
        style={{ borderRadius: 0 }}
      />

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!amount || submitting}
          className={`flex-1 py-2.5 items-center flex-row justify-center ${
            amount && !submitting ? "bg-brand-600" : "bg-gray-200"
          }`}
          style={{ borderRadius: 0 }}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Send size={14} color={amount ? "#fff" : "#9CA3AF"} />
              <Text className={`font-semibold ml-1.5 ${amount ? "text-white" : "text-gray-400"}`}>
                Submit Bid
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ContractorJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<MockJob[]>(mockJobs);
  const { jobs: realtimeJobs } = useRealtimeJobs();

  useEffect(() => {
    fetchJobs().then(setJobs);
  }, []);

  useEffect(() => {
    if (realtimeJobs.length > 0) setJobs(realtimeJobs as MockJob[]);
  }, [realtimeJobs]);

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
          className="bg-white border border-border mx-5 mb-3 overflow-hidden"
          style={{ borderRadius: 0 }}
          activeOpacity={0.7}
          onPress={() => toggleExpand(item.id)}
        >
          {/* Thumbnail */}
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: "100%", height: 140, borderRadius: 0 }}
            resizeMode="cover"
          />

          {/* Content */}
          <View className="p-4">
            {/* Title */}
            <Text className="text-dark font-bold text-base mb-1">
              {item.title}
            </Text>

            {/* Location */}
            <View className="flex-row items-center mb-2">
              <MapPin size={14} color={BRAND.colors.textMuted} />
              <Text className="text-text-secondary text-sm ml-1">
                {item.location}
              </Text>
            </View>

            {/* Budget */}
            <Text className="text-dark font-bold mb-2">
              {formatCurrency(item.budget.min)} - {formatCurrency(item.budget.max)}
            </Text>

            {/* Category + Bids + Urgency row */}
            <View className="flex-row items-center mb-2">
              <Text className="text-text-secondary text-xs">{item.category}</Text>
              <View className="w-1 h-1 bg-text-muted mx-2" style={{ borderRadius: 0.5 }} />
              <Users size={12} color={BRAND.colors.textMuted} />
              <Text className="text-text-muted text-xs ml-1">{item.bidCount} bids</Text>
              <View className="w-1 h-1 bg-text-muted mx-2" style={{ borderRadius: 0.5 }} />
              <View className={`w-2 h-2 ${getUrgencyDot(item.urgency)} mr-1`} style={{ borderRadius: 1 }} />
              <Text className="text-text-muted text-xs">{getUrgencyLabel(item.urgency)}</Text>
            </View>

            {/* Description — 1 line */}
            <Text className="text-text-muted text-sm" numberOfLines={1}>
              {item.description}
            </Text>
          </View>

          {/* Expanded bid form */}
          {isExpanded && (
            <View className="px-4 pb-4 border-t border-border pt-3">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-text-secondary text-sm">
                  Posted by{" "}
                  <Text className="text-dark font-medium">{item.postedBy}</Text>
                </Text>
                <View
                  className={`px-2.5 py-0.5 ${
                    item.status === "open"
                      ? "bg-emerald-50"
                      : item.status === "bidding"
                      ? "bg-blue-50"
                      : item.status === "in_progress"
                      ? "bg-amber-50"
                      : "bg-gray-100"
                  }`}
                  style={{ borderRadius: 0 }}
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
              <BidForm jobId={item.id} budget={item.budget} />
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
        <View className="bg-white flex-row items-center px-4 py-3 border border-border" style={{ borderRadius: 0 }}>
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
            className={`px-4 py-2 border ${
              activeCategory === null
                ? "bg-brand-600 border-brand-600"
                : "bg-white border-border"
            }`}
            style={{ borderRadius: 0 }}
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
              className={`px-4 py-2 border ${
                activeCategory === cat
                  ? "bg-brand-600 border-brand-600"
                  : "bg-white border-border"
              }`}
              style={{ borderRadius: 0 }}
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
