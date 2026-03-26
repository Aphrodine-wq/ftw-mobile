import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Shield,
  Star,
  Clock,
  DollarSign,
  Share2,
  MapPin,
  FileText,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { fetchFairRecords } from "@src/api/data";
import { mockFairRecords } from "@src/lib/mock-data";
import { formatDate } from "@src/lib/utils";
import { BRAND, API_BASE } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import type { FairRecord } from "@src/types";

interface FairRecordData {
  records: FairRecord[];
  stats: {
    total: number;
    avg_budget_accuracy: number;
    on_time_rate: number;
    avg_rating: number;
  };
}

export default function RecordsScreen() {
  const router = useRouter();
  const [data, setData] = useState<FairRecordData>({
    records: mockFairRecords as FairRecord[],
    stats: {
      total: mockFairRecords.length,
      avg_budget_accuracy: 96.8,
      on_time_rate: 80.0,
      avg_rating: 4.9,
    },
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const result = await fetchFairRecords();
    setData(result as FairRecordData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleCertificate = async (record: FairRecord) => {
    const url = `${API_BASE}/api/records/${record.publicId}/certificate`;
    await WebBrowser.openBrowserAsync(url);
  };

  const handleShare = async (record: FairRecord) => {
    try {
      await Share.share({
        message: `Check out this FairRecord for ${record.projectTitle}: https://fairtradeworker.com/records/${record.publicId}`,
        title: `FairRecord - ${record.projectTitle}`,
      });
    } catch (error) {
      Alert.alert("Error", "Could not share this record.");
    }
  };

  const { records, stats } = data;

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="mr-3"
        >
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Shield size={22} color={BRAND.colors.primary} />
          <Text className="text-2xl font-bold text-dark ml-2">
            FairRecord
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row mx-5 mt-4 gap-2">
        <View className="flex-1 bg-white rounded-2xl p-3 items-center">
          <Text className="text-xl font-bold text-dark">{stats.total}</Text>
          <Text className="text-text-muted text-xs mt-0.5">Records</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-3 items-center">
          <Text className="text-xl font-bold text-emerald-600">
            {stats.avg_budget_accuracy}%
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">Budget Acc.</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-3 items-center">
          <Text className="text-xl font-bold text-blue-600">
            {stats.on_time_rate}%
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">On-Time</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-3 items-center">
          <Text className="text-xl font-bold text-amber-600">
            {stats.avg_rating}
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">Rating</Text>
        </View>
      </View>

      {/* Section label */}
      <View className="px-5 mt-5 mb-2">
        <Text className="text-lg font-bold text-dark">Portfolio</Text>
      </View>
    </View>
  );

  const renderRecord = ({ item }: { item: FairRecord }) => (
    <View className="bg-white rounded-2xl mx-5 mb-3 p-4">
      {/* Title + Category */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-dark font-bold text-base">
            {item.projectTitle}
          </Text>
          <View className="flex-row items-center mt-1">
            <MapPin size={12} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-sm ml-1">
              {item.locationCity}
            </Text>
            <Text className="text-text-muted text-sm mx-1.5">--</Text>
            <Text className="text-text-secondary text-sm">{item.category}</Text>
          </View>
        </View>
        <Text className="text-text-muted text-xs">
          {formatDate(item.actualCompletionDate)}
        </Text>
      </View>

      {/* Metric Badges Row */}
      <View className="flex-row flex-wrap gap-2 mt-2 mb-3">
        <Badge
          label={`${item.budgetAccuracyPct}% Budget`}
          variant={item.onBudget ? "success" : "warning"}
        />
        <Badge
          label={item.onTime ? "On Time" : "Late"}
          variant={item.onTime ? "success" : "danger"}
        />
      </View>

      {/* Stats Row */}
      <View className="flex-row items-center pt-3 border-t border-border">
        <View className="flex-row items-center mr-5">
          <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
          <Text className="text-dark font-semibold text-sm ml-1">
            {item.avgRating}
          </Text>
        </View>
        <View className="flex-row items-center mr-5">
          <DollarSign size={14} color={BRAND.colors.textSecondary} />
          <Text className="text-text-secondary text-sm">
            Quality: {item.qualityScoreAtCompletion}
          </Text>
        </View>
        <View className="flex-1" />
        <TouchableOpacity
          className="flex-row items-center bg-gray-100 rounded-lg px-3 py-1.5 mr-2"
          activeOpacity={0.7}
          onPress={() => handleCertificate(item)}
        >
          <FileText size={14} color={BRAND.colors.dark} />
          <Text className="text-dark text-sm font-semibold ml-1.5">
            Certificate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center bg-brand-50 rounded-lg px-3 py-1.5"
          activeOpacity={0.7}
          onPress={() => handleShare(item)}
        >
          <Share2 size={14} color={BRAND.colors.primary} />
          <Text className="text-brand-600 text-sm font-semibold ml-1.5">
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <Shield size={48} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-base mt-4">
              No FairRecords yet
            </Text>
            <Text className="text-text-muted text-sm mt-1 text-center">
              Complete your first project to earn a verified record
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
