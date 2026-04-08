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
import { useProjects } from "@src/api/hooks";
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
  const { data: projects = [] as Project[], refetch, isRefetching } = useProjects();

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
        className="bg-white border border-border overflow-hidden flex-1"
        style={{ borderRadius: 4 }}
        activeOpacity={0.7}
        onPress={() => router.push(`/(contractor)/projects/${item.id}` as any)}
      >
        {/* Thumbnail */}
        {item.thumbnail && (
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: "100%", height: 150 }}
            resizeMode="cover"
          />
        )}

        <View className="p-3">
          {/* Status */}
          <Badge
            label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            variant={getStatusVariant(item.status)}
          />

          {/* Title */}
          <Text className="font-bold text-dark mt-1.5" style={{ fontSize: 17 }} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Client */}
          <Text className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>{item.homeownerName}</Text>

          {/* Budget Bar */}
          <View className="mt-2.5">
            <View className="h-2 bg-gray-100 overflow-hidden" style={{ borderRadius: 99 }}>
              <View
                className="h-full"
                style={{
                  width: `${progress}%`,
                  borderRadius: 99,
                  backgroundColor: item.status === "completed" ? "#10B981"
                    : progress > 90 ? "#F59E0B"
                    : BRAND.colors.primary,
                }}
              />
            </View>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-text-secondary font-bold" style={{ fontSize: 12 }}>{progress}%</Text>
              <Text className="text-dark font-bold" style={{ fontSize: 12 }}>
                {formatCurrency(item.spent)}
              </Text>
            </View>
          </View>

          {/* Tasks */}
          {totalTasks > 0 && (
            <Text className="text-text-secondary mt-1.5" style={{ fontSize: 12 }}>
              {doneTasks}/{totalTasks} tasks
            </Text>
          )}

          {/* FairRecord for completed */}
          {item.status === "completed" && (
            <View className="flex-row items-center mt-2 pt-2 border-t border-border">
              <Shield size={12} color={BRAND.colors.primary} />
              <Text className="font-bold ml-1" style={{ fontSize: 11, color: BRAND.colors.primary }}>FairRecord</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRow = ({ item }: { item: Project[] }) => (
    <View className="flex-row px-4 mb-3" style={{ gap: 10 }}>
      {item.map((project) => (
        <View key={project.id} style={{ flex: 1 }}>
          {renderProject({ item: project })}
        </View>
      ))}
      {item.length === 1 && <View style={{ flex: 1 }} />}
    </View>
  );

  // Chunk projects into pairs for two-column layout
  const rows = [];
  for (let i = 0; i < projects.length; i += 2) {
    rows.push(projects.slice(i, i + 2));
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <FlatList
        data={rows}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderRow}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <FolderOpen size={48} color={BRAND.colors.textSecondary} />
            <Text className="text-text-secondary text-base mt-4">No projects yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
