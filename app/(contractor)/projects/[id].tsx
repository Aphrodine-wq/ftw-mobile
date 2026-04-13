import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
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
  Plus,
  X,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { mockProjects } from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import type { Project, ProjectMilestone, ProjectTask, ProjectDocument, ProjectActivity, ProjectExpense } from "@src/types";

type Tab = "overview" | "milestones" | "tasks" | "documents" | "activity" | "costs";

const EXPENSE_CATEGORIES = ["Labor", "Materials", "Equipment", "Subcontractor", "Permits", "Overhead", "Other"] as const;

const MOCK_EXPENSES: ProjectExpense[] = [
  { id: "e1", description: "Framing lumber delivery", amount: 285000, category: "Materials", date: "2026-03-01", vendor: "McCoy's Building Supply" },
  { id: "e2", description: "Electrical rough-in labor", amount: 195000, category: "Labor", date: "2026-03-05" },
  { id: "e3", description: "Plumbing subcontractor", amount: 340000, category: "Subcontractor", date: "2026-03-08", vendor: "Austin Plumbing Co" },
  { id: "e4", description: "Building permit fee", amount: 45000, category: "Permits", date: "2026-02-14" },
  { id: "e5", description: "Dumpster rental", amount: 65000, category: "Equipment", date: "2026-02-16", vendor: "Waste Management" },
  { id: "e6", description: "Cabinet order deposit", amount: 480000, category: "Materials", date: "2026-02-20", vendor: "KraftMaid" },
  { id: "e7", description: "Tile crew — day 1", amount: 120000, category: "Labor", date: "2026-03-12" },
  { id: "e8", description: "Insurance rider", amount: 35000, category: "Overhead", date: "2026-02-15" },
];

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
    case "complete": return { icon: CheckCircle2, color: BRAND.colors.primary };
    case "in_progress": return { icon: Clock, color: "#D97706" };
    case "delayed": return { icon: AlertTriangle, color: "#DC2626" };
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
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<string>("Materials");
  const [expenseMilestone, setExpenseMilestone] = useState<string>("");
  const [expenseVendor, setExpenseVendor] = useState("");

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
    { key: "costs", label: "Costs" },
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
              <View className="bg-gray-100 h-3 w-full mb-1" style={{ borderRadius: 99 }}>
                <View
                  className="h-3"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: project.status === "completed" ? "#059669" : progress > 90 ? "#D97706" : BRAND.colors.primary,
                    borderRadius: 99,
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
              const statusLabel = ms.status === "paid" ? "Paid" : ms.status === "complete" ? "Complete" : ms.status === "in_progress" ? "In Progress" : ms.status === "delayed" ? "Delayed" : "Pending";
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
                        <View className={`px-2 py-0.5 ${ms.status === "paid" ? "bg-green-100" : ms.status === "complete" ? "bg-brand-50" : ms.status === "in_progress" ? "bg-amber-100" : ms.status === "delayed" ? "bg-red-100" : "bg-gray-100"}`}>
                          <Text className={`text-[10px] font-bold ${ms.status === "paid" ? "text-green-700" : ms.status === "complete" ? "text-brand-600" : ms.status === "in_progress" ? "text-amber-700" : ms.status === "delayed" ? "text-red-700" : "text-text-secondary"}`}>
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
              <View className="bg-gray-100 h-2 w-full" style={{ borderRadius: 99 }}>
                <View
                  className="h-2"
                  style={{
                    width: totalTasks > 0 ? `${Math.round((doneTasks / totalTasks) * 100)}%` : "0%",
                    backgroundColor: "#059669",
                    borderRadius: 99,
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

        {activeTab === "costs" && (() => {
          const totalSpent = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0);
          const remaining = project.budget - totalSpent;
          const spentPct = project.budget > 0 ? Math.round((totalSpent / project.budget) * 100) : 0;

          const categoryTotals = EXPENSE_CATEGORIES.map((cat) => {
            const catTotal = MOCK_EXPENSES.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
            return { category: cat, total: catTotal, pct: totalSpent > 0 ? Math.round((catTotal / totalSpent) * 100) : 0 };
          }).filter((c) => c.total > 0);

          return (
            <View>
              {/* Budget / Spent / Remaining */}
              <View className="bg-white border-b border-border p-4">
                <View className="flex-row" style={{ gap: 8 }}>
                  <View className="flex-1 bg-surface p-3">
                    <Text className="text-xs text-text-muted uppercase tracking-wide">Budget</Text>
                    <Text className="text-base font-bold text-dark mt-1">{formatCurrency(project.budget)}</Text>
                  </View>
                  <View className="flex-1 bg-surface p-3">
                    <Text className="text-xs text-text-muted uppercase tracking-wide">Spent</Text>
                    <Text className="text-base font-bold text-dark mt-1">{formatCurrency(totalSpent)}</Text>
                  </View>
                  <View className="flex-1 bg-surface p-3">
                    <Text className="text-xs text-text-muted uppercase tracking-wide">Remaining</Text>
                    <Text className="text-base font-bold text-brand-600 mt-1">{formatCurrency(remaining)}</Text>
                  </View>
                </View>
                <View className="mt-3">
                  <View className="bg-gray-100 h-3 w-full" style={{ borderRadius: 99 }}>
                    <View
                      className="h-3"
                      style={{
                        width: `${Math.min(spentPct, 100)}%`,
                        backgroundColor: spentPct > 90 ? "#D97706" : BRAND.colors.primary,
                        borderRadius: 99,
                      }}
                    />
                  </View>
                  <Text className="text-xs text-text-muted mt-1">{spentPct}% of budget used</Text>
                </View>
              </View>

              {/* Category Breakdown */}
              <View className="bg-white border-b border-border p-4">
                <Text className="text-base font-bold text-dark mb-3">By Category</Text>
                {categoryTotals.map((cat) => (
                  <View key={cat.category} className="mb-3">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm text-text-secondary">{cat.category}</Text>
                      <Text className="text-sm font-bold text-dark">{formatCurrency(cat.total)}</Text>
                    </View>
                    <View className="bg-gray-100 h-2 w-full" style={{ borderRadius: 99 }}>
                      <View
                        className="h-2"
                        style={{
                          width: `${cat.pct}%`,
                          backgroundColor: BRAND.colors.primary,
                          borderRadius: 99,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Expense List */}
              <View className="bg-white border-b border-border p-4">
                <Text className="text-base font-bold text-dark mb-3">Expenses</Text>
                {MOCK_EXPENSES.map((exp, i) => (
                  <View key={exp.id} className={`flex-row items-center py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-dark">{exp.description}</Text>
                      <View className="flex-row items-center mt-0.5">
                        <Text className="text-xs text-text-muted">{formatDate(exp.date)}</Text>
                        {exp.vendor && <Text className="text-xs text-text-muted ml-2">-- {exp.vendor}</Text>}
                      </View>
                    </View>
                    <View className="items-end ml-3">
                      <Text className="text-sm font-bold text-dark">{formatCurrency(exp.amount)}</Text>
                      {exp.category && (
                        <View className="bg-surface px-2 py-0.5 mt-0.5">
                          <Text className="text-[10px] font-bold text-text-secondary">{exp.category}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Add Expense Button */}
              <View className="p-4">
                <TouchableOpacity
                  onPress={() => {
                    setExpenseDesc("");
                    setExpenseAmount("");
                    setExpenseCategory("Materials");
                    setExpenseMilestone("");
                    setExpenseVendor("");
                    setShowExpenseModal(true);
                  }}
                  className="bg-brand-600 py-4 items-center flex-row justify-center"
                  activeOpacity={0.8}
                >
                  <Plus size={18} color="#FFFFFF" />
                  <Text className="text-white font-bold text-base ml-2">Add Expense</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={showExpenseModal} animationType="slide" onRequestClose={() => setShowExpenseModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          {/* Modal Header */}
          <View className="bg-dark px-5 pt-4 pb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-xl font-bold">Add Expense</Text>
              <TouchableOpacity onPress={() => setShowExpenseModal(false)} activeOpacity={0.7}>
                <X size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingBottom: 40 }}>
            <View className="px-5 pt-4">
              {/* Description */}
              <View className="mb-4">
                <Text className="text-text-secondary text-sm font-bold mb-1.5">Description</Text>
                <TextInput
                  className="bg-white border border-border p-3 text-dark text-sm"
                  value={expenseDesc}
                  onChangeText={setExpenseDesc}
                  placeholder="What was this expense for?"
                  placeholderTextColor={BRAND.colors.textMuted}
                />
              </View>

              {/* Amount */}
              <View className="mb-4">
                <Text className="text-text-secondary text-sm font-bold mb-1.5">Amount</Text>
                <TextInput
                  className="bg-white border border-border p-3 text-dark text-sm"
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  placeholder="0.00"
                  placeholderTextColor={BRAND.colors.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Category */}
              <View className="mb-4">
                <Text className="text-text-secondary text-sm font-bold mb-1.5">Category</Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setExpenseCategory(cat)}
                      className={`px-4 py-2 border ${expenseCategory === cat ? "bg-brand-600 border-brand-600" : "bg-white border-border"}`}
                      activeOpacity={0.7}
                    >
                      <Text className={`text-sm font-bold ${expenseCategory === cat ? "text-white" : "text-dark"}`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Milestone */}
              <View className="mb-4">
                <Text className="text-text-secondary text-sm font-bold mb-1.5">Milestone (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row" style={{ gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setExpenseMilestone("")}
                      className={`px-4 py-2 border ${expenseMilestone === "" ? "bg-brand-600 border-brand-600" : "bg-white border-border"}`}
                      activeOpacity={0.7}
                    >
                      <Text className={`text-sm font-bold ${expenseMilestone === "" ? "text-white" : "text-dark"}`}>None</Text>
                    </TouchableOpacity>
                    {project.milestones.map((ms) => (
                      <TouchableOpacity
                        key={ms.id}
                        onPress={() => setExpenseMilestone(ms.id)}
                        className={`px-4 py-2 border ${expenseMilestone === ms.id ? "bg-brand-600 border-brand-600" : "bg-white border-border"}`}
                        activeOpacity={0.7}
                      >
                        <Text className={`text-sm font-bold ${expenseMilestone === ms.id ? "text-white" : "text-dark"}`}>{ms.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Vendor */}
              <View className="mb-6">
                <Text className="text-text-secondary text-sm font-bold mb-1.5">Vendor (optional)</Text>
                <TextInput
                  className="bg-white border border-border p-3 text-dark text-sm"
                  value={expenseVendor}
                  onChangeText={setExpenseVendor}
                  placeholder="Vendor or supplier name"
                  placeholderTextColor={BRAND.colors.textMuted}
                />
              </View>

              {/* Save */}
              <TouchableOpacity
                onPress={() => {
                  if (!expenseDesc || !expenseAmount) {
                    Alert.alert("Missing Info", "Description and amount are required.");
                    return;
                  }
                  Alert.alert("Expense Added", `${expenseDesc} -- ${formatCurrency(Math.round(parseFloat(expenseAmount) * 100))}`, [
                    { text: "OK", onPress: () => setShowExpenseModal(false) },
                  ]);
                }}
                className="bg-brand-600 py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-base">Save Expense</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
