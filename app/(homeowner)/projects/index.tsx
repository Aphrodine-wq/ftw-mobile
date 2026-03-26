import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  Circle,
  FolderOpen,
} from "lucide-react-native";
import { fetchProjects } from "@src/api/data";
import { mockProjects } from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { router } from "expo-router";

type Project = (typeof mockProjects)[number];

const STATUS_COLORS: Record<string, { bg: string; text: string; variant: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", variant: "Active" },
  completed: { bg: "bg-gray-100", text: "text-gray-600", variant: "Completed" },
  paused: { bg: "bg-amber-50", text: "text-amber-700", variant: "Paused" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", variant: "Cancelled" },
};

// Mock milestones per project
const PROJECT_MILESTONES: Record<string, { label: string; done: boolean }[]> = {
  p1: [
    { label: "Demo and removal", done: true },
    { label: "Rough-in (plumbing, electrical)", done: true },
    { label: "Cabinet installation", done: false },
    { label: "Countertops and backsplash", done: false },
    { label: "Final inspection", done: false },
  ],
  p2: [
    { label: "Tear-off existing shingles", done: true },
    { label: "Inspect and repair decking", done: false },
    { label: "Install underlayment", done: false },
    { label: "Shingle installation", done: false },
    { label: "Final cleanup and inspection", done: false },
  ],
  p3: [
    { label: "Surface prep and priming", done: true },
    { label: "First coat", done: true },
    { label: "Second coat and trim", done: true },
    { label: "Touch-ups and walkthrough", done: true },
  ],
};

export default function HomeownerProjects() {
  const [projects, setProjects] = useState<Project[]>(mockProjects as Project[]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects().then((data) => setProjects(data as Project[]));
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const renderProject = useCallback(
    ({ item }: { item: Project }) => {
      const isExpanded = expandedId === item.id;
      const statusConfig = STATUS_COLORS[item.status] || STATUS_COLORS.active;
      const progress = item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
      const milestones = PROJECT_MILESTONES[item.id] || [];

      return (
        <TouchableOpacity
          className="bg-white rounded-2xl mx-5 mb-3 overflow-hidden"
          activeOpacity={0.7}
          onPress={() => toggleExpand(item.id)}
        >
          <View className="p-4">
            {/* Title + Status */}
            <View className="flex-row items-start justify-between mb-2">
              <Text className="text-base font-semibold text-dark flex-1 mr-2">
                {item.name}
              </Text>
              <View className={`${statusConfig.bg} rounded-full px-2.5 py-0.5`}>
                <Text
                  className={`${statusConfig.text} text-xs font-semibold`}
                >
                  {statusConfig.variant}
                </Text>
              </View>
            </View>

            {/* Contractor */}
            <Text className="text-text-secondary text-sm mb-3">
              {item.contractorName}
            </Text>

            {/* Budget Progress */}
            <View className="mb-2">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-text-secondary text-sm">
                  {formatCurrency(item.spent)} of {formatCurrency(item.budget)}
                </Text>
                <Text className="text-text-muted text-xs">
                  {Math.round(progress)}%
                </Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-brand-600 rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </View>
            </View>

            {/* Start Date + Expand */}
            <View className="flex-row items-center justify-between mt-1">
              <View className="flex-row items-center">
                <Calendar size={14} color={BRAND.colors.textMuted} />
                <Text className="text-text-muted text-xs ml-1.5">
                  Started {formatDate(item.startDate)}
                </Text>
              </View>
              {milestones.length > 0 && (
                isExpanded ? (
                  <ChevronUp size={18} color={BRAND.colors.textMuted} />
                ) : (
                  <ChevronDown size={18} color={BRAND.colors.textMuted} />
                )
              )}
            </View>
          </View>

          {/* Milestones (expanded) */}
          {isExpanded && milestones.length > 0 && (
            <View className="border-t border-border px-4 py-3">
              <Text className="text-sm font-semibold text-dark mb-2">
                Milestones
              </Text>
              {milestones.map((milestone, i) => (
                <View
                  key={i}
                  className="flex-row items-center py-1.5"
                >
                  {milestone.done ? (
                    <CheckCircle2
                      size={16}
                      color="#059669"
                      fill="#D1FAE5"
                    />
                  ) : (
                    <Circle size={16} color={BRAND.colors.textMuted} />
                  )}
                  <Text
                    className={`ml-2.5 text-sm ${
                      milestone.done
                        ? "text-text-secondary line-through"
                        : "text-dark"
                    }`}
                  >
                    {milestone.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [expandedId, toggleExpand]
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
          My Projects
        </Text>
        <View className="bg-brand-50 rounded-full px-3 py-1">
          <Text className="text-brand-600 text-sm font-medium">
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
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-12 px-5">
            <FolderOpen size={40} color={BRAND.colors.textMuted} />
            <Text className="text-text-secondary text-base mt-3">
              No projects yet. Post a job to get started.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
