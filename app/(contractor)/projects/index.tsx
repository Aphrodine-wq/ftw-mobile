import { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  FolderOpen,
  ChevronRight,
  Shield,
  Plus,
  X,
  Check,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useProjects } from "@src/api/hooks";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";

import { Badge } from "@src/components/ui/badge";
import type { Project } from "@src/types";

const PROJECT_CATEGORIES = [
  "Kitchen Remodel", "Bathroom Remodel", "Roofing", "Flooring", "Painting",
  "HVAC", "Plumbing", "Electrical", "General Renovation", "Deck/Patio",
  "Fencing", "Siding", "Windows/Doors", "Foundation", "Landscaping",
];

const CATEGORY_MILESTONE_TEMPLATES: Record<string, { label: string; pct: number }[]> = {
  "Kitchen Remodel": [
    { label: "Demo complete", pct: 12 },
    { label: "Rough-in (plumbing/electrical)", pct: 22 },
    { label: "Cabinet install", pct: 20 },
    { label: "Countertops", pct: 18 },
    { label: "Tile & flooring", pct: 18 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "Bathroom Remodel": [
    { label: "Demo complete", pct: 15 },
    { label: "Plumbing rough-in", pct: 22 },
    { label: "Tile & waterproofing", pct: 25 },
    { label: "Vanity & fixtures", pct: 23 },
    { label: "Final walkthrough", pct: 15 },
  ],
  "Roofing": [
    { label: "Tear-off complete", pct: 20 },
    { label: "Decking & underlayment", pct: 25 },
    { label: "Shingles installed", pct: 30 },
    { label: "Flashings & ridge vent", pct: 15 },
    { label: "Final inspection", pct: 10 },
  ],
  "Flooring": [
    { label: "Furniture removal & protection", pct: 10 },
    { label: "Subfloor prep", pct: 20 },
    { label: "Flooring install", pct: 40 },
    { label: "Trim & transitions", pct: 20 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "Painting": [
    { label: "Prep & protection", pct: 20 },
    { label: "Prime", pct: 15 },
    { label: "Paint (2 coats)", pct: 35 },
    { label: "Trim & detail work", pct: 20 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "HVAC": [
    { label: "Disconnect old system", pct: 15 },
    { label: "Ductwork modifications", pct: 25 },
    { label: "Equipment install", pct: 30 },
    { label: "Startup & testing", pct: 20 },
    { label: "Final inspection", pct: 10 },
  ],
  "Plumbing": [
    { label: "Demo & access", pct: 15 },
    { label: "Rough-in", pct: 30 },
    { label: "Fixture install", pct: 25 },
    { label: "Testing & pressure check", pct: 15 },
    { label: "Final inspection", pct: 15 },
  ],
  "Electrical": [
    { label: "Panel assessment", pct: 10 },
    { label: "Rough-in & wiring", pct: 35 },
    { label: "Fixtures & devices", pct: 25 },
    { label: "Testing & labeling", pct: 15 },
    { label: "Final inspection", pct: 15 },
  ],
  "General Renovation": [
    { label: "Demo complete", pct: 15 },
    { label: "Framing & structural", pct: 20 },
    { label: "MEP rough-in", pct: 25 },
    { label: "Finishes", pct: 25 },
    { label: "Final walkthrough", pct: 15 },
  ],
  "Deck/Patio": [
    { label: "Footings & posts", pct: 20 },
    { label: "Framing", pct: 25 },
    { label: "Decking boards", pct: 25 },
    { label: "Railing & stairs", pct: 20 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "Fencing": [
    { label: "Layout & post holes", pct: 20 },
    { label: "Posts set", pct: 25 },
    { label: "Rails installed", pct: 20 },
    { label: "Pickets/panels", pct: 25 },
    { label: "Gates & final", pct: 10 },
  ],
  "Siding": [
    { label: "Tear-off old siding", pct: 15 },
    { label: "Sheathing & house wrap", pct: 20 },
    { label: "Siding install", pct: 35 },
    { label: "Trim & caulk", pct: 20 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "Windows/Doors": [
    { label: "Removal & prep", pct: 15 },
    { label: "Framing & flashing", pct: 25 },
    { label: "Install", pct: 30 },
    { label: "Trim & caulk", pct: 20 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "Foundation": [
    { label: "Excavation", pct: 20 },
    { label: "Forms & rebar", pct: 20 },
    { label: "Pour", pct: 25 },
    { label: "Cure & strip forms", pct: 20 },
    { label: "Backfill & grade", pct: 15 },
  ],
  "Landscaping": [
    { label: "Clearing & grading", pct: 20 },
    { label: "Hardscape", pct: 25 },
    { label: "Irrigation", pct: 20 },
    { label: "Planting", pct: 25 },
    { label: "Mulch & final cleanup", pct: 10 },
  ],
};

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

  // Create project modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [milestoneChecks, setMilestoneChecks] = useState<Record<number, boolean>>({});
  const [milestoneAmounts, setMilestoneAmounts] = useState<Record<number, string>>({});

  const templateMilestones = useMemo(() => {
    return CATEGORY_MILESTONE_TEMPLATES[selectedCategory] || [];
  }, [selectedCategory]);

  function openCreateModal() {
    setModalStep(1);
    setProjectName("");
    setClientName("");
    setSelectedCategory("");
    setDescription("");
    setBudget("");
    setStartDate("");
    setEndDate("");
    setMilestoneChecks({});
    setMilestoneAmounts({});
    setShowModal(true);
  }

  function goToStep2() {
    if (!projectName.trim()) {
      Alert.alert("Missing Info", "Project name is required.");
      return;
    }
    // Pre-populate milestones from template
    const budgetCents = Math.round(parseFloat(budget || "0") * 100);
    const checks: Record<number, boolean> = {};
    const amounts: Record<number, string> = {};
    templateMilestones.forEach((ms, i) => {
      checks[i] = true;
      amounts[i] = budgetCents > 0 ? (Math.round(budgetCents * ms.pct / 100) / 100).toFixed(2) : "";
    });
    setMilestoneChecks(checks);
    setMilestoneAmounts(amounts);
    setModalStep(2);
  }

  function submitProject() {
    const selectedMs = templateMilestones
      .map((ms, i) => ({ ...ms, idx: i }))
      .filter((_, i) => milestoneChecks[i]);

    Alert.alert(
      "Project Created",
      `"${projectName}" with ${selectedMs.length} milestones`,
      [{ text: "OK", onPress: () => setShowModal(false) }],
    );
  }

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

      {/* FAB */}
      <TouchableOpacity
        onPress={openCreateModal}
        className="absolute bg-brand-600 items-center justify-center"
        style={{ width: 56, height: 56, borderRadius: 28, bottom: 24, right: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 }}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Project Modal */}
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          {/* Modal Header */}
          <View className="bg-dark px-5 pt-4 pb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                {modalStep === 2 && (
                  <TouchableOpacity onPress={() => setModalStep(1)} activeOpacity={0.7} className="mr-3">
                    <ArrowLeft size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                <View>
                  <Text className="text-white text-xl font-bold">
                    {modalStep === 1 ? "New Project" : "Milestones"}
                  </Text>
                  <Text className="text-white/50 text-xs mt-0.5">
                    {modalStep === 1 ? "Step 1 of 2 -- Project details" : "Step 2 of 2 -- Review milestones"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)} activeOpacity={0.7}>
                <X size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {/* Progress bars */}
            <View className="flex-row mt-3" style={{ gap: 4 }}>
              <View className="flex-1 h-1" style={{ backgroundColor: BRAND.colors.primary }} />
              <View className="flex-1 h-1" style={{ backgroundColor: modalStep === 2 ? BRAND.colors.primary : "rgba(255,255,255,0.2)" }} />
            </View>
          </View>

          <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingBottom: 40 }}>
            {modalStep === 1 && (
              <View className="px-5 pt-4">
                {/* Project Name */}
                <View className="mb-4">
                  <Text className="text-text-secondary text-sm font-bold mb-1.5">Project Name</Text>
                  <TextInput
                    className="bg-white border border-border p-3 text-dark text-sm"
                    value={projectName}
                    onChangeText={setProjectName}
                    placeholder="e.g. Kitchen Remodel -- Smith Residence"
                    placeholderTextColor={BRAND.colors.textMuted}
                  />
                </View>

                {/* Client Name */}
                <View className="mb-4">
                  <Text className="text-text-secondary text-sm font-bold mb-1.5">Client Name</Text>
                  <TextInput
                    className="bg-white border border-border p-3 text-dark text-sm"
                    value={clientName}
                    onChangeText={setClientName}
                    placeholder="Homeowner name"
                    placeholderTextColor={BRAND.colors.textMuted}
                  />
                </View>

                {/* Category */}
                <View className="mb-4">
                  <Text className="text-text-secondary text-sm font-bold mb-1.5">Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row" style={{ gap: 8 }}>
                      {PROJECT_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => setSelectedCategory(cat)}
                          className={`px-4 py-2.5 border ${selectedCategory === cat ? "bg-brand-600 border-brand-600" : "bg-white border-border"}`}
                          activeOpacity={0.7}
                        >
                          <Text className={`text-sm font-bold ${selectedCategory === cat ? "text-white" : "text-dark"}`}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Description */}
                <View className="mb-4">
                  <Text className="text-text-secondary text-sm font-bold mb-1.5">Description</Text>
                  <TextInput
                    className="bg-white border border-border p-3 text-dark text-sm min-h-[80px]"
                    style={{ textAlignVertical: "top" }}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Scope of work..."
                    placeholderTextColor={BRAND.colors.textMuted}
                    multiline
                  />
                </View>

                {/* Budget */}
                <View className="mb-4">
                  <Text className="text-text-secondary text-sm font-bold mb-1.5">Budget ($)</Text>
                  <TextInput
                    className="bg-white border border-border p-3 text-dark text-sm"
                    value={budget}
                    onChangeText={setBudget}
                    placeholder="0.00"
                    placeholderTextColor={BRAND.colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Dates */}
                <View className="flex-row mb-6" style={{ gap: 12 }}>
                  <View className="flex-1">
                    <Text className="text-text-secondary text-sm font-bold mb-1.5">Start Date</Text>
                    <TextInput
                      className="bg-white border border-border p-3 text-dark text-sm"
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={BRAND.colors.textMuted}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-secondary text-sm font-bold mb-1.5">End Date</Text>
                    <TextInput
                      className="bg-white border border-border p-3 text-dark text-sm"
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={BRAND.colors.textMuted}
                    />
                  </View>
                </View>

                {/* Next */}
                <TouchableOpacity
                  onPress={goToStep2}
                  className="bg-brand-600 py-4 items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-base">
                    {selectedCategory && templateMilestones.length > 0 ? "Next -- Review Milestones" : "Create Project"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {modalStep === 2 && (
              <View className="px-5 pt-4">
                {/* Context */}
                <View className="bg-white border border-border p-4 mb-4">
                  <Text className="text-dark font-bold text-base">{projectName}</Text>
                  <Text className="text-text-muted text-sm mt-0.5">{selectedCategory}{budget ? ` -- ${formatCurrency(Math.round(parseFloat(budget) * 100))}` : ""}</Text>
                </View>

                <Text className="text-text-secondary text-sm font-bold mb-3">
                  Suggested milestones for {selectedCategory}
                </Text>
                <Text className="text-text-muted text-xs mb-4">
                  Uncheck any you don't need. Amounts are editable.
                </Text>

                {templateMilestones.map((ms, i) => {
                  const isChecked = milestoneChecks[i] ?? true;
                  return (
                    <View key={i} className={`bg-white border border-border mb-2 p-4 ${!isChecked ? "opacity-50" : ""}`}>
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          onPress={() => setMilestoneChecks((prev) => ({ ...prev, [i]: !isChecked }))}
                          className={`w-6 h-6 items-center justify-center border mr-3 ${isChecked ? "bg-brand-600 border-brand-600" : "bg-white border-border"}`}
                          activeOpacity={0.7}
                        >
                          {isChecked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </TouchableOpacity>
                        <View className="flex-1">
                          <Text className="text-dark font-bold text-sm">{ms.label}</Text>
                          <Text className="text-text-muted text-xs mt-0.5">{ms.pct}% of budget</Text>
                        </View>
                        <View className="w-24">
                          <TextInput
                            className="bg-surface border border-border p-2 text-dark text-sm text-right"
                            value={milestoneAmounts[i] || ""}
                            onChangeText={(val) => setMilestoneAmounts((prev) => ({ ...prev, [i]: val }))}
                            placeholder="$0"
                            placeholderTextColor={BRAND.colors.textMuted}
                            keyboardType="decimal-pad"
                            editable={isChecked}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}

                {templateMilestones.length === 0 && (
                  <View className="items-center py-8">
                    <Text className="text-text-muted text-sm">No templates for this category. Project will be created without milestones.</Text>
                  </View>
                )}

                {/* Submit */}
                <TouchableOpacity
                  onPress={submitProject}
                  className="bg-brand-600 py-4 items-center mt-4"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-base">Create Project</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
