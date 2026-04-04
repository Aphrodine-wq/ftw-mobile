import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Camera,
  FileSignature,
  Receipt,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  MessageCircle,
  Activity,
  ClipboardList,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { mockProjects } from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import type { Project, ProjectMilestone, ProjectTask, ProjectDocument, ProjectActivity } from "@src/types";

type Tab = "overview" | "milestones" | "tasks" | "documents" | "activity";

function getStatusVariant(status: Project["status"]): "neutral" | "default" | "success" | "warning" {
  switch (status) {
    case "planning": return "neutral";
    case "active": return "default";
    case "completed": return "success";
    case "cancelled": return "warning";
  }
}

function getMilestoneIcon(status: ProjectMilestone["status"]) {
  switch (status) {
    case "paid": return { icon: CheckCircle2, color: "#059669" };
    case "completed": return { icon: CheckCircle2, color: BRAND.colors.primary };
    case "in_progress": return { icon: Clock, color: "#D97706" };
    default: return { icon: Circle, color: BRAND.colors.textMuted };
  }
}

function getTaskIcon(status: ProjectTask["status"]) {
  switch (status) {
    case "done": return { icon: CheckCircle2, color: "#059669" };
    case "in_progress": return { icon: Clock, color: "#D97706" };
    default: return { icon: Circle, color: BRAND.colors.textMuted };
  }
}

function getDocIcon(type: ProjectDocument["type"]) {
  switch (type) {
    case "photo": return Camera;
    case "contract": return FileSignature;
    case "invoice": return Receipt;
    case "permit": return Shield;
    case "inspection": return ClipboardList;
    case "change_order": return AlertTriangle;
    default: return FileText;
  }
}

