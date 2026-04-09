import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Star,
  ChevronLeft,
  Plus,
  X,
} from "lucide-react-native";
import { useReviews, useSubmitReview, useJobs } from "@src/api/hooks";
import { formatDate, getInitials } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";
import type { Review } from "@src/types";

function RatingStars({ rating, size = 14, interactive = false, onRate }: { rating: number; size?: number; interactive?: boolean; onRate?: (r: number) => void }) {
  return (
    <View className="flex-row items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!interactive}
          onPress={() => onRate?.(star)}
          activeOpacity={interactive ? 0.7 : 1}
          style={{ marginRight: 2, padding: interactive ? 4 : 0 }}
        >
          <Star
            size={size}
            color={star <= rating ? "#D97706" : BRAND.colors.border}
            fill={star <= rating ? "#D97706" : "transparent"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function HomeownerReviews() {
  const { data: reviews = [] as Review[] } = useReviews();
  const { data: jobs = [] } = useJobs();
  const submitReview = useSubmitReview();

  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Filter completed jobs for review submission
  const completedJobs = (jobs as any[]).filter((j: any) => j.status === "completed");

  const handleSubmit = useCallback(async () => {
    if (!selectedJobId || rating === 0) {
      Alert.alert("Missing Info", "Select a job and provide a rating.");
      return;
    }

    try {
      await submitReview.mutateAsync({
        contractorId: "", // Backend resolves from job
        jobId: selectedJobId,
        rating,
        comment: comment.trim(),
      });
      setShowModal(false);
      setRating(0);
      setComment("");
      setSelectedJobId(null);
      Alert.alert("Review Submitted", "Your review has been submitted.");
    } catch {
      Alert.alert("Error", "Failed to submit review. Please try again.");
    }
  }, [selectedJobId, rating, comment, submitReview]);

  const renderReview = useCallback(
    ({ item }: { item: Review }) => (
      <View style={s.card}>
        <View className="flex-row items-center mb-3">
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
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
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

      {/* Leave Review Button */}
      <View style={{ paddingHorizontal: 20, marginTop: 12, marginBottom: 8 }}>
        <TouchableOpacity
          style={s.leaveReviewBtn}
          activeOpacity={0.8}
          onPress={() => setShowModal(true)}
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

      {/* Review Submission Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text style={{ fontSize: 20, fontWeight: "700", color: BRAND.colors.textPrimary }}>
                Leave a Review
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)} activeOpacity={0.7}>
                <X size={24} color={BRAND.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Job Selector */}
            <Text style={s.label}>Select Job</Text>
            {completedJobs.length > 0 ? (
              <View style={{ marginBottom: 16 }}>
                {completedJobs.map((job: any) => (
                  <TouchableOpacity
                    key={job.id}
                    style={[
                      s.jobOption,
                      selectedJobId === job.id && s.jobOptionActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedJobId(job.id)}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: selectedJobId === job.id ? "700" : "500",
                        color: selectedJobId === job.id ? BRAND.colors.primary : BRAND.colors.textPrimary,
                      }}
                      numberOfLines={1}
                    >
                      {job.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={{ fontSize: 13, color: BRAND.colors.textMuted, marginBottom: 16 }}>
                No completed jobs available for review.
              </Text>
            )}

            {/* Rating */}
            <Text style={s.label}>Rating</Text>
            <View style={{ marginBottom: 16 }}>
              <RatingStars rating={rating} size={32} interactive onRate={setRating} />
              {rating > 0 && (
                <Text style={{ fontSize: 13, color: BRAND.colors.textSecondary, marginTop: 4 }}>
                  {rating === 5 ? "Excellent" : rating === 4 ? "Great" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                </Text>
              )}
            </View>

            {/* Comment */}
            <Text style={s.label}>Comment</Text>
            <TextInput
              style={s.commentInput}
              placeholder="How was your experience with this contractor?"
              placeholderTextColor={BRAND.colors.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Submit */}
            <TouchableOpacity
              style={[s.submitBtn, (rating === 0 || submitReview.isPending) && s.submitBtnDisabled]}
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={rating === 0 || submitReview.isPending}
            >
              {submitReview.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
                  Submit Review
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    padding: 24,
    maxHeight: "85%",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND.colors.textSecondary,
    marginBottom: 8,
  },
  jobOption: {
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  jobOptionActive: {
    borderColor: BRAND.colors.primary,
    backgroundColor: "#FDF2F3",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    padding: 12,
    fontSize: 14,
    color: BRAND.colors.textPrimary,
    minHeight: 100,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: BRAND.colors.primary,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    backgroundColor: BRAND.colors.border,
  },
});
