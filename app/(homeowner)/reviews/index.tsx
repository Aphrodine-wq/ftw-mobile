import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Star,
  ChevronLeft,
  Plus,
} from "lucide-react-native";
import { mockReviews } from "@src/lib/mock-data";
import { useReviews } from "@src/api/hooks";
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
  const { data: reviews = mockReviews as Review[] } = useReviews();

  const renderReview = useCallback(
    ({ item }: { item: Review }) => (
      <View style={s.card}>
        <View className="flex-row items-center mb-3">
          {/* Avatar */}
          <View style={s.avatar}>
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
              {getInitials(item.reviewerName)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: BRAND.colors.textPrimary }}>
              {item.reviewerName}
            </Text>
            <RatingStars rating={item.rating} />
          </View>
          <Text style={{ fontSize: 12, color: BRAND.colors.textMuted }}>
            {formatDate(item.date)}
          </Text>
        </View>

        <Text style={{ fontSize: 14, color: BRAND.colors.textSecondary, lineHeight: 20 }}>
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
        <Text style={{ fontSize: 24, fontWeight: "700", color: BRAND.colors.textPrimary, flex: 1 }}>
          My Reviews
        </Text>
        <View style={s.countBadge}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: BRAND.colors.primary }}>
            {reviews.length}
          </Text>
        </View>
      </View>

      {/* Leave New Review Button */}
      <View style={{ paddingHorizontal: 20, marginTop: 12, marginBottom: 8 }}>
        <TouchableOpacity
          style={s.leaveReviewBtn}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 15, marginLeft: 8 }}>
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
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 90 }}
        ListEmptyComponent={
          <View className="items-center py-12 px-5">
            <Star size={40} color={BRAND.colors.textMuted} />
            <Text style={{ color: BRAND.colors.textSecondary, fontSize: 15, marginTop: 12 }}>
              No reviews yet. Complete a project to leave a review.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: BRAND.colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  countBadge: {
    backgroundColor: "#FDF2F3",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  leaveReviewBtn: {
    backgroundColor: BRAND.colors.primary,
    borderRadius: 4,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
