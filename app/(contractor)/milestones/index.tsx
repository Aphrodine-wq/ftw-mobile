import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  DollarSign,
  Calendar,
  Flag,
  Camera,
  Send,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { mockProjects } from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import type { Project, ProjectMilestone } from "@src/types";

// --- Status helpers ---

function getMilestoneStatusLabel(status: string): string {
  switch (status) {
    case "paid": return "Paid";
    case "completed": return "Completed";
    case "in_progress": return "In Progress";
    case "pending": return "Pending";
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function getMilestoneBadgeVariant(status: string): "success" | "default" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "paid": return "success";
    case "completed": return "default";
    case "in_progress": return "danger";
    case "pending": return "neutral";
    default: return "neutral";
  }
}

function getMilestoneIcon(status: string) {
  switch (status) {
    case "paid": return <CheckCircle2 size={20} color="#059669" />;
    case "completed": return <CheckCircle2 size={20} color="#3B82F6" />;
    case "in_progress": return <Clock size={20} color={BRAND.colors.primary} />;
    default: return <Circle size={20} color={BRAND.colors.textMuted} />;
  }
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const due = new Date(dateStr);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysLabel(dateStr: string): { text: string; urgent: boolean } {
  const days = daysUntil(dateStr);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgent: true };
  if (days === 0) return { text: "Due today", urgent: true };
  if (days <= 3) return { text: `${days}d left`, urgent: true };
  if (days <= 7) return { text: `${days}d left`, urgent: false };
  return { text: `${days}d left`, urgent: false };
}

// --- Components ---

