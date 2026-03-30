import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Receipt,
  Plus,
  X,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  DollarSign,
  FileText,
  Calendar,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { fetchInvoices } from "@src/api/data";
import { mockInvoices, mockProjects } from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
import type { Invoice, Project, ProjectMilestone } from "@src/types";

type InvoiceFilter = "all" | "sent" | "paid" | "overdue";

const FILTERS: { key: InvoiceFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
];

function getStatusVariant(status: Invoice["status"]): "neutral" | "default" | "success" | "danger" {
  switch (status) {
    case "draft": return "neutral";
    case "sent": return "default";
    case "paid": return "success";
    case "overdue": return "danger";
  }
}

function getMilestoneIcon(status: ProjectMilestone["status"]) {
  switch (status) {
    case "paid": return { Icon: CheckCircle2, color: "#059669" };
    case "completed": return { Icon: CheckCircle2, color: BRAND.colors.primary };
    case "in_progress": return { Icon: Clock, color: "#D97706" };
    default: return { Icon: Circle, color: BRAND.colors.textMuted };
  }
}

export default function InvoicesScreen() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [activeFilter, setActiveFilter] = useState<InvoiceFilter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<"project" | "milestone" | "details">("project");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [invoiceNote, setInvoiceNote] = useState("");
  const [dueInDays, setDueInDays] = useState("30");

  const loadData = useCallback(async () => {
    const data = await fetchInvoices();
    setInvoices(data);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filtered = activeFilter === "all" ? invoices : invoices.filter((inv) => inv.status === activeFilter);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
  const outstanding = invoices.filter((inv) => inv.status === "sent" || inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0);

  const activeProjects = (mockProjects as Project[]).filter((p) => p.status === "active" || p.status === "completed");
  const unpaidMilestones = selectedProject?.milestones.filter((m) => m.status !== "paid") || [];

  function openModal() {
    setModalStep("project");
    setSelectedProject(null);
    setSelectedMilestone(null);
    setInvoiceNote("");
    setDueInDays("30");
    setShowModal(true);
  }

  function selectProject(proj: Project) {
    setSelectedProject(proj);
    setModalStep("milestone");
  }

  function selectMilestone(ms: ProjectMilestone) {
    setSelectedMilestone(ms);
    setInvoiceNote(`${selectedProject?.name} — ${ms.title}`);
    setModalStep("details");
  }

  function createInvoice() {
    if (!selectedProject || !selectedMilestone) return;
    Alert.alert(
      "Invoice Created",
      `${formatCurrency(selectedMilestone.amount)} invoice sent to ${selectedProject.homeownerName} for "${selectedMilestone.title}"`,
      [{ text: "OK", onPress: () => setShowModal(false) }],
    );
  }

  const renderHeader = () => (
    <View>
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Invoices</Text>
        </View>
        <TouchableOpacity onPress={openModal} className="bg-brand-600 p-2.5" style={{ borderRadius: 0 }} activeOpacity={0.7}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View className="flex-row mx-5 mt-4 bg-white border border-border overflow-hidden" style={{ borderRadius: 0 }}>
        <View className="flex-1 items-center py-4 border-r border-border">
          <Text className="text-xl font-bold text-dark">{formatCurrency(totalInvoiced)}</Text>
          <Text className="text-text-secondary text-sm mt-0.5">Invoiced</Text>
        </View>
        <View className="flex-1 items-center py-4 border-r border-border">
          <Text className="text-xl font-bold text-dark">{formatCurrency(totalPaid)}</Text>
          <Text className="text-text-secondary text-sm mt-0.5">Paid</Text>
        </View>
        <View className="flex-1 items-center py-4">
          <Text className="text-xl font-bold text-dark">{formatCurrency(outstanding)}</Text>
          <Text className="text-text-secondary text-sm mt-0.5">Outstanding</Text>
        </View>
      </View>

      <View className="flex-row px-5 mt-4 mb-2 gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 ${isActive ? "bg-dark" : "bg-white border border-border"}`}
              style={{ borderRadius: 0 }}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${isActive ? "text-white" : "text-text-secondary"}`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <TouchableOpacity className="bg-white border border-border mx-5 mb-3 p-4 flex-row items-center" style={{ borderRadius: 0 }} activeOpacity={0.7}>
      <View className="w-10 h-10 bg-gray-100 items-center justify-center mr-3" style={{ borderRadius: 0 }}>
        <Receipt size={20} color={BRAND.colors.textSecondary} />
      </View>
      <View className="flex-1">
        <Text className="text-dark font-semibold" numberOfLines={1}>{item.description}</Text>
        <Text className="text-text-muted text-sm mt-0.5">
          {item.status === "paid" && item.paidAt ? `Paid ${formatDate(item.paidAt)}` : `Due ${formatDate(item.dueDate)}`}
        </Text>
      </View>
      <View className="items-end ml-3">
        <Text className="text-dark font-bold">{formatCurrency(item.amount)}</Text>
        <View className="mt-1">
          <Badge label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} variant={getStatusVariant(item.status)} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={{ paddingBottom: 8 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <Receipt size={48} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-base mt-4">No invoices found</Text>
          </View>
        }
      />

      {/* New Invoice Modal */}
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            {/* Modal Header */}
            <View className="bg-dark px-5 pt-4 pb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  {modalStep !== "project" && (
                    <TouchableOpacity
                      onPress={() => setModalStep(modalStep === "details" ? "milestone" : "project")}
                      activeOpacity={0.7}
                      className="mr-3"
                    >
                      <ArrowLeft size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                  <View>
                    <Text className="text-white text-xl font-bold">
                      {modalStep === "project" ? "New Invoice" : modalStep === "milestone" ? "Select Milestone" : "Invoice Details"}
                    </Text>
                    <Text className="text-white/50 text-xs mt-0.5">
                      {modalStep === "project" ? "Step 1 of 3 — Choose a project" : modalStep === "milestone" ? "Step 2 of 3 — Choose a milestone" : "Step 3 of 3 — Review and send"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowModal(false)} activeOpacity={0.7}>
                  <X size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {/* Step progress */}
              <View className="flex-row mt-3" style={{ gap: 4 }}>
                <View className="flex-1 h-1" style={{ backgroundColor: BRAND.colors.primary }} />
                <View className="flex-1 h-1" style={{ backgroundColor: modalStep !== "project" ? BRAND.colors.primary : "rgba(255,255,255,0.2)" }} />
                <View className="flex-1 h-1" style={{ backgroundColor: modalStep === "details" ? BRAND.colors.primary : "rgba(255,255,255,0.2)" }} />
              </View>
            </View>

            <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingBottom: 40 }}>
              {/* Step 1: Select Project */}
              {modalStep === "project" && (
                <View className="px-5 pt-4">
                  <Text className="text-text-secondary text-sm font-bold mb-3">Which project is this invoice for?</Text>
                  {activeProjects.map((proj) => {
                    const pct = proj.budget > 0 ? Math.round((proj.spent / proj.budget) * 100) : 0;
                    const unpaid = proj.milestones.filter((m) => m.status !== "paid");
                    const nextMs = unpaid[0];
                    const totalUnpaid = unpaid.reduce((s, m) => s + m.amount, 0);
                    return (
                      <TouchableOpacity
                        key={proj.id}
                        onPress={() => selectProject(proj)}
                        className="bg-white border border-border mb-3"
                        style={{ borderRadius: 0 }}
                        activeOpacity={0.7}
                      >
                        {/* Project Header */}
                        <View className="p-4 flex-row items-start">
                          <View className="flex-1">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-dark font-bold text-lg">{proj.name}</Text>
                              <Badge label={proj.status.charAt(0).toUpperCase() + proj.status.slice(1)} variant={proj.status === "active" ? "default" : "success"} />
                            </View>
                            <Text className="text-text-secondary text-sm mt-0.5">{proj.homeownerName}</Text>
                            {proj.address && <Text className="text-text-muted text-xs mt-0.5">{proj.address}</Text>}
                          </View>
                        </View>

                        {/* Budget Progress */}
                        <View className="px-4 pb-3">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-text-muted text-xs">{pct}% invoiced</Text>
                            <Text className="text-dark text-sm font-bold">{formatCurrency(proj.spent)} / {formatCurrency(proj.budget)}</Text>
                          </View>
                          <View className="bg-gray-100 h-2 w-full">
                            <View className="h-2" style={{ width: `${pct}%`, backgroundColor: BRAND.colors.primary }} />
                          </View>
                        </View>

                        {/* Milestone Summary */}
                        <View className="border-t border-border px-4 py-3 flex-row items-center justify-between">
                          <View>
                            <Text className="text-dark text-sm font-bold">{unpaid.length} unpaid milestone{unpaid.length !== 1 ? "s" : ""}</Text>
                            {nextMs && <Text className="text-text-muted text-xs mt-0.5">Next: {nextMs.title} — {formatCurrency(nextMs.amount)}</Text>}
                          </View>
                          <View className="flex-row items-center">
                            <Text className="text-brand-600 font-bold text-sm mr-1">{formatCurrency(totalUnpaid)}</Text>
                            <ChevronRight size={18} color={BRAND.colors.primary} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {activeProjects.length === 0 && (
                    <View className="items-center py-12">
                      <Receipt size={40} color={BRAND.colors.textMuted} />
                      <Text className="text-text-muted text-sm mt-3">No active projects to invoice</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Step 2: Select Milestone */}
              {modalStep === "milestone" && selectedProject && (
                <View className="px-5 pt-4">
                  {/* Project context */}
                  <View className="bg-white border border-border p-4 mb-4" style={{ borderRadius: 0 }}>
                    <Text className="text-dark font-bold text-base">{selectedProject.name}</Text>
                    <Text className="text-text-secondary text-sm mt-0.5">{selectedProject.homeownerName}</Text>
                    <View className="flex-row mt-3 pt-3 border-t border-border">
                      <View className="flex-1">
                        <Text className="text-text-muted text-xs">Total Contract</Text>
                        <Text className="text-dark font-bold text-sm mt-0.5">{formatCurrency(selectedProject.budget)}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-text-muted text-xs">Already Paid</Text>
                        <Text className="text-dark font-bold text-sm mt-0.5">{formatCurrency(selectedProject.spent)}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-text-muted text-xs">Remaining</Text>
                        <Text className="text-brand-600 font-bold text-sm mt-0.5">{formatCurrency(selectedProject.budget - selectedProject.spent)}</Text>
                      </View>
                    </View>
                  </View>

                  <Text className="text-text-secondary text-sm font-bold mb-3">Select a milestone to invoice</Text>
                  {unpaidMilestones.map((ms) => {
                    const { Icon: MsIcon, color } = getMilestoneIcon(ms.status);
                    const statusLabel = ms.status === "completed" ? "Completed" : ms.status === "in_progress" ? "In Progress" : "Pending";
                    const statusVariant = ms.status === "completed" ? "success" as const : ms.status === "in_progress" ? "default" as const : "neutral" as const;
                    return (
                      <TouchableOpacity
                        key={ms.id}
                        onPress={() => selectMilestone(ms)}
                        className="bg-white border border-border mb-3"
                        style={{ borderRadius: 0 }}
                        activeOpacity={0.7}
                      >
                        <View className="p-4 flex-row items-start">
                          <MsIcon size={20} color={color} />
                          <View className="flex-1 ml-3">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-dark font-bold text-base flex-1 mr-2">{ms.title}</Text>
                              <Badge label={statusLabel} variant={statusVariant} />
                            </View>
                            <Text className="text-text-muted text-xs mt-1">Due {formatDate(ms.dueDate)}</Text>
                          </View>
                        </View>
                        <View className="border-t border-border px-4 py-3 flex-row items-center justify-between">
                          <Text className="text-text-muted text-xs">Milestone Amount</Text>
                          <View className="flex-row items-center">
                            <Text className="text-dark font-bold text-lg mr-2">{formatCurrency(ms.amount)}</Text>
                            <ChevronRight size={16} color={BRAND.colors.primary} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {unpaidMilestones.length === 0 && (
                    <Text className="text-text-muted text-sm text-center py-8">All milestones have been invoiced</Text>
                  )}
                </View>
              )}

              {/* Step 3: Invoice Details */}
              {modalStep === "details" && selectedProject && selectedMilestone && (
                <View className="px-5 pt-4">
                  {/* Summary Card */}
                  <View className="bg-dark p-4 mb-4" style={{ borderRadius: 0 }}>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-white/60 text-xs uppercase tracking-wide">Invoice Amount</Text>
                      <Text className="text-white text-2xl font-bold">{formatCurrency(selectedMilestone.amount)}</Text>
                    </View>
                    <View className="border-t border-white/20 pt-2 mt-1">
                      <Text className="text-white text-sm font-bold">{selectedProject.name}</Text>
                      <Text className="text-white/60 text-xs mt-0.5">{selectedMilestone.title}</Text>
                    </View>
                  </View>

                  {/* Bill To */}
                  <View className="bg-white border border-border p-4 mb-3" style={{ borderRadius: 0 }}>
                    <Text className="text-text-muted text-xs uppercase tracking-wide font-bold mb-2">Bill To</Text>
                    <Text className="text-dark font-bold text-base">{selectedProject.homeownerName}</Text>
                    <Text className="text-text-secondary text-sm mt-0.5">{selectedProject.address}</Text>
                  </View>

                  {/* Line Items */}
                  <View className="bg-white border border-border mb-3" style={{ borderRadius: 0 }}>
                    <View className="flex-row bg-dark px-4 py-2">
                      <Text className="flex-1 text-white text-xs font-bold">Description</Text>
                      <Text className="text-white text-xs font-bold">Amount</Text>
                    </View>
                    <View className="px-4 py-3 flex-row items-center border-b border-border">
                      <View className="flex-1">
                        <Text className="text-dark text-sm font-bold">{selectedMilestone.title}</Text>
                        <Text className="text-text-muted text-xs mt-0.5">{selectedProject.name}</Text>
                      </View>
                      <Text className="text-dark font-bold text-sm">{formatCurrency(selectedMilestone.amount)}</Text>
                    </View>
                    <View className="px-4 py-3 flex-row items-center justify-between bg-gray-50">
                      <Text className="text-dark font-bold text-sm">Total Due</Text>
                      <Text className="text-dark font-bold text-lg">{formatCurrency(selectedMilestone.amount)}</Text>
                    </View>
                  </View>

                  {/* Due Date */}
                  <View className="mb-3">
                    <Text className="text-text-secondary text-sm font-bold mb-1.5">Payment Due (days)</Text>
                    <View className="flex-row" style={{ gap: 8 }}>
                      {["15", "30", "45", "60"].map((d) => (
                        <TouchableOpacity
                          key={d}
                          onPress={() => setDueInDays(d)}
                          className={`flex-1 py-2.5 items-center border ${d === dueInDays ? "bg-brand-600 border-brand-600" : "bg-white border-border"}`}
                          style={{ borderRadius: 0 }}
                          activeOpacity={0.7}
                        >
                          <Text className={`text-sm font-bold ${d === dueInDays ? "text-white" : "text-dark"}`}>{d}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Note */}
                  <View className="mb-4">
                    <Text className="text-text-secondary text-sm font-bold mb-1.5">Note (optional)</Text>
                    <TextInput
                      className="bg-white border border-border p-3 text-dark text-sm min-h-[60px]"
                      style={{ borderRadius: 0, textAlignVertical: "top" }}
                      value={invoiceNote}
                      onChangeText={setInvoiceNote}
                      placeholder="Add a note to the invoice..."
                      placeholderTextColor={BRAND.colors.textMuted}
                      multiline
                    />
                  </View>

                  {/* Send */}
                  <TouchableOpacity
                    onPress={createInvoice}
                    className="bg-brand-600 py-4 items-center"
                    style={{ borderRadius: 0 }}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-bold text-base">Send Invoice — {formatCurrency(selectedMilestone.amount)}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
