import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  MapPin,
  Star,
  AlertCircle,
  Clock,
  Users,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useRealtimeSubJobs } from "@src/realtime/hooks";
import { placeSubBid } from "@src/api/client";
import { SubJob } from "@src/lib/mock-data";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";

type FilterTab = "all" | "open" | "urgent";

function daysUntil(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getPaymentPathLabel(path: string): string {
  return path === "contractor_escrow" ? "GC Escrow" : "Pass-through";
}

export default function BrowseSubJobsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [biddingJobId, setBiddingJobId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidTimeline, setBidTimeline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { subJobs, loading } = useRealtimeSubJobs();

  const filtered = useMemo(() => subJobs.filter((sj) => {
    if (activeTab === "open") return sj.status === "open";
    if (activeTab === "urgent") return sj.urgency === "high" && sj.status === "open";
    return true;
  }), [activeTab, subJobs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    import("@src/api/data").then(({ fetchSubJobs }) =>
      fetchSubJobs().then(() => setRefreshing(false))
    ).catch(() => setRefreshing(false));
  }, []);

  const handlePlaceBid = useCallback(async (subJobId: string) => {
    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Invalid Amount", "Enter a valid bid amount.");
      return;
    }
    if (!bidMessage.trim()) {
      Alert.alert("Missing Message", "Add a brief message with your bid.");
      return;
    }

    setSubmitting(true);
    try {
      await placeSubBid(subJobId, {
        amount: Math.round(amount * 100), // Convert dollars to cents for API
        message: bidMessage.trim(),
        timeline: bidTimeline.trim() || "TBD",
      });
      Alert.alert("Bid Placed", "Your bid has been submitted.");
      setBiddingJobId(null);
      setBidAmount("");
      setBidMessage("");
      setBidTimeline("");
    } catch (err: any) {
      Alert.alert("Bid Failed", err.message || "Could not place bid. Try again.");
    } finally {
      setSubmitting(false);
    }
  }, [bidAmount, bidMessage, bidTimeline]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "urgent", label: "Urgent" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-3">Sub Jobs</Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 mb-3" style={{ gap: 8 }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`px-4 py-2 ${activeTab === tab.key ? "bg-dark" : "bg-white border border-border rounded"}`}
            activeOpacity={0.7}
          >
            <Text className={`text-sm font-bold ${activeTab === tab.key ? "text-white" : "text-dark"}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND.colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C41E3A" />
          }
        >
          {filtered.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Text className="text-text-muted text-base">No sub jobs found</Text>
            </View>
          ) : (
            <View className="px-4" style={{ gap: 8 }}>
              {filtered.map((sj: SubJob) => {
                const days = daysUntil(sj.deadline);
                const isBidding = biddingJobId === sj.id;
                return (
                  <View key={sj.id} className="bg-white border border-border rounded overflow-hidden">
                    <View className="p-4">
                      {/* Top row */}
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="bg-gray-100 px-2 py-0.5">
                          <Text className="text-[10px] font-bold text-text-secondary uppercase">{sj.category}</Text>
                        </View>
                        <View className="flex-row items-center" style={{ gap: 8 }}>
                          {sj.urgency === "high" && (
                            <View className="flex-row items-center">
                              <AlertCircle size={12} color={BRAND.colors.primary} />
                              <Text className="text-[10px] font-bold text-brand-600 ml-1 uppercase">Urgent</Text>
                            </View>
                          )}
                          <Badge
                            label={getPaymentPathLabel(sj.paymentPath)}
                            variant="neutral"
                            square
                          />
                        </View>
                      </View>

                      <Text className="text-base font-bold text-dark mb-1">{sj.title}</Text>
                      <Text className="text-sm text-text-secondary mb-2" numberOfLines={2}>{sj.description}</Text>

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

                      {/* Budget */}
                      <Text className="text-lg font-bold text-dark mb-2">
                        {formatCurrency(sj.budgetMin)}-{formatCurrency(sj.budgetMax)}
                      </Text>

                      {/* Info row */}
                      <View className="flex-row items-center justify-between mb-2">
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

                      {/* GC + bids row */}
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <Text className="text-sm text-text-secondary">{sj.contractorName}</Text>
                          <View className="flex-row items-center ml-2">
                            <Star size={12} color={BRAND.colors.primary} fill={BRAND.colors.primary} />
                            <Text className="text-xs text-text-muted ml-0.5">{sj.contractorRating}</Text>
                          </View>
                        </View>
                        <View className="flex-row items-center">
                          <Users size={12} color={BRAND.colors.textMuted} />
                          <Text className="text-xs text-text-muted ml-1">{sj.bidCount} bids</Text>
                        </View>
                      </View>

                      {/* Place Bid button / form */}
                      {sj.status === "open" && !isBidding && (
                        <TouchableOpacity
                          className="bg-brand-600 py-3 items-center"
                          style={{ borderRadius: 4 }}
                          activeOpacity={0.8}
                          onPress={() => setBiddingJobId(sj.id)}
                        >
                          <Text className="text-white font-bold text-base">Place Bid</Text>
                        </TouchableOpacity>
                      )}

                      {/* Inline bid form */}
                      {isBidding && (
                        <View className="border-t border-border pt-3 mt-1" style={{ gap: 8 }}>
                          <TextInput
                            className="border border-border bg-white px-3 py-2 text-dark"
                            placeholder="Bid amount ($)"
                            placeholderTextColor={BRAND.colors.textMuted}
                            keyboardType="numeric"
                            value={bidAmount}
                            onChangeText={setBidAmount}
                          />
                          <TextInput
                            className="border border-border bg-white px-3 py-2 text-dark"
                            placeholder="Message (your pitch)"
                            placeholderTextColor={BRAND.colors.textMuted}
                            value={bidMessage}
                            onChangeText={setBidMessage}
                            multiline
                          />
                          <TextInput
                            className="border border-border bg-white px-3 py-2 text-dark"
                            placeholder="Timeline (e.g. 3-4 days)"
                            placeholderTextColor={BRAND.colors.textMuted}
                            value={bidTimeline}
                            onChangeText={setBidTimeline}
                          />
                          <View className="flex-row" style={{ gap: 8 }}>
                            <TouchableOpacity
                              className="flex-1 bg-gray-100 py-3 items-center"
                              style={{ borderRadius: 4 }}
                              activeOpacity={0.7}
                              onPress={() => { setBiddingJobId(null); setBidAmount(""); setBidMessage(""); setBidTimeline(""); }}
                            >
                              <Text className="text-dark font-bold text-sm">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              className="flex-1 bg-brand-600 py-3 items-center"
                              style={{ borderRadius: 4, opacity: submitting ? 0.6 : 1 }}
                              activeOpacity={0.8}
                              onPress={() => handlePlaceBid(sj.id)}
                              disabled={submitting}
                            >
                              <Text className="text-white font-bold text-sm">
                                {submitting ? "Submitting..." : "Submit Bid"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 90 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