function MilestoneRow({
  milestone,
  project,
  tasks,
  isLast,
  isFirst,
}: {
  milestone: ProjectMilestone;
  project: Project;
  tasks: { id: string; title: string; status: string; assignee?: string; dueDate?: string }[];
  isLast: boolean;
  isFirst: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPaid = milestone.status === "paid";
  const isActive = milestone.status === "in_progress";
  const isDone = milestone.status === "completed";
  const daysInfo = !isPaid && !isDone ? getDaysLabel(milestone.dueDate) : null;

  const doneTasks = tasks.filter((t) => t.status === "done").length;

  function handleMarkComplete() {
    Alert.alert("Mark Complete", `Mark "${milestone.title}" as complete and ready for payment?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Mark Complete", onPress: () => {} },
    ]);
  }

  function handleSendInvoice() {
    Alert.alert("Send Invoice", `Send ${formatCurrency(milestone.amount)} invoice to ${project.homeownerName} for "${milestone.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Send Invoice", onPress: () => {} },
    ]);
  }

  return (
    <View className="flex-row">
      {/* Timeline column */}
      <View className="items-center" style={{ width: 40 }}>
        {!isFirst && <View className="w-0.5 bg-border" style={{ height: 12 }} />}
        <View className="my-1">{getMilestoneIcon(milestone.status)}</View>
        {!isLast && <View className="w-0.5 bg-border flex-1" />}
      </View>

      {/* Content */}
      <View className={`flex-1 pb-4 ${!isFirst ? "pt-1" : ""}`}>
        <TouchableOpacity
          className={`bg-white border ${isActive ? "border-brand-600 border-l-4" : "border-border"} p-4`}
          style={{ borderRadius: 4 }}
          activeOpacity={0.7}
          onPress={() => setExpanded(!expanded)}
        >
          {/* Header row */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-2">
              <Text className={`text-base font-bold ${isPaid ? "text-text-muted" : "text-dark"}`} numberOfLines={1}>
                {milestone.title}
              </Text>
              <Text className="text-xs text-text-muted mt-0.5">{project.name}</Text>
            </View>
            <View className="items-end">
              <Text className={`text-base font-bold ${isPaid ? "text-text-muted" : "text-dark"}`}>
                {formatCurrency(milestone.amount)}
              </Text>
              <Badge
                label={getMilestoneStatusLabel(milestone.status)}
                variant={getMilestoneBadgeVariant(milestone.status)}
              />
            </View>
          </View>

          {/* Date + days remaining */}
          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
            <View className="flex-row items-center">
              <Calendar size={13} color={BRAND.colors.textMuted} />
              <Text className="text-xs text-text-muted ml-1.5">
                {milestone.completedDate ? `Completed ${formatDate(milestone.completedDate)}` : `Due ${formatDate(milestone.dueDate)}`}
              </Text>
            </View>
            {daysInfo && (
              <Text className={`text-xs font-bold ${daysInfo.urgent ? "text-brand-600" : "text-text-secondary"}`}>
                {daysInfo.text}
              </Text>
            )}
            {isPaid && milestone.completedDate && (
              <Text className="text-xs text-text-muted">Paid</Text>
            )}
          </View>

          {/* Task progress bar (if tasks exist) */}
          {tasks.length > 0 && (
            <View className="flex-row items-center mt-2">
              <View className="flex-1 bg-gray-100 h-1.5 mr-2">
                <View className="h-1.5" style={{ width: `${tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0}%`, backgroundColor: "#059669" }} />
              </View>
              <Text className="text-[10px] text-text-muted">{doneTasks}/{tasks.length} tasks</Text>
            </View>
          )}

          {/* Expand indicator */}
          <View className="flex-row items-center justify-center mt-2">
            {expanded ? <ChevronDown size={14} color={BRAND.colors.textMuted} /> : <ChevronRight size={14} color={BRAND.colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* Expanded content */}
        {expanded && (
          <View className="bg-white border border-border rounded border-t-0 px-4 pb-4" style={{ borderRadius: 4 }}>
            {/* Tasks */}
            {tasks.length > 0 && (
              <View className="mb-3">
                <Text className="text-xs text-text-muted uppercase font-bold tracking-wide mb-2">Tasks</Text>
                {tasks.map((task) => (
                  <View key={task.id} className="flex-row items-center py-1.5">
                    {task.status === "done" ? (
                      <CheckCircle2 size={15} color="#059669" />
                    ) : task.status === "in_progress" ? (
                      <Clock size={15} color={BRAND.colors.primary} />
                    ) : (
                      <Circle size={15} color={BRAND.colors.textMuted} />
                    )}
                    <Text className={`text-sm ml-2 flex-1 ${task.status === "done" ? "text-text-muted line-through" : "text-dark"}`} numberOfLines={1}>
                      {task.title}
                    </Text>
                    {task.assignee && <Text className="text-xs text-text-muted ml-2">{task.assignee}</Text>}
                    {task.dueDate && <Text className="text-xs text-text-muted ml-2">{formatDate(task.dueDate)}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* Payment Info */}
            <View className="bg-gray-50 border border-border p-3 mb-3" style={{ borderRadius: 4 }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-text-muted">Milestone Payment</Text>
                <Text className="text-sm font-bold text-dark">{formatCurrency(milestone.amount)}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-xs text-text-muted">Client</Text>
                <Text className="text-sm text-dark">{project.homeownerName}</Text>
              </View>
            </View>

            {/* Action buttons */}
            {isActive && (
              <View className="flex-row" style={{ gap: 8 }}>
                <TouchableOpacity
                  className="flex-1 bg-white border border-border rounded py-3 flex-row items-center justify-center"
                  style={{ borderRadius: 4 }}
                  activeOpacity={0.7}
                  onPress={handleMarkComplete}
                >
                  <CheckCircle2 size={16} color={BRAND.colors.dark} />
                  <Text className="text-dark font-bold text-xs ml-1.5">Mark Complete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-white border border-border rounded py-3 flex-row items-center justify-center"
                  style={{ borderRadius: 4 }}
                  activeOpacity={0.7}
                >
                  <Camera size={16} color={BRAND.colors.dark} />
                  <Text className="text-dark font-bold text-xs ml-1.5">Add Photos</Text>
                </TouchableOpacity>
              </View>
            )}
            {isDone && (
              <TouchableOpacity
                className="bg-brand-600 py-3 flex-row items-center justify-center"
                style={{ borderRadius: 4 }}
                activeOpacity={0.7}
                onPress={handleSendInvoice}
              >
                <Send size={16} color="#FFFFFF" />
                <Text className="text-white font-bold text-sm ml-2">Send Invoice — {formatCurrency(milestone.amount)}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function ProjectSection({ project }: { project: Project }) {
  const paidAmount = project.milestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0);
  const remaining = project.budget - paidAmount;
  const paidPct = project.budget > 0 ? Math.round((paidAmount / project.budget) * 100) : 0;
  const activeMilestones = project.milestones.filter((m) => m.status === "in_progress").length;
  const tasksPerMs = Math.ceil((project.tasks?.length || 0) / project.milestones.length);

  return (
    <View className="mb-6">
      {/* Project Header */}
      <View className="mx-5 bg-white border border-border rounded p-4 mb-3" style={{ borderRadius: 4 }}>
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-lg font-bold text-dark flex-1 mr-2" numberOfLines={1}>{project.name}</Text>
          <Badge label={project.status === "active" ? "Active" : "Completed"} variant={project.status === "active" ? "default" : "success"} />
        </View>
        <Text className="text-sm text-text-secondary">{project.homeownerName}</Text>

        {/* Payment summary */}
        <View className="flex-row mt-3 pt-3 border-t border-border">
          <View className="flex-1">
            <Text className="text-xs text-text-muted">Contract</Text>
            <Text className="text-sm font-bold text-dark">{formatCurrency(project.budget)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-text-muted">Paid</Text>
            <Text className="text-sm font-bold text-dark">{formatCurrency(paidAmount)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-text-muted">Remaining</Text>
            <Text className="text-sm font-bold text-brand-600">{formatCurrency(remaining)}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="mt-2">
          <View className="bg-gray-100 h-2 w-full">
            <View className="h-2" style={{ width: `${paidPct}%`, backgroundColor: "#059669" }} />
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-[10px] text-text-muted">{paidPct}% paid</Text>
            <Text className="text-[10px] text-text-muted">{activeMilestones} active milestone{activeMilestones !== 1 ? "s" : ""}</Text>
          </View>
        </View>
      </View>

      {/* Timeline milestones */}
      <View className="mx-5">
        {project.milestones.map((ms, idx) => {
          const startIdx = idx * tasksPerMs;
          const endIdx = Math.min(startIdx + tasksPerMs, project.tasks?.length || 0);
          const msTasks = project.tasks?.slice(startIdx, endIdx) || [];
          return (
            <MilestoneRow
              key={ms.id}
              milestone={ms}
              project={project}
              tasks={msTasks}
              isFirst={idx === 0}
              isLast={idx === project.milestones.length - 1}
            />
          );
        })}
      </View>
    </View>
  );
}

// --- Main Screen ---

export default function MilestonesScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const projects = (mockProjects as Project[]).filter((p) => p.milestones && p.milestones.length > 0);

  const totalContract = projects.reduce((s, p) => s + p.budget, 0);
  const totalPaid = projects.reduce((s, p) => s + p.milestones.filter((m) => m.status === "paid").reduce((ss, m) => ss + m.amount, 0), 0);
  const totalRemaining = totalContract - totalPaid;
  const activeMilestones = projects.reduce((s, p) => s + p.milestones.filter((m) => m.status === "in_progress").length, 0);
  const totalMilestones = projects.reduce((s, p) => s + p.milestones.length, 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 200);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
              <ArrowLeft size={24} color={BRAND.colors.dark} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-dark">Milestones</Text>
          </View>
        </View>

        {/* Summary */}
        <View className="mx-5 mb-4 bg-white border border-border p-4" style={{ borderRadius: 4 }}>
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-text-muted text-xs uppercase tracking-wide">Total Pipeline</Text>
              <Text className="text-dark font-bold" style={{ fontSize: 28 }}>{formatCurrency(totalContract)}</Text>
            </View>
            <View className="items-end">
              <Text className="text-text-muted text-xs">{activeMilestones} active</Text>
              <Text className="text-text-muted text-xs">{totalMilestones} total</Text>
            </View>
          </View>
          <View className="flex-row" style={{ gap: 8 }}>
            <View className="flex-1 bg-surface p-3 items-center">
              <Text className="text-dark font-bold text-lg">{formatCurrency(totalPaid)}</Text>
              <Text className="text-text-muted text-xs mt-0.5">Collected</Text>
            </View>
            <View className="flex-1 bg-surface p-3 items-center">
              <Text className="text-dark font-bold text-lg">{formatCurrency(totalRemaining)}</Text>
              <Text className="text-text-muted text-xs mt-0.5">Remaining</Text>
            </View>
            <View className="flex-1 bg-surface p-3 items-center">
              <Text className="text-dark font-bold text-lg">{totalContract > 0 ? Math.round((totalPaid / totalContract) * 100) : 0}%</Text>
              <Text className="text-text-muted text-xs mt-0.5">Complete</Text>
            </View>
          </View>
        </View>

        {/* Projects with milestone timelines */}
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectSection key={project.id} project={project} />
          ))
        ) : (
          <View className="items-center justify-center py-16 px-5">
            <Flag size={48} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-base mt-4">No active milestones</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