function getActivityIcon(type: ProjectActivity["type"]) {
  switch (type) {
    case "milestone": return CheckCircle2;
    case "payment": return DollarSign;
    case "message": return MessageCircle;
    case "document": return FileText;
    case "task": return ClipboardList;
    default: return Activity;
  }
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(dateStr);
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const project = mockProjects.find((p) => p.id === id) as Project | undefined;

  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <Text className="text-text-muted text-base">Project not found</Text>
      </SafeAreaView>
    );
  }

  const progress = project.budget > 0
    ? Math.min(Math.round((project.spent / project.budget) * 100), 100)
    : 0;

  const paidMilestones = project.milestones.filter((m) => m.status === "paid").length;
  const totalMilestones = project.milestones.length;
  const doneTasks = project.tasks.filter((t) => t.status === "done").length;
  const totalTasks = project.tasks.length;

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "milestones", label: `Milestones (${totalMilestones})` },
    { key: "tasks", label: `Tasks (${totalTasks})` },
    { key: "documents", label: `Docs (${project.documents.length})` },
    { key: "activity", label: "Activity" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-3 pb-3 border-b border-border bg-white">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-xl font-bold text-dark flex-1 mr-2" numberOfLines={1}>
                {project.name}
              </Text>
              <Badge label={project.status.charAt(0).toUpperCase() + project.status.slice(1)} variant={getStatusVariant(project.status)} />
            </View>
            <Text className="text-sm text-text-muted mt-0.5">{project.category}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <MapPin size={13} color={BRAND.colors.textMuted} />
          <Text className="text-xs text-text-muted ml-1">{project.address}</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View className="bg-white border-b border-border">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`px-4 py-3 mr-1 ${activeTab === tab.key ? "border-b-2 border-brand-600" : ""}`}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-bold ${activeTab === tab.key ? "text-brand-600" : "text-text-muted"}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === "overview" && (
          <View>
            {/* Budget Summary */}
            <View className="bg-white border-b border-border p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-bold text-dark">Budget</Text>
                <Text className="text-lg font-bold text-dark">
                  {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                </Text>
              </View>
              <View className="bg-gray-100 h-3 w-full mb-1">
                <View
                  className="h-3"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: project.status === "completed" ? "#059669" : progress > 90 ? "#D97706" : BRAND.colors.primary,
                  }}
                />
              </View>
              <Text className="text-xs text-text-muted">{progress}% of budget used</Text>
            </View>

            {/* Key Info */}
            <View className="bg-white border-b border-border p-4">
              <View className="flex-row mb-3">
                <View className="flex-1">
                  <Text className="text-xs text-text-muted uppercase tracking-wide">Client</Text>
                  <Text className="text-sm font-bold text-dark mt-0.5">{project.homeownerName}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-text-muted uppercase tracking-wide">Timeline</Text>
                  <Text className="text-sm font-bold text-dark mt-0.5">
                    {formatDate(project.startDate)} — {project.endDate ? formatDate(project.endDate) : "Ongoing"}
                  </Text>
                </View>
              </View>
              <View className="flex-row">
                <View className="flex-1">
                  <Text className="text-xs text-text-muted uppercase tracking-wide">Milestones</Text>
                  <Text className="text-sm font-bold text-dark mt-0.5">{paidMilestones} / {totalMilestones} paid</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-text-muted uppercase tracking-wide">Tasks</Text>
                  <Text className="text-sm font-bold text-dark mt-0.5">{doneTasks} / {totalTasks} done</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View className="bg-white border-b border-border p-4">
              <Text className="text-base font-bold text-dark mb-2">Scope of Work</Text>
              <Text className="text-sm text-text-secondary leading-5">{project.description}</Text>
            </View>

            {/* Upcoming Milestones */}
            <View className="bg-white border-b border-border p-4">
              <Text className="text-base font-bold text-dark mb-3">Upcoming Milestones</Text>
              {project.milestones
                .filter((m) => m.status !== "paid")
                .slice(0, 3)
                .map((ms, i) => {
                  const { icon: Icon, color } = getMilestoneIcon(ms.status);
                  return (
                    <View key={ms.id} className={`flex-row items-center py-2.5 ${i > 0 ? "border-t border-border" : ""}`}>
                      <Icon size={18} color={color} />
                      <View className="flex-1 ml-3">
                        <Text className="text-sm font-bold text-dark">{ms.title}</Text>
                        <Text className="text-xs text-text-muted">Due {formatDate(ms.dueDate)}</Text>
                      </View>
                      <Text className="text-sm font-bold text-dark">{formatCurrency(ms.amount)}</Text>
                    </View>
                  );
                })}
              {project.milestones.filter((m) => m.status !== "paid").length === 0 && (
                <Text className="text-sm text-text-muted">All milestones paid</Text>
              )}
            </View>

            {/* Recent Activity */}
            <View className="bg-white p-4">
              <Text className="text-base font-bold text-dark mb-3">Recent Activity</Text>
              {project.activity.slice(0, 5).map((act, i) => {
                const Icon = getActivityIcon(act.type);
                return (
                  <View key={act.id} className={`flex-row items-start py-2.5 ${i > 0 ? "border-t border-border" : ""}`}>
                    <View className="mt-0.5">
                      <Icon size={16} color={BRAND.colors.textMuted} />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-sm text-dark">{act.description}</Text>
                      <Text className="text-xs text-text-muted mt-0.5">{act.actor} — {relativeTime(act.date)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === "milestones" && (
          <View className="p-4" style={{ gap: 8 }}>
            {project.milestones.map((ms) => {
              const { icon: Icon, color } = getMilestoneIcon(ms.status);
              const statusLabel = ms.status === "paid" ? "Paid" : ms.status === "completed" ? "Complete" : ms.status === "in_progress" ? "In Progress" : "Pending";
              return (
                <View key={ms.id} className="bg-white border border-border rounded p-4">
                  <View className="flex-row items-start">
                    <View className="mt-0.5 mr-3">
                      <Icon size={20} color={color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className={`text-base font-bold ${ms.status === "paid" ? "text-text-muted" : "text-dark"}`}>
                          {ms.title}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-xs text-text-muted">
                          {ms.completedDate ? `Completed ${formatDate(ms.completedDate)}` : `Due ${formatDate(ms.dueDate)}`}
                        </Text>
                        <View className={`px-2 py-0.5 ${ms.status === "paid" ? "bg-green-100" : ms.status === "in_progress" ? "bg-amber-100" : "bg-gray-100"}`}>
                          <Text className={`text-[10px] font-bold ${ms.status === "paid" ? "text-green-700" : ms.status === "in_progress" ? "text-amber-700" : "text-text-secondary"}`}>
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-lg font-bold text-dark mt-2">{formatCurrency(ms.amount)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Milestone Summary */}
            <View className="bg-white border border-border rounded p-4 mt-2">
              <Text className="text-base font-bold text-dark mb-3">Payment Summary</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-text-secondary">Total Contract</Text>
                <Text className="text-sm font-bold text-dark">{formatCurrency(project.budget)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-text-secondary">Paid to Date</Text>
                <Text className="text-sm font-bold text-dark">{formatCurrency(project.spent)}</Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-border">
                <Text className="text-sm font-bold text-dark">Remaining</Text>
                <Text className="text-sm font-bold text-brand-600">{formatCurrency(project.budget - project.spent)}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === "tasks" && (
          <View className="p-4">
            {/* Task Progress */}
            <View className="bg-white border border-border rounded p-4 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-bold text-dark">Progress</Text>
                <Text className="text-sm text-text-muted">{doneTasks} / {totalTasks}</Text>
              </View>
              <View className="bg-gray-100 h-2 w-full">
                <View
                  className="h-2"
                  style={{
                    width: totalTasks > 0 ? `${Math.round((doneTasks / totalTasks) * 100)}%` : "0%",
                    backgroundColor: "#059669",
                  }}
                />
              </View>
            </View>

            {/* In Progress */}
            {project.tasks.filter((t) => t.status === "in_progress").length > 0 && (
              <View className="mb-3">
                <Text className="text-sm font-bold text-text-muted uppercase tracking-wide mb-2">In Progress</Text>
                {project.tasks.filter((t) => t.status === "in_progress").map((task) => {
                  const { icon: Icon, color } = getTaskIcon(task.status);
                  return (
                    <View key={task.id} className="bg-white border border-border rounded p-3 mb-2 flex-row items-center">
                      <Icon size={18} color={color} />
                      <View className="flex-1 ml-3">
                        <Text className="text-sm font-bold text-dark">{task.title}</Text>
                        <Text className="text-xs text-text-muted">{task.assignee}{task.dueDate ? ` — Due ${formatDate(task.dueDate)}` : ""}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* To Do */}
            {project.tasks.filter((t) => t.status === "todo").length > 0 && (
              <View className="mb-3">
                <Text className="text-sm font-bold text-text-muted uppercase tracking-wide mb-2">To Do</Text>
                {project.tasks.filter((t) => t.status === "todo").map((task) => {
                  const { icon: Icon, color } = getTaskIcon(task.status);
                  return (
                    <View key={task.id} className="bg-white border border-border rounded p-3 mb-2 flex-row items-center">
                      <Icon size={18} color={color} />
                      <View className="flex-1 ml-3">
                        <Text className="text-sm font-bold text-dark">{task.title}</Text>
                        <Text className="text-xs text-text-muted">{task.assignee}{task.dueDate ? ` — Due ${formatDate(task.dueDate)}` : ""}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Done */}
            {project.tasks.filter((t) => t.status === "done").length > 0 && (
              <View>
                <Text className="text-sm font-bold text-text-muted uppercase tracking-wide mb-2">Completed</Text>
                {project.tasks.filter((t) => t.status === "done").map((task) => {
                  const { icon: Icon, color } = getTaskIcon(task.status);
                  return (
                    <View key={task.id} className="bg-white border border-border rounded p-3 mb-2 flex-row items-center">
                      <Icon size={18} color={color} />
                      <View className="flex-1 ml-3">
                        <Text className="text-sm font-bold text-dark text-text-muted line-through">{task.title}</Text>
                        <Text className="text-xs text-text-muted">{task.assignee}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {activeTab === "documents" && (
          <View className="p-4" style={{ gap: 6 }}>
            {project.documents.map((doc) => {
              const DocIcon = getDocIcon(doc.type);
              return (
                <TouchableOpacity key={doc.id} className="bg-white border border-border rounded p-4 flex-row items-center" activeOpacity={0.7}>
                  <View className="bg-gray-100 p-2 mr-3">
                    <DocIcon size={20} color={BRAND.colors.textSecondary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-dark" numberOfLines={1}>{doc.name}</Text>
                    <Text className="text-xs text-text-muted mt-0.5">
                      {doc.type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} — {formatDate(doc.date)}
                    </Text>
                  </View>
                  {doc.size && (
                    <Text className="text-xs text-text-muted ml-2">{doc.size}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeTab === "activity" && (
          <View className="p-4">
            {project.activity.map((act, i) => {
              const Icon = getActivityIcon(act.type);
              return (
                <View key={act.id} className="flex-row items-start mb-0">
                  {/* Timeline line */}
                  <View className="items-center" style={{ width: 32 }}>
                    <View className="bg-white border border-border rounded p-1.5">
                      <Icon size={14} color={BRAND.colors.textSecondary} />
                    </View>
                    {i < project.activity.length - 1 && (
                      <View className="w-px bg-border flex-1" style={{ minHeight: 24 }} />
                    )}
                  </View>
                  <View className="flex-1 ml-3 pb-4">
                    <Text className="text-sm text-dark">{act.description}</Text>
                    <Text className="text-xs text-text-muted mt-0.5">{act.actor} — {formatDate(act.date)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
