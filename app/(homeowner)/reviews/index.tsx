import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Star,
  ChevronLeft,
  Plus,
} from "lucide-react-native";
import { fetchReviews } from "@src/api/data";
import { mockReviews } from "@src/lib/mock-data";
import { formatDate, getInitials } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

type Review = (typeof mockReviews)[number];

function RatingStars({ rating }: { rating: number }) {
  return (
    <View className="flex-row items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          color={star <= rating ? "#D97706" : BRAND.colors.border}
          fill={star <= rating ? "#D97706" : "transparent"}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );
}

export default function HomeownerReviews() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  useEffect(() => {
    fetchReviews().then((data) => setReviews(data as Review[]));
  }, []);

  const renderReview = useCallback(
    ({ item }: { item: Review }) => (
      <View className="bg-white rounded-2xl p-4 mx-5 mb-3">
        <View className="flex-row items-center mb-2">
          {/* Contractor avatar */}
          <View className="w-10 h-10 rounded-full bg-brand-600 items-center justify-center mr-3">
            <Text className="text-white font-bold text-sm">
              {getInitials(item.reviewerName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-dark font-semibold text-base">
              {item.reviewerName}
            </Text>
            <RatingStars rating={item.rating} />
          </View>
          <Text className="text-text-muted text-xs">
            {formatDate(item.date)}
          </Text>
        </View>

        <Text className="text-text-secondary text-sm leading-5">
          {item.comment}
        </Text>
      </View>
    ),
    []
  );

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
        <Text className="text-2xl font-bold text-dark flex-1">
          My Reviews
        </Text>
        <View className="bg-brand-50 rounded-full px-3 py-1">
          <Text className="text-brand-600 text-sm font-medium">
            {reviews.length}
          </Text>
        </View>
      </View>

      {/* Leave New Review Button */}
      <View className="px-5 mt-3 mb-2">
        <TouchableOpacity
          className="bg-brand-600 rounded-xl py-3 flex-row items-center justify-center"
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold text-base ml-2">
            Leave a Review
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-12 px-5">
            <Star size={40} color={BRAND.colors.textMuted} />
            <Text className="text-text-secondary text-base mt-3">
              No reviews yet. Complete a project to leave a review.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
