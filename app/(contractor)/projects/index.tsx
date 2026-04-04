import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  FolderOpen,
  ChevronRight,
  Shield,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { fetchProjects } from "@src/api/data";
import { mockProjects } from "@src/lib/mock-data";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import type { Project } from "@src/types";

function getStatusVariant(
  status: Project["status"],
): "neutral" | "default" | "success" | "warning" {
  switch (status) {
    case "planning": return "neutral";
    case "active": return "default";
    case "completed": return "success";
    case "cancelled": return "warning";
  }
}

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(mockProjects as Project[]);
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
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-dark">Projects</Text>
      </View>
    </View>
  );

  const renderProject = ({ item }: { item: Project }) => {
    const progress = item.budget > 0
      ? Math.min(Math.round((item.spent / item.budget) * 100), 100)
      : 0;

    const doneTasks = item.tasks?.filter((t) => t.status === "done").length || 0;
    const totalTasks = item.tasks?.length || 0;

    return (
      <TouchableOpacity
        className="bg-white border border-border rounded mx-5 mb-3 overflow-hidden"
        style={{ borderRadius: 4 }}
        activeOpacity={0.7}
        onPress={() => router.push(`/(contractor)/projects/${item.id}` as any)}
      >
        {/* Thumbnail */}
        {item.thumbnail && (
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: "100%", height: 140 }}
            resizeMode="cover"
          />
        )}

        <View className="p-4">
          {/* Title + Status */}
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-bold text-dark flex-1 mr-2" numberOfLines={1}>
              {item.name}
            </Text>
            <Badge
              label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              variant={getStatusVariant(item.status)}
            />
          </View>

          {/* Client + Description */}
          <Text className="text-sm text-text-secondary">{item.homeownerName}</Text>
          <Text className="text-xs text-text-muted mt-1" numberOfLines={1}>
            {item.description}
          </Text>

          {/* Budget Bar */}
          <View className="mt-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs text-text-muted">{progress}%</Text>
              <Text className="text-sm font-bold text-dark">
                {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
              </Text>
            </View>
            <View className="h-2 bg-gray-100 overflow-hidden">
              <View
                className={`h-full ${
                  item.status === "completed" ? "bg-emerald-500"
                    : progress > 90 ? "bg-amber-500"
                    : "bg-brand-600"
                }`}
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
            {totalTasks > 0 ? (
              <Text className="text-xs text-text-muted">
                {doneTasks}/{totalTasks} tasks done
              </Text>
            ) : (
              <View />
            )}
            <ChevronRight size={16} color={BRAND.colors.textMuted} />
          </View>

          {/* FairRecord for completed */}
          {item.status === "completed" && (
            <TouchableOpacity className="flex-row items-center mt-2 pt-2 border-t border-border" activeOpacity={0.7}>
              <Shield size={14} color={BRAND.colors.primary} />
              <Text className="text-brand-600 text-xs font-bold ml-1.5">View FairRecord</Text>
            </TouchableOpacity>
          )}
        </View>
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
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <FolderOpen size={48} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-base mt-4">No projects yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
