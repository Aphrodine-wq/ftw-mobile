import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  FolderOpen,
  CalendarDays,
  Shield,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { fetchProjects } from "@src/api/data";
import { mockProjects } from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import type { Project } from "@src/types";

function getStatusVariant(
  status: Project["status"],
): "neutral" | "default" | "success" | "warning" {
  switch (status) {
    case "planning":
      return "neutral";
    case "active":
      return "default";
    case "completed":
      return "success";
    case "cancelled":
      return "warning";
  }
}

function getStatusLabel(status: Project["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchProjects();
    setProjects(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const renderHeader = () => (
    <View className="px-5 pt-4 pb-4">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="mr-3"
        >
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-dark">Projects</Text>
      </View>
    </View>
  );

  const renderProject = ({ item }: { item: Project }) => {
    const progress =
      item.budget > 0
        ? Math.min(Math.round((item.spent / item.budget) * 100), 100)
        : 0;

    return (
      <TouchableOpacity
        className="bg-white border border-border mx-5 mb-3 p-4"
        style={{ borderRadius: 0 }}
        activeOpacity={0.7}
      >
        {/* Title + Status */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-dark font-bold text-base">{item.name}</Text>
            <Text className="text-text-secondary text-sm mt-0.5">
              {item.contractorName} / {item.homeownerName}
            </Text>
          </View>
          <Badge
            label={getStatusLabel(item.status)}
            variant={getStatusVariant(item.status)}
          />
        </View>

        {/* Budget Bar */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-text-secondary text-sm">Budget</Text>
            <Text className="text-dark text-sm font-semibold">
              {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
            </Text>
          </View>
          <View
            className="h-2 bg-gray-100 overflow-hidden"
            style={{ borderRadius: 0 }}
          >
            <View
              className={`h-full ${
                item.status === "completed"
                  ? "bg-emerald-500"
                  : progress > 90
                  ? "bg-amber-500"
                  : "bg-brand-600"
              }`}
              style={{ width: `${progress}%`, borderRadius: 0 }}
            />
          </View>
          {item.status === "active" && (
            <Text className="text-text-muted text-xs mt-1">
              {progress}% spent
            </Text>
          )}
        </View>

        {/* Dates */}
        <View className="flex-row items-center">
          <CalendarDays size={14} color={BRAND.colors.textMuted} />
          <Text className="text-text-muted text-sm ml-1.5">
            {formatDate(item.startDate)}
            {item.endDate ? ` — ${formatDate(item.endDate)}` : " — Ongoing"}
          </Text>
        </View>

        {/* FairRecord Link for completed */}
        {item.status === "completed" && (
          <TouchableOpacity
            className="flex-row items-center mt-3 pt-3 border-t border-border"
            activeOpacity={0.7}
          >
            <Shield size={16} color={BRAND.colors.primary} />
            <Text className="text-brand-600 text-sm font-semibold ml-1.5">
              View FairRecord
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <FolderOpen size={48} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-base mt-4">
              No projects yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
