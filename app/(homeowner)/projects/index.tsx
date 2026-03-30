import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Calendar,
  FolderOpen,
} from "lucide-react-native";
import { fetchProjects } from "@src/api/data";
import { mockProjects } from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import { router } from "expo-router";

type Project = (typeof mockProjects)[number];
type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral";

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: "Active", variant: "success" },
  completed: { label: "Completed", variant: "neutral" },
  paused: { label: "Paused", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

export default function HomeownerProjects() {
  const [projects, setProjects] = useState<Project[]>(mockProjects as Project[]);

  useEffect(() => {
    fetchProjects().then((data) => setProjects(data as Project[]));
  }, []);

  const renderProject = useCallback(
    ({ item }: { item: Project }) => {
      const statusConfig = STATUS_MAP[item.status] || STATUS_MAP.active;
      const progress = item.budget > 0 ? (item.spent / item.budget) * 100 : 0;

      return (
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.7}
        >
          {/* Title + Status */}
          <View className="flex-row items-start justify-between mb-2">
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: BRAND.colors.textPrimary, flex: 1, marginRight: 8 }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Badge label={statusConfig.label} variant={statusConfig.variant} square />
          </View>

          {/* Contractor */}
          <Text style={{ fontSize: 13, color: BRAND.colors.textMuted, marginBottom: 10 }}>
            {item.contractorName}
          </Text>

          {/* Budget Progress */}
          <View className="flex-row items-center justify-between mb-1.5">
            <Text style={{ fontSize: 13, color: BRAND.colors.textSecondary }}>
              {formatCurrency(item.spent)} of {formatCurrency(item.budget)}
            </Text>
            <Text style={{ fontSize: 12, color: BRAND.colors.textMuted }}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={s.progressTrack}>
            <View
              style={[s.progressFill, { width: `${Math.min(progress, 100)}%` }]}
            />
          </View>

          {/* Date Range */}
          <View className="flex-row items-center mt-3">
            <Calendar size={13} color={BRAND.colors.textMuted} />
            <Text style={{ fontSize: 12, color: BRAND.colors.textMuted, marginLeft: 6 }}>
              Started {formatDate(item.startDate)}
              {item.endDate ? ` -- Ended ${formatDate(item.endDate)}` : ""}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
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
          My Projects
        </Text>
        <View style={s.countBadge}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: BRAND.colors.primary }}>
            {projects.length}
          </Text>
        </View>
      </View>

      {/* Project List */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 90 }}
        ListEmptyComponent={
          <View className="items-center py-12 px-5">
            <FolderOpen size={40} color={BRAND.colors.textMuted} />
            <Text style={{ color: BRAND.colors.textSecondary, fontSize: 15, marginTop: 12 }}>
              No projects yet. Post a job to get started.
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
    borderRadius: 0,
    padding: 16,
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 0,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BRAND.colors.primary,
    borderRadius: 0,
  },
  countBadge: {
    backgroundColor: "#FDF2F3",
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
