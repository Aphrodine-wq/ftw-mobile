import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Star, MessageSquare } from "lucide-react-native";
import { useRouter } from "expo-router";
import { fetchReviews } from "@src/api/data";
import { mockReviews } from "@src/lib/mock-data";
import { formatDate, getInitials } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Avatar } from "@src/components/ui/avatar";
import type { Review } from "@src/types";

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          color="#F59E0B"
          fill={i <= rating ? "#F59E0B" : "transparent"}
          strokeWidth={i <= rating ? 0 : 1.5}
        />
      ))}
    </View>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View className="flex-row items-center mb-1.5">
      <Text className="text-text-secondary text-sm w-4 text-right">{stars}</Text>
      <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
      <View className="flex-1 h-2 bg-gray-100 mx-2 overflow-hidden" style={{ borderRadius: 4 }}>
        <View
          className="h-full bg-gray-400"
          style={{ width: `${pct}%`, borderRadius: 4 }}
        />
      </View>
      <Text className="text-text-muted text-xs w-6">{count}</Text>
    </View>
  );
}

export default function ReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchReviews();
    setReviews(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Compute stats
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  // Rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

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
        <Text className="text-2xl font-bold text-dark">Reviews</Text>
      </View>

      {/* Rating Summary */}
      <View
        className="bg-white border border-border rounded mx-5 mt-4 p-5"
        style={{ borderRadius: 4 }}
      >
        <View className="flex-row">
          {/* Left: big number */}
          <View className="items-center mr-6">
            <Text className="text-5xl font-bold text-dark">
              {avgRating.toFixed(1)}
            </Text>
            <StarRating rating={Math.round(avgRating)} size={16} />
            <Text className="text-text-muted text-sm mt-1">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </Text>
          </View>

          {/* Right: breakdown bars */}
          <View className="flex-1 justify-center">
            {breakdown.map((b) => (
              <RatingBar
                key={b.stars}
                stars={b.stars}
                count={b.count}
                total={totalReviews}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Section label */}
      <View className="px-5 mt-5 mb-2">
        <Text className="text-lg font-bold text-dark">All Reviews</Text>
      </View>
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View
      className="bg-white border border-border rounded mx-5 mb-3 p-4"
      style={{ borderRadius: 4 }}
    >
      {/* Reviewer row */}
      <View className="flex-row items-center mb-3">
        <Avatar name={item.reviewerName} />
        <View className="flex-1 ml-3">
          <Text className="text-dark font-semibold">{item.reviewerName}</Text>
          <Text className="text-text-muted text-sm">{formatDate(item.date)}</Text>
        </View>
        <StarRating rating={item.rating} />
      </View>

      {/* Comment */}
      <Text className="text-text-secondary text-sm leading-5">
        {item.comment}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <MessageSquare size={48} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-base mt-4">
              No reviews yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
